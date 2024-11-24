import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { QuestionType } from '../../enum/question-type.enum';
import { MultipleChoiceRegenerationHandler } from './multiple-choice-regeneration-handler';
import { QuestionTypeRegenerationHandler } from './question-type-regeneration-handler.interface';
import { ShortAnswerRegenerationHandler } from './short-answer-regeneration.handler';
import { TrueFalseRegenerationHandler } from './true-false-regeneration.handler';

@Injectable()
export class QuestionTypeHandlerFactory {
  constructor(
    private readonly multipleChoiceRegenerationHandler: MultipleChoiceRegenerationHandler,
  ) {}

  createHandler(type: QuestionType): QuestionTypeRegenerationHandler {
    switch (type) {
      case QuestionType.MCQ:
        return this.multipleChoiceRegenerationHandler;
      case QuestionType.TRUE_FALSE:
        return new TrueFalseRegenerationHandler();
      case QuestionType.SHORT_ANSWER:
        return new ShortAnswerRegenerationHandler();
      default:
        throw new HttpException(
          'Unknown question type',
          HttpStatus.BAD_REQUEST,
        );
    }
  }
}
