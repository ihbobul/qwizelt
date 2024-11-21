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
  ) {}

  async execute(query: GetQuestionsQuery): Promise<any> {
    const { label, orderBy, page, limit } = query;
    const skip = (page - 1) * limit;

    const [questions, totalCount] = await this.questionRepository.findAndCount({
      where: { label },
      order: {
        id: orderBy,
      },
      skip,
      take: limit,
    });

    return {
      questions,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
}
