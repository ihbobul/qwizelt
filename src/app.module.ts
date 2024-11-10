import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        if (process.env.NODE_ENV === 'test') {
          return {
            type: 'sqlite',
            database: ':memory:',
            entities: [User],
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
            entities: [User],
            synchronize: true,
          };
        }
      },
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
