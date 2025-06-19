import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { RoleQueryInput } from './role.type';
import { PermissionEntity } from '../permissions';

export class RoleEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;
  @ApiProperty({ type: 'string', default: null })
  name?: string | null;
  @ApiProperty({ type: 'string', default: null })
  description?: string | null;
  @ApiProperty({ type: 'array', default: [] })
  permissions?: PermissionEntity[];
  @ApiProperty()
  created_at?: string;
  @ApiProperty()
  updated_at?: string;

  constructor();

  constructor(data: RoleQueryInput);

  constructor(data?: RoleQueryInput) {
    if (!data) return;
    this.id = data?.id;
    if ('name' in data) {
      this.name = data?.name;
      this.description = data?.description;
      this.permissions = data?.role_permissions?.map(
        (rp) => new PermissionEntity(rp.permission),
      );
      this.created_at = data?.created_at.toJSON();
      this.updated_at = data?.updated_at.toJSON();
    }
  }
}
