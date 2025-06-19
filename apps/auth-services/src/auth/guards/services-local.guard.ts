import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { extractServiceNames, GenericLocalGuard } from './generic-local.guard';

@Injectable()
export class ServicesLocalGuard extends GenericLocalGuard {
  constructor(reflector: Reflector) {
    super(reflector, 'services', extractServiceNames);
  }
}
