import { HttpException, HttpStatus } from '@nestjs/common';
import { Question } from '../entity/question.entity';
import { Variant } from '../entity/variant.entity';
import { QuestionRepository } from '../repository/question.repository';
import { VariantRepository } from '../repository/variant.repository';

export async function updateQuestionText(
  questionRepository: QuestionRepository,
  questionId: number,
  newQuestionText: string,
): Promise<Question> {
  const question = await questionRepository.findOne({
    where: { id: questionId },
    relations: ['variants'],
  });

  if (!question) {
    throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
  }

  question.question = newQuestionText;
  return questionRepository.save(question);
}

export async function updateVariants(
  variantRepository: VariantRepository,
  question: Question,
  newVariants: string[],
): Promise<void> {
  const existingVariants = question.variants;

  for (let i = 0; i < newVariants.length; i++) {
    if (existingVariants[i]) {
      existingVariants[i].variant = newVariants[i];
      await variantRepository.save(existingVariants[i]);
    } else {
      const newVariant = variantRepository.create({
        variant: newVariants[i],
        question: question,
      });
      await variantRepository.save(newVariant);
    }
  }

  if (existingVariants.length > newVariants.length) {
    const excessVariants = existingVariants.slice(newVariants.length);
    await variantRepository.remove(excessVariants);
  }
}
