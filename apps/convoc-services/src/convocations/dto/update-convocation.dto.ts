import { PartialType } from '@nestjs/swagger';
import { CreateConvocationDto } from './create-convocation.dto';

export class UpdateConvocationDto extends PartialType(CreateConvocationDto) {}
