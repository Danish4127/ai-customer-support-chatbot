import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({ description: 'Recipient email address', example: 'customer@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ description: 'Email subject line', example: 'We received your message' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    description: 'Email body (plain text, will be wrapped in a simple HTML template)',
    example: 'Thanks for reaching out! Our support team will get back to you shortly.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
