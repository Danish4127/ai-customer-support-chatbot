import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { ChatMessage } from '../chat/chat.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY is not set. Email requests will fail until you add it to .env',
      );
    }
    this.resend = new Resend(apiKey);
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
  }

  async sendEmail(to: string, subject: string, message: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html: this.wrapInTemplate(subject, `<p>${this.escapeHtml(message)}</p>`),
      });

      if (error) {
        this.logger.error(`Resend returned an error: ${JSON.stringify(error)}`);
        throw new InternalServerErrorException('Failed to send email');
      }

      return { success: true, id: data?.id };
    } catch (error) {
      this.logger.error('Email sending failed', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendChatSummary(to: string, sessionId: string, history: ChatMessage[]) {
    const conversationHtml = history
      .filter((m) => m.role !== 'system')
      .map(
        (m) =>
          `<p><strong>${m.role === 'user' ? 'Customer' : 'Support Bot'}:</strong> ${this.escapeHtml(
            m.content,
          )}</p>`,
      )
      .join('');

    const body = conversationHtml || '<p>No messages found for this session yet.</p>';
    const subject = `Your support chat summary (Session ${sessionId.slice(0, 8)})`;

    return this.sendRawHtml(to, subject, this.wrapInTemplate('Chat Summary', body));
  }

  /** Internal helper to send fully custom HTML (used for the chat summary). */
  private async sendRawHtml(to: string, subject: string, html: string) {
    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject,
      html,
    });
    if (error) {
      this.logger.error(`Resend returned an error: ${JSON.stringify(error)}`);
      throw new InternalServerErrorException('Failed to send email');
    }
    return { success: true, id: data?.id };
  }

  private wrapInTemplate(title: string, bodyHtml: string): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333;">${this.escapeHtml(title)}</h2>
        ${bodyHtml}
        <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />
        <p style="color: #999; font-size: 12px;">Sent automatically by AI Customer Support Chatbot</p>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
