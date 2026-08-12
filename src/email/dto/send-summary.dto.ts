import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendSummaryDto {
  @ApiProperty({ description: 'Recipient email address', example: 'customer@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'The chat sessionId whose conversation history should be emailed',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
