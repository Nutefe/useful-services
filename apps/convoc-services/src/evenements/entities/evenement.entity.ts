import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { MembresEntity } from '../../membres/entities/membre.entity';
import { OrganisationsEntity } from '../../organisations/entities/organisation.entity';
import { EvenementsQueryInput } from './evenement.type';

export class EvenementsEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;
  @ApiProperty()
  libelle?: string;
  @ApiProperty({ type: 'string', default: null })
  description?: string | null;
  @ApiProperty({ type: () => MembresEntity, default: null })
  coordinateur?: MembresEntity | null;
  @ApiProperty({ type: 'string', default: null })
  dateDebut?: string | null;
  @ApiProperty({ type: 'string', default: null })
  dateFin?: string | null;
  @ApiProperty({ type: () => OrganisationsEntity, default: null })
  organisation?: OrganisationsEntity | null;
  @ApiProperty()
  envoyer?: boolean;
  @ApiProperty()
  createdAt?: string;
  @ApiProperty()
  updatedAt?: string;

  constructor();
  constructor(data: EvenementsQueryInput);
  constructor(data?: EvenementsQueryInput) {
    if (!data) return;
    this.id = data.id;
    if ('libelle' in data) {
      this.libelle = data.libelle;
      this.description = data.description;
      this.coordinateur = data.coordinateur
        ? new MembresEntity(data.coordinateur)
        : null;
      this.dateDebut = data.date_debut ? data.date_debut.toJSON() : null;
      this.dateFin = data.date_fin ? data.date_fin.toJSON() : null;
      this.organisation = data.organisation
        ? new OrganisationsEntity(data.organisation)
        : null;
      this.envoyer = data.envoyer;
      this.createdAt = data.created_at.toJSON();
      this.updatedAt = data.updated_at.toJSON();
    }
  }
}
