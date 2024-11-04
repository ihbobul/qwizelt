import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiService } from './ai/ai.service';
import { QuestionController } from './question/question.controller';

@Module({
  imports: [],
  controllers: [AppController, QuestionController],
  providers: [AppService, AiService],
})
export class AppModule {}
