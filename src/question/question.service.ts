import { OpenaiService } from 'src/openai/openai.service';

import { Injectable } from '@nestjs/common';

import { GenerateQuestionDto } from './dto/generate-questions.dto';

@Injectable()
export class QuestionService {
  constructor(private readonly openAiService: OpenaiService) {}

  async generateQuestions(generateQuestionsDto: GenerateQuestionDto) {
    const { prompt, numberOfQuestions, type, difficulty } =
      generateQuestionsDto;

    return this.openAiService.generateQuestions(
      prompt,
      numberOfQuestions,
      type,
      difficulty,
    );
  }
}
