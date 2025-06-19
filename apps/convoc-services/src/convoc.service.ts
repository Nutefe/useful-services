import { Injectable } from '@nestjs/common';

@Injectable()
export class ConvocService {
  getHello(): string {
    return 'Hello World!';
  }
}
