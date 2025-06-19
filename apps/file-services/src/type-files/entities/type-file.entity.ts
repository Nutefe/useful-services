import { ServiceEntity } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TypeFilesQueryInput } from './type-file.type';

export class TypeFilesEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;

  @ApiProperty({ type: () => ServiceEntity, default: null })
  service?: ServiceEntity | null;

  @ApiProperty({ type: 'string' })
  libelle?: string;

  @ApiProperty()
  created_at?: string;

  @ApiProperty()
  updated_at?: string;

  constructor();
  constructor(data: TypeFilesQueryInput);
  constructor(data?: TypeFilesQueryInput) {
    if (!data) return;
    this.id = data.id;
    if ('libelle' in data) {
      this.libelle = data.libelle;
      this.service = data.service ? new ServiceEntity(data.service) : null;
      this.created_at = data.created_at.toJSON();
      this.updated_at = data.updated_at.toJSON();
    }
  }
}
