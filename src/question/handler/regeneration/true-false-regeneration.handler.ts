import { Question } from '../../entity/question.entity';
import { QuestionTypeRegenerationHandler } from './question-type-regeneration-handler.interface';

export class TrueFalseRegenerationHandler
  implements QuestionTypeRegenerationHandler
{
  async handle(question: Question, newQuestionData: any): Promise<void> {
    question.question = newQuestionData.question;
  }
}
