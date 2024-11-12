import { OpenaiService } from 'src/openai/openai.service';

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

describe('QuestionController', () => {
  let controller: QuestionController;

  const mockOpenaiService = {
    generateQuestions: jest.fn().mockResolvedValue(['Mock Question 1']),
    generateQuestionsFromFile: jest
      .fn()
      .mockResolvedValue(['Mock File Question']),
  };

  const mockQuestionService = {
    generateQuestions: jest.fn().mockResolvedValue(['Mock Question 1']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionController],
      providers: [
        { provide: QuestionService, useValue: mockQuestionService },
        { provide: OpenaiService, useValue: mockOpenaiService },
        ConfigService,
      ],
    }).compile();

    controller = module.get<QuestionController>(QuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call generateQuestions and return mock questions', async () => {
    const result = await controller.generateQuestions({
      prompt: 'Sample prompt',
      numberOfQuestions: 1,
      type: 'short-answer',
      difficulty: 'easy',
    });
    expect(mockQuestionService.generateQuestions).toHaveBeenCalled();
    expect(result).toEqual(['Mock Question 1']);
  });

  it('should call generateQuestionsFromFile and return mock file questions', async () => {
    const mockFile = {
      buffer: Buffer.from(''),
      mimetype: 'text/plain',
    } as Express.Multer.File;

    const result = await controller.generateQuestionsFromFile(mockFile, {
      prompt: 'Sample prompt',
      numberOfQuestions: 1,
      type: 'short-answer',
      difficulty: 'easy',
    });
    expect(mockOpenaiService.generateQuestionsFromFile).toHaveBeenCalled();
    expect(result).toEqual(['Mock File Question']);
  });
});
