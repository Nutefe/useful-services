import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

const getCurrentUserByContext = (context: ExecutionContext) => {
  return context.switchToHttp().getRequest<Request>().user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
