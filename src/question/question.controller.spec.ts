import { Test, TestingModule } from '@nestjs/testing';

import { GenerateQuestionDto } from './dto/generate-questions.dto';
import { Difficulty } from './enum/difficulty.enum';
import { QuestionType } from './enum/question-type.enum';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

describe('QuestionController', () => {
  let controller: QuestionController;
  let questionService: QuestionService;

  const mockQuestionService = {
    generateQuestions: jest.fn().mockResolvedValue(['Mock Question 1']),
    generateQuestionsFromFile: jest
      .fn()
      .mockResolvedValue(['Mock File Question']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionController],
      providers: [{ provide: QuestionService, useValue: mockQuestionService }],
    }).compile();

    controller = module.get<QuestionController>(QuestionController);
    questionService = module.get<QuestionService>(QuestionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call generateQuestions and return mock questions', async () => {
    const generateQuestionsDto: GenerateQuestionDto = {
      prompt: 'Sample prompt',
      numberOfQuestions: 1,
      type: QuestionType.SHORT_ANSWER,
      difficulty: Difficulty.EASY,
    };

    const result = await controller.generateQuestions(generateQuestionsDto);

    expect(questionService.generateQuestions).toHaveBeenCalledWith(
      generateQuestionsDto.prompt,
      generateQuestionsDto.numberOfQuestions,
      generateQuestionsDto.type,
      generateQuestionsDto.difficulty,
    );
    expect(result).toEqual(['Mock Question 1']);
  });

  it('should call generateQuestionsFromFile and return mock file questions', async () => {
    const mockFile = {
      buffer: Buffer.from(''),
      mimetype: 'text/plain',
    } as Express.Multer.File;

    const generateQuestionsDto: GenerateQuestionDto = {
      prompt: 'Sample prompt',
      numberOfQuestions: 1,
      type: QuestionType.SHORT_ANSWER,
      difficulty: Difficulty.EASY,
    };

    const result = await controller.generateQuestionsFromFile(
      mockFile,
      generateQuestionsDto,
    );

    expect(questionService.generateQuestionsFromFile).toHaveBeenCalledWith(
      mockFile,
      generateQuestionsDto.numberOfQuestions,
      generateQuestionsDto.type,
      generateQuestionsDto.difficulty,
    );
    expect(result).toEqual(['Mock File Question']);
  });
});
