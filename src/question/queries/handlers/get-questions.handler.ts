import { Label } from 'src/label/entity/label.entity';
import { Question } from 'src/question/entity/question.entity';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { GetQuestionsQuery } from '../get-questions.query';

@Injectable()
@QueryHandler(GetQuestionsQuery)
export class GetQuestionsHandler implements IQueryHandler<GetQuestionsQuery> {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
  ) {}

  async execute(query: GetQuestionsQuery): Promise<any> {
    const { label, orderBy, page, limit } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.labels', 'label');

    if (label) {
      queryBuilder.where('label.label = :label', { label });
    }

    queryBuilder.orderBy('question.id', orderBy).skip(skip).take(limit);

    const [questions, totalCount] = await queryBuilder.getManyAndCount();

    return {
      questions,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
}
