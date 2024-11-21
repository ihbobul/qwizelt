import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from './abs/abstract.entity';
import { Prompt } from './prompt.entity';
import { Variant } from './variant.entity';

@Entity()
export class Question extends AbstractEntity {
  @Column()
  question: string;

  @Column()
  label: string;

  @ManyToOne(() => Prompt, (prompt) => prompt.questions)
  @JoinColumn({ name: 'prompt_id' })
  prompt: Prompt;

  @OneToMany(() => Variant, (variant) => variant.question)
  variants: Variant[];
}
