import { OpenaiService } from 'src/openai/openai.service';

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { QuestionService } from './question.service';

describe('QuestionService', () => {
  let service: QuestionService;
  let openaiService: OpenaiService;

  const mockOpenaiService = {
    generateQuestions: jest
      .fn()
      .mockResolvedValue(['Mock Question 1', 'Mock Question 2']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        { provide: OpenaiService, useValue: mockOpenaiService },
        ConfigService,
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
    openaiService = module.get<OpenaiService>(OpenaiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call OpenaiService and return questions', async () => {
    const result = await service.generateQuestions({
      prompt: 'Sample prompt',
      numberOfQuestions: 2,
      type: 'multiple-choice',
      difficulty: 'medium',
    });
    expect(openaiService.generateQuestions).toHaveBeenCalled();
    expect(result).toEqual(['Mock Question 1', 'Mock Question 2']);
  });
});
