import { AbstractEntity } from 'src/question/entity/abs/abstract.entity';
import { Question } from 'src/question/entity/question.entity';
import { Column, Entity, JoinTable, ManyToOne } from 'typeorm';

@Entity()
export class Label extends AbstractEntity {
  @Column()
  label: string;

  @ManyToOne(() => Question, (question) => question.labels)
  @JoinTable({ name: 'question_id' })
  question: Question;
}
