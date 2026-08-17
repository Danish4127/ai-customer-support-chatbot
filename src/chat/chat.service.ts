import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are a friendly, professional customer support assistant for an
online store. Keep answers short, clear, and helpful. If you don't know something
specific to the customer's account or order, politely say you'll escalate it to a
human agent instead of making up details.`;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly openai: OpenAI;
  private readonly model: string;

  private readonly conversations = new Map<string, ChatMessage[]>();

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'GROQ_API_KEY is not set. Chat requests will fail until you add it to .env',
      );
    }

    this.openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    this.model =
      this.configService.get<string>('GROQ_MODEL') ||
      'openai/gpt-oss-120b';
  }

  async sendMessage(message: string, sessionId?: string) {
    const id = sessionId || randomUUID();

    const history = this.conversations.get(id) || [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    history.push({ role: 'user', content: message });

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: history as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: 0.7,
        max_tokens: 400,
      });

      const reply =
        completion.choices[0]?.message?.content?.trim() ||
        "Sorry, I wasn't able to generate a response. Please try again.";

      history.push({ role: 'assistant', content: reply });
      this.conversations.set(id, history);

      return {
        sessionId: id,
        reply,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Groq API call failed', error);

      throw new InternalServerErrorException(
        'The AI service is currently unavailable. Please try again shortly.',
      );
    }
  }

  getHistory(sessionId: string): ChatMessage[] {
    return this.conversations.get(sessionId) || [];
  }
}