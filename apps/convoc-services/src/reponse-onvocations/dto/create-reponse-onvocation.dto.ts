import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReponseOnvocationDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  slug?: string;
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  choix?: string;
  @ApiProperty({ type: 'boolean', default: false })
  alerte?: boolean;
  @ApiProperty({ type: 'string', required: false, default: '' })
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty({ type: 'string' })
  @IsDateString()
  @IsNotEmpty()
  dateEnvoi?: Date;
}
