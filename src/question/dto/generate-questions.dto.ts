import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { Difficulty } from '../enum/difficulty.enum';
import { QuestionType } from '../enum/question-type.enum';

export class GenerateQuestionDto {
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  numberOfQuestions: number;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsOptional()
  @IsString()
  label: string;
}
