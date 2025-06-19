import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateConvocationDto } from './dto/create-convocation.dto';
import {
  ConvocationMailDto,
  DatabaseService,
  DataResponse,
  FiltersDto,
  formatPage,
  generateUniqueCode,
  getDateFromDateString,
  getTimeFromDateString,
} from '@app/common';
import { OrganisationsService } from '../organisations/organisations.service';
import { ClientProxy } from '@nestjs/microservices';
import { ConvocationsEntity } from './entities/convocation.entity';
import { CreateConvocationEquipeDto } from './dto/create-convocation-equipe.dto';
import { Prisma } from '@prisma/client';
import {
  includeConvocations,
  searchConvocations,
} from './entities/convocation.utils';

@Injectable()
export class ConvocationsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly organisationService: OrganisationsService,
    @Inject(process.env.EMAIL_SERVICE ?? 'email-service')
    private readonly emailServicesService: ClientProxy,
    @Inject(process.env.NOTIFICATION_SERVICE ?? 'notification-service')
    private readonly notificationServicesService: ClientProxy,
  ) {}

  async create(
    createConvocationDto: CreateConvocationDto,
    user_id?: number,
  ): Promise<ConvocationsEntity> {
    // check if this event already convoked
    const alreadyConvoked = await this.databaseService.evenements.findFirst({
      where: {
        id: createConvocationDto.evenement_id,
        deleted: false,
        envoyer: true,
      },
    });
    if (alreadyConvoked) {
      throw new Error('This event is already convoked');
    }

    // check if equipe is already convoked this week
    const alreadyConvokedThisWeek =
      await this.databaseService.convocations.findFirst({
        where: {
          evenement: {
            evenement_equipes: {
              some: {
                evenement_id: createConvocationDto.evenement_id,
              },
            },
          },
          date_envoi: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
          deleted: false,
        },
      });

    if (alreadyConvokedThisWeek) {
      throw new Error('This equipe is already convoked this week');
    }

    // check max convocation for this organisation
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );
    if (!organisation) {
      throw new Error('Organisation not found');
    }

    const countConvocations = await this.databaseService.convocations.count({
      where: {
        evenement: {
          organisation_id: organisation.id,
          deleted: false,
        },
        deleted: false,
      },
    });
    if (
      organisation.convocMax &&
      organisation.convocMax === countConvocations
    ) {
      throw new Error(
        'Maximum number of convocations reached for this organisation',
      );
    }

    // create convocation

    const slug = await this.createConvocWithUniqueCode();
    const convocation = await this.databaseService.convocations.create({
      data: {
        date_envoi: new Date(),
        evenement_id: createConvocationDto.evenement_id,
        envoyer: true,
        slug: slug,
        convocation_membres: {
          create: createConvocationDto.membre_ids.map((membre) => ({
            membre_id: membre,
          })),
        },
      },
      include: {
        convocation_membres: {
          include: {
            membre: true,
          },
        },
      },
    });

    const convocationEntity = new ConvocationsEntity(convocation);

    if (convocationEntity) {
      // send email to members
      this.emailServicesService.emit('convocation_created', {
        convocation: convocationEntity,
      });

      // send notification to members
      this.notificationServicesService.emit('convocation_created', {
        convocation: convocationEntity,
      });
    }

    return convocationEntity;
  }

  async createEquipe(
    createConvocationDto: CreateConvocationEquipeDto,
    user_id?: number,
  ): Promise<ConvocationsEntity> {
    // check if this event already convoked
    const alreadyConvoked = await this.databaseService.evenements.findFirst({
      where: {
        id: createConvocationDto.evenement_id,
        deleted: false,
        envoyer: true,
      },
    });
    if (alreadyConvoked) {
      throw new Error('This event is already convoked');
    }

    // check if equipe is already convoked this week
    const alreadyConvokedThisWeek =
      await this.databaseService.convocations.findFirst({
        where: {
          evenement: {
            evenement_equipes: {
              some: {
                evenement_id: createConvocationDto.evenement_id,
              },
            },
          },
          date_envoi: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
          deleted: false,
        },
      });

    if (alreadyConvokedThisWeek) {
      throw new Error('This equipe is already convoked this week');
    }

    // check max convocation for this organisation
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );
    if (!organisation) {
      throw new Error('Organisation not found');
    }

    const countConvocations = await this.databaseService.convocations.count({
      where: {
        evenement: {
          organisation_id: organisation.id,
          deleted: false,
        },
        deleted: false,
      },
    });
    if (
      organisation.convocMax &&
      organisation.convocMax === countConvocations
    ) {
      throw new Error(
        'Maximum number of convocations reached for this organisation',
      );
    }

    // create convocation

    const slug = await this.createConvocWithUniqueCode();

    const membre_ids = await this.databaseService.membres.findMany({
      where: {
        equipe_membres: {
          some: {
            equipe_id: {
              in: createConvocationDto.equipe_ids,
            },
          },
        },
        deleted: false,
      },
      select: {
        id: true,
      },
    });

    const convocation = await this.databaseService.convocations.create({
      data: {
        date_envoi: new Date(),
        evenement_id: createConvocationDto.evenement_id,
        envoyer: true,
        slug: slug,
        convocation_membres: {
          create: membre_ids.map((membre) => ({
            membre_id: membre.id,
          })),
        },
      },
      include: {
        convocation_membres: {
          include: {
            membre: true,
          },
        },
      },
    });

    const convocationEntity = new ConvocationsEntity(convocation);

    if (convocationEntity) {
      // send email to members
      this.emailServicesService.emit('convocation_created', {
        convocation: convocationEntity,
      });

      // send notification to members
      this.notificationServicesService.emit('convocation_created', {
        convocation: convocationEntity,
      });
    }

    return convocationEntity;
  }

  async send(
    evenement_id: number,
    user_id?: number,
  ): Promise<ConvocationsEntity> {
    // check if this event already convoked
    const alreadyConvoked = await this.databaseService.evenements.findFirst({
      where: {
        id: evenement_id,
        deleted: false,
        envoyer: true,
      },
    });
    if (alreadyConvoked) {
      throw new Error('This event is already convoked');
    }

    // check if equipe is already convoked this week
    const alreadyConvokedThisWeek =
      await this.databaseService.convocations.findFirst({
        where: {
          evenement: {
            evenement_equipes: {
              some: {
                evenement_id: evenement_id,
              },
            },
          },
          date_envoi: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
          deleted: false,
        },
      });

    if (alreadyConvokedThisWeek) {
      throw new Error('This equipe is already convoked this week');
    }

    // check max convocation for this organisation
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );
    if (!organisation) {
      throw new Error('Organisation not found');
    }

    const countConvocations = await this.databaseService.convocations.count({
      where: {
        evenement: {
          organisation_id: organisation.id,
          deleted: false,
        },
        deleted: false,
      },
    });
    if (
      organisation.convocMax &&
      organisation.convocMax === countConvocations
    ) {
      throw new Error(
        'Maximum number of convocations reached for this organisation',
      );
    }

    // create convocation

    const slug = await this.createConvocWithUniqueCode();

    const equipe_ids = await this.databaseService.evenements.findUnique({
      where: { id: evenement_id },
      select: {
        evenement_equipes: {
          select: {
            equipe_id: true,
          },
        },
      },
    });

    const membre_ids = await this.databaseService.membres.findMany({
      where: {
        equipe_membres: {
          some: {
            equipe_id: {
              in: equipe_ids?.evenement_equipes.map(
                (equipe) => equipe.equipe_id,
              ),
            },
          },
        },
        deleted: false,
      },
      select: {
        id: true,
      },
    });

    const convocation = await this.databaseService.convocations.create({
      data: {
        date_envoi: new Date(),
        evenement_id: evenement_id,
        envoyer: true,
        slug: slug,
        convocation_membres: {
          create: membre_ids.map((membre) => ({
            membre_id: membre.id,
          })),
        },
      },
      include: {
        convocation_membres: {
          include: {
            membre: true,
          },
        },
      },
    });

    const convocationEntity = new ConvocationsEntity(convocation);

    if (convocationEntity) {
      // send email to members
      this.sendConvocation(convocationEntity);
    }

    return convocationEntity;
  }

  sendConvocation(convocation: ConvocationsEntity): void {
    if (!convocation) {
      throw new NotFoundException('Convocation not found');
    }

    if (convocation?.membres && convocation?.membres.length > 0) {
      convocation?.membres.forEach((membre) => {
        // send email to members
        if (membre.hasResponsable) {
          const convocationData: ConvocationMailDto = {
            id: Number(convocation.id),
            name: membre.libelle ?? '',
            membre: membre.responsable?.libelle ?? '',
            date_debut: getDateFromDateString(
              convocation.evenement?.dateDebut ?? '',
            ),
            heure_debut: getTimeFromDateString(
              convocation.evenement?.dateDebut ?? '',
            ),
            date_fin: getDateFromDateString(
              convocation.evenement?.dateFin ?? '',
            ),
            heure_fin: getTimeFromDateString(
              convocation.evenement?.dateFin ?? '',
            ),
            evenement: convocation.evenement?.libelle ?? '',
            slug: convocation.slug ?? '',
            email: membre.responsable?.email ?? '',
          };

          this.emailServicesService.emit('convocation-send', {
            convocation: convocationData,
          });

          // send notification to members
          // this.notificationServicesService.emit('convocation_created', {
          //   convocation: convocationData,
          // });
        } else {
          const convocationData: ConvocationMailDto = {
            id: Number(convocation.id),
            name: membre.libelle ?? '',
            membre: membre?.libelle ?? '',
            date_debut: getDateFromDateString(
              convocation.evenement?.dateDebut ?? '',
            ),
            heure_debut: getTimeFromDateString(
              convocation.evenement?.dateDebut ?? '',
            ),
            date_fin: getDateFromDateString(
              convocation.evenement?.dateFin ?? '',
            ),
            heure_fin: getTimeFromDateString(
              convocation.evenement?.dateFin ?? '',
            ),
            evenement: convocation.evenement?.libelle ?? '',
            slug: convocation.slug ?? '',
            email: membre.responsable?.email ?? '',
          };

          this.emailServicesService.emit('convocation-send', {
            convocation: convocationData,
          });

          // send notification to members
          // this.notificationServicesService.emit('convocation_created', {
          //   convocation: convocationData,
          // });
        }
      });
    }
  }

  async findAll(): Promise<ConvocationsEntity[]> {
    const convocations = await this.databaseService.convocations.findMany({
      where: { deleted: false },
      include: {
        evenement: true,
        convocation_membres: {
          include: {
            membre: true,
          },
        },
        reponse_convocations: true,
      },
    });
    return convocations.map(
      (convocation) => new ConvocationsEntity(convocation),
    );
  }

  async findOne(id: number): Promise<ConvocationsEntity> {
    const convocation = await this.databaseService.convocations.findUnique({
      where: { id: id, deleted: false },
      include: {
        evenement: true,
        convocation_membres: {
          include: {
            membre: true,
          },
        },
        reponse_convocations: true,
      },
    });
    if (!convocation) {
      throw new Error(`Convocation with id ${id} not found`);
    }
    return new ConvocationsEntity(convocation);
  }

  async findBySlug(slug: string): Promise<ConvocationsEntity> {
    const convocation = await this.databaseService.convocations.findUnique({
      where: { slug: slug, deleted: false },
      include: {
        evenement: true,
        convocation_membres: {
          include: {
            membre: true,
          },
        },
        reponse_convocations: true,
      },
    });
    if (!convocation) {
      throw new Error(`Convocation with slug ${slug} not found`);
    }
    return new ConvocationsEntity(convocation);
  }

  async findAllByPage(
    filter: FiltersDto,
    evenement_id?: number,
    user_id?: number,
  ): Promise<DataResponse> {
    const { take, page, skip, keyword } = formatPage(
      filter.take,
      filter.page,
      filter.keyword,
    );

    // Define the where condition for the search
    const whereCondition: Prisma.ConvocationsWhereInput = {
      deleted: false,
      OR: searchConvocations(keyword),
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

      whereCondition.evenement = {
        organisation_id: organisation.id,
        deleted: false,
      };
    }

    if (evenement_id) {
      whereCondition.evenement_id = evenement_id;
    }

    const [convocations, total] = await Promise.all([
      this.databaseService.convocations.findMany({
        where: whereCondition,
        skip,
        take,
        include: includeConvocations,
      }),
      this.databaseService.convocations.count({ where: whereCondition }),
    ]);

    const datas = convocations.map(
      (convocation) => new ConvocationsEntity(convocation),
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

  async createConvocWithUniqueCode() {
    while (true) {
      const code = generateUniqueCode(10);
      const exists = await this.databaseService.convocations.findUnique({
        where: { slug: code },
      });
      if (!exists) return code;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} convocation`;
  }
}
