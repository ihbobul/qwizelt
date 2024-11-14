import {
  Body,
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { fileValidatorConstants } from './constants';
import { GenerateQuestionDto } from './dto/generate-questions.dto';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('generate')
  async generateQuestions(@Body() generateQuestionsDto: GenerateQuestionDto) {
    return this.questionService.generateQuestions(
      generateQuestionsDto.prompt,
      generateQuestionsDto.numberOfQuestions,
      generateQuestionsDto.type,
      generateQuestionsDto.difficulty,
    );
  }

  @Post('generate-from-file')
  @UseInterceptors(FileInterceptor('file'))
  async generateQuestionsFromFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: fileValidatorConstants.allowedFileTypeRegex,
        })
        .addMaxSizeValidator({
          maxSize: fileValidatorConstants.allowedMaxFileSize,
        })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
    @Body() generateQuestionsDto: GenerateQuestionDto,
  ) {
    return this.questionService.generateQuestionsFromFile(
      file,
      generateQuestionsDto.numberOfQuestions,
      generateQuestionsDto.type,
      generateQuestionsDto.difficulty,
    );
  }
}
