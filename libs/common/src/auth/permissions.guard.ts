import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { extractPermissionNames, GenericGuard } from './generic.guard';

@Injectable()
export class PermissionsGuard extends GenericGuard {
  constructor(reflector: Reflector) {
    super(reflector, 'permissions', extractPermissionNames);
  }
}
