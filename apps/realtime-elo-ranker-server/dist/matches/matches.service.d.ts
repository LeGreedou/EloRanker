import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { PlayersService } from '../players/players.service';
import { RankingService } from '../ranking/ranking.service';
export declare class MatchesService {
    private matchRepository;
    private playersService;
    private rankingService;
    constructor(matchRepository: Repository<Match>, playersService: PlayersService, rankingService: RankingService);
    create(createMatchDto: CreateMatchDto): Promise<{
        winner: import("../players/entities/player.entity").Player;
        loser: import("../players/entities/player.entity").Player;
    }>;
}
