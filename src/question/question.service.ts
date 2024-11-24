import { FileService } from 'src/file/file.service';
import { OpenaiService } from 'src/openai/openai.service';
import { VariantService } from 'src/variant/variant.service';
import { In, Repository } from 'typeorm';

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
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
    private readonly queryBus: QueryBus,
    private readonly questionTypeHandlerFactory: QuestionTypeHandlerFactory,
    private readonly logger: Logger,
  ) {}

  async generateQuestions(generateQuestionDto: GenerateQuestionDto) {
    const { prompt, numberOfQuestions, type, difficulty, label } =
      generateQuestionDto;

    this.logger.log(
      `Generating questions with prompt: "${prompt}". With label: ${label}`,
    );

    try {
      this.logger.debug('Creating prompt entity...');
      const promptEntity = this.promptRepository.create({
        prompt,
        numberOfQuestions,
        type,
        difficulty,
      });

      const savedPrompt = await this.promptRepository.save(promptEntity);
      this.logger.debug(`Prompt entity saved with ID: ${savedPrompt.id}`);

      this.logger.debug('Generating questions from OpenAI...');
      const generatedQuestions = await this.openaiService.generateQuestions(
        prompt,
        numberOfQuestions,
        type,
        difficulty,
      );
      this.logger.debug(
        `Generated ${generatedQuestions.length} questions successfully`,
      );

      this.logger.debug(
        'Saving generated questions and variants to the database...',
      );
      await this.questionRepository.saveQuestionsWithVariants(
        generatedQuestions,
        savedPrompt,
        label,
      );

      this.logger.log('Questions generated and saved successfully');
      return generatedQuestions;
    } catch (error) {
      this.logger.error('Failed to generate questions', {
        error: error.message,
        stack: error.stack,
        dto: generateQuestionDto,
      });

      throw new HttpException(
        'Error occurred while generating questions. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateQuestionsFromFile(
    file: Express.Multer.File,
    generateQuestionDto: GenerateQuestionDto,
  ): Promise<any> {
    const { numberOfQuestions, type, difficulty, label } = generateQuestionDto;

    this.logger.log(
      `Generating questions from file: ${file.originalname}. With label: ${label}`,
    );

    try {
      this.logger.debug('Extracting text from the uploaded file...');
      const text = await this.fileService.extractText(file);
      this.logger.debug('File text extracted successfully');

      this.logger.debug('Creating prompt entity...');
      const promptEntity = this.promptRepository.create({
        prompt: text,
        numberOfQuestions,
        type,
        difficulty,
      });
      const savedPrompt = await this.promptRepository.save(promptEntity);
      this.logger.debug(`Prompt entity saved with ID: ${savedPrompt.id}`);

      this.logger.debug('Generating questions using OpenAI...');
      const generatedQuestions = await this.openaiService.generateQuestions(
        text,
        numberOfQuestions,
        type,
        difficulty,
      );
      this.logger.debug(`Generated ${generatedQuestions.length} questions`);

      this.logger.debug('Saving generated questions to the database...');
      await this.questionRepository.saveQuestionsWithVariants(
        generatedQuestions,
        savedPrompt,
        label,
      );
      this.logger.log('Questions successfully generated and saved');

      return generatedQuestions;
    } catch (error) {
      this.logger.error('Failed to generate questions from file', {
        error: error.message,
        stack: error.stack,
        dto: generateQuestionDto,
      });

      throw new HttpException(
        'Error occurred while generating questions from the file. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFilteredQuestions(
    label: string,
    orderBy: 'ASC' | 'DESC' = 'ASC',
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    this.logger.log(`Fetching filtered questions for label: "${label}"`);

    try {
      const query = new GetQuestionsQuery(label, orderBy, page, limit);
      this.logger.debug(`Executing query: ${JSON.stringify(query)}`);

      const result = await this.queryBus.execute(query);
      this.logger.log(`Successfully fetched questions for label: "${label}"`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch questions for label: "${label}"`, {
        error: error.message,
        stack: error.stack,
        query: { label, orderBy, page, limit },
      });

      throw new HttpException(
        'Error fetching questions. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async editQuestion(
    questionId: number,
    newQuestionText: string,
  ): Promise<Question> {
    this.logger.log(`Editing question with ID: ${questionId}`);

    try {
      this.logger.debug(`Fetching question with ID: ${questionId}`);
      const question = await this.questionRepository.findOne({
        where: { id: questionId },
        relations: ['variants'],
      });

      if (!question) {
        this.logger.warn(`Question not found for ID: ${questionId}`);
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      }

      this.logger.debug(`Updating question text for ID: ${questionId}`);
      question.question = newQuestionText;

      const updatedQuestion = await this.questionRepository.save(question);
      this.logger.log(`Successfully updated question with ID: ${questionId}`);

      return updatedQuestion;
    } catch (error) {
      this.logger.error(`Failed to edit question with ID: ${questionId}`, {
        error: error.message,
        stack: error.stack,
        questionId,
        newQuestionText,
      });

      throw new HttpException(
        'Error editing question. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async editVariant(
    variantId: number,
    newVariantText: string,
  ): Promise<Variant> {
    this.logger.log(`Editing variant with ID: ${variantId}`);

    try {
      const updatedVariant = await this.variantService.editVariant(
        variantId,
        newVariantText,
      );

      this.logger.log(`Successfully updated variant with ID: ${variantId}`);
      return updatedVariant;
    } catch (error) {
      this.logger.error(`Failed to edit variant with ID: ${variantId}`, {
        error: error.message,
        stack: error.stack,
        variantId,
        newVariantText,
      });

      throw new HttpException(
        'Error editing variant. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addVariant(
    questionId: number,
    newVariantText: string,
  ): Promise<Variant> {
    this.logger.log(`Adding new variant to question with ID: ${questionId}`);

    try {
      this.logger.debug(`Fetching question with ID: ${questionId}`);
      const question = await this.questionRepository.findOne({
        where: { id: questionId },
      });

      if (!question) {
        this.logger.warn(`Question not found for ID: ${questionId}`);
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      }

      const newVariant = await this.variantService.addVariant(
        question,
        newVariantText,
      );

      this.logger.log(
        `Successfully added variant to question with ID: ${questionId}`,
      );
      return newVariant;
    } catch (error) {
      this.logger.error(
        `Failed to add variant to question with ID: ${questionId}`,
        {
          error: error.message,
          stack: error.stack,
          questionId,
          newVariantText,
        },
      );

      throw new HttpException(
        'Error adding variant. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeVariant(variantId: number): Promise<void> {
    this.logger.log(`Removing variant with ID: ${variantId}`);

    try {
      await this.variantService.removeVariant(variantId);

      this.logger.log(`Successfully removed variant with ID: ${variantId}`);
    } catch (error) {
      this.logger.error(`Failed to remove variant with ID: ${variantId}`, {
        error: error.message,
        stack: error.stack,
        variantId,
      });

      throw new HttpException(
        'Error removing variant. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async regenerateSelectedQuestion(
    regenerateQuestionDto: RegenerateQuestionDto,
  ): Promise<Question> {
    const { promptId, questionId } = regenerateQuestionDto;

    this.logger.log(
      `Regenerating question with ID: ${questionId} using prompt ID: ${promptId}`,
    );

    try {
      this.logger.debug(`Fetching prompt with ID: ${promptId}`);
      const promptEntity = await this.promptRepository.findOne({
        where: { id: promptId },
      });

      if (!promptEntity) {
        this.logger.warn(`Prompt not found for ID: ${promptId}`);
        throw new HttpException('Prompt not found', HttpStatus.NOT_FOUND);
      }

      const { prompt, numberOfQuestions, type, difficulty } = promptEntity;

      this.logger.debug(
        `Generating questions with type: ${type}, difficulty: ${difficulty}, count: ${numberOfQuestions}`,
      );
      const generatedQuestions = await this.openaiService.generateQuestions(
        prompt,
        numberOfQuestions,
        type,
        difficulty,
      );

      if (!generatedQuestions.length) {
        this.logger.warn('No questions were generated by OpenAI');
        throw new HttpException(
          'No questions were generated',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const newQuestionData = generatedQuestions[0];

      this.logger.debug(`Fetching question with ID: ${questionId}`);
      const question = await this.questionRepository.findOne({
        where: { id: questionId },
        relations: ['variants'],
      });

      if (!question) {
        this.logger.warn(`Question not found for ID: ${questionId}`);
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      }

      question.question = newQuestionData.question;

      this.logger.debug(`Handling regeneration for question type: ${type}`);
      const questionTypeHandler =
        this.questionTypeHandlerFactory.createHandler(type);

      await questionTypeHandler.handle(question, newQuestionData);

      const updatedQuestion = await this.questionRepository.save(question);

      this.logger.log(
        `Successfully regenerated question with ID: ${questionId}`,
      );
      return updatedQuestion;
    } catch (error) {
      this.logger.error(
        `Failed to regenerate question with ID: ${questionId}`,
        {
          error: error.message,
          stack: error.stack,
          promptId,
          questionId,
        },
      );

      throw new HttpException(
        'Error regenerating question. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async exportQuestionsToExcel(questionIds: number[]): Promise<Buffer> {
    this.logger.log(
      `Exporting questions to Excel for IDs: ${questionIds.join(', ')}`,
    );

    try {
      this.logger.debug(`Fetching questions with IDs: ${questionIds}`);
      const questions = await this.questionRepository.find({
        where: {
          id: In(questionIds),
        },
        relations: ['variants', 'prompt'],
      });

      if (!questions.length) {
        this.logger.warn(`No questions found for provided IDs: ${questionIds}`);
        throw new HttpException('No questions found', HttpStatus.NOT_FOUND);
      }

      this.logger.debug('Formatting questions for Excel export');
      const formattedData = formatQuestionsForExcel(questions);

      this.logger.debug('Creating Excel buffer');
      const excelBuffer = createExcelBuffer(formattedData);

      this.logger.log(`Successfully exported questions to Excel`);
      return excelBuffer;
    } catch (error) {
      this.logger.error('Failed to export questions to Excel', {
        error: error.message,
        stack: error.stack,
        questionIds,
      });

      throw new HttpException(
        'Error exporting questions to Excel. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
