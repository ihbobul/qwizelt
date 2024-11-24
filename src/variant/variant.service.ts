import { Question } from 'src/question/entity/question.entity';
import { Variant } from 'src/variant/entity/variant.entity';
import { Repository } from 'typeorm';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VariantService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
  ) {}

  async editVariant(
    variantId: number,
    newVariantText: string,
  ): Promise<Variant> {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId },
    });

    if (!variant) {
      throw new HttpException('Variant not found', HttpStatus.NOT_FOUND);
    }

    variant.variant = newVariantText;
    return this.variantRepository.save(variant);
  }

  async addVariant(
    question: Question,
    newVariantText: string,
  ): Promise<Variant> {
    const newVariant = this.variantRepository.create({
      variant: newVariantText,
      question,
    });

    return this.variantRepository.save(newVariant);
  }

  async removeVariant(variantId: number): Promise<void> {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId },
    });

    if (!variant) {
      throw new HttpException('Variant not found', HttpStatus.NOT_FOUND);
    }

    await this.variantRepository.remove(variant);
  }

  async updateVariants(
    question: Question,
    newVariants: string[],
  ): Promise<void> {
    const existingVariants = question.variants;

    for (let i = 0; i < newVariants.length; i++) {
      if (existingVariants[i]) {
        existingVariants[i].variant = newVariants[i];
        await this.variantRepository.save(existingVariants[i]);
      } else {
        const newVariant = this.variantRepository.create({
          variant: newVariants[i],
          question: question,
        });
        await this.variantRepository.save(newVariant);
      }
    }

    if (existingVariants.length > newVariants.length) {
      const excessVariants = existingVariants.slice(newVariants.length);
      await this.variantRepository.remove(excessVariants);
    }
  }
}
