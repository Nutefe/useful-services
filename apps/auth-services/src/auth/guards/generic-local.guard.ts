import { JwtPayload } from '@app/common';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

type Extractor = (user: JwtPayload) => string[];

export const extractServiceNames: Extractor = (user) => {
  if (!user?.role_services) {
    return [];
  }
  return user.role_services
    .map((role) => role?.service?.name)
    .filter((name): name is string => Boolean(name));
};

export const extractRoleNames: Extractor = (user) => {
  if (!user?.role_services) {
    return [];
  }
  return user.role_services
    .map((role) => role?.role?.name)
    .filter((name): name is string => Boolean(name));
};

export const extractPermissionNames: Extractor = (user) => {
  if (!user?.role_services) {
    return [];
  }
  return user.role_services
    .flatMap((role) => role?.role?.permissions?.map((perm) => perm?.name))
    .filter((name): name is string => Boolean(name));
};

@Injectable()
export class GenericLocalGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly key: string,
    private readonly extractor: Extractor,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredServices = this.reflector.getAllAndOverride<string[]>(
      this.key,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredServices) {
      return true;
    }
    const user = context.switchToHttp().getRequest<Request>()
      .user as JwtPayload;

    const serviceInit: string[] = this.extractor(user);

    return requiredServices.some((role) => serviceInit.includes(role));
  }
}
