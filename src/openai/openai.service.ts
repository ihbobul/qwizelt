import { OpenAI } from 'openai';
import { Difficulty } from 'src/question/enum/difficulty.enum';
import { QuestionType } from 'src/question/enum/question-type.enum';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PromptBuilderUtil } from './util/prompt-builder.util';
import { QuestionExampleUtil } from './util/question-example.util';

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
    type: QuestionType,
    difficulty: Difficulty,
  ): Promise<string[]> {
    const example = QuestionExampleUtil.generateExample(type);

    const openaiPrompt = PromptBuilderUtil.generateQuestionsPrompt(
      prompt,
      numberOfQuestions,
      type,
      difficulty,
      example,
    );

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that generates educational test questions.`,
        },
        {
          role: 'user',
          content: openaiPrompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.5,
    });

    return response.choices.map((choice) => choice.message?.content?.trim());
  }
}
