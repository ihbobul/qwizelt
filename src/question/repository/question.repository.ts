import { Repository } from 'typeorm';

import { Variant } from '../../variant/entity/variant.entity';
import { Prompt } from '../entity/prompt.entity';
import { Question } from '../entity/question.entity';

export interface QuestionRepository extends Repository<Question> {
  saveQuestionsWithVariants(
    questions: { question: string; variants: string[] }[],
    prompt: Prompt,
  ): Promise<Question[]>;
}

export const customQuestionRepository: Pick<QuestionRepository, any> = {
  async saveQuestionsWithVariants(
    questions: { question: string; variants: string[] }[],
    prompt: Prompt,
  ): Promise<Question[]> {
    const savedQuestions = [];
    for (const { question, variants } of questions) {
      const questionEntity = await this.create({
        question,
        prompt,
      });

      const savedQuestion = await this.save(questionEntity);
      savedQuestions.push(savedQuestion);

      if (variants.length > 0) {
        const variantEntities = variants.map((variant) =>
          this.manager.create(Variant, {
            variant,
            question: savedQuestion,
          }),
        );
        await this.manager.save(variantEntities);
      }
    }
    return savedQuestions;
  },
};
