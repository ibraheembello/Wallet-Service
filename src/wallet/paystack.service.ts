import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaystackService {
  private readonly baseUrl: string;
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('PAYSTACK_BASE_URL');
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
  }

  async initializeTransaction(
    email: string,
    amount: number,
    reference: string,
  ): Promise<{ authorization_url: string; reference: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Convert to kobo
          reference,
          callback_url: `${this.configService.get<string>('FRONTEND_URL')}/payment/callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data.status) {
        throw new BadRequestException('Failed to initialize transaction');
      }

      return {
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.message || 'Payment initialization failed',
      );
    }
  }

  async verifyTransaction(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      return response.data.data;
    } catch (error) {
      throw new BadRequestException('Transaction verification failed');
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }
}
