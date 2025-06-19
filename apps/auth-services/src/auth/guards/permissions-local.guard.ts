import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  extractPermissionNames,
  GenericLocalGuard,
} from './generic-local.guard';

@Injectable()
export class PermissionsLocalGuard extends GenericLocalGuard {
  constructor(reflector: Reflector) {
    super(reflector, 'permissions', extractPermissionNames);
  }
}
