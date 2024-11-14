import { FileService } from 'src/file/file.service';
import { OpenaiService } from 'src/openai/openai.service';

import { Injectable } from '@nestjs/common';

import { Difficulty } from './enum/difficulty.enum';
import { QuestionType } from './enum/question-type.enum';

@Injectable()
export class QuestionService {
  constructor(
    private readonly openaiService: OpenaiService,
    private readonly fileService: FileService,
  ) {}

  async generateQuestions(
    prompt: string,
    numberOfQuestions: number,
    type: QuestionType,
    difficulty: Difficulty,
  ) {
    return this.openaiService.generateQuestions(
      prompt,
      numberOfQuestions,
      type,
      difficulty,
    );
  }

  async generateQuestionsFromFile(
    file: Express.Multer.File,
    numberOfQuestions: number,
    type: QuestionType,
    difficulty: Difficulty,
  ) {
    const text = await this.fileService.extractText(file);
    console.log(text);
    return this.openaiService.generateQuestions(
      text,
      numberOfQuestions,
      type,
      difficulty,
    );
  }
}
