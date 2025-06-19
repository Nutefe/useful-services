import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ConvocationsEntity } from '../../convocations/entities/convocation.entity';
import { ReponseConvocationsQueryInput } from './response-convocation.type';

export class ReponseConvocationsEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;
  @ApiProperty({ type: 'string', default: null })
  choix?: string | null;
  @ApiProperty()
  alerte?: boolean;
  @ApiProperty({ type: 'string', default: null })
  description?: string | null;
  @ApiProperty({ type: () => ConvocationsEntity, default: null })
  convocation?: ConvocationsEntity | null;
  @ApiProperty({ type: 'string', default: null })
  dateEnvoi?: string | null;
  @ApiProperty()
  createdAt?: string;
  @ApiProperty()
  updatedAt?: string;

  constructor();
  constructor(data: ReponseConvocationsQueryInput);
  constructor(data?: ReponseConvocationsQueryInput) {
    if (!data) return;
    this.id = data.id;
    if ('choix' in data) {
      this.choix = data.choix;
      this.alerte = data.alerte;
      this.description = data.description;
      this.convocation = data.convocation
        ? new ConvocationsEntity(data.convocation)
        : null;
      this.dateEnvoi = data.date_envoi ? data.date_envoi.toJSON() : null;
      this.createdAt = data.created_at.toJSON();
      this.updatedAt = data.updated_at.toJSON();
    }
  }
}
