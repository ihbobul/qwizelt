import { OpenaiModule } from 'src/openai/openai.module';

import { Module } from '@nestjs/common';

import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

@Module({
  imports: [OpenaiModule],
  providers: [QuestionService],
  controllers: [QuestionController],
})
export class QuestionModule {}
