import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeysService } from './api-keys.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { User } from '../entities/user.entity';

describe('ApiKeysService', () => {
  let service: ApiKeysService;

  const mockApiKeyRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysService,
        {
          provide: getRepositoryToken(ApiKey),
          useValue: mockApiKeyRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have createApiKey method', () => {
    expect(service.createApiKey).toBeDefined();
  });

  it('should have validateApiKey method', () => {
    expect(service.validateApiKey).toBeDefined();
  });

  it('should have rolloverApiKey method', () => {
    expect(service.rolloverApiKey).toBeDefined();
  });

  it('should have revokeApiKey method', () => {
    expect(service.revokeApiKey).toBeDefined();
  });
});
