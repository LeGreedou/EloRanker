import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { RankingService } from '../ranking/ranking.service';
export declare class PlayersService {
    private repo;
    private rankingService;
    constructor(repo: Repository<Player>, rankingService: RankingService);
    create(dto: CreatePlayerDto): Promise<Player>;
    findAll(): Promise<Player[]>;
    findOne(id: string): Promise<Player | null>;
    updateRank(id: string, newRank: number): Promise<Player>;
}
