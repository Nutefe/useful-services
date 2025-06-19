import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateMembreDto {
  @ApiProperty({ type: 'string', default: '' })
  @IsString()
  @IsNotEmpty()
  libelle: string;
  @ApiProperty({ type: 'string', default: '' })
  @IsString()
  @IsNotEmpty()
  adresse: string;
  @ApiProperty({ type: 'string', default: '' })
  @IsString()
  @IsNotEmpty()
  telephone: string;
  @ApiProperty({ type: 'string', default: '' })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ type: 'string', default: '' })
  @IsBoolean()
  hasResponsable: boolean;
  @ApiProperty({ type: 'string', default: '' })
  @IsBoolean()
  actif: boolean;
  @ApiProperty({ type: 'string', default: '' })
  @IsDateString()
  @IsNotEmpty()
  dateFin: Date;
  @ApiProperty({ type: 'array', isArray: true, default: [] })
  @IsArray()
  @IsNotEmpty()
  equipe_ids: number[];

  @ApiProperty({ type: 'string', default: '' })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  emailResponsable: string;

  @ApiProperty({ type: 'string', default: '' })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  libelleResponsable: string;

  @ApiProperty({ type: 'string', default: '' })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  telephoneResponsable: string;

  @ApiProperty({ type: 'string', default: '' })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  adresseResponsable: string;
}
