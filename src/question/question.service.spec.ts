/* eslint-disable @typescript-eslint/no-unused-vars */
import { FileService } from 'src/file/file.service';
import { OpenaiService } from 'src/openai/openai.service';
import { DataSource, Repository } from 'typeorm';

import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { GenerateQuestionDto } from './dto/generate-questions.dto';
import { Prompt } from './entity/prompt.entity';
import { Question } from './entity/question.entity';
import { Variant } from './entity/variant.entity';
import { Difficulty } from './enum/difficulty.enum';
import { QuestionType } from './enum/question-type.enum';
import { QuestionService } from './question.service';
import { QuestionRepository } from './repository/question.repository';

describe('QuestionService', () => {
  let questionService: QuestionService;
  let openaiService: OpenaiService;
  let fileService: FileService;
  let questionRepository: QuestionRepository;
  let promptRepository: Repository<Prompt>;
  let queryBus: QueryBus;

  const mockOpenaiService = {
    generateQuestions: jest.fn().mockResolvedValue([
      { question: 'Mock Question 1', variants: ['Option A', 'Option B'] },
      { question: 'Mock Question 2', variants: ['Option C', 'Option D'] },
      { question: 'Mock Question 3', variants: ['Option E', 'Option F'] },
    ]),
  };

  const mockFileService = {
    extractText: jest.fn().mockResolvedValue('Sample prompt for questions'),
  };

  const mockCustomQuestionRepository = {
    saveQuestionsWithVariants: jest.fn().mockResolvedValue([
      { question: 'Mock Question 1', variants: ['Option A', 'Option B'] },
      { question: 'Mock Question 2', variants: ['Option C', 'Option D'] },
      { question: 'Mock Question 3', variants: ['Option E', 'Option F'] },
    ]),
  };

  const mockPromptRepository = {
    create: jest.fn().mockImplementation((entity) => ({
      ...entity,
      id: 1,
    })),
    save: jest.fn().mockResolvedValue({
      id: 1,
    }),
  };

  const mockVariantRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockQueryBus = {
    execute: jest.fn(),
  };

  // Mock DataSource
  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockCustomQuestionRepository),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        { provide: OpenaiService, useValue: mockOpenaiService },
        { provide: FileService, useValue: mockFileService },
        { provide: QueryBus, useValue: mockQueryBus },
        {
          provide: getRepositoryToken(Question),
          useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(Question),
          inject: [getDataSourceToken()],
        },
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
        { provide: getRepositoryToken(Prompt), useValue: mockPromptRepository },
        {
          provide: getRepositoryToken(Variant),
          useValue: mockVariantRepository,
        },
      ],
    }).compile();

    questionService = module.get<QuestionService>(QuestionService);
    openaiService = module.get<OpenaiService>(OpenaiService);
    fileService = module.get<FileService>(FileService);
    questionRepository = module.get<QuestionRepository>(
      getRepositoryToken(Question),
    );
    promptRepository = module.get<Repository<Prompt>>(
      getRepositoryToken(Prompt),
    );
    queryBus = module.get<QueryBus>(QueryBus);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(questionService).toBeDefined();
  });

  describe('generateQuestions', () => {
    it('should call OpenaiService, save each question, and return questions', async () => {
      const dto: GenerateQuestionDto = {
        prompt: 'Sample prompt',
        numberOfQuestions: 3,
        type: QuestionType.MCQ,
        difficulty: Difficulty.MEDIUM,
        label: 'Test Label',
      };

      const result = await questionService.generateQuestions(dto);

      expect(openaiService.generateQuestions).toHaveBeenCalledWith(
        'Sample prompt',
        3,
        QuestionType.MCQ,
        Difficulty.MEDIUM,
      );

      expect(mockPromptRepository.create).toHaveBeenCalledWith({
        prompt: 'Sample prompt',
        numberOfQuestions: 3,
        type: QuestionType.MCQ,
        difficulty: Difficulty.MEDIUM,
      });

      expect(
        mockCustomQuestionRepository.saveQuestionsWithVariants,
      ).toHaveBeenCalledWith(
        [
          { question: 'Mock Question 1', variants: ['Option A', 'Option B'] },
          { question: 'Mock Question 2', variants: ['Option C', 'Option D'] },
          { question: 'Mock Question 3', variants: ['Option E', 'Option F'] },
        ],
        expect.objectContaining({ id: 1 }),
        'Test Label',
      );

      expect(result).toEqual([
        { question: 'Mock Question 1', variants: ['Option A', 'Option B'] },
        { question: 'Mock Question 2', variants: ['Option C', 'Option D'] },
        { question: 'Mock Question 3', variants: ['Option E', 'Option F'] },
      ]);
    });

    it('should generate questions from file and return the questions', async () => {
      const file = {
        buffer: Buffer.from('file content'),
      } as Express.Multer.File;

      const dto: GenerateQuestionDto = {
        numberOfQuestions: 3,
        type: QuestionType.MCQ,
        difficulty: Difficulty.MEDIUM,
        label: 'Test Label from File',
      };

      const result = await questionService.generateQuestionsFromFile(file, dto);

      expect(mockFileService.extractText).toHaveBeenCalledWith(
        expect.objectContaining({
          buffer: expect.any(Buffer),
        }),
      );

      expect(openaiService.generateQuestions).toHaveBeenCalledWith(
        'Sample prompt for questions',
        3,
        QuestionType.MCQ,
        Difficulty.MEDIUM,
      );

      expect(
        mockCustomQuestionRepository.saveQuestionsWithVariants,
      ).toHaveBeenCalledWith(
        [
          { question: 'Mock Question 1', variants: ['Option A', 'Option B'] },
          { question: 'Mock Question 2', variants: ['Option C', 'Option D'] },
          { question: 'Mock Question 3', variants: ['Option E', 'Option F'] },
        ],
        expect.objectContaining({ id: 1 }),
        'Test Label from File',
      );

      expect(result).toEqual([
        { question: 'Mock Question 1', variants: ['Option A', 'Option B'] },
        { question: 'Mock Question 2', variants: ['Option C', 'Option D'] },
        { question: 'Mock Question 3', variants: ['Option E', 'Option F'] },
      ]);
    });
  });
});
