import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';

@Controller('player')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  async create(@Body() createPlayerDto: CreatePlayerDto, @Res() res: Response) {
    try {
      const player = await this.playersService.create(createPlayerDto);
      return res.status(HttpStatus.OK).json(player);
    } catch (error) {
      if (error.status === 409) {
        return res.status(HttpStatus.CONFLICT).json({ code: 409, message: error.message });
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ code: 400, message: 'Invalid player ID' });
    }
  }
}
