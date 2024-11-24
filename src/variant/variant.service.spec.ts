import { Variant } from 'src/variant/entity/variant.entity';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { VariantService } from './variant.service';

describe('VariantService', () => {
  let service: VariantService;

  const mockVariantRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VariantService,
        {
          provide: getRepositoryToken(Variant),
          useValue: mockVariantRepository,
        },
      ],
    }).compile();

    service = module.get<VariantService>(VariantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
