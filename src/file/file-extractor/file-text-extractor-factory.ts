import { BadRequestException, Injectable } from '@nestjs/common';

import { MimeType } from '../enum/mime-type.enum';
import { DocxTextExtractor } from './docx-text-extractor';
import { FileTextExtractor } from './file-text-extractor.interface';
import { PdfTextExtractor } from './pdf-text-extractor';
import { TxtTextExtractor } from './txt-text-extractor';

@Injectable()
export class FileTextExtractorFactory {
  createExtractor(mimeType: string): FileTextExtractor {
    switch (mimeType) {
      case MimeType.PDF:
        return new PdfTextExtractor();
      case MimeType.DOCX:
        return new DocxTextExtractor();
      case MimeType.TXT:
        return new TxtTextExtractor();
      default:
        throw new BadRequestException('Unsupported file type.');
    }
  }
}
