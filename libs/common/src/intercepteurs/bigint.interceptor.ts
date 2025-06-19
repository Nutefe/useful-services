import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntToNumberInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.convertBigIntToNumber(data);
      }),
    );
  }

  private convertBigIntToNumber(data: any): any {
    if (Array.isArray(data)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data.map((item) => this.convertBigIntToNumber(item));
    } else if (data !== null && typeof data === 'object') {
      return Object.keys(data).reduce((acc, key) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        acc[key] =
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          typeof data[key] === 'bigint'
            ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              Number(data[key])
            : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              this.convertBigIntToNumber(data[key]);
        return acc;
      }, {});
    }
    return data;
  }
}
