import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EvenementsEntity } from '../../evenements/entities/evenement.entity';
import { MembresEntity } from '../../membres/entities/membre.entity';
import { ConvocationsQueryInput } from './convocation.type';

export class ConvocationsEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;
  @ApiProperty({ type: 'string', default: null })
  dateEnvoi?: string | null;
  @ApiProperty({ type: () => EvenementsEntity, default: null })
  evenement?: EvenementsEntity | null;
  @ApiProperty({ type: () => [MembresEntity], default: null })
  membres?: MembresEntity[];
  @ApiProperty({ type: 'string', default: null })
  slug?: string | null;
  @ApiProperty()
  envoyer?: boolean;
  @ApiProperty()
  createdAt?: string;
  @ApiProperty()
  updatedAt?: string;

  constructor();
  constructor(data: ConvocationsQueryInput);
  constructor(data?: ConvocationsQueryInput) {
    if (!data) return;
    this.id = data.id;
    if ('slug' in data) {
      this.slug = data.slug;
      this.dateEnvoi = data.date_envoi ? data.date_envoi.toJSON() : null;
      this.evenement = data.evenement
        ? new EvenementsEntity(data.evenement)
        : null;
      this.membres = data.convocation_membres
        ? data.convocation_membres.map(
            (membre) => new MembresEntity(membre.membre),
          )
        : [];
      this.envoyer = data.envoyer;
      this.createdAt = data.created_at.toJSON();
      this.updatedAt = data.updated_at.toJSON();
    }
  }
}
