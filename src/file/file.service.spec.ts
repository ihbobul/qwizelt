import { Test, TestingModule } from '@nestjs/testing';

import { FileService } from './file.service';
import { FileTextExtractorFactory } from './file-extractor/file-text-extractor-factory';

describe('FileService', () => {
  let service: FileService;
  let factory: FileTextExtractorFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService, FileTextExtractorFactory],
    }).compile();

    service = module.get<FileService>(FileService);
    factory = module.get<FileTextExtractorFactory>(FileTextExtractorFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(factory).toBeDefined();
  });
});
