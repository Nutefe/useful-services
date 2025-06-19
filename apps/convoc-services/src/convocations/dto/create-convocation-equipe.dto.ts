import { ApiProperty } from '@nestjs/swagger';

export class CreateConvocationEquipeDto {
  @ApiProperty({ type: 'number' })
  evenement_id: number;
  @ApiProperty({ type: 'array', items: { type: 'number' } })
  equipe_ids: number[];
}
