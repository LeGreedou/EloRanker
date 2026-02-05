import { Injectable, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { RankingService } from '../ranking/ranking.service';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player) private repo: Repository<Player>,
    @Inject(forwardRef(() => RankingService)) private rankingService: RankingService,
  ) {}

  async create(dto: CreatePlayerDto): Promise<Player> {
    const existing = await this.repo.findOneBy({ id: dto.id });
    if (existing) throw new ConflictException('Player already exists');

    const all = await this.repo.find();
    let initialRank = 1200;
    if (all.length > 0) {
      initialRank = Math.round(all.reduce((acc, p) => acc + p.rank, 0) / all.length);
    }

    const player = await this.repo.save(this.repo.create({ id: dto.id, rank: initialRank }));
    
    // NOTIFICATION TEMPS REEL
    this.rankingService.publishRankingUpdate(player);
    this.rankingService.updateCache(player);

    return player;
  }

  async findAll(): Promise<Player[]> { return this.repo.find(); }
  async findOne(id: string): Promise<Player | null> { return this.repo.findOneBy({ id }); }
  
  async updateRank(id: string, newRank: number): Promise<Player> {
    const player = await this.repo.findOneBy({ id });
    if (!player) throw new Error('Player not found');
    player.rank = newRank;
    const updated = await this.repo.save(player);
    this.rankingService.updateCache(updated);
    return updated;
  }
}