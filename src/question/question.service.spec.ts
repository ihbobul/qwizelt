import { FileService } from 'src/file/file.service';
import { OpenaiService } from 'src/openai/openai.service';

import { Test, TestingModule } from '@nestjs/testing';

import { Difficulty } from './enum/difficulty.enum';
import { QuestionType } from './enum/question-type.enum';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
  let questionService: QuestionService;
  let openaiService: OpenaiService;
  let fileService: FileService;

  const mockOpenaiService = {
    generateQuestions: jest
      .fn()
      .mockResolvedValue(['Mock Question 1', 'Mock Question 2']),
  };

  const mockFileService = {
    extractText: jest.fn().mockResolvedValue('Extracted file text'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        { provide: OpenaiService, useValue: mockOpenaiService },
        { provide: FileService, useValue: mockFileService },
      ],
    }).compile();

    questionService = module.get<QuestionService>(QuestionService);
    openaiService = module.get<OpenaiService>(OpenaiService);
    fileService = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(questionService).toBeDefined();
  });

  describe('generateQuestions', () => {
    it('should call OpenaiService and return questions', async () => {
      const result = await questionService.generateQuestions(
        'Sample prompt',
        2,
        QuestionType.MCQ,
        Difficulty.MEDIUM,
      );

      expect(openaiService.generateQuestions).toHaveBeenCalledWith(
        'Sample prompt',
        2,
        QuestionType.MCQ,
        Difficulty.MEDIUM,
      );
      expect(result).toEqual(['Mock Question 1', 'Mock Question 2']);
    });
  });

  describe('generateQuestionsFromFile', () => {
    it('should extract text from the file and call OpenaiService', async () => {
      const mockFile = {} as Express.Multer.File;

      const result = await questionService.generateQuestionsFromFile(
        mockFile,
        3,
        QuestionType.SHORT_ANSWER,
        Difficulty.HARD,
      );

      expect(fileService.extractText).toHaveBeenCalledWith(mockFile);
      expect(openaiService.generateQuestions).toHaveBeenCalledWith(
        'Extracted file text',
        3,
        QuestionType.SHORT_ANSWER,
        Difficulty.HARD,
      );
      expect(result).toEqual(['Mock Question 1', 'Mock Question 2']);
    });
  });
});
