import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) - Health check', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
      });
  });

  describe('Authentication Endpoints', () => {
    it('/auth/google (GET) - Should redirect to Google OAuth', () => {
      return request(app.getHttpServer())
        .get('/auth/google')
        .expect(302); // Redirect status
    });
  });

  describe('Wallet Endpoints - Unauthorized', () => {
    it('/wallet/balance (GET) - Should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/wallet/balance').expect(401);
    });

    it('/wallet/deposit (POST) - Should return 401 without auth', () => {
      return request(app.getHttpServer())
        .post('/wallet/deposit')
        .send({ amount: 5000 })
        .expect(401);
    });

    it('/wallet/transfer (POST) - Should return 401 without auth', () => {
      return request(app.getHttpServer())
        .post('/wallet/transfer')
        .send({ wallet_number: '1234567890123', amount: 1000 })
        .expect(401);
    });

    it('/wallet/transactions (GET) - Should return 401 without auth', () => {
      return request(app.getHttpServer())
        .get('/wallet/transactions')
        .expect(401);
    });
  });

  describe('API Keys Endpoints - Unauthorized', () => {
    it('/keys/create (POST) - Should return 401 without auth', () => {
      return request(app.getHttpServer())
        .post('/keys/create')
        .send({
          name: 'Test Key',
          permissions: ['read'],
          expiry: '1M',
        })
        .expect(401);
    });

    it('/keys (GET) - Should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/keys').expect(401);
    });
  });
});
