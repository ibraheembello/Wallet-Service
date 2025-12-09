import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PaystackService } from './paystack.service';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction, User]),
    ApiKeysModule,
    AuthModule,
  ],
  controllers: [WalletController],
  providers: [WalletService, PaystackService],
  exports: [WalletService, PaystackService],
})
export class WalletModule {}
