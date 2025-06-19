import { JwtPayloadPermissions } from './jwt.paylaod-permissions';

export class JwtPayloadRoles {
  id?: number;
  name?: string;
  permissions?: JwtPayloadPermissions[];
}
