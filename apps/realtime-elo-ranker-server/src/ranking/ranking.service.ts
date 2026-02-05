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
