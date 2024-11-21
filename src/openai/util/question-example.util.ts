import { QuestionType } from 'src/question/enum/question-type.enum';

export class QuestionExampleUtil {
  static generateExample(type: QuestionType): string {
    switch (type) {
      case QuestionType.MCQ:
        return this.generateQuestionWithMultipleChoiceAnswerExample();
      case QuestionType.TRUE_FALSE:
        return this.generateQuestionWithTrueOrFalseAnswerExample();
      case QuestionType.SHORT_ANSWER:
        return this.generateQuestionWithShortAnswerExample();
      default:
        return '';
    }
  }

  private static generateQuestionWithMultipleChoiceAnswerExample(): string {
    return `
    What is the capital of France?
    A) Berlin
    B) Madrid
    C) Paris
    D) Rome
    `;
  }

  private static generateQuestionWithTrueOrFalseAnswerExample(): string {
    return `
    The Earth is flat.
    A) True
    B) False
    `;
  }

  private static generateQuestionWithShortAnswerExample(): string {
    return `
    Who was the first President of the United States?
    `;
  }
}
