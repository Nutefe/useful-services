import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEquipeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  libelle?: string;
  @ApiProperty({ required: false, default: '' })
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty({ type: 'boolean', default: false })
  @IsBoolean()
  actif: boolean;
  @ApiProperty({})
  @IsDateString()
  @IsNotEmpty()
  dateFin?: Date;
  @ApiProperty({ type: 'array', isArray: true, default: [] })
  @IsArray()
  @IsOptional()
  membre_ids: number[];
}
