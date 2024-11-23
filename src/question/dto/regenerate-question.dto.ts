import { IsInt, IsNotEmpty } from 'class-validator';

export class RegenerateQuestionDto {
  @IsInt()
  @IsNotEmpty()
  questionId: number;

  @IsInt()
  @IsNotEmpty()
  promptId: number;
}
