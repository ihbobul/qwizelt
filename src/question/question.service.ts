import { FileService } from 'src/file/file.service';
import { OpenaiService } from 'src/openai/openai.service';
import { VariantService } from 'src/variant/variant.service';
import { In, Repository } from 'typeorm';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Variant } from '../variant/entity/variant.entity';
import { GenerateQuestionDto } from './dto/generate-questions.dto';
import { RegenerateQuestionDto } from './dto/regenerate-question.dto';
import { Prompt } from './entity/prompt.entity';
import { Question } from './entity/question.entity';
import { QuestionTypeHandlerFactory } from './handler/regeneration/question-type-regeneration-factory';
import { GetQuestionsQuery } from './queries/get-questions.query';
import { QuestionRepository } from './repository/question.repository';
import {
  createExcelBuffer,
  formatQuestionsForExcel,
} from './utils/excel-format.util';

@Injectable()
export class QuestionService {
  constructor(
    private readonly openaiService: OpenaiService,
    private readonly fileService: FileService,
    private readonly variantService: VariantService,
    @InjectRepository(Question)
    private readonly questionRepository: QuestionRepository,
    @InjectRepository(Prompt)
    private readonly promptRepository: Repository<Prompt>,
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    private readonly queryBus: QueryBus,
    private readonly questionTypeHandlerFactory: QuestionTypeHandlerFactory,
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

  async editQuestion(
    questionId: number,
    newQuestionText: string,
  ): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['variants'],
    });

    if (!question) {
      throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
    }

    question.question = newQuestionText;

    await this.questionRepository.save(question);

    return question;
  }

  async editVariant(
    variantId: number,
    newVariantText: string,
  ): Promise<Variant> {
    return this.variantService.editVariant(variantId, newVariantText);
  }

  async addVariant(
    questionId: number,
    newVariantText: string,
  ): Promise<Variant> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
    }

    return this.variantService.addVariant(question, newVariantText);
  }

  async removeVariant(variantId: number): Promise<void> {
    return this.variantService.removeVariant(variantId);
  }

  async regenerateSelectedQuestion(
    regenerateQuestionDto: RegenerateQuestionDto,
  ): Promise<Question> {
    const { promptId, questionId } = regenerateQuestionDto;

    const promptEntity = await this.promptRepository.findOne({
      where: { id: promptId },
    });

    if (!promptEntity) {
      throw new HttpException('Prompt not found', HttpStatus.NOT_FOUND);
    }

    const { prompt, numberOfQuestions, type, difficulty } = promptEntity;

    const generatedQuestions = await this.openaiService.generateQuestions(
      prompt,
      numberOfQuestions,
      type,
      difficulty,
    );
    const newQuestionData = generatedQuestions[0];

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['variants'],
    });

    if (!question) {
      throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
    }

    question.question = newQuestionData.question;

    const questionTypeHandler =
      this.questionTypeHandlerFactory.createHandler(type);

    await questionTypeHandler.handle(question, newQuestionData);

    return this.questionRepository.save(question);
  }

  async exportQuestionsToExcel(questionIds: number[]): Promise<Buffer> {
    const questions = await this.questionRepository.find({
      where: {
        id: In(questionIds),
      },
      relations: ['variants', 'prompt'],
    });

    if (!questions.length) {
      throw new HttpException('No questions found', HttpStatus.NOT_FOUND);
    }

    const formattedData = formatQuestionsForExcel(questions);

    return createExcelBuffer(formattedData);
  }
}
