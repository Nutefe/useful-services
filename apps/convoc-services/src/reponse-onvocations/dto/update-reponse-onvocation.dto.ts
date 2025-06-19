import { PartialType } from '@nestjs/swagger';
import { CreateReponseOnvocationDto } from './create-reponse-onvocation.dto';

export class UpdateReponseOnvocationDto extends PartialType(CreateReponseOnvocationDto) {}
