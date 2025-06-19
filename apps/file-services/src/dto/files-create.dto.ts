import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FilesCreateDto {
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

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  type_file: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  categorie_file: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buffer: string;
}
