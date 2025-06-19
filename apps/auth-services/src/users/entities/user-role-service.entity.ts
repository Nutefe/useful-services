import { RoleEntity } from '../../roles/entities/role.entity';
import { RoleQueryInput } from '../../roles/entities/role.type';
import { ServiceEntity } from '../../services/entities/service.entity';
import { ServiceQueryInput } from '../../services/entities/service.type';

export class UserRoleServiceEntity {
  role?: RoleEntity;
  service?: ServiceEntity;

  constructor(role: RoleQueryInput, service: ServiceQueryInput) {
    if (!service && !role) return;
    this.role = new RoleEntity(role);
    this.service = new ServiceEntity(service);
  }
}
