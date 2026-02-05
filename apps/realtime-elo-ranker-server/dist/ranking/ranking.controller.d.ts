import { MessageEvent } from '@nestjs/common';
import { Response } from 'express';
import { RankingService } from './ranking.service';
import { Observable } from 'rxjs';
export declare class RankingController {
    private readonly rankingService;
    constructor(rankingService: RankingService);
    getRanking(res: Response): Promise<Response<any, Record<string, any>>>;
    events(): Observable<MessageEvent>;
}
