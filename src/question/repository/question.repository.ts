import { Repository } from 'typeorm';

import { Prompt } from '../entity/prompt.entity';
import { Question } from '../entity/question.entity';
import { Variant } from '../entity/variant.entity';

export interface QuestionRepository extends Repository<Question> {
  saveQuestionsWithVariants(
    questions: { question: string; variants: string[] }[],
    prompt: Prompt,
    label: string,
  ): Promise<Question[]>;
}

export const customQuestionRepository: Pick<QuestionRepository, any> = {
  async saveQuestionsWithVariants(
    questions: { question: string; variants: string[] }[],
    prompt: Prompt,
    label: string,
  ): Promise<Question[]> {
    const savedQuestions = [];
    for (const { question, variants } of questions) {
      const questionEntity = this.create({
        question,
        prompt,
        label,
      });

      const savedQuestion = await this.save(questionEntity);
      savedQuestions.push(savedQuestion);

      if (variants.length > 0) {
        const variantEntities = variants.map((variant) =>
          this.manager.create(Variant, { variant, question: savedQuestion }),
        );
        await this.manager.save(variantEntities);
      }
    }
    return savedQuestions;
  },
};
