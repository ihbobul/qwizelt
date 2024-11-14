// file.service.ts
import { Injectable } from '@nestjs/common';

import { FileTextExtractorFactory } from './file-extractor/file-text-extractor-factory';

@Injectable()
export class FileService {
  constructor(private readonly extractorFactory: FileTextExtractorFactory) {}

  async extractText(file: Express.Multer.File): Promise<string> {
    const extractor = this.extractorFactory.createExtractor(file.mimetype);
    return extractor.extractText(file.buffer);
  }
}
