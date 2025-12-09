import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { JwtPayload } from './dto/jwt-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(googleUser: any): Promise<User> {
    const { googleId, email, name, picture } = googleUser;

    let user = await this.userRepository.findOne({
      where: { googleId },
      relations: ['wallet'],
    });

    if (!user) {
      // Create new user
      user = this.userRepository.create({
        googleId,
        email,
        name,
        picture,
      });
      await this.userRepository.save(user);

      // Create wallet for user
      const walletNumber = this.generateWalletNumber();
      const wallet = this.walletRepository.create({
        userId: user.id,
        walletNumber,
        balance: 0,
      });
      await this.walletRepository.save(wallet);

      user.wallet = wallet;
    }

    return user;
  }

  async generateJwt(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }

  private generateWalletNumber(): string {
    // Generate 13-digit wallet number
    const min = 1000000000000; // 13 digits minimum
    const max = 9999999999999; // 13 digits maximum
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }
}
