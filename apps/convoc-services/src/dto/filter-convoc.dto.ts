import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class FilterConvocDto {
  @ApiProperty({ required: false, default: [] })
  @Type(() => Array)
  noms?: string[] = [];
  @ApiProperty({ required: false, default: [] })
  @Type(() => Array)
  etats?: boolean[] = [];
  @ApiProperty({ required: false, default: [] })
  @Type(() => Array)
  equipes?: string[] = [];
  @ApiProperty({ required: false, default: [] })
  @Type(() => Array)
  membres?: string[] = [];
  @ApiProperty({ required: false, default: [] })
  @Type(() => Array)
  dateReponse?: Date[] = [];
  @ApiProperty({ required: false, default: [] })
  @Type(() => Array)
  reponses?: string[] = [];
  @ApiProperty({ default: 1 })
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ default: 10 })
  @Type(() => Number)
  @IsNumber()
  take?: number = 10;
}
