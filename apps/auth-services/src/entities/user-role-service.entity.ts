import { RoleEntity } from '../roles/entities/role.entity';
import { ServiceEntity } from '../services/entities/service.entity';
import { UserEntity } from '../users/entities/user.entity';

export class UserRoleServiceEntity {
  user?: UserEntity;
  role?: RoleEntity;
  service?: ServiceEntity;

  constructor(data?: Partial<UserRoleServiceEntity>) {
    if (!data) return;
    this.user = data.user;
    this.role = data.role;
    this.service = data.service;
  }
}
