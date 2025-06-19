import { ApiProperty } from '@nestjs/swagger';
import { EvenementsEntity } from '../entities/evenement.entity';

export class StatusResponseDto {
  @ApiProperty()
  evenement: EvenementsEntity;
  @ApiProperty()
  dateEnvoie: Date | null; // date d'envoie de la convocation
  @ApiProperty()
  nbrPersConvoc: number; // nombre de personne convoquer
  @ApiProperty()
  nbrReponseRecu: number; // nombre de reponse recu
  @ApiProperty()
  pourcReponseRecu: string; // pourcentage de reponse recu
  @ApiProperty()
  nbrReponsePositif: number; // nombre de reponse Positif
  @ApiProperty()
  pourcReponsePositif: string; // pourcentage de reponse Positif
  @ApiProperty()
  nbrReponseNegatif: number; // nombre de reponse Negatif
  @ApiProperty()
  pourcReponseNegatif: string; // pourcentage de reponse Negatif
  @ApiProperty()
  nbrReponseNeant: number; // nombre de reponse Negatif
  @ApiProperty()
  pourcReponseNeant: string; // pourcentage de reponse Negatif
}
