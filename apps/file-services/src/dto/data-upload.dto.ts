import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DataUploadDto {
  @ApiProperty({
    description: `userid c'est l'id de l'utilisateur pour qui le fichier est importer`,
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: `type_file c'est l'id de type de fichier importer`,
  })
  @IsString()
  @IsNotEmpty()
  type_file: string;

  @ApiProperty({
    description: `categorie_file c'est l'id du categorie de fichier importer`,
  })
  @IsString()
  @IsNotEmpty()
  categorie_file: string;

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: any[];
}
