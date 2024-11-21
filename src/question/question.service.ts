import { FileService } from 'src/file/file.service';
import { OpenaiService } from 'src/openai/openai.service';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { GenerateQuestionDto } from './dto/generate-questions.dto';
import { Prompt } from './entity/prompt.entity';
import { Question } from './entity/question.entity';
import { GetQuestionsQuery } from './queries/get-questions.query';
import { QuestionRepository } from './repository/question.repository';

@Injectable()
export class QuestionService {
  constructor(
    private readonly openaiService: OpenaiService,
    private readonly fileService: FileService,
    @InjectRepository(Question)
    private readonly questionRepository: QuestionRepository,
    @InjectRepository(Prompt)
    private readonly promptRepository: Repository<Prompt>,
    private readonly queryBus: QueryBus,
  ) {}

  async generateQuestions(generateQuestionDto: GenerateQuestionDto) {
    const { prompt, numberOfQuestions, type, difficulty, label } =
      generateQuestionDto;

    const promptEntity = this.promptRepository.create({
      prompt,
      numberOfQuestions,
      type,
      difficulty,
    });
    const savedPrompt = await this.promptRepository.save(promptEntity);

    const generatedQuestions = await this.openaiService.generateQuestions(
      prompt,
      numberOfQuestions,
      type,
      difficulty,
    );

    await this.questionRepository.saveQuestionsWithVariants(
      generatedQuestions,
      savedPrompt,
      label,
    );

    return generatedQuestions;
  }

  async generateQuestionsFromFile(
    file: Express.Multer.File,
    generateQuestionDto: GenerateQuestionDto,
  ) {
    const { numberOfQuestions, type, difficulty, label } = generateQuestionDto;

    const text = await this.fileService.extractText(file);

    const promptEntity = this.promptRepository.create({
      prompt: text,
      numberOfQuestions,
      type,
      difficulty,
    });
    const savedPrompt = await this.promptRepository.save(promptEntity);

    const generatedQuestions = await this.openaiService.generateQuestions(
      text,
      numberOfQuestions,
      type,
      difficulty,
    );

    await this.questionRepository.saveQuestionsWithVariants(
      generatedQuestions,
      savedPrompt,
      label,
    );

    return generatedQuestions;
  }

  async getFilteredQuestions(
    label: string,
    orderBy: 'ASC' | 'DESC' = 'ASC',
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const query = new GetQuestionsQuery(label, orderBy, page, limit);
    return this.queryBus.execute(query);
  }
}
