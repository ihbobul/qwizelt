import { Column, Entity, JoinTable, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../question/entity/abs/abstract.entity';
import { Question } from '../../question/entity/question.entity';

@Entity()
export class Variant extends AbstractEntity {
  @Column()
  variant: string;

  @ManyToOne(() => Question, (question) => question.variants)
  @JoinTable({ name: 'question_id' })
  question: Question;
}
