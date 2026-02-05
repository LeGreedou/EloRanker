import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';

@Controller('match')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  async create(@Body() createMatchDto: CreateMatchDto, @Res() res: Response) {
    try {
      const result = await this.matchesService.create(createMatchDto);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      if (error.status === 422) {
        return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({ code: 422, message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ code: 500, message: 'Internal Error' });
    }
  }
}
