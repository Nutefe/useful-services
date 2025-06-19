import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TypeFilesEntity } from '../type-files/entities/type-file.entity';
import { UserEntity } from '@app/common';
import { FilesQueryInput } from './file.type';

export class FilesEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;

  @ApiProperty({ type: () => TypeFilesEntity, default: null })
  type_file?: TypeFilesEntity | null;

  @ApiProperty({ type: () => UserEntity, default: null })
  user?: UserEntity | null;

  @ApiProperty({ type: 'string', default: null })
  filename?: string | null;

  @ApiProperty({ type: 'string', default: null })
  origine_name?: string | null;

  @ApiProperty({ type: 'string', default: null })
  mimetype?: string | null;

  @ApiProperty({ type: 'string', default: null })
  path?: string | null;

  @ApiProperty({ type: 'string', default: null })
  file_dir?: string | null;

  @ApiProperty()
  created_at?: string;

  @ApiProperty()
  updated_at?: string;

  constructor();
  constructor(data: FilesQueryInput);
  constructor(data?: FilesQueryInput) {
    if (!data) return;
    this.id = data.id;
    if ('filename' in data) {
      this.type_file = data.type_file
        ? new TypeFilesEntity(data.type_file)
        : undefined;
      this.user = data.user ? new UserEntity(data.user) : null;
      this.filename = data.filename;
      this.origine_name = data.origine_name;
      this.mimetype = data.mimetype;
      this.path = data.path;
      this.file_dir = data.file_dir;
      this.created_at = data.created_at.toJSON();
      this.updated_at = data.updated_at.toJSON();
    }
  }
}
