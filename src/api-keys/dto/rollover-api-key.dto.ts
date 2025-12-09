import { IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExpiryFormat } from './create-api-key.dto';

export class RolloverApiKeyDto {
  @ApiProperty({ example: 'abc123e4-5678-90ab-cdef-1234567890ab' })
  @IsString()
  @IsUUID()
  expired_key_id: string;

  @ApiProperty({
    example: '1M',
    enum: ExpiryFormat,
    description: '1H = 1 Hour, 1D = 1 Day, 1M = 1 Month, 1Y = 1 Year',
  })
  @IsEnum(ExpiryFormat)
  expiry: ExpiryFormat;
}
