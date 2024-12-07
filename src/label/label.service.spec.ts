import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Label } from './entity/label.entity';
import { LabelService } from './label.service';

describe('LabelService', () => {
  let service: LabelService;

  const mockLabelRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabelService,
        {
          provide: getRepositoryToken(Label),
          useValue: mockLabelRepository,
        },
      ],
    }).compile();

    service = module.get<LabelService>(LabelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
