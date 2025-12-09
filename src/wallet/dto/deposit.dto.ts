import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({
    example: 5000,
    description: 'Amount to deposit in kobo/cents',
  })
  @IsNumber()
  @Min(100, { message: 'Minimum deposit amount is 100' })
  amount: number;
}
