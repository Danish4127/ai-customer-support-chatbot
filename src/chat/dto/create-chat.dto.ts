import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    description: 'The message the user wants to send to the support chatbot',
    example: 'Hi, I was charged twice for my last order. Can you help?',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({
    description:
      'A conversation/session ID. Send the same ID on follow-up messages so the bot remembers context. Omit it to start a new conversation.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
