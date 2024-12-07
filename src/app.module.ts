import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { Label } from './label/entity/label.entity';
import { LabelModule } from './label/label.module';
import { OpenaiModule } from './openai/openai.module';
import { Prompt } from './question/entity/prompt.entity';
import { Question } from './question/entity/question.entity';
import { QuestionModule } from './question/question.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { Variant } from './variant/entity/variant.entity';
import { VariantModule } from './variant/variant.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        if (process.env.NODE_ENV === 'test') {
          return {
            type: 'sqlite',
            database: ':memory:',
            entities: [User, Question, Prompt, Variant, Label],
            synchronize: true,
            dropSchema: true,
          };
        } else {
          return {
            type: 'postgres',
            host: 'localhost',
            port: 5440,
            username: 'postgres',
            password: 'changeme',
            database: 'qwizelt',
            entities: [User, Question, Prompt, Variant, Label],
            synchronize: true,
          };
        }
      },
    }),
    ConfigModule.forRoot({}),
    CacheModule.register({ isGlobal: true }),
    UserModule,
    OpenaiModule,
    QuestionModule,
    FileModule,
    CqrsModule,
    VariantModule,
    LabelModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
