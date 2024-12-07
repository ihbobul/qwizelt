import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Label } from './entity/label.entity';
import { LabelService } from './label.service';

@Module({
  imports: [TypeOrmModule.forFeature([Label])],
  providers: [LabelService],
  exports: [LabelService],
})
export class LabelModule {}
