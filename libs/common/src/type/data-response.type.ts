import { RoleEntity } from 'apps/auth-services/src/roles/entities/role.entity';
import { UserEntity } from 'apps/auth-services/src/users/entities/user.entity';
// This type is used to define the structure of the data response
export type DataResponseType = RoleEntity | UserEntity;
