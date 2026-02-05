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
