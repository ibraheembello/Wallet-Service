import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { RolloverApiKeyDto } from './dto/rollover-api-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('API Keys')
@Controller('keys')
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({
    status: 201,
    description: 'API key created successfully',
    schema: {
      properties: {
        api_key: { type: 'string', example: 'sk_live_xxxxx' },
        expires_at: { type: 'string', example: '2025-01-01T12:00:00Z' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Maximum 5 active keys allowed' })
  async createApiKey(@Req() req, @Body() createApiKeyDto: CreateApiKeyDto) {
    return this.apiKeysService.createApiKey(req.user.id, createApiKeyDto);
  }

  @Post('rollover')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rollover an expired API key' })
  @ApiResponse({
    status: 201,
    description: 'API key rolled over successfully',
    schema: {
      properties: {
        api_key: { type: 'string', example: 'sk_live_xxxxx' },
        expires_at: { type: 'string', example: '2025-01-01T12:00:00Z' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'API key is not expired yet' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async rolloverApiKey(@Req() req, @Body() rolloverDto: RolloverApiKeyDto) {
    return this.apiKeysService.rolloverApiKey(req.user.id, rolloverDto);
  }
}
