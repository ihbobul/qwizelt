import { Response } from 'express';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { fileValidatorConstants } from './constants';
import { GenerateQuestionDto } from './dto/generate-questions.dto';
import { RegenerateQuestionDto } from './dto/regenerate-question.dto';
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

  @Put('edit/:id')
  async editQuestion(
    @Param('id') questionId: number,
    @Body() { newQuestionText }: { newQuestionText: string },
  ) {
    return this.questionService.editQuestion(questionId, newQuestionText);
  }

  @Put('variants/edit/:id')
  async editVariant(
    @Param('id') variantId: number,
    @Body() { newVariantText }: { newVariantText: string },
  ) {
    return this.questionService.editVariant(variantId, newVariantText);
  }

  @Post('variants/add')
  async addVariant(
    @Body()
    {
      questionId,
      newVariantText,
    }: {
      questionId: number;
      newVariantText: string;
    },
  ) {
    return this.questionService.addVariant(questionId, newVariantText);
  }

  @Delete('variants/remove/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeVariant(@Param('id') variantId: number) {
    return this.questionService.removeVariant(variantId);
  }

  @Put('regenerate')
  async regenerateQuestions(
    @Body()
    regenerateQuestionDto: RegenerateQuestionDto,
  ) {
    return this.questionService.regenerateSelectedQuestion(
      regenerateQuestionDto,
    );
  }

  @Get('export')
  async exportQuestions(@Query('ids') ids: string, @Res() res: Response) {
    const questionIds = ids.split(',').map(Number);
    const excelBuffer =
      await this.questionService.exportQuestionsToExcel(questionIds);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="questions.xlsx"',
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.end(excelBuffer);
  }
}
