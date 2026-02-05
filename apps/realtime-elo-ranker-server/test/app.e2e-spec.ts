import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Realtime Elo Ranker (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/player (POST) - Create Player', () => {
    return request(app.getHttpServer())
      .post('/api/player')
      .send({ id: 'player1' })
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe('player1');
        expect(res.body.rank).toBe(1200);
      });
  });

  it('/api/match (POST) - Create Match and Update Ranks', async () => {
    // 1. Create players
    await request(app.getHttpServer()).post('/api/player').send({ id: 'winner' });
    await request(app.getHttpServer()).post('/api/player').send({ id: 'loser' });

    // 2. Post match
    return request(app.getHttpServer())
      .post('/api/match')
      .send({ winner: 'winner', loser: 'loser', draw: false })
      .expect(200)
      .expect((res) => {
        expect(res.body.winner.rank).toBeGreaterThan(1200);
        expect(res.body.loser.rank).toBeLessThan(1200);
      });
  });

  it('/api/ranking (GET) - Get Sorted Ranking', async () => {
    await request(app.getHttpServer()).post('/api/player').send({ id: 'p1' });
    
    return request(app.getHttpServer())
      .get('/api/ranking')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        // Verify sort order if multiple players existed
      });
  });
});
