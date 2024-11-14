import * as pdf from 'pdf-parse';

import { FileTextExtractor } from './file-text-extractor.interface';

export class PdfTextExtractor implements FileTextExtractor {
  async extractText(buffer: Buffer): Promise<string> {
    const { text } = await pdf(buffer);
    return text;
  }
}
