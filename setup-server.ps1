# Définition du chemin de base
$BaseDir = "apps\realtime-elo-ranker-server"

Write-Host "Nettoyage de l'ancienne source..." -ForegroundColor Yellow
if (Test-Path "$BaseDir\src") { Remove-Item "$BaseDir\src" -Recurse -Force }
if (Test-Path "$BaseDir\test") { Remove-Item "$BaseDir\test" -Recurse -Force }

# Création des dossiers
Write-Host "Creation de l'arborescence..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "$BaseDir\src\common\dto" | Out-Null
New-Item -ItemType Directory -Force -Path "$BaseDir\src\domain" | Out-Null
New-Item -ItemType Directory -Force -Path "$BaseDir\src\players\dto" | Out-Null
New-Item -ItemType Directory -Force -Path "$BaseDir\src\players\entities" | Out-Null
New-Item -ItemType Directory -Force -Path "$BaseDir\src\matches\dto" | Out-Null
New-Item -ItemType Directory -Force -Path "$BaseDir\src\matches\entities" | Out-Null
New-Item -ItemType Directory -Force -Path "$BaseDir\src\ranking" | Out-Null
New-Item -ItemType Directory -Force -Path "$BaseDir\test" | Out-Null

Write-Host "Generation des fichiers..." -ForegroundColor Cyan

# --- package.json ---
$Content = @'
{
  "name": "realtime-elo-ranker-server",
  "version": "0.0.1",
  "description": "",
  "author": "",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/event-emitter": "^2.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "sqlite3": "^5.1.6",
    "typeorm": "^0.3.17"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.3.1",
    "@types/supertest": "^2.0.12",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "jest": "^29.5.0",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
'@
Set-Content -Path "$BaseDir\package.json" -Value $Content -Encoding UTF8

# --- tsconfig.app.json ---
$Content = @'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": "./",
    "module": "commonjs",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "sourceMap": true,
    "types": [
      "node"
    ]
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "test",
    "**/*spec.ts"
  ]
}
'@
Set-Content -Path "$BaseDir\tsconfig.app.json" -Value $Content -Encoding UTF8

# --- src/main.ts ---
$Content = @'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  
  // CORS active pour permettre au client NextJS (port 3000) de parler au serveur
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(3001); // Le client tourne sur 3000 ou 8080, on met le serveur sur 3001
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
'@
Set-Content -Path "$BaseDir\src\main.ts" -Value $Content -Encoding UTF8

# --- src/app.module.ts ---
$Content = @'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PlayersModule } from './players/players.module';
import { MatchesModule } from './matches/matches.module';
import { RankingModule } from './ranking/ranking.module';
import { Player } from './players/entities/player.entity';
import { Match } from './matches/entities/match.entity';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'elo.db', // Persistance locale pour le test
      entities: [Player, Match],
      synchronize: true, // Auto-schema update pour le dev uniquement
    }),
    PlayersModule,
    MatchesModule,
    RankingModule,
  ],
})
export class AppModule {}
'@
Set-Content -Path "$BaseDir\src\app.module.ts" -Value $Content -Encoding UTF8

# --- src/common/dto/error.dto.ts ---
$Content = @'
export class ErrorDto {
  code: number;
  message: string;
}
'@
Set-Content -Path "$BaseDir\src\common\dto\error.dto.ts" -Value $Content -Encoding UTF8

# --- src/domain/elo-calculator.ts ---
$Content = @'
export class EloCalculator {
  private static readonly K_FACTOR = 32;
  private static readonly DIVIDER = 400;

  static calculateWinProbability(ratingPlayer: number, ratingOpponent: number): number {
    return 1 / (1 + Math.pow(10, (ratingOpponent - ratingPlayer) / this.DIVIDER));
  }

  static calculateNewRating(currentRating: number, actualScore: number, expectedScore: number): number {
    const newRating = currentRating + this.K_FACTOR * (actualScore - expectedScore);
    return Math.round(newRating);
  }

  static computeMatchResult(
    winnerRank: number,
    loserRank: number,
    isDraw: boolean
  ): { newWinnerRank: number; newLoserRank: number } {
    const winnerExpected = this.calculateWinProbability(winnerRank, loserRank);
    const loserExpected = this.calculateWinProbability(loserRank, winnerRank);

    const winnerScore = isDraw ? 0.5 : 1;
    const loserScore = isDraw ? 0.5 : 0;

    const newWinnerRank = this.calculateNewRating(winnerRank, winnerScore, winnerExpected);
    const newLoserRank = this.calculateNewRating(loserRank, loserScore, loserExpected);

    return { newWinnerRank, newLoserRank };
  }
}
'@
Set-Content -Path "$BaseDir\src\domain\elo-calculator.ts" -Value $Content -Encoding UTF8

# --- src/domain/elo-calculator.spec.ts ---
$Content = @'
import { EloCalculator } from './elo-calculator';

describe('EloCalculator', () => {
  it('should calculate win probability correctly', () => {
    const prob = EloCalculator.calculateWinProbability(1200, 800);
    expect(prob).toBeCloseTo(0.91, 2);
  });

  it('should calculate new rating correctly for winner', () => {
    const newRating = EloCalculator.calculateNewRating(1200, 1, 0.76);
    expect(newRating).toBe(1208);
  });

  it('should calculate new rating correctly for loser', () => {
    const newRating = EloCalculator.calculateNewRating(800, 0, 0.24);
    expect(newRating).toBe(792);
  });

  it('should compute match result', () => {
    const result = EloCalculator.computeMatchResult(1200, 800, false);
    expect(result.newWinnerRank).toBe(1208);
    expect(result.newLoserRank).toBe(792);
  });
});
'@
Set-Content -Path "$BaseDir\src\domain\elo-calculator.spec.ts" -Value $Content -Encoding UTF8

# --- src/players/entities/player.entity.ts ---
$Content = @'
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Player {
  @PrimaryColumn()
  id: string;

  @Column('int')
  rank: number;
}
'@
Set-Content -Path "$BaseDir\src\players\entities\player.entity.ts" -Value $Content -Encoding UTF8

# --- src/players/dto/create-player.dto.ts ---
$Content = @'
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
'@
Set-Content -Path "$BaseDir\src\players\dto\create-player.dto.ts" -Value $Content -Encoding UTF8

# --- src/players/players.service.ts ---
$Content = @'
import { Injectable, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { RankingService } from '../ranking/ranking.service';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @Inject(forwardRef(() => RankingService))
    private rankingService: RankingService,
  ) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const existing = await this.playerRepository.findOneBy({ id: createPlayerDto.id });
    if (existing) {
      throw new ConflictException('Player already exists');
    }

    const allPlayers = await this.playerRepository.find();
    let initialRank = 1200;

    // Regle: moyenne des joueurs existants s'il y en a
    if (allPlayers.length > 0) {
      const sum = allPlayers.reduce((acc, p) => acc + p.rank, 0);
      initialRank = Math.round(sum / allPlayers.length);
    }

    const player = this.playerRepository.create({
      id: createPlayerDto.id,
      rank: initialRank,
    });

    const savedPlayer = await this.playerRepository.save(player);
    this.rankingService.updateCache(savedPlayer);
    return savedPlayer;
  }

  async findAll(): Promise<Player[]> {
    return this.playerRepository.find();
  }

  async findOne(id: string): Promise<Player | null> {
    return this.playerRepository.findOneBy({ id });
  }

  async updateRank(id: string, newRank: number): Promise<Player> {
    const player = await this.playerRepository.findOneBy({ id });
    if (!player) throw new Error('Player not found');
    player.rank = newRank;
    const updated = await this.playerRepository.save(player);
    // Mise a jour du cache Singleton apres ecriture en BDD
    this.rankingService.updateCache(updated);
    return updated;
  }
}
'@
Set-Content -Path "$BaseDir\src\players\players.service.ts" -Value $Content -Encoding UTF8

# --- src/players/players.controller.ts ---
$Content = @'
import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';

@Controller('player')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  async create(@Body() createPlayerDto: CreatePlayerDto, @Res() res: Response) {
    try {
      const player = await this.playersService.create(createPlayerDto);
      return res.status(HttpStatus.OK).json(player);
    } catch (error) {
      if (error.status === 409) {
        return res.status(HttpStatus.CONFLICT).json({ code: 409, message: error.message });
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ code: 400, message: 'Invalid player ID' });
    }
  }
}
'@
Set-Content -Path "$BaseDir\src\players\players.controller.ts" -Value $Content -Encoding UTF8

# --- src/players/players.module.ts ---
$Content = @'
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { Player } from './entities/player.entity';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player]),
    forwardRef(() => RankingModule)
  ],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
'@
Set-Content -Path "$BaseDir\src\players\players.module.ts" -Value $Content -Encoding UTF8

# --- src/matches/entities/match.entity.ts ---
$Content = @'
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  winnerId: string;

  @Column()
  loserId: string;

  @Column()
  isDraw: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
'@
Set-Content -Path "$BaseDir\src\matches\entities\match.entity.ts" -Value $Content -Encoding UTF8

# --- src/matches/dto/create-match.dto.ts ---
$Content = @'
import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  winner: string;

  @IsString()
  @IsNotEmpty()
  loser: string;

  @IsBoolean()
  draw: boolean;
}
'@
Set-Content -Path "$BaseDir\src\matches\dto\create-match.dto.ts" -Value $Content -Encoding UTF8

# --- src/matches/matches.service.ts ---
$Content = @'
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { PlayersService } from '../players/players.service';
import { EloCalculator } from '../domain/elo-calculator';
import { RankingService } from '../ranking/ranking.service';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private playersService: PlayersService,
    private rankingService: RankingService,
  ) {}

  async create(createMatchDto: CreateMatchDto) {
    const winner = await this.playersService.findOne(createMatchDto.winner);
    const loser = await this.playersService.findOne(createMatchDto.loser);

    if (!winner || !loser) {
      throw new UnprocessableEntityException('One or both players do not exist');
    }

    // Calcul du nouveau classement (Logique metier pure)
    const { newWinnerRank, newLoserRank } = EloCalculator.computeMatchResult(
      winner.rank,
      loser.rank,
      createMatchDto.draw
    );

    // Mise a jour atomique (idealement transactionnel, simplifie ici)
    const updatedWinner = await this.playersService.updateRank(winner.id, newWinnerRank);
    const updatedLoser = await this.playersService.updateRank(loser.id, newLoserRank);

    // Sauvegarde historique
    const match = this.matchRepository.create({
      winnerId: winner.id,
      loserId: loser.id,
      isDraw: createMatchDto.draw,
    });
    await this.matchRepository.save(match);

    // Emission des evenements en temps reel
    this.rankingService.publishRankingUpdate(updatedWinner);
    this.rankingService.publishRankingUpdate(updatedLoser);

    return {
      winner: updatedWinner,
      loser: updatedLoser,
    };
  }
}
'@
Set-Content -Path "$BaseDir\src\matches\matches.service.ts" -Value $Content -Encoding UTF8

# --- src/matches/matches.controller.ts ---
$Content = @'
import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';

@Controller('match')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  async create(@Body() createMatchDto: CreateMatchDto, @Res() res: Response) {
    try {
      const result = await this.matchesService.create(createMatchDto);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      if (error.status === 422) {
        return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({ code: 422, message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ code: 500, message: 'Internal Error' });
    }
  }
}
'@
Set-Content -Path "$BaseDir\src\matches\matches.controller.ts" -Value $Content -Encoding UTF8

# --- src/matches/matches.module.ts ---
$Content = @'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from './entities/match.entity';
import { PlayersModule } from '../players/players.module';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    PlayersModule,
    RankingModule
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
'@
Set-Content -Path "$BaseDir\src\matches\matches.module.ts" -Value $Content -Encoding UTF8

# --- src/ranking/ranking.service.ts ---
$Content = @'
import { Injectable, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Player } from '../players/entities/player.entity';
import { PlayersService } from '../players/players.service';
import { fromEvent, map, Observable } from 'rxjs';

/**
 * Service Singleton pour le cache du classement.
 */
@Injectable()
export class RankingService implements OnModuleInit {
  // Structure de donnees en memoire pour le cache
  private rankingCache: Map<string, Player> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => PlayersService))
    private playersService: PlayersService
  ) {}

  async onModuleInit() {
    await this.refreshCache();
  }

  /**
   * Initialise le cache depuis la BDD au demarrage
   */
  async refreshCache() {
    const players = await this.playersService.findAll();
    this.rankingCache.clear();
    players.forEach(p => this.rankingCache.set(p.id, p));
  }

  /**
   * Met a jour un joueur specifique dans le cache
   */
  updateCache(player: Player) {
    this.rankingCache.set(player.id, player);
  }

  /**
   * Recupere le classement trie
   */
  getRanking(): Player[] {
    return Array.from(this.rankingCache.values()).sort((a, b) => b.rank - a.rank);
  }

  /**
   * Emet un evenement interne
   */
  publishRankingUpdate(player: Player) {
    this.eventEmitter.emit('ranking.update', player);
  }

  /**
   * Transforme l'evenement interne en flux SSE
   */
  getRankingEvents(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'ranking.update').pipe(
      map((payload: any) => ({
        data: {
          type: 'RankingUpdate',
          player: payload,
        },
      } as MessageEvent))
    );
  }
}
'@
Set-Content -Path "$BaseDir\src\ranking\ranking.service.ts" -Value $Content -Encoding UTF8

# --- src/ranking/ranking.controller.ts ---
$Content = @'
import { Controller, Get, Sse, MessageEvent, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { RankingService } from './ranking.service';
import { Observable } from 'rxjs';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  async getRanking(@Res() res: Response) {
    const ranking = this.rankingService.getRanking();
    if (ranking.length === 0) {
      // Pour eviter de renvoyer une erreur 404 si le jeu est vide mais que la requete est valide
      // on renvoie un tableau vide, sauf si la spec demande explicitement 404.
      // Le Swagger dit 404 si aucun joueur n'existe :
      return res.status(HttpStatus.NOT_FOUND).json({ code: 404, message: 'No players found' });
    }
    return res.status(HttpStatus.OK).json(ranking);
  }

  @Sse('events')
  events(): Observable<MessageEvent> {
    return this.rankingService.getRankingEvents();
  }
}
'@
Set-Content -Path "$BaseDir\src\ranking\ranking.controller.ts" -Value $Content -Encoding UTF8

# --- src/ranking/ranking.module.ts ---
$Content = @'
import { Module, forwardRef } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [forwardRef(() => PlayersModule)],
  controllers: [RankingController],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingModule {}
'@
Set-Content -Path "$BaseDir\src\ranking\ranking.module.ts" -Value $Content -Encoding UTF8

# --- test/app.e2e-spec.ts ---
$Content = @'
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
'@
Set-Content -Path "$BaseDir\test\app.e2e-spec.ts" -Value $Content -Encoding UTF8

# --- test/jest-e2e.json ---
$Content = @'
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
'@
Set-Content -Path "$BaseDir\test\jest-e2e.json" -Value $Content -Encoding UTF8

Write-Host "Generation terminee avec succes !" -ForegroundColor Green