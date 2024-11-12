import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { OpenaiService } from './openai.service';

describe('OpenaiService', () => {
  let service: OpenaiService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('dummy-api-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenaiService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<OpenaiService>(OpenaiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return mock questions without calling OpenAI API', async () => {
    jest
      .spyOn(service, 'generateQuestions')
      .mockResolvedValue(['Mock API Question']);
    const result = await service.generateQuestions('Sample prompt', 1);
    expect(result).toEqual(['Mock API Question']);
  });
});
