import { Variant } from 'src/variant/entity/variant.entity';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VariantService } from './variant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Variant])],
  providers: [VariantService],
  exports: [VariantService],
})
export class VariantModule {}
