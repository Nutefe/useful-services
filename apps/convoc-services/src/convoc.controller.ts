import { Controller, Get } from '@nestjs/common';
import { ConvocService } from './convoc.service';

@Controller()
export class ConvocController {
  constructor(private readonly convocService: ConvocService) {}

  @Get()
  getHello(): string {
    return this.convocService.getHello();
  }
}
