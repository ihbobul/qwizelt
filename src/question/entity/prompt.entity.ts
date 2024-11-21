import { Column, Entity, OneToMany } from 'typeorm';

import { Difficulty } from '../enum/difficulty.enum';
import { QuestionType } from '../enum/question-type.enum';
import { AbstractEntity } from './abs/abstract.entity';
import { Question } from './question.entity';

@Entity()
export class Prompt extends AbstractEntity {
  @Column({ type: 'text' })
  prompt: string;

  @Column()
  difficulty: Difficulty;

  @Column()
  type: QuestionType;

  @Column()
  numberOfQuestions: number;

  @OneToMany(() => Question, (question) => question.prompt)
  questions: Question[];
}
