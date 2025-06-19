import { SetMetadata } from '@nestjs/common';
import { PermissionEnum } from 'apps/auth-services/src/permissions/entities/permission.enum';

export const HasPermissions = (...permissions: PermissionEnum[]) =>
  SetMetadata('permissions', permissions);
