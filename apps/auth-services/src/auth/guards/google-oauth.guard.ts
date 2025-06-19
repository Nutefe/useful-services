import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: Request & { session?: Record<string, any> } = context
      .switchToHttp()
      .getRequest();
    if (req.session) {
      req.session.service_name = req.query.service_name;
    }
    return super.canActivate(context);
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context
      .switchToHttp()
      .getRequest<Request & { query: { service_name?: string } }>();
    const state = req.query.service_name;

    return { scope: ['profile', 'email'], state };
  }
}
