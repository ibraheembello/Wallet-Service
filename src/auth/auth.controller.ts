import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth sign-in' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT token',
    schema: {
      properties: {
        access_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            walletNumber: { type: 'string' },
          },
        },
      },
    },
  })
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = await this.authService.validateGoogleUser(req.user);
    const token = await this.authService.generateJwt(user);

    return res.json({
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        walletNumber: user.wallet?.walletNumber,
      },
    });
  }
}
