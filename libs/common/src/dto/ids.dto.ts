import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class IdsDto {
  @ApiProperty({ type: 'array', isArray: true, default: [] })
  @IsArray()
  @IsNotEmpty()
  ids: number[];
}
