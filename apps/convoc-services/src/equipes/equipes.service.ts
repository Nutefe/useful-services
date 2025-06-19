import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEquipeDto } from './dto/create-equipe.dto';
import { UpdateEquipeDto } from './dto/update-equipe.dto';
import {
  DatabaseService,
  DataResponse,
  FiltersDto,
  formatPage,
  IdsDto,
} from '@app/common';
import { EquipesEntity } from './entities/equipe.entity';
import { OrganisationsService } from '../organisations/organisations.service';
import { Prisma } from '@prisma/client';
import { searchEquipes } from './entities/equipe.utils';

@Injectable()
export class EquipesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly organisationService: OrganisationsService,
  ) {}

  async create(
    createEquipeDto: CreateEquipeDto,
    user_id?: number,
  ): Promise<EquipesEntity> {
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );

    if (!organisation) {
      throw new NotFoundException('Organisation not found for the user');
    }

    // Check max equipes for the organisation
    const maxEquipes = organisation.equipeMax ?? 0;
    const currentEquipesCount = await this.databaseService.equipes.count({
      where: {
        organisation_id: organisation.id,
      },
    });
    if (maxEquipes > 0 && currentEquipesCount >= maxEquipes) {
      throw new NotAcceptableException(
        `Maximum number of equipes (${maxEquipes}) reached for this organisation.`,
      );
    }

    const equipe = await this.databaseService.equipes.create({
      data: {
        libelle: createEquipeDto.libelle ?? '',
        description: createEquipeDto.description ?? '',
        actif: createEquipeDto.actif,
        date_fin: createEquipeDto.dateFin,
        organisation: {
          connect: { id: organisation.id },
        },
      },
      include: {
        organisation: true,
        _count: {
          select: {
            equipe_membres: true,
          },
        },
      },
    });

    if (!equipe) {
      throw new NotFoundException('Equipe could not be created');
    }

    if (createEquipeDto.membre_ids.length > 0) {
      const membres = await Promise.all(
        createEquipeDto.membre_ids.map(async (membreId) => {
          const membre = await this.databaseService.membres.findUnique({
            where: { id: membreId },
          });

          if (!membre) {
            throw new NotFoundException(`Membre with ID ${membreId} not found`);
          }

          if (membre.date_fin && new Date(membre.date_fin) < new Date()) {
            if (
              equipe.organisation?.membre_equipe_actifs ===
              equipe._count.equipe_membres
            ) {
              throw new NotAcceptableException(
                `Membre with ID ${membreId} is not active (date_fin is in the past)`,
              );
            }
          }

          return membre.id;
        }),
      );

      await this.databaseService.equipes.update({
        where: { id: equipe.id },
        data: {
          equipe_membres: {
            create: membres.map((membreId) => ({
              membre: { connect: { id: membreId } },
            })),
          },
        },
      });
    }

    return new EquipesEntity(equipe);
  }

  async findAll(): Promise<EquipesEntity[]> {
    const equipes = await this.databaseService.equipes.findMany({
      where: { deleted: false },
      orderBy: { created_at: 'desc' },
      include: {
        organisation: true,
        equipe_membres: {
          include: {
            membre: true,
          },
        },
      },
    });
    return equipes.map((equipe) => new EquipesEntity(equipe));
  }

  async findAllByOrganisationId(user_id?: number): Promise<EquipesEntity[]> {
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );

    if (!organisation) {
      throw new NotFoundException('Organisation not found for the user');
    }

    const equipes = await this.databaseService.equipes.findMany({
      where: {
        organisation_id: organisation.id,
        deleted: false,
      },
      include: {
        organisation: true,
      },
    });

    return equipes.map((equipe) => new EquipesEntity(equipe));
  }

  async findAllByOrganisationExcludeMembreEquipe(
    membre_id: number,
    user_id?: number,
  ): Promise<EquipesEntity[]> {
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );

    if (!organisation) {
      throw new NotFoundException('Organisation not found for the user');
    }

    const equipes = await this.databaseService.equipes.findMany({
      where: {
        organisation_id: organisation.id,
        deleted: false,
        equipe_membres: {
          none: {
            membre_id: BigInt(membre_id),
          },
        },
        date_fin: {
          gte: new Date(),
        },
      },
      include: {
        organisation: true,
      },
    });

    return equipes.map((equipe) => new EquipesEntity(equipe));
  }

  async findAllByEvenementId(evenement_id: number): Promise<EquipesEntity[]> {
    const equipes = await this.databaseService.equipes.findMany({
      where: {
        evenement_equipes: {
          some: {
            evenement_id: BigInt(evenement_id),
          },
        },
        deleted: false,
      },
      include: {
        organisation: true,
      },
    });
    return equipes.map((equipe) => new EquipesEntity(equipe));
  }

  async findAllByPage(
    filter: FiltersDto,
    user_id?: number,
  ): Promise<DataResponse> {
    const { take, page, skip, keyword } = formatPage(
      filter.take,
      filter.page,
      filter.keyword,
    );

    // Define the where condition for the search
    const whereCondition: Prisma.EquipesWhereInput = {
      deleted: false,
      OR: searchEquipes(keyword),
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

    const [equipes, total] = await Promise.all([
      this.databaseService.equipes.findMany({
        where: whereCondition,
        skip,
        take,
      }),
      this.databaseService.equipes.count({ where: whereCondition }),
    ]);

    const datas = equipes.map((equipe) => new EquipesEntity(equipe));

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

  async findOne(id: number): Promise<EquipesEntity> {
    const equipe = await this.databaseService.equipes.findUnique({
      where: { id: BigInt(id), deleted: false },
      include: {
        organisation: true,
        equipe_membres: {
          include: {
            membre: true,
          },
        },
      },
    });
    if (!equipe) {
      throw new NotFoundException(`Equipe with ID ${id} not found`);
    }
    return new EquipesEntity(equipe);
  }

  async addMembreEquipe(id: number, idsDto: IdsDto): Promise<EquipesEntity> {
    const equipe = await this.databaseService.equipes.findUnique({
      where: { id: BigInt(id), deleted: false },
      include: {
        organisation: true,
        _count: {
          select: {
            equipe_membres: true,
          },
        },
      },
    });
    if (!equipe) {
      throw new NotFoundException(`Equipe with ID ${id} not found`);
    }

    if (!equipe.organisation) {
      throw new NotFoundException('Organisation not found for the user');
    }

    if (idsDto.ids && idsDto.ids.length > 0) {
      const membres = await Promise.all(
        idsDto.ids.map(async (membreId) => {
          const membre = await this.databaseService.membres.findUnique({
            where: { id: membreId },
          });
          if (!membre) {
            throw new NotFoundException(`Membre with ID ${membreId} not found`);
          }
          if (membre.date_fin && new Date(membre.date_fin) < new Date()) {
            if (
              equipe.organisation?.membre_equipe_actifs ===
              equipe._count.equipe_membres
            ) {
              throw new NotAcceptableException(
                `Membre with ID ${membreId} is not active (date_fin is in the past)`,
              );
            }
          }
          return membre.id;
        }),
      );
      await this.databaseService.equipes.update({
        where: { id: equipe.id },
        data: {
          equipe_membres: {
            deleteMany: {},
            create: membres.map((membreId) => ({
              membre: { connect: { id: membreId } },
            })),
          },
        },
      });
    }
    return new EquipesEntity(equipe);
  }

  async update(
    id: number,
    updateEquipeDto: UpdateEquipeDto,
    user_id?: number,
  ): Promise<EquipesEntity> {
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );

    if (!organisation) {
      throw new NotFoundException('Organisation not found for the user');
    }

    const equipe = await this.databaseService.equipes.findUnique({
      where: { id: BigInt(id), deleted: false },
      include: {
        organisation: true,
        equipe_membres: {
          include: {
            membre: true,
          },
        },
      },
    });
    if (!equipe) {
      throw new NotFoundException(`Equipe with ID ${id} not found`);
    }
    const updatedEquipe = await this.databaseService.equipes.update({
      where: { id: BigInt(id) },
      data: {
        libelle: updateEquipeDto.libelle ?? equipe.libelle,
        description: updateEquipeDto.description ?? equipe.description,
        actif: updateEquipeDto.actif ?? equipe.actif,
        date_fin: updateEquipeDto.dateFin ?? equipe.date_fin,
        organisation: {
          connect: { id: organisation.id },
        },
      },
      include: {
        organisation: true,
        _count: {
          select: {
            equipe_membres: true,
          },
        },
      },
    });
    if (!updatedEquipe) {
      throw new NotFoundException(`Equipe with ID ${id} could not be updated`);
    }
    if (updateEquipeDto.membre_ids && updateEquipeDto.membre_ids.length > 0) {
      const membres = await Promise.all(
        updateEquipeDto.membre_ids.map(async (membreId) => {
          const membre = await this.databaseService.membres.findUnique({
            where: { id: membreId },
          });
          if (!membre) {
            throw new NotFoundException(`Membre with ID ${membreId} not found`);
          }
          if (membre.date_fin && new Date(membre.date_fin) < new Date()) {
            if (
              updatedEquipe.organisation?.membre_equipe_actifs ===
              updatedEquipe._count.equipe_membres
            ) {
              throw new NotAcceptableException(
                `Membre with ID ${membreId} is not active (date_fin is in the past)`,
              );
            }
          }
          return membre.id;
        }),
      );
      await this.databaseService.equipes.update({
        where: { id: updatedEquipe.id },
        data: {
          equipe_membres: {
            deleteMany: {},
            create: membres.map((membreId) => ({
              membre: { connect: { id: membreId } },
            })),
          },
        },
      });
    }
    return new EquipesEntity(updatedEquipe);
  }

  async remove(id: number) {
    const equipeOld = await this.databaseService.equipes.findUnique({
      where: { id: BigInt(id), deleted: false },
    });

    if (!equipeOld) {
      throw new NotFoundException('Equipe not found');
    }

    const date = new Date();

    await this.databaseService.equipes.update({
      where: { id, version: equipeOld.version },
      data: {
        deleted: true,
        libelle: equipeOld.libelle + '-' + date.getTime(),
        version: { increment: 1 },
      },
    });
  }

  async removeMembreInEqueipe(id: number, idsDto: IdsDto) {
    if (idsDto.ids && idsDto.ids.length > 0) {
      await this.databaseService.equipes.update({
        where: { id: id },
        data: {
          equipe_membres: {
            deleteMany: {
              membre_id: { in: idsDto.ids.map((id) => BigInt(id)) },
            },
          },
        },
      });
    }
  }
}
