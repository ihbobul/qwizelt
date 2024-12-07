import { Question } from 'src/question/entity/question.entity';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Label } from './entity/label.entity';

@Injectable()
export class LabelService {
  constructor(
    @InjectRepository(Label)
    private labelRepository: Repository<Label>,
  ) {}

  async getAllLabels(): Promise<Label[]> {
    return await this.labelRepository.find();
  }

  async getLabelById(id: number): Promise<Label> {
    return await this.labelRepository.findOneByOrFail({ id });
  }

  async createLabel(label: string, question: Question): Promise<Label> {
    const existingLabel = await this.labelRepository.findOne({
      where: { label, question: { id: question.id } },
      relations: ['question'],
    });

    if (existingLabel) {
      return existingLabel;
    }

    const labelEntity = this.labelRepository.create({
      label,
      question,
    });

    return this.labelRepository.save(labelEntity);
  }
}
