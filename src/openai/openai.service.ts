import * as mammoth from 'mammoth';
import { OpenAI } from 'openai';
import * as pdf from 'pdf-parse';

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;
  private apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey: this.apiKey });
  }

  async generateQuestions(
    prompt: string,
    numberOfQuestions: number,
    type: string = 'short-answer',
    difficulty: string = 'easy',
  ) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI that generates educational test questions.`,
        },
        {
          role: 'user',
          content: `Here is the theoretical material: ${prompt}. Generate ${numberOfQuestions} questions with ${type} type and ${difficulty} difficulty.`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.5,
    });

    return response.choices.map((choice) => choice.message?.content?.trim());
  }

  async extractTextFromFile(file: Express.Multer.File): Promise<string> {
    const fileType = file.mimetype;
    if (fileType === 'application/pdf') {
      const data = await pdf(file.buffer);
      return data.text;
    } else if (
      fileType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const { value } = await mammoth.extractRawText({ buffer: file.buffer });
      return value;
    } else if (fileType === 'text/plain') {
      return file.buffer.toString('utf-8');
    } else {
      throw new BadRequestException('Unsupported file type.');
    }
  }

  async generateQuestionsFromFile(
    file: Express.Multer.File,
    numberOfQuestions: number,
    type: string = 'short-answer',
    difficulty: string = 'easy',
  ) {
    const text = await this.extractTextFromFile(file);
    console.log(text);
    return this.generateQuestions(text, numberOfQuestions, type, difficulty);
  }
}
