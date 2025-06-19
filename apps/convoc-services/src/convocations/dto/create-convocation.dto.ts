import { ApiProperty } from '@nestjs/swagger';

export class CreateConvocationDto {
  @ApiProperty({ type: 'number' })
  evenement_id: number;
  @ApiProperty({ type: 'array', items: { type: 'number' } })
  membre_ids: number[];
}
