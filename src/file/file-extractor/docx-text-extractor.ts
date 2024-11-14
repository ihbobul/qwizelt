import * as mammoth from 'mammoth';

import { FileTextExtractor } from './file-text-extractor.interface';

export class DocxTextExtractor implements FileTextExtractor {
  async extractText(buffer: Buffer): Promise<string> {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
}
