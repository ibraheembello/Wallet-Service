import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { ApiKey } from '../entities/api-key.entity';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { JwtOrApiKeyGuard } from './guards/jwt-or-api-key.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey, User])],
  controllers: [ApiKeysController],
  providers: [
    ApiKeysService,
    JwtAuthGuard,
    ApiKeyGuard,
    JwtOrApiKeyGuard,
    PermissionsGuard,
  ],
  exports: [ApiKeysService, ApiKeyGuard, JwtOrApiKeyGuard, PermissionsGuard],
})
export class ApiKeysModule {}
