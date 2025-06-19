import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';
import { UserDto } from '../dto';

@Injectable()
export class JwtAutGuard implements CanActivate {
  constructor(
    @Inject(process.env.AUTH_SERVICE ?? 'auth-service')
    private readonly authService: ClientProxy,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      if (context.getType() !== 'http' && context.getType() !== 'rpc') {
        return false;
      }

      if (context.getType() !== 'http' && context.getType() !== 'rpc') {
        return false;
      }

      let jwt: string | undefined;
      let request: Request & { jwt?: string };

      if (context.getType() === 'http') {
        request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers['authorization'] as string;
        if (!authHeader) return false;
        const authHeaderParts = authHeader.split(' ');
        if (authHeaderParts.length !== 2) return false;
        [, jwt] = authHeaderParts;
      } else {
        request = context
          .switchToHttp()
          .getRequest<Request & { jwt?: string }>();
        jwt = request.jwt;
      }

      if (!jwt) return false;

      const jwt_response: { exp: number; userdto: UserDto } =
        await lastValueFrom(this.authService.send('verify-jwt', { jwt }));
      if (!jwt_response?.exp) return false;

      const user = jwt_response?.userdto;
      const TOKEN_EXP_MS = jwt_response.exp * 1000;
      const isJwtValid = Date.now() < TOKEN_EXP_MS;

      if (user?.user) {
        request.user = user.user;
      }

      return isJwtValid;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
