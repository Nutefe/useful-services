import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TypeDataDto {
  @ApiProperty()
  @IsString()
  service_name: string;
  @ApiProperty()
  @IsString()
  libelle: string;
}
