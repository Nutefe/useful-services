import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthServicesService } from '../../auth-services.service';

@Injectable()
export class JwtAutLocalGuard implements CanActivate {
  constructor(private readonly usersService: AuthServicesService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      if (context.getType() !== 'http') {
        return false;
      }

      const request: Request = context.switchToHttp().getRequest<Request>();

      const authHeader = request.headers['authorization'] as string;

      if (!authHeader) return false;

      const authHeaderParts = authHeader.split(' ');

      if (authHeaderParts.length !== 2) return false;

      const [, jwt] = authHeaderParts;

      if (!jwt) return false;

      const { exp, userdto } = await this.usersService.verifyJwt(jwt);
      if (!exp) return false;

      const user = userdto;

      const TOKEN_EXP_MS = exp * 1000;

      const isJwtValid = Date.now() < TOKEN_EXP_MS;

      request.user = user.user;

      return isJwtValid;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
