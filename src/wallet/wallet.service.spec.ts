import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PaystackService } from './paystack.service';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';

describe('WalletService', () => {
  let service: WalletService;

  const mockWalletRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockTransactionRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockPaystackService = {
    initializeTransaction: jest.fn(),
    verifyTransaction: jest.fn(),
    verifyWebhookSignature: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
      },
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: PaystackService,
          useValue: mockPaystackService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have getBalance method', () => {
    expect(service.getBalance).toBeDefined();
  });

  it('should have initiateDeposit method', () => {
    expect(service.initiateDeposit).toBeDefined();
  });

  it('should have getDepositStatus method', () => {
    expect(service.getDepositStatus).toBeDefined();
  });

  it('should have transfer method', () => {
    expect(service.transfer).toBeDefined();
  });

  it('should have getTransactions method', () => {
    expect(service.getTransactions).toBeDefined();
  });

  it('should have handleWebhook method', () => {
    expect(service.handleWebhook).toBeDefined();
  });
});
