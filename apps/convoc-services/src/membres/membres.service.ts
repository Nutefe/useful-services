import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMembreDto } from './dto/create-membre.dto';
import { UpdateMembreDto } from './dto/update-membre.dto';
import {
  DatabaseService,
  DataResponse,
  FiltersDto,
  formatPage,
  IdsDto,
} from '@app/common';
import { MembresEntity } from './entities/membre.entity';
import { Prisma } from '@prisma/client';
import { generateUniqueCode } from '@app/common/helper/slug.helper';
import { OrganisationsService } from '../organisations/organisations.service';
import { includeMembres, searchMembres } from './entities/membre.utils';

@Injectable()
export class MembresService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly organisationService: OrganisationsService,
  ) {}

  async create(
    createMembreDto: CreateMembreDto,
    user_id: number,
  ): Promise<MembresEntity> {
    if (
      createMembreDto.email &&
      (await this.existEmail(createMembreDto.email))
    ) {
      throw new Error('Email already exists');
    }

    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );
    if (!organisation) {
      throw new NotFoundException('Organisation not found for the user');
    }

    const slug = await this.createMembreWithUniqueCode();

    const membreData = {
      libelle: createMembreDto.libelle,
      email: createMembreDto.email,
      adresse: createMembreDto.adresse,
      telephone: createMembreDto.telephone,
      slug,
      has_responsable: createMembreDto.hasResponsable,
      actif: createMembreDto.actif,
      date_fin: createMembreDto.dateFin,
      organisation: { connect: { id: organisation.id } },
    };

    let membre = await this.databaseService.membres.create({
      data: membreData,
    });

    if (createMembreDto.hasResponsable && createMembreDto.emailResponsable) {
      let responsable = await this.databaseService.responsables.findFirst({
        where: { email: createMembreDto.emailResponsable, deleted: false },
      });

      responsable ??= await this.databaseService.responsables.create({
        data: {
          email: createMembreDto.emailResponsable,
          libelle: createMembreDto.libelleResponsable,
          telephone: createMembreDto.telephoneResponsable,
          adresse: createMembreDto.adresseResponsable,
          organisation: { connect: { id: organisation.id } },
        },
      });

      // Always update membre with responsable_id (new or existing)
      membre = await this.databaseService.membres.update({
        where: { id: membre.id },
        data: { responsable_id: responsable.id },
      });
    }

    if (
      Array.isArray(createMembreDto.equipe_ids) &&
      createMembreDto.equipe_ids.length > 0
    ) {
      const equipes = await Promise.all(
        createMembreDto.equipe_ids.map(async (equipeId) => {
          const equipe = await this.databaseService.membres.findUnique({
            where: { id: equipeId },
            include: {
              organisation: true,
              _count: {
                select: { equipe_membres: true },
              },
            },
          });

          if (!equipe) {
            throw new NotFoundException(`Equipe with ID ${equipeId} not found`);
          }

          if (membre.date_fin && new Date(membre.date_fin) < new Date()) {
            if (
              equipe.organisation?.membre_equipe_actifs ===
              equipe._count.equipe_membres
            ) {
              throw new NotAcceptableException(
                `Equipe with ID ${equipeId} is not active (date_fin is in the past)`,
              );
            }
          }

          return equipe.id;
        }),
      );

      membre = await this.databaseService.membres.update({
        where: { id: membre.id },
        data: {
          equipe_membres: {
            create: equipes.map((equipe_id) => ({
              equipe_id,
            })),
          },
        },
      });
    }

    return new MembresEntity(membre);
  }

  async findAll(): Promise<MembresEntity[]> {
    const membres = await this.databaseService.membres.findMany({
      where: { deleted: false },
      include: {
        organisation: true,
        responsable: true,
        equipe_membres: {
          include: {
            equipe: true,
          },
        },
      },
    });
    return membres.map((membre) => new MembresEntity(membre));
  }

  async findAllByEvenementId(evenement_id: number): Promise<MembresEntity[]> {
    const equipes = await this.databaseService.evenementEquipes.findMany({
      where: { evenement_id: evenement_id },
      select: { equipe_id: true },
    });
    const membres = await this.databaseService.membres.findMany({
      where: {
        deleted: false,
        equipe_membres: {
          some: {
            equipe_id: {
              in: equipes.map((equipe) => equipe.equipe_id),
            },
          },
        },
      },
      include: {
        organisation: true,
        responsable: true,
        equipe_membres: {
          include: {
            equipe: true,
          },
        },
      },
    });
    return membres.map((membre) => new MembresEntity(membre));
  }

  async findAllByEquipeId(equipe_id: number): Promise<MembresEntity[]> {
    const membres = await this.databaseService.membres.findMany({
      where: {
        deleted: false,
        equipe_membres: {
          some: { equipe_id: equipe_id },
        },
      },
      include: {
        organisation: true,
        responsable: true,
        equipe_membres: {
          include: {
            equipe: true,
          },
        },
      },
    });
    return membres.map((membre) => new MembresEntity(membre));
  }

  async findAllActifByEquipeId(equipe_id: number): Promise<MembresEntity[]> {
    const membres = await this.databaseService.membres.findMany({
      where: {
        deleted: false,
        date_fin: {
          gte: new Date(),
        },
        equipe_membres: {
          some: { equipe_id: equipe_id },
        },
      },
      include: {
        organisation: true,
        responsable: true,
        equipe_membres: {
          include: {
            equipe: true,
          },
        },
      },
    });
    return membres.map((membre) => new MembresEntity(membre));
  }

  async findAllActifByEquipeIds(
    equipe_ids: number[],
  ): Promise<MembresEntity[]> {
    const membres = await this.databaseService.membres.findMany({
      where: {
        deleted: false,
        date_fin: {
          gte: new Date(),
        },
        equipe_membres: {
          some: { equipe_id: { in: equipe_ids } },
        },
      },
      include: {
        organisation: true,
        responsable: true,
        equipe_membres: {
          include: {
            equipe: true,
          },
        },
      },
    });
    return membres.map((membre) => new MembresEntity(membre));
  }

  async findAllNotActifByEquipeId(
    equipe_id: number,
    user_id?: number,
  ): Promise<MembresEntity[]> {
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );
    if (!organisation) {
      throw new NotFoundException('Organisation not found for the user');
    }

    const membres = await this.databaseService.membres.findMany({
      where: {
        deleted: false,
        date_fin: {
          lt: new Date(),
        },
        organisation_id: organisation.id,
        equipe_membres: {
          some: { equipe_id: equipe_id },
        },
      },
      include: {
        organisation: true,
        responsable: true,
        equipe_membres: {
          include: {
            equipe: true,
          },
        },
      },
    });
    return membres.map((membre) => new MembresEntity(membre));
  }

  async findAllByOrganisationId(user_id?: number): Promise<MembresEntity[]> {
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );
    if (!organisation) {
      throw new NotFoundException('Organisation not found for the user');
    }

    const membres = await this.databaseService.membres.findMany({
      where: { deleted: false, organisation_id: organisation.id },
      include: {
        organisation: true,
        responsable: true,
        equipe_membres: {
          include: {
            equipe: true,
          },
        },
      },
    });
    return membres.map((membre) => new MembresEntity(membre));
  }

  async findAllActifByOrganisationId(
    user_id?: number,
  ): Promise<MembresEntity[]> {
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );
    if (!organisation) {
      throw new NotFoundException('Organisation not found for the user');
    }

    const membres = await this.databaseService.membres.findMany({
      where: {
        deleted: false,
        date_fin: {
          gte: new Date(),
        },
        actif: true,
        organisation_id: organisation.id,
      },
      include: {
        organisation: true,
        responsable: true,
        equipe_membres: {
          include: {
            equipe: true,
          },
        },
      },
    });
    return membres.map((membre) => new MembresEntity(membre));
  }

  async findAllInviteByEvenementId(
    evenement_id: number,
  ): Promise<MembresEntity[]> {
    const membres = await this.databaseService.convocations.findMany({
      where: {
        deleted: false,
        evenement_id: evenement_id,
      },
      include: {
        convocation_membres: {
          include: {
            membre: {
              include: {
                organisation: true,
                responsable: true,
                equipe_membres: {
                  include: {
                    equipe: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return membres.map((membre) => new MembresEntity(membre));
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
    const whereCondition: Prisma.MembresWhereInput = {
      deleted: false,
      OR: searchMembres(keyword),
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
      whereCondition.equipe_membres = {
        some: { equipe_id: equipe_id },
      };
    }

    const [membres, total] = await Promise.all([
      this.databaseService.membres.findMany({
        where: whereCondition,
        skip,
        take,
        include: includeMembres,
      }),
      this.databaseService.membres.count({ where: whereCondition }),
    ]);

    const datas = membres.map((membre) => new MembresEntity(membre));

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

  async findAllByEvenementPage(
    filter: FiltersDto,
    evenement_id?: number,
  ): Promise<DataResponse> {
    const { take, page, skip, keyword } = formatPage(
      filter.take,
      filter.page,
      filter.keyword,
    );

    // Define the where condition for the search
    const whereCondition: Prisma.MembresWhereInput = {
      deleted: false,
      OR: searchMembres(keyword),
    };

    if (evenement_id) {
      const equipes = await this.databaseService.evenementEquipes.findMany({
        where: { evenement_id: evenement_id },
        select: { equipe_id: true },
      });

      whereCondition.equipe_membres = {
        some: {
          equipe_id: {
            in: equipes.map((equipe) => equipe.equipe_id),
          },
        },
      };
    }

    const [membres, total] = await Promise.all([
      this.databaseService.membres.findMany({
        where: whereCondition,
        skip,
        take,
        include: includeMembres,
      }),
      this.databaseService.membres.count({ where: whereCondition }),
    ]);

    const datas = membres.map((membre) => new MembresEntity(membre));

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

  async findOne(id: number): Promise<MembresEntity> {
    const membre = await this.databaseService.membres.findUnique({
      where: { id: id, deleted: false },
      include: {
        organisation: true,
        responsable: true,
        equipe_membres: {
          include: {
            equipe: true,
          },
        },
      },
    });
    if (!membre) {
      throw new NotFoundException('Membre not found');
    }
    return new MembresEntity(membre);
  }

  async addMembreEquip(
    membreId: number,
    idsDto: IdsDto,
    user_id: number,
  ): Promise<MembresEntity> {
    // 1. Vérifier si le membre existe
    const membreOld = await this.databaseService.membres.findUnique({
      where: { id: membreId },
    });
    if (!membreOld) throw new NotFoundException('Membre not found');

    //
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );
    if (!organisation)
      throw new NotFoundException('Organisation not found for the user');

    //
    if (Array.isArray(idsDto.ids) && idsDto.ids.length > 0) {
      const equipes = await Promise.all(
        idsDto.ids.map(async (equipeId) => {
          const equipe = await this.databaseService.membres.findUnique({
            where: { id: equipeId },
            include: {
              organisation: true,
              _count: {
                select: { equipe_membres: true },
              },
            },
          });

          if (!equipe) {
            throw new NotFoundException(`Equipe with ID ${equipeId} not found`);
          }

          if (membreOld.date_fin && new Date(membreOld.date_fin) < new Date()) {
            if (
              equipe.organisation?.membre_equipe_actifs ===
              equipe._count.equipe_membres
            ) {
              throw new NotAcceptableException(
                `Equipe with ID ${equipeId} is not active (date_fin is in the past)`,
              );
            }
          }

          return equipe.id;
        }),
      );

      await this.databaseService.equipeMembres.createMany({
        data: equipes.map((equipe_id) => ({
          membre_id: membreId,
          equipe_id,
        })),
      });
    }

    return new MembresEntity(membreOld);
  }

  async update(
    membreId: number,
    updateMembreDto: UpdateMembreDto,
    user_id: number,
  ): Promise<MembresEntity> {
    // 1. Vérifier si le membre existe
    const membreOld = await this.databaseService.membres.findUnique({
      where: { id: membreId },
    });
    if (!membreOld) throw new NotFoundException('Membre not found');

    //
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );
    if (!organisation)
      throw new NotFoundException('Organisation not found for the user');

    //
    let responsable_id: bigint | number | null = null;
    if (updateMembreDto.hasResponsable && updateMembreDto.emailResponsable) {
      let responsable = await this.databaseService.responsables.findFirst({
        where: { email: updateMembreDto.emailResponsable, deleted: false },
      });

      responsable ??= await this.databaseService.responsables.create({
        data: {
          email: updateMembreDto.emailResponsable,
          libelle: updateMembreDto.libelleResponsable,
          telephone: updateMembreDto.telephoneResponsable,
          adresse: updateMembreDto.adresseResponsable,
          organisation: { connect: { id: organisation.id } },
        },
      });

      responsable_id = responsable.id;
    }

    //
    const updatedMembre = await this.databaseService.membres.update({
      where: { id: membreId },
      data: {
        libelle: updateMembreDto.libelle ?? membreOld.libelle,
        email: updateMembreDto.email ?? membreOld.email,
        adresse: updateMembreDto.adresse ?? membreOld.adresse,
        telephone: updateMembreDto.telephone ?? membreOld.telephone,
        has_responsable:
          updateMembreDto.hasResponsable ?? membreOld.has_responsable,
        actif: updateMembreDto.actif ?? membreOld.actif,
        date_fin: updateMembreDto.dateFin ?? membreOld.date_fin,
        responsable_id: responsable_id,
      },
    });

    //
    if (Array.isArray(updateMembreDto.equipe_ids)) {
      // On supprime les liens existants et on recrée les nouveaux
      await this.databaseService.equipeMembres.deleteMany({
        where: { membre_id: membreId },
      });

      if (updateMembreDto.equipe_ids.length > 0) {
        await this.databaseService.equipeMembres.createMany({
          data: updateMembreDto.equipe_ids.map((equipe_id) => ({
            membre_id: membreId,
            equipe_id,
          })),
        });
      }
    }

    return new MembresEntity(updatedMembre);
  }

  async existEmail(email: string, id?: number): Promise<boolean> {
    // Find the permission by name and is not deleted
    const whereCondition: Prisma.MembresWhereInput = {
      deleted: false,
      email: email,
    };

    // If the id is provided, exclude it from the search
    if (id) {
      whereCondition.id = { not: id };
    }

    // Check if the role exists
    const membre = await this.databaseService.membres.findFirst({
      where: whereCondition,
    });

    return !!membre;
  }

  async createMembreWithUniqueCode() {
    while (true) {
      const code = generateUniqueCode(10);
      const exists = await this.databaseService.membres.findUnique({
        where: { slug: code },
      });
      if (!exists) return code;
    }
  }

  async remove(id: number) {
    const membreOld = await this.databaseService.membres.findUnique({
      where: { id: BigInt(id), deleted: false },
    });

    if (!membreOld) {
      throw new NotFoundException('Evenement not found');
    }

    const date = new Date();

    await this.databaseService.membres.update({
      where: { id, version: membreOld.version },
      data: {
        deleted: true,
        libelle: membreOld.libelle + '-' + date.getTime(),
        version: { increment: 1 },
      },
    });
  }

  async removeMembreFromEquipe(
    membre_id: number,
    idsDto: IdsDto,
  ): Promise<MembresEntity> {
    // 1. Vérifier si le membre existe
    const membreOld = await this.databaseService.membres.findUnique({
      where: { id: membre_id, deleted: false },
    });
    if (!membreOld) throw new NotFoundException('Membre not found');

    // 2. Supprimer les liens avec les équipes spécifiées
    if (Array.isArray(idsDto.ids) && idsDto.ids.length > 0) {
      await this.databaseService.equipeMembres.deleteMany({
        where: {
          membre_id: membre_id,
          equipe_id: { in: idsDto.ids },
        },
      });
    }

    return new MembresEntity(membreOld);
  }
}
