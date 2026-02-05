import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  winner: string;

  @IsString()
  @IsNotEmpty()
  loser: string;

  @IsBoolean()
  draw: boolean;
}
