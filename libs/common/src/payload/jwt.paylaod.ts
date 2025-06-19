import { JwtPayloadRoleServices } from './jwt.paylaod-role-services';

export class JwtPayload {
  id?: number;
  email?: string | null;
  username?: string | null;
  role_services?: JwtPayloadRoleServices[];
  curent_service_name?: string | null;
}
