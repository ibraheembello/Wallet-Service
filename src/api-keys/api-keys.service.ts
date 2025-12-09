import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { User } from '../entities/user.entity';
import { CreateApiKeyDto, ExpiryFormat } from './dto/create-api-key.dto';
import { RolloverApiKeyDto } from './dto/rollover-api-key.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createApiKey(userId: string, createApiKeyDto: CreateApiKeyDto) {
    // Check if user has less than 5 active keys
    const _activeKeysCount = await this.apiKeyRepository.count({
      where: {
        userId,
        isRevoked: false,
        expiresAt: LessThan(new Date()) ? undefined : LessThan(new Date()),
      },
    });

    // Count non-expired and non-revoked keys
    const activeKeys = await this.apiKeyRepository.find({
      where: { userId, isRevoked: false },
    });

    const currentActiveCount = activeKeys.filter(
      (key) => new Date(key.expiresAt) > new Date(),
    ).length;

    if (currentActiveCount >= 5) {
      throw new BadRequestException(
        'Maximum of 5 active API keys allowed per user',
      );
    }

    // Generate API key
    const plainKey = this.generateApiKey();
    const keyHash = await bcrypt.hash(plainKey, 10);

    // Calculate expiry date
    const expiresAt = this.calculateExpiryDate(createApiKeyDto.expiry);

    // Create API key
    const apiKey = this.apiKeyRepository.create({
      userId,
      name: createApiKeyDto.name,
      keyHash,
      permissions: createApiKeyDto.permissions,
      expiresAt,
      isRevoked: false,
    });

    await this.apiKeyRepository.save(apiKey);

    return {
      api_key: plainKey,
      expires_at: expiresAt.toISOString(),
    };
  }

  async rolloverApiKey(userId: string, rolloverDto: RolloverApiKeyDto) {
    // Find the expired key
    const expiredKey = await this.apiKeyRepository.findOne({
      where: { id: rolloverDto.expired_key_id, userId },
    });

    if (!expiredKey) {
      throw new NotFoundException('API key not found');
    }

    // Verify the key is actually expired
    if (new Date(expiredKey.expiresAt) > new Date()) {
      throw new BadRequestException('API key is not expired yet');
    }

    // Check active keys limit
    const activeKeys = await this.apiKeyRepository.find({
      where: { userId, isRevoked: false },
    });

    const currentActiveCount = activeKeys.filter(
      (key) => new Date(key.expiresAt) > new Date(),
    ).length;

    if (currentActiveCount >= 5) {
      throw new BadRequestException(
        'Maximum of 5 active API keys allowed. Please revoke an existing key first.',
      );
    }

    // Generate new API key with same permissions
    const plainKey = this.generateApiKey();
    const keyHash = await bcrypt.hash(plainKey, 10);
    const expiresAt = this.calculateExpiryDate(rolloverDto.expiry);

    const newApiKey = this.apiKeyRepository.create({
      userId,
      name: expiredKey.name,
      keyHash,
      permissions: expiredKey.permissions,
      expiresAt,
      isRevoked: false,
    });

    await this.apiKeyRepository.save(newApiKey);

    return {
      api_key: plainKey,
      expires_at: expiresAt.toISOString(),
    };
  }

  async validateApiKey(
    apiKey: string,
  ): Promise<{ user: User; permissions: string[] }> {
    const allKeys = await this.apiKeyRepository.find({
      relations: ['user', 'user.wallet'],
    });

    for (const key of allKeys) {
      const isMatch = await bcrypt.compare(apiKey, key.keyHash);

      if (isMatch) {
        // Check if revoked
        if (key.isRevoked) {
          throw new UnauthorizedException('API key has been revoked');
        }

        // Check if expired
        if (new Date(key.expiresAt) < new Date()) {
          throw new UnauthorizedException('API key has expired');
        }

        return {
          user: key.user,
          permissions: key.permissions,
        };
      }
    }

    throw new UnauthorizedException('Invalid API key');
  }

  private generateApiKey(): string {
    const prefix = 'sk_live_';
    const randomString = crypto.randomBytes(32).toString('hex');
    return `${prefix}${randomString}`;
  }

  private calculateExpiryDate(expiry: ExpiryFormat): Date {
    const now = new Date();

    switch (expiry) {
      case ExpiryFormat.ONE_HOUR:
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      case ExpiryFormat.ONE_DAY:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      case ExpiryFormat.ONE_MONTH:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      case ExpiryFormat.ONE_YEAR:
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days
      default:
        throw new BadRequestException('Invalid expiry format');
    }
  }
}
