import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { PaystackService } from './paystack.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import * as crypto from 'crypto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private paystackService: PaystackService,
    private dataSource: DataSource,
  ) {}

  async initiateDeposit(user: User, depositDto: DepositDto) {
    const wallet = await this.walletRepository.findOne({
      where: { userId: user.id },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Generate unique reference
    const reference = `dep_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // Create pending transaction
    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.DEPOSIT,
      amount: depositDto.amount,
      status: TransactionStatus.PENDING,
      reference,
      metadata: {
        email: user.email,
        initiated_by: user.id,
      },
    });

    await this.transactionRepository.save(transaction);

    // Initialize Paystack transaction
    const paymentData = await this.paystackService.initializeTransaction(
      user.email,
      depositDto.amount,
      reference,
    );

    return {
      reference: paymentData.reference,
      authorization_url: paymentData.authorization_url,
    };
  }

  async handleWebhook(event: any): Promise<void> {
    if (event.event === 'charge.success') {
      const { reference, amount, status } = event.data;

      // Find transaction
      const transaction = await this.transactionRepository.findOne({
        where: { reference },
        relations: ['wallet'],
      });

      if (!transaction) {
        console.log(`Transaction not found for reference: ${reference}`);
        return;
      }

      // Check if already processed (idempotency)
      if (transaction.status === TransactionStatus.SUCCESS) {
        console.log(`Transaction already processed: ${reference}`);
        return;
      }

      // Update transaction and wallet atomically
      await this.dataSource.transaction(async (manager) => {
        // Update transaction status
        transaction.status = TransactionStatus.SUCCESS;
        transaction.metadata = {
          ...transaction.metadata,
          paystack_status: status,
          processed_at: new Date().toISOString(),
        };
        await manager.save(transaction);

        // Credit wallet
        const wallet = transaction.wallet;
        wallet.balance = Number(wallet.balance) + Number(transaction.amount);
        await manager.save(wallet);
      });

      console.log(`Wallet credited: ${reference}, Amount: ${amount / 100}`);
    }
  }

  async getDepositStatus(reference: string, user: User) {
    const transaction = await this.transactionRepository.findOne({
      where: { reference, type: TransactionType.DEPOSIT },
      relations: ['wallet'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Verify user owns this transaction
    if (transaction.wallet.userId !== user.id) {
      throw new BadRequestException('Unauthorized access to transaction');
    }

    return {
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
    };
  }

  async getBalance(user: User) {
    const wallet = await this.walletRepository.findOne({
      where: { userId: user.id },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      balance: Number(wallet.balance),
    };
  }

  async transfer(user: User, transferDto: TransferDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get sender wallet
      const senderWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: user.id },
      });

      if (!senderWallet) {
        throw new NotFoundException('Sender wallet not found');
      }

      // Check sufficient balance
      if (Number(senderWallet.balance) < transferDto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Get recipient wallet
      const recipientWallet = await queryRunner.manager.findOne(Wallet, {
        where: { walletNumber: transferDto.wallet_number },
      });

      if (!recipientWallet) {
        throw new NotFoundException('Recipient wallet not found');
      }

      // Prevent self-transfer
      if (senderWallet.id === recipientWallet.id) {
        throw new BadRequestException('Cannot transfer to yourself');
      }

      // Debit sender
      senderWallet.balance = Number(senderWallet.balance) - transferDto.amount;
      await queryRunner.manager.save(senderWallet);

      // Credit recipient
      recipientWallet.balance =
        Number(recipientWallet.balance) + transferDto.amount;
      await queryRunner.manager.save(recipientWallet);

      // Create sender transaction record
      const senderTransaction = queryRunner.manager.create(Transaction, {
        walletId: senderWallet.id,
        type: TransactionType.TRANSFER,
        amount: -transferDto.amount, // Negative for debit
        status: TransactionStatus.SUCCESS,
        reference: `txf_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
        recipientWalletNumber: recipientWallet.walletNumber,
        senderWalletNumber: senderWallet.walletNumber,
        metadata: {
          type: 'debit',
          recipient: recipientWallet.walletNumber,
        },
      });
      await queryRunner.manager.save(senderTransaction);

      // Create recipient transaction record
      const recipientTransaction = queryRunner.manager.create(Transaction, {
        walletId: recipientWallet.id,
        type: TransactionType.TRANSFER,
        amount: transferDto.amount, // Positive for credit
        status: TransactionStatus.SUCCESS,
        reference: `txf_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
        recipientWalletNumber: recipientWallet.walletNumber,
        senderWalletNumber: senderWallet.walletNumber,
        metadata: {
          type: 'credit',
          sender: senderWallet.walletNumber,
        },
      });
      await queryRunner.manager.save(recipientTransaction);

      await queryRunner.commitTransaction();

      return {
        status: 'success',
        message: 'Transfer completed',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactions(user: User) {
    const wallet = await this.walletRepository.findOne({
      where: { userId: user.id },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const transactions = await this.transactionRepository.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
    });

    return transactions.map((tx) => ({
      type: tx.type,
      amount: Math.abs(Number(tx.amount)),
      status: tx.status,
      reference: tx.reference,
      createdAt: tx.createdAt,
      metadata: tx.metadata,
    }));
  }
}
