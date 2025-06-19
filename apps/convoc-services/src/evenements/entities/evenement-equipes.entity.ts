import { ApiProperty } from '@nestjs/swagger';
import { EvenementsEntity } from './evenement.entity';
import { EquipesEntity } from '../../equipes/entities/equipe.entity';
import { EvenementsQueryInput } from './evenement.type';
import { EquipesQueryInput } from '../../equipes/entities/equipe.type';

export class EvenementEquipesEntity {
  @ApiProperty({ type: () => EvenementsEntity, default: null })
  evenement?: EvenementsEntity | null;
  @ApiProperty({ type: () => EquipesEntity, default: null })
  equipe?: EquipesEntity | null;

  constructor();

  constructor(data: {
    evenement: EvenementsQueryInput;
    equipe: EquipesQueryInput;
  });

  constructor(data?: {
    evenement: EvenementsQueryInput;
    equipe: EquipesQueryInput;
  }) {
    if (!data) return;
    this.evenement = data.evenement
      ? new EvenementsEntity(data.evenement)
      : null;
    this.equipe = data.equipe ? new EquipesEntity(data.equipe) : null;
  }
}
