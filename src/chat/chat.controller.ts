import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({
    summary: 'Send a message to the AI chatbot',
    description:
      'Sends a user message to the OpenAI-powered support bot and returns its reply. ' +
      'Pass the returned sessionId on your next request to continue the same conversation.',
  })
  @ApiResponse({ status: 201, description: 'AI reply generated successfully', type: ChatResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error (empty/too long message)' })
  @ApiResponse({ status: 500, description: 'AI service unavailable' })
  sendMessage(@Body() dto: CreateChatDto): Promise<ChatResponseDto> {
    return this.chatService.sendMessage(dto.message, dto.sessionId);
  }

  @Get(':sessionId/history')
  @ApiOperation({
    summary: 'Get conversation history',
    description: 'Returns the full message history for a given session ID.',
  })
  @ApiParam({ name: 'sessionId', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Conversation history returned' })
  getHistory(@Param('sessionId') sessionId: string) {
    return { sessionId, messages: this.chatService.getHistory(sessionId) };
  }
}
