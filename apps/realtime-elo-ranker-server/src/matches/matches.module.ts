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
