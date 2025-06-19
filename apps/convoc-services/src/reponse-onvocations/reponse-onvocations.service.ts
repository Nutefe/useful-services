import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReponseOnvocationDto } from './dto/create-reponse-onvocation.dto';
import { UpdateReponseOnvocationDto } from './dto/update-reponse-onvocation.dto';
import {
  DatabaseService,
  DataResponse,
  FiltersDto,
  formatPage,
} from '@app/common';
import { ReponseConvocationsEntity } from './entities/reponse-onvocation.entity';
import { OrganisationsService } from '../organisations/organisations.service';
import { ConvocationsService } from '../convocations/convocations.service';
import { Prisma } from '@prisma/client';
import {
  includeReponseConvocations,
  searchReponseConvocations,
} from './entities/reponse-convocation.utils';

@Injectable()
export class ReponseOnvocationsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly organisationService: OrganisationsService,
    private readonly convocationsService: ConvocationsService,
  ) {}

  async create(
    createReponseOnvocationDto: CreateReponseOnvocationDto,
  ): Promise<ReponseConvocationsEntity> {
    // check if convocation exists
    const convocation = await this.convocationsService.findBySlug(
      createReponseOnvocationDto?.slug ?? '',
    );

    if (!convocation) {
      throw new NotFoundException('Convocation not found');
    }

    // check if convocation is already responded
    const existingResponse =
      await this.databaseService.reponseConvocations.findFirst({
        where: {
          convocation: {
            id: convocation.id,
          },
        },
      });
    if (existingResponse) {
      throw new NotFoundException(
        'A response for this convocation and alert already exists',
      );
    }

    const createdReponseOnvocation =
      await this.databaseService.reponseConvocations.create({
        data: {
          alerte: createReponseOnvocationDto.alerte,
          choix: createReponseOnvocationDto.choix,
          description: createReponseOnvocationDto.description,
          date_envoi: createReponseOnvocationDto.dateEnvoi
            ? new Date(createReponseOnvocationDto.dateEnvoi)
            : null,
          convocation: {
            connect: {
              id: convocation.id,
            },
          },
        },
      });
    return new ReponseConvocationsEntity(createdReponseOnvocation);
  }

  async findAll(): Promise<ReponseConvocationsEntity[]> {
    const reponseOnvocations =
      await this.databaseService.reponseConvocations.findMany({
        include: {
          convocation: true,
        },
      });
    return reponseOnvocations.map(
      (reponseOnvocation) => new ReponseConvocationsEntity(reponseOnvocation),
    );
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
    const whereCondition: Prisma.ReponseConvocationsWhereInput = {
      deleted: false,
      OR: searchReponseConvocations(keyword),
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

      whereCondition.convocation = {
        evenement: {
          organisation_id: organisation.id,
        },
      };
    }

    if (evenement_id) {
      whereCondition.convocation = {
        evenement: {
          id: evenement_id,
        },
      };
    }

    const [reponse_convocations, total] = await Promise.all([
      this.databaseService.reponseConvocations.findMany({
        where: whereCondition,
        skip,
        take,
        include: includeReponseConvocations,
      }),
      this.databaseService.reponseConvocations.count({ where: whereCondition }),
    ]);

    const datas = reponse_convocations.map(
      (convocation) => new ReponseConvocationsEntity(convocation),
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

  async findOne(id: number): Promise<ReponseConvocationsEntity> {
    const reponseOnvocation =
      await this.databaseService.reponseConvocations.findUnique({
        where: { id, deleted: false },
        include: {
          convocation: true,
        },
      });
    if (!reponseOnvocation) {
      throw new NotFoundException(`ReponseOnvocation with id ${id} not found`);
    }
    return new ReponseConvocationsEntity(reponseOnvocation);
  }

  async update(
    id: number,
    updateReponseOnvocationDto: UpdateReponseOnvocationDto,
  ): Promise<ReponseConvocationsEntity> {
    // check if convocation exists
    const convocation = await this.convocationsService.findBySlug(
      updateReponseOnvocationDto?.slug ?? '',
    );

    if (!convocation) {
      throw new NotFoundException('Convocation not found');
    }

    const reponseOnvocation =
      await this.databaseService.reponseConvocations.update({
        where: { id, deleted: false },
        data: {
          alerte: updateReponseOnvocationDto.alerte,
          choix: updateReponseOnvocationDto.choix,
          description: updateReponseOnvocationDto.description,
          date_envoi: updateReponseOnvocationDto.dateEnvoi
            ? new Date(updateReponseOnvocationDto.dateEnvoi)
            : null,
          convocation: {
            connect: {
              id: convocation.id,
            },
          },
        },
        include: {
          convocation: true,
        },
      });

    return new ReponseConvocationsEntity(reponseOnvocation);
  }

  async reponseEncours(user_id: number): Promise<number> {
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );

    if (!organisation) {
      throw new NotFoundException(
        'Organisation not found for the given user ID',
      );
    }

    const count = await this.databaseService.reponseConvocations.count({
      where: {
        deleted: false,
        convocation: {
          evenement: {
            organisation_id: organisation.id,
          },
        },
        choix: 'Oui, sera présent(e)',
        date_envoi: {
          gte: new Date(),
        },
      },
    });

    return count;
  }

  remove(id: number) {
    return `This action removes a #${id} reponseOnvocation`;
  }
}
