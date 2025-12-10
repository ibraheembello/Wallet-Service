import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RevokeApiKeyDto {
  @ApiProperty({
    description: 'The ID of the API key to revoke',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty()
  @IsUUID()
  api_key_id: string;
}
