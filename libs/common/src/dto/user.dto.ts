import { UserEntity } from 'apps/auth-services/src/users/entities/user.entity';

export class UserDto {
  user?: UserEntity;
  iat: number;
  exp: number;
}
