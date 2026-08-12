import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  sessionId: string;

  @ApiProperty({
    example:
      "I'm sorry to hear about the double charge! I can help. Could you share your order number so I can look into it?",
  })
  reply: string;

  @ApiProperty({ example: '2026-08-12T10:15:00.000Z' })
  timestamp: string;
}
