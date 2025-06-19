import { ApiProperty } from '@nestjs/swagger';
import { EquipesEntity } from './equipe.entity';
import { MembresEntity } from '../../membres/entities/membre.entity';
import { RoleEntity } from 'apps/auth-services/src/roles/entities/role.entity';
import { EquipesQueryInput } from './equipe.type';
import { MembresQueryInput } from '../../membres/entities/membre.type';
import { RoleQueryInput } from 'apps/auth-services/src/roles/entities/role.type';

export class EquipeMembresEntity {
  @ApiProperty({ type: () => EquipesEntity, default: null })
  equipe?: EquipesEntity | null;
  @ApiProperty({ type: () => MembresEntity, default: null })
  membre?: MembresEntity | null;
  @ApiProperty({ type: () => RoleEntity, default: null })
  role?: RoleEntity | null;

  constructor();
  constructor(data: {
    equipe: EquipesQueryInput;
    membre: MembresQueryInput;
    role: RoleQueryInput;
  });
  constructor(data?: {
    equipe: EquipesQueryInput;
    membre: MembresQueryInput;
    role: RoleQueryInput;
  }) {
    if (!data) return;
    this.equipe = data.equipe ? new EquipesEntity(data.equipe) : null;
    this.membre = data.membre ? new MembresEntity(data.membre) : null;
    this.role = data.role ? new RoleEntity(data.role) : null;
  }
}
