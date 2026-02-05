import { OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Player } from '../players/entities/player.entity';
import { PlayersService } from '../players/players.service';
import { Observable } from 'rxjs';
export declare class RankingService implements OnModuleInit {
    private eventEmitter;
    private playersService;
    private rankingCache;
    constructor(eventEmitter: EventEmitter2, playersService: PlayersService);
    onModuleInit(): Promise<void>;
    refreshCache(): Promise<void>;
    updateCache(player: Player): void;
    getRanking(): Player[];
    publishRankingUpdate(player: Player): void;
    getRankingEvents(): Observable<MessageEvent>;
}
