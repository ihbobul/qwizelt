import { FileModule } from 'src/file/file.module';
import { OpenaiModule } from 'src/openai/openai.module';
import { DataSource } from 'typeorm';

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';

import { Prompt } from './entity/prompt.entity';
import { Question } from './entity/question.entity';
import { Variant } from './entity/variant.entity';
import { GetQuestionsHandler } from './queries/handlers/get-questions.handler';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { customQuestionRepository } from './repository/question.repository';

@Module({
  imports: [
    OpenaiModule,
    FileModule,
    CqrsModule,
    TypeOrmModule.forFeature([Prompt, Question, Variant]),
  ],
  providers: [
    QuestionService,
    GetQuestionsHandler,
    {
      provide: getRepositoryToken(Question),
      inject: [getDataSourceToken()],
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(Question).extend(customQuestionRepository),
    },
  ],
  controllers: [QuestionController],
})
export class QuestionModule {}
