import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { TypeDataDto } from './type-data.dto';

export class FilesCreateGlobalDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  user_import: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  origine_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  file_dir: string;

  @ApiProperty({ type: () => TypeDataDto })
  @IsObject()
  @IsNotEmptyObject()
  type_file: TypeDataDto;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  categorie_file: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buffer: string;
}
