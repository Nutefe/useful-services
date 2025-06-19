import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'apps/auth-services/src/roles/entities/role.enum';

export const HasRoles = (...roles: RoleEnum[]) => SetMetadata('roles', roles);
