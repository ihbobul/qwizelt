import { AuthService } from './../../src/auth/auth.service';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { defineFeature, loadFeature } from 'jest-cucumber';

let app: INestApplication;
let authService: AuthService;
let response: request.Response;
let email: string;
let password: string;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  authService = app.get<AuthService>(AuthService);
});

afterAll(async () => {
  await app.close();
});

const feature = loadFeature('./test/features/register.feature');

defineFeature(feature, (test) => {
  test('Successful Registration', ({ given, when, then }) => {
    given('I have a valid email and password', () => {
      email = 'newuser@example.com';
      password = 'securepassword';
    });

    when('I send a registration request', async () => {
      response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password });
    });

    then('I should receive a confirmation response', () => {
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'User registered successfully!',
      });
    });
  });

  test('Registration with Existing Email', ({ given, when, then }) => {
    given('I have an email that is already registered', async () => {
      email = 'existinguser@example.com';
      password = 'securepassword';

      await authService.register({ email, password });
    });

    when('I send a registration request', async () => {
      response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password });
    });

    then(
      'I should receive an error indicating that the email is already in use',
      () => {
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: 'Email already in use.',
          statusCode: 400,
        });
      },
    );
  });
});
