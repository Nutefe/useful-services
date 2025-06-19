import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { extractRoleNames, GenericLocalGuard } from './generic-local.guard';

@Injectable()
export class RolesLocalGuard extends GenericLocalGuard {
  constructor(reflector: Reflector) {
    super(reflector, 'roles', extractRoleNames);
  }
}
