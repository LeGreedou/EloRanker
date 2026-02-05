import { Response } from 'express';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
export declare class MatchesController {
    private readonly matchesService;
    constructor(matchesService: MatchesService);
    create(createMatchDto: CreateMatchDto, res: Response): Promise<Response<any, Record<string, any>>>;
}
