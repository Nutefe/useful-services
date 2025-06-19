import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEvenementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  libelle: string;
  @ApiProperty({ type: 'string', required: false })
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty({ type: 'string' })
  @IsDateString()
  @IsNotEmpty()
  dateDebut?: string;
  @ApiProperty({ type: 'string' })
  @IsDateString()
  @IsNotEmpty()
  dateFin?: string;
  @ApiProperty({ type: 'array', isArray: true, default: [] })
  @IsArray()
  @IsNotEmpty({ each: true })
  equipe_ids?: number[];
  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsNotEmpty()
  coordinateur_id: number;
}
