import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { fileValidatorConstants } from './constants';
import { GenerateQuestionDto } from './dto/generate-questions.dto';
import { Question } from './entity/question.entity';
import { QuestionService } from './question.service';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('generate')
  async generateQuestions(@Body() generateQuestionsDto: GenerateQuestionDto) {
    return this.questionService.generateQuestions(generateQuestionsDto);
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
      generateQuestionsDto,
    );
  }

  @Get('filter')
  async getFilteredQuestions(
    @Query('label') label: string,
    @Query('orderBy') orderBy: 'ASC' | 'DESC' = 'ASC',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Question[]> {
    return this.questionService.getFilteredQuestions(
      label,
      orderBy,
      page,
      limit,
    );
  }
}
