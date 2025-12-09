import { IsString, IsArray, IsEnum, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiKeyPermission } from '../../entities/api-key.entity';

export enum ExpiryFormat {
  ONE_HOUR = '1H',
  ONE_DAY = '1D',
  ONE_MONTH = '1M',
  ONE_YEAR = '1Y',
}

export class CreateApiKeyDto {
  @ApiProperty({ example: 'wallet-service' })
  @IsString()
  name: string;

  @ApiProperty({
    example: ['deposit', 'transfer', 'read'],
    enum: ApiKeyPermission,
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ApiKeyPermission, { each: true })
  permissions: ApiKeyPermission[];

  @ApiProperty({
    example: '1D',
    enum: ExpiryFormat,
    description: '1H = 1 Hour, 1D = 1 Day, 1M = 1 Month, 1Y = 1 Year',
  })
  @IsEnum(ExpiryFormat)
  expiry: ExpiryFormat;
}
