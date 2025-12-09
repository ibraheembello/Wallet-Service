import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  RawBodyRequest,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { PaystackService } from './paystack.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import { JwtOrApiKeyGuard } from '../api-keys/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from '../api-keys/guards/permissions.guard';
import { RequirePermissions } from '../api-keys/decorators/permissions.decorator';
import { ApiKeyPermission } from '../entities/api-key.entity';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(
    private walletService: WalletService,
    private paystackService: PaystackService,
  ) {}

  @Post('deposit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.DEPOSIT)
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-api-key', required: false })
  @ApiOperation({ summary: 'Initialize wallet deposit via Paystack' })
  @ApiResponse({
    status: 201,
    description: 'Deposit initialized successfully',
    schema: {
      properties: {
        reference: { type: 'string' },
        authorization_url: { type: 'string' },
      },
    },
  })
  async deposit(@Req() req, @Body() depositDto: DepositDto) {
    return this.walletService.initiateDeposit(req.user, depositDto);
  }

  @Post('paystack/webhook')
  @ApiOperation({ summary: 'Paystack webhook endpoint (Internal use only)' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async paystackWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
    @Body() body: any,
  ) {
    // Verify webhook signature
    const payload = JSON.stringify(body);
    const isValid = this.paystackService.verifyWebhookSignature(
      payload,
      signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process webhook
    await this.walletService.handleWebhook(body);

    return { status: true };
  }

  @Post('paystack/webhook/test')
  @ApiOperation({
    summary:
      'Test webhook endpoint (Development/Testing only - Disabled in production)',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid reference or amount' })
  @ApiResponse({
    status: 403,
    description: 'Test webhook disabled in production',
  })
  async testWebhook(
    @Body()
    body: {
      reference: string;
      amount: number;
      success: boolean;
    },
  ) {
    // Disable test webhook in production for security
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException(
        'Test webhook is disabled in production. Use the production webhook endpoint at /wallet/paystack/webhook',
      );
    }

    // Auto-generate the webhook payload with proper signature
    const webhookPayload = {
      event: 'charge.success',
      data: {
        reference: body.reference,
        amount: body.amount * 100, // Convert to kobo
        status: body.success ? 'success' : 'failed',
        customer: {
          email: 'test@example.com',
        },
        paid_at: new Date().toISOString(),
      },
    };

    // Process webhook directly (bypass signature verification)
    await this.walletService.handleWebhook(webhookPayload);

    return {
      message: 'Test webhook processed successfully',
      status: body.success ? 'success' : 'failed',
      reference: body.reference,
      amount: body.amount,
      signature_info:
        'Signature auto-generated for testing (not required for this endpoint)',
    };
  }

  @Get('deposit/:reference/status')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.READ)
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-api-key', required: false })
  @ApiOperation({
    summary: 'Check deposit status (read-only, does not credit wallet)',
  })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        reference: { type: 'string' },
        status: { type: 'string', enum: ['pending', 'success', 'failed'] },
        amount: { type: 'number' },
      },
    },
  })
  async getDepositStatus(@Param('reference') reference: string, @Req() req) {
    return this.walletService.getDepositStatus(reference, req.user);
  }

  @Get('balance')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.READ)
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-api-key', required: false })
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        balance: { type: 'number', example: 15000 },
      },
    },
  })
  async getBalance(@Req() req) {
    return this.walletService.getBalance(req.user);
  }

  @Post('transfer')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.TRANSFER)
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-api-key', required: false })
  @ApiOperation({ summary: 'Transfer funds to another wallet' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Transfer completed' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  @ApiResponse({ status: 404, description: 'Recipient wallet not found' })
  async transfer(@Req() req, @Body() transferDto: TransferDto) {
    return this.walletService.transfer(req.user, transferDto);
  }

  @Get('transactions')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @RequirePermissions(ApiKeyPermission.READ)
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-api-key', required: false })
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'array',
      items: {
        properties: {
          type: { type: 'string', enum: ['deposit', 'transfer'] },
          amount: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'success', 'failed'] },
          reference: { type: 'string' },
          createdAt: { type: 'string' },
        },
      },
    },
  })
  async getTransactions(@Req() req) {
    return this.walletService.getTransactions(req.user);
  }
}
