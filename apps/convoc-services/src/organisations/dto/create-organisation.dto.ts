import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrganisationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nom: string;
  @ApiProperty({ type: 'string', default: '' })
  @IsString()
  @IsOptional()
  desciption?: string | null;
  @ApiProperty({ type: 'string', default: '' })
  @IsString()
  @IsOptional()
  devise?: string | null;
  @ApiProperty({ default: '2' })
  @IsString()
  @IsOptional()
  equipeMax?: string;
  @ApiProperty({ default: '2' })
  @IsString()
  @IsOptional()
  evenementActifs?: string;
  @ApiProperty({ default: '25' })
  @IsString()
  @IsOptional()
  membreEquipeActifs?: string;
  @ApiProperty({ default: '50' })
  @IsString()
  @IsOptional()
  membreEventMax?: string;
  @ApiProperty({ default: '50' })
  @IsString()
  @IsOptional()
  membreActifs?: string;
  @ApiProperty({ default: '2' })
  @IsString()
  @IsOptional()
  convocMax?: string;
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  file: any[];
}
