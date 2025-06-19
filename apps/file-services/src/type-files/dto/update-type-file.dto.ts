import { PartialType } from '@nestjs/swagger';
import { CreateTypeFileDto } from './create-type-file.dto';

export class UpdateTypeFileDto extends PartialType(CreateTypeFileDto) {}
