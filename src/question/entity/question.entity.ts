import { Label } from 'src/label/entity/label.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { Variant } from '../../variant/entity/variant.entity';
import { AbstractEntity } from './abs/abstract.entity';
import { Prompt } from './prompt.entity';

@Entity()
export class Question extends AbstractEntity {
  @Column()
  question: string;

  @ManyToOne(() => Prompt, (prompt) => prompt.questions)
  @JoinColumn({ name: 'prompt_id' })
  prompt: Prompt;

  @OneToMany(() => Variant, (variant) => variant.question)
  variants: Variant[];

  @OneToMany(() => Label, (label) => label.question)
  labels: Label[];
}
