import { IsString, IsNumber, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({
    example: '4566678954356',
    description: '13-digit wallet number',
  })
  @IsString()
  @Length(13, 13, { message: 'Wallet number must be exactly 13 digits' })
  wallet_number: string;

  @ApiProperty({ example: 3000, description: 'Amount to transfer' })
  @IsNumber()
  @Min(1, { message: 'Minimum transfer amount is 1' })
  amount: number;
}
