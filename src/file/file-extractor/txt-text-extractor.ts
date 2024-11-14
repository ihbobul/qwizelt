import { FileTextExtractor } from './file-text-extractor.interface';

export class TxtTextExtractor implements FileTextExtractor {
  async extractText(buffer: Buffer): Promise<string> {
    return buffer.toString('utf-8');
  }
}
