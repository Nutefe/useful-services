import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ServiceQueryInput } from './service.type';

export class ServiceEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;
  @ApiProperty({ type: 'string', default: null })
  name?: string | null;
  @ApiProperty({ type: 'string', default: null })
  description?: string | null;
  @ApiProperty()
  created_at?: string;
  @ApiProperty()
  updated_at?: string;

  constructor();

  constructor(data: ServiceQueryInput);

  constructor(data?: ServiceQueryInput) {
    if (!data) return;
    this.id = data?.id;
    if ('name' in data) {
      this.name = data?.name;
      this.description = data?.description;
      this.created_at = data?.created_at.toJSON();
      this.updated_at = data?.updated_at.toJSON();
    }
  }
}
