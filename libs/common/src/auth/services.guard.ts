import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { extractServiceNames, GenericGuard } from './generic.guard';

@Injectable()
export class ServicesGuard extends GenericGuard {
  constructor(reflector: Reflector) {
    super(reflector, 'services', extractServiceNames);
  }
}
