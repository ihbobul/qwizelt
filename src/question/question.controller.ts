import { OpenaiService } from 'src/openai/openai.service';

import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { GenerateQuestionDto } from './dto/generate-questions.dto';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(
    private readonly questionService: QuestionService,
    private readonly openAiService: OpenaiService,
  ) {}

  @Post('generate')
  async generateQuestions(@Body() generateQuestionsDto: GenerateQuestionDto) {
    return this.questionService.generateQuestions(generateQuestionsDto);
  }

  @Post('generate-from-file')
  @UseInterceptors(FileInterceptor('file'))
  async generateQuestionsFromFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() { numberOfQuestions, type, difficulty }: GenerateQuestionDto,
  ) {
    return this.openAiService.generateQuestionsFromFile(
      file,
      numberOfQuestions,
      type,
      difficulty,
    );
  }
}
