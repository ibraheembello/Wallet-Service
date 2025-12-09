import { SetMetadata } from '@nestjs/common';
import { ApiKeyPermission } from '../../entities/api-key.entity';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: ApiKeyPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
