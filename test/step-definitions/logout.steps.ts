/* eslint-disable @typescript-eslint/no-unused-vars */
import * as cookieParser from 'cookie-parser';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

let app: INestApplication;
let userService: UserService;
let authService: AuthService;
let response: request.Response;
let email: string;
let password: string;
let accessToken: string;
let refreshToken: string;
let userId: number;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.use(cookieParser());
  await app.init();

  userService = app.get<UserService>(UserService);
  authService = app.get<AuthService>(AuthService);
});

afterAll(async () => {
  await app.close();
});

const feature = loadFeature('./test/features/logout.feature');

defineFeature(feature, (test) => {
  test('User logs out successfully', ({ given, when, then, and }) => {
    given('I have a valid refresh token', async () => {
      const createUserDto: CreateUserDto = {
        email: 'validuser@example.com',
        password: 'validpassword',
        firstName: 'Valid',
        lastName: 'User',
      };
      const user = await userService.create(createUserDto);
      userId = user.id;

      email = createUserDto.email;
      password = createUserDto.password;

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });

      accessToken = loginResponse.body.accessToken;
      refreshToken = loginResponse.body.refreshToken;
    });

    when('I send a logout request with the refresh token', async () => {
      response = await request(app.getHttpServer()).post('/auth/logout').send({
        refreshToken,
      });
    });

    then(
      'I should receive a success message indicating the logout was successful',
      () => {
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Logout successful');
      },
    );

    and('the refresh token should be invalidated', async () => {
      const isInvalidated =
        await authService.isRefreshInvalidated(refreshToken);
      expect(isInvalidated).toBe(true);
    });
  });

  test('User tries to log out with an invalid refresh token', ({
    given,
    when,
    then,
    and,
  }) => {
    given('I have an invalid refresh token', () => {
      refreshToken = 'invalid-refresh-token';
    });

    when('I send a logout request with the invalid refresh token', async () => {
      response = await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken });
    });

    then(
      'I should receive an error message indicating the refresh token is invalid',
      () => {
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid refresh token');
      },
    );

    and('the response status should be 400', () => {
      expect(response.status).toBe(400);
    });
  });
});
