import { Module } from '@nestjs/common';

import { FileService } from './file.service';
import { FileTextExtractorFactory } from './file-extractor/file-text-extractor-factory';

@Module({
  providers: [FileService, FileTextExtractorFactory],
  exports: [FileService],
})
export class FileModule {}
