import { FileModule } from 'src/file/file.module';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { OpenaiService } from './openai.service';

@Module({
  imports: [ConfigModule, FileModule],
  providers: [OpenaiService],
  exports: [OpenaiService],
})
export class OpenaiModule {}
