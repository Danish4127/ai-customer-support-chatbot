import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { EmailModule } from './email/email.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // Loads variables from .env into process.env, available app-wide
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatModule,
    EmailModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
