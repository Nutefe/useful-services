import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEvenementDto } from './dto/create-evenement.dto';
import { UpdateEvenementDto } from './dto/update-evenement.dto';
import {
  DatabaseService,
  DataResponse,
  FiltersDto,
  formatPage,
} from '@app/common';
import { OrganisationsService } from '../organisations/organisations.service';
import { EvenementsEntity } from './entities/evenement.entity';
import { Prisma } from '@prisma/client';
import {
  includeEvenements,
  searchEvenements,
} from './entities/evenement.utils';
import { StatusResponseDto } from './dto/status-response.dto';
import { FilterConvocDto } from '../dto/filter-convoc.dto';
import { MembresEntity } from '../membres/entities/membre.entity';

@Injectable()
export class EvenementsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly organisationService: OrganisationsService,
  ) {}

  async create(
    createEvenementDto: CreateEvenementDto,
    user_id?: number,
  ): Promise<EvenementsEntity> {
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );
    if (!organisation) {
      throw new NotFoundException('Organisation not found for the user');
    }

    const countEvenements = await this.databaseService.evenements.count({
      where: {
        organisation_id: organisation.id,
        envoyer: false,
        date_fin: {
          gte: new Date(),
        },
      },
    });

    if (
      organisation?.evenementActifs &&
      countEvenements >= organisation?.evenementActifs
    ) {
      throw new NotFoundException(
        'You have reached the maximum number of active events for this organisation',
      );
    }

    // compare the date_debut and date_fin
    if (
      createEvenementDto.dateDebut &&
      createEvenementDto.dateFin &&
      new Date(createEvenementDto.dateDebut) >
        new Date(createEvenementDto.dateFin)
    ) {
      throw new NotFoundException(
        'The start date cannot be after the end date',
      );
    }

    const evenement = await this.databaseService.evenements.create({
      data: {
        libelle: createEvenementDto.libelle,
        description: createEvenementDto.description,
        organisation_id: organisation.id,
        coordinateur_id: createEvenementDto.coordinateur_id,
        date_debut: createEvenementDto.dateDebut
          ? new Date(createEvenementDto.dateDebut)
          : null,
        date_fin: createEvenementDto.dateFin
          ? new Date(createEvenementDto.dateFin)
          : null,
        envoyer: false, // Default to false, can be updated later
      },
    });

    if (
      createEvenementDto.equipe_ids &&
      createEvenementDto.equipe_ids.length > 0
    ) {
      if (createEvenementDto.equipe_ids.length > 2) {
        throw new NotFoundException('You can not add more than 2 equipes');
      }

      await this.databaseService.evenements.update({
        where: { id: evenement.id },
        data: {
          evenement_equipes: {
            create: createEvenementDto.equipe_ids.map((equipe_id) => ({
              equipe_id: equipe_id,
            })),
          },
        },
      });
    }

    return new EvenementsEntity(evenement);
  }

  async findAll(): Promise<EvenementsEntity[]> {
    const evenements = await this.databaseService.evenements.findMany({
      where: { deleted: false },
      orderBy: { created_at: 'desc' },
      include: {
        organisation: true,
        coordinateur: true,
        evenement_equipes: {
          include: {
            equipe: true,
          },
        },
      },
    });
    return evenements.map((evenement) => new EvenementsEntity(evenement));
  }

  async findAllByEquipeId(equipe_id: number): Promise<EvenementsEntity[]> {
    const evenements = await this.databaseService.evenements.findMany({
      where: {
        evenement_equipes: {
          some: { equipe_id: equipe_id },
        },
        deleted: false,
      },
      orderBy: { created_at: 'desc' },
      include: {
        organisation: true,
        coordinateur: true,
        evenement_equipes: {
          include: {
            equipe: true,
          },
        },
      },
    });
    return evenements.map((evenement) => new EvenementsEntity(evenement));
  }

  async findAllByMembreId(membre_id: number): Promise<EvenementsEntity[]> {
    const evenements = await this.databaseService.evenements.findMany({
      where: {
        evenement_equipes: {
          some: {
            equipe: {
              equipe_membres: {
                some: { membre_id: membre_id },
              },
            },
          },
        },
        deleted: false,
      },
      orderBy: { created_at: 'desc' },
      include: {
        organisation: true,
        coordinateur: true,
        evenement_equipes: {
          include: {
            equipe: true,
          },
        },
      },
    });
    return evenements.map((evenement) => new EvenementsEntity(evenement));
  }

  async findAllByOrganisationId(user_id?: number): Promise<EvenementsEntity[]> {
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );
    if (!organisation) {
      throw new NotFoundException('Organisation not found for the user');
    }

    const evenements = await this.databaseService.evenements.findMany({
      where: {
        organisation_id: organisation.id,
        deleted: false,
      },
      orderBy: { created_at: 'desc' },
      include: {
        organisation: true,
        coordinateur: true,
        evenement_equipes: {
          include: {
            equipe: true,
          },
        },
      },
    });
    return evenements.map((evenement) => new EvenementsEntity(evenement));
  }

  async countEvenementEncours(user_id?: number): Promise<number> {
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );
    if (!organisation) {
      throw new NotFoundException('Organisation not found for the user');
    }

    return this.databaseService.evenements.count({
      where: {
        organisation_id: organisation.id,
        envoyer: false,
        date_fin: { gte: new Date() },
      },
    });
  }

  async findAllByPage(
    filter: FiltersDto,
    equipe_id?: number,
    user_id?: number,
  ): Promise<DataResponse> {
    const { take, page, skip, keyword } = formatPage(
      filter.take,
      filter.page,
      filter.keyword,
    );

    // Define the where condition for the search
    const whereCondition: Prisma.EvenementsWhereInput = {
      deleted: false,
      OR: searchEvenements(keyword),
    };

    if (user_id) {
      const organisation = await this.organisationService.findFirstByUserId(
        user_id ?? 0,
      );

      if (!organisation) {
        throw new NotFoundException(
          'Organisation not found for the given user ID',
        );
      }

      whereCondition.organisation_id = organisation.id;
    }

    if (equipe_id) {
      whereCondition.evenement_equipes = {
        some: { equipe_id: equipe_id },
      };
    }

    const [evenements, total] = await Promise.all([
      this.databaseService.evenements.findMany({
        where: whereCondition,
        skip,
        take,
        include: includeEvenements,
      }),
      this.databaseService.evenements.count({ where: whereCondition }),
    ]);

    const datas = evenements.map(
      (evenement) => new EvenementsEntity(evenement),
    );

    return new DataResponse(
      total,
      take,
      page,
      Math.ceil(total / take),
      page + 1,
      page - 1,
      datas,
    );
  }

  async findAllByFilterPage(
    filter: FilterConvocDto,
    evenement_id: number,
  ): Promise<DataResponse> {
    const { take, page, skip } = formatPage(filter.take, filter.page);
    const { equipes, membres, dateReponse, reponses } = filter;

    // Define the where condition for the search
    if (reponses && reponses.length > 0) {
      const whereCondition: Prisma.ReponseConvocationsWhereInput = {
        deleted: false,
        convocation: {
          evenement_id: evenement_id,
        },
        OR: [
          { convocation: { membre: { libelle: { in: membres } } } },
          {
            convocation: {
              membre: {
                equipe_membres: {
                  some: {
                    equipe: {
                      libelle: { in: equipes },
                    },
                  },
                },
              },
            },
          },
          {
            choix: { in: reponses },
          },
        ],
      };

      if (dateReponse && dateReponse?.length >= 2) {
        whereCondition.date_envoi = {
          gte: new Date(dateReponse[0]),
          lte: new Date(dateReponse[1]),
        };
      }

      const evenements =
        await this.databaseService.reponseConvocations.findMany({
          where: whereCondition,
          skip,
          take,
          select: {
            convocation: true,
          },
        });

      const convocation_id = evenements.map((event) =>
        Number(event?.convocation?.id),
      );

      const members = await this.databaseService.convocationMembres.findMany({
        where: { convocation_id: { in: convocation_id } },
        distinct: ['membre_id'],
        select: {
          membre: true,
        },
      });

      const total = members.length;

      const datas = members.map((member) => new MembresEntity(member.membre));

      return new DataResponse(
        total,
        take,
        page,
        Math.ceil(total / take),
        page + 1,
        page - 1,
        datas,
      );
    } else {
      const whereCondition: Prisma.ConvocationsWhereInput = {
        deleted: false,
        evenement_id: evenement_id,
        OR: [
          {
            membre: { libelle: { in: membres } },
          },
          {
            membre: {
              equipe_membres: {
                some: {
                  equipe: {
                    libelle: { in: equipes },
                  },
                },
              },
            },
          },
        ],
      };

      const evenements = await this.databaseService.convocations.findMany({
        where: whereCondition,
        skip,
        take,
      });

      const convocation_id = evenements.map((event) => Number(event?.id));

      const members = await this.databaseService.convocationMembres.findMany({
        where: { convocation_id: { in: convocation_id } },
        distinct: ['membre_id'],
        select: {
          membre: true,
        },
      });

      const total = members.length;

      const datas = members.map((member) => new MembresEntity(member.membre));

      return new DataResponse(
        total,
        take,
        page,
        Math.ceil(total / take),
        page + 1,
        page - 1,
        datas,
      );
    }
  }

  async findOne(id: number): Promise<EvenementsEntity> {
    const evenement = await this.databaseService.evenements.findUnique({
      where: { id: id },
      include: {
        organisation: true,
        coordinateur: true,
        evenement_equipes: {
          include: {
            equipe: true,
          },
        },
      },
    });
    if (!evenement) {
      throw new NotFoundException('Event not found');
    }
    return new EvenementsEntity(evenement);
  }

  async costumeEtatEvenement(evenement_id: number): Promise<StatusResponseDto> {
    const evenement = await this.databaseService.evenements.findUnique({
      where: { id: evenement_id, deleted: false },
    });
    if (!evenement) throw new NotFoundException('Event not found');

    const convocation = await this.databaseService.convocations.findFirst({
      where: { evenement_id: evenement.id, deleted: false },
    });

    const convocationsCount = await this.databaseService.convocations.count({
      where: { evenement_id: evenement.id, deleted: false },
    });
    const reponsesCount = await this.databaseService.reponseConvocations.count({
      where: {
        convocation: {
          evenement_id: evenement.id,
        },
        deleted: false,
      },
    });
    const reponsesPositivesCount =
      await this.databaseService.reponseConvocations.count({
        where: {
          convocation: {
            evenement_id: evenement.id,
          },
          choix: 'Oui, sera présent(e)',
          deleted: false,
        },
      });

    const reponsesNegativesCount =
      await this.databaseService.reponseConvocations.count({
        where: {
          convocation: {
            evenement_id: evenement.id,
          },
          choix: 'Non, sera absent(e)',
          deleted: false,
        },
      });

    const reponsesNeantCount = convocationsCount - reponsesCount;
    const statusEvenement: StatusResponseDto = {
      evenement: new EvenementsEntity(evenement),
      dateEnvoie: convocation ? convocation.date_envoi : null,
      nbrPersConvoc: convocationsCount ?? 0.0,
      nbrReponseRecu: reponsesCount ?? 0.0,
      nbrReponsePositif: reponsesPositivesCount ?? 0.0,
      nbrReponseNegatif: reponsesNegativesCount ?? 0.0,
      nbrReponseNeant: reponsesNeantCount ?? 0.0,
      pourcReponseRecu:
        convocationsCount > 0
          ? ((reponsesCount / convocationsCount) * 100).toFixed(2)
          : '0.00',
      pourcReponsePositif:
        convocationsCount > 0
          ? ((reponsesPositivesCount / convocationsCount) * 100).toFixed(2)
          : '0.00',
      pourcReponseNegatif:
        convocationsCount > 0
          ? ((reponsesNegativesCount / convocationsCount) * 100).toFixed(2)
          : '0.00',
      pourcReponseNeant:
        convocationsCount > 0
          ? ((reponsesNeantCount / convocationsCount) * 100).toFixed(2)
          : '0.00',
    };

    return statusEvenement;
  }

  async update(
    evenement_id: number,
    updateEvenementDto: UpdateEvenementDto,
    user_id?: number,
  ): Promise<EvenementsEntity> {
    const evenementOld = await this.databaseService.evenements.findUnique({
      where: { id: evenement_id },
    });
    if (!evenementOld) throw new NotFoundException('Event not found');

    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );
    if (!organisation) {
      throw new NotFoundException('Organisation not found for the user');
    }

    const countEvenements = await this.databaseService.evenements.count({
      where: {
        organisation_id: organisation.id,
        envoyer: false,
        date_fin: { gte: new Date() },
        NOT: { id: evenement_id },
      },
    });
    if (
      organisation?.evenementActifs &&
      countEvenements >= organisation.evenementActifs
    ) {
      throw new NotFoundException(
        'You have reached the maximum number of active events for this organisation',
      );
    }

    if (
      updateEvenementDto.dateDebut &&
      updateEvenementDto.dateFin &&
      new Date(updateEvenementDto.dateDebut) >
        new Date(updateEvenementDto.dateFin)
    ) {
      throw new NotFoundException(
        'The start date cannot be after the end date',
      );
    }

    // 6. Mettre à jour l'événement
    const updatedEvenement = await this.databaseService.evenements.update({
      where: { id: evenement_id },
      data: {
        libelle: updateEvenementDto.libelle ?? evenementOld.libelle,
        description: updateEvenementDto.description ?? evenementOld.description,
        coordinateur_id:
          updateEvenementDto.coordinateur_id ?? evenementOld.coordinateur_id,
        date_debut: updateEvenementDto.dateDebut
          ? new Date(updateEvenementDto.dateDebut)
          : evenementOld.date_debut,
        date_fin: updateEvenementDto.dateFin
          ? new Date(updateEvenementDto.dateFin)
          : evenementOld.date_fin,
      },
    });

    // 7. Gérer l'association des équipes
    if (Array.isArray(updateEvenementDto.equipe_ids)) {
      if (updateEvenementDto.equipe_ids.length > 2) {
        throw new NotFoundException('You can not add more than 2 equipes');
      }

      // Supprimer les associations existantes
      await this.databaseService.evenementEquipes.deleteMany({
        where: { evenement_id: evenement_id },
      });

      if (updateEvenementDto.equipe_ids.length > 0) {
        // Créer les nouvelles associations
        await this.databaseService.evenements.update({
          where: { id: evenement_id },
          data: {
            evenement_equipes: {
              create: updateEvenementDto.equipe_ids.map((equipe_id) => ({
                equipe_id: equipe_id,
              })),
            },
          },
        });
      }
    }

    return new EvenementsEntity(updatedEvenement);
  }

  async remove(id: number) {
    const evenementOld = await this.databaseService.evenements.findUnique({
      where: { id: BigInt(id), deleted: false },
    });

    if (!evenementOld) {
      throw new NotFoundException('Evenement not found');
    }

    const date = new Date();

    await this.databaseService.evenements.update({
      where: { id, version: evenementOld.version },
      data: {
        deleted: true,
        libelle: evenementOld.libelle + '-' + date.getTime(),
        version: { increment: 1 },
      },
    });
  }
}
