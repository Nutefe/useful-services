import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { extractRoleNames, GenericGuard } from './generic.guard';

@Injectable()
export class RolesGuard extends GenericGuard {
  constructor(reflector: Reflector) {
    super(reflector, 'roles', extractRoleNames);
  }
}
