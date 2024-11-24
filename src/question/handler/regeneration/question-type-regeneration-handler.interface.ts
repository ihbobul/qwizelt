import { Question } from '../../entity/question.entity';

export interface QuestionTypeRegenerationHandler {
  handle(question: Question, newQuestionData: any): Promise<void>;
}
