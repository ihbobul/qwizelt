import { defineFeature, loadFeature } from 'jest-cucumber';
import { AppModule } from 'src/app.module';
import { UserService } from 'src/user/user.service';
import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

let app: INestApplication;
let userService: UserService;
let response: request.Response;
let email: string;
let password: string;
let token: string;
let userId: number;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  userService = app.get<UserService>(UserService);
});

afterAll(async () => {
  await app.close();
});

const feature = loadFeature('./test/features/login.feature');

defineFeature(feature, (test) => {
  test('User login with valid credentials', ({ given, when, then }) => {
    given('I have valid credentials', async () => {
      email = 'validuser@example.com';
      password = 'validpassword';

      const user = await userService.create(email, password);
      userId = user.id;
    });

    when('I send a login request with those credentials', async () => {
      response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });
    });

    then('I should receive a JWT token', () => {
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      token = response.body.token;
    });

    then('I should be able to access protected resources', async () => {
      const protectedResponse = await request(app.getHttpServer())
        .get(`/user/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(protectedResponse.status).toBe(200);
    });
  });

  test('User login with invalid credentials', ({ given, when, then }) => {
    given('I have invalid credentials', () => {
      email = 'invaliduser@example.com';
      password = 'invalidpassword';
    });

    when('I send a login request with those credentials', async () => {
      response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });
    });

    then(
      'I should receive an error message indicating invalid credentials',
      () => {
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid credentials.');
      },
    );
  });
});
