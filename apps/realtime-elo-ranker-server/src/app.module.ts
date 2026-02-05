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
