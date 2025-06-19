import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTypeFileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  libelle?: string;
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  service_id?: bigint;
}
