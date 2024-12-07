import { FileModule } from 'src/file/file.module';
import { Label } from 'src/label/entity/label.entity';
import { LabelModule } from 'src/label/label.module';
import { OpenaiModule } from 'src/openai/openai.module';
import { VariantModule } from 'src/variant/variant.module';
import { DataSource } from 'typeorm';

import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';

import { Variant } from '../variant/entity/variant.entity';
import { Prompt } from './entity/prompt.entity';
import { Question } from './entity/question.entity';
import { MultipleChoiceRegenerationHandler } from './handler/regeneration/multiple-choice-regeneration-handler';
import { QuestionTypeHandlerFactory } from './handler/regeneration/question-type-regeneration-factory';
import { GetQuestionsHandler } from './queries/handlers/get-questions.handler';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { customQuestionRepository } from './repository/question.repository';

@Module({
  imports: [
    OpenaiModule,
    FileModule,
    CqrsModule,
    TypeOrmModule.forFeature([Prompt, Question, Variant, Label]),
    VariantModule,
    LabelModule,
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
    QuestionTypeHandlerFactory,
    MultipleChoiceRegenerationHandler,
    Logger,
  ],
  controllers: [QuestionController],
})
export class QuestionModule {}
