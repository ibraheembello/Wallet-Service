import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from './api-key.guard';

@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
  constructor(
    private jwtAuthGuard: JwtAuthGuard,
    private apiKeyGuard: ApiKeyGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Check if Authorization header exists (JWT)
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const result = await this.jwtAuthGuard.canActivate(context);
        return result as boolean;
      } catch (error) {
        throw new UnauthorizedException('Invalid JWT token');
      }
    }

    // Check if x-api-key header exists (API Key)
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      try {
        const result = await this.apiKeyGuard.canActivate(context);
        return result as boolean;
      } catch (error) {
        throw new UnauthorizedException('Invalid API key');
      }
    }

    throw new UnauthorizedException(
      'Authentication required: Provide either JWT token or API key',
    );
  }
}
