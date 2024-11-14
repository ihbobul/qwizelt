import { Difficulty } from 'src/question/enum/difficulty.enum';
import { QuestionType } from 'src/question/enum/question-type.enum';

export class PromptBuilderUtil {
  static generateQuestionsPrompt(
    prompt: string,
    numberOfQuestions: number,
    type: QuestionType,
    difficulty: Difficulty,
    example: string,
  ): string {
    return `
      Here is the material: ${prompt}.
      Please generate ${numberOfQuestions} questions with ${difficulty} difficulty and ${type}.
      Be sure to not answer the questions (it could break the core logic) and don't repeat them.
      Below are the guidelines for each difficulty level:
      - For "easy" questions: Focus on basic concepts and straightforward facts.
      - For "medium" questions: Cover intermediate concepts and involve some reasoning.
      - For "hard" questions: Focus on advanced concepts and require application or analysis of the material.
      Example of the format of question with ${type} type:
      ${example}
    `;
  }
}
