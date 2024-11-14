export interface FileTextExtractor {
  extractText(buffer: Buffer): Promise<string>;
}
