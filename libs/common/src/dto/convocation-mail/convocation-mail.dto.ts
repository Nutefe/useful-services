import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ConvocationMailDto {
  @ApiProperty({ type: 'string' })
  @IsNumber()
  id: number;
  @ApiProperty({ type: 'string' })
  @IsString()
  name: string;
  @ApiProperty({ type: 'string' })
  @IsString()
  membre: string;
  @ApiProperty({ type: 'string' })
  @IsString()
  date_debut: string;
  @ApiProperty({ type: 'string' })
  @IsString()
  heure_debut: string;
  @ApiProperty({ type: 'string' })
  @IsString()
  date_fin: string;
  @ApiProperty({ type: 'string' })
  @IsString()
  heure_fin: string;
  @ApiProperty({ type: 'string' })
  @IsString()
  evenement: string;
  @ApiProperty({ type: 'string' })
  @IsString()
  slug: string;
  @ApiProperty({ type: 'string' })
  @IsString()
  email: string;
}
