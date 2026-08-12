import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendSummaryDto } from './dto/send-summary.dto';
import { ChatService } from '../chat/chat.service';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly chatService: ChatService,
  ) {}

  @Post('test')
  @ApiOperation({
    summary: 'Send a test / notification email',
    description: 'Sends a simple email via Resend. Useful for testing your Resend integration.',
  })
  @ApiResponse({ status: 201, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 500, description: 'Failed to send email' })
  sendTestEmail(@Body() dto: SendEmailDto) {
    return this.emailService.sendEmail(dto.to, dto.subject, dto.message);
  }

  @Post('summary')
  @ApiOperation({
    summary: 'Email a chatbot conversation summary',
    description:
      'Fetches the message history for a given chat sessionId and emails it to the given address.',
  })
  @ApiResponse({ status: 201, description: 'Summary email sent successfully' })
  @ApiResponse({ status: 500, description: 'Failed to send email' })
  sendSummary(@Body() dto: SendSummaryDto) {
    const history = this.chatService.getHistory(dto.sessionId);
    return this.emailService.sendChatSummary(dto.to, dto.sessionId, history);
  }
}
