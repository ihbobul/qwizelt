import { QuestionType } from 'src/question/enum/question-type.enum';

export class QuestionParserUtil {
  static parseGeneratedQuestions(
    responseContent: string,
    type: QuestionType,
  ): { question: string; variants: string[] }[] {
    if (!responseContent) return [];

    const questions = responseContent
      .split('\n\n')
      .map((q) => {
        const parts = q.split('\n');
        const questionText = parts[0];
        const variants = parts.slice(1).map((v) => v.trim());
        return { question: questionText, variants };
      })
      .filter((q) => q.question.length > 0);

    if (type === QuestionType.SHORT_ANSWER) {
      return questions.map((q) => ({
        question: q.question,
        variants: [],
      }));
    }

    return questions;
  }
}
