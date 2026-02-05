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
