import { VariantService } from 'src/variant/variant.service';

import { Injectable } from '@nestjs/common';

import { Question } from '../../entity/question.entity';
import { QuestionTypeRegenerationHandler } from './question-type-regeneration-handler.interface';

@Injectable()
export class MultipleChoiceRegenerationHandler
  implements QuestionTypeRegenerationHandler
{
  constructor(private readonly variantService: VariantService) {}

  async handle(question: Question, newQuestionData: any): Promise<void> {
    const newVariants = newQuestionData.variants;
    await this.variantService.updateVariants(question, newVariants);
  }
}
