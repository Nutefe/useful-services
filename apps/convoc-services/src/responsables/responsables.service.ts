import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';
import {
  DatabaseService,
  DataResponse,
  FiltersDto,
  formatPage,
} from '@app/common';
import { ResponsablesEntity } from './entities/responsable.entity';
import { Prisma } from '@prisma/client';
import { searchResponsable } from './entities/responsable.utils';
import { OrganisationsService } from '../organisations/organisations.service';

@Injectable()
export class ResponsablesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly organisationService: OrganisationsService,
  ) {}

  async create(
    createResponsableDto: CreateResponsableDto,
  ): Promise<ResponsablesEntity> {
    // Check if the email already exists
    if (
      createResponsableDto.email &&
      createResponsableDto.organisation_id &&
      (await this.existEmail(
        createResponsableDto.email,
        createResponsableDto.organisation_id,
      ))
    ) {
      throw new ConflictException('Email already exists');
    }

    const responsable = await this.databaseService.responsables.create({
      data: {
        ...createResponsableDto,
      },
    });
    return new ResponsablesEntity(responsable);
  }

  async findAll(): Promise<ResponsablesEntity[]> {
    const responsables = await this.databaseService.responsables.findMany({
      where: { deleted: false },
      include: {
        organisation: true,
        membres: true,
      },
    });
    return responsables.map(
      (responsable) => new ResponsablesEntity(responsable),
    );
  }

  async findAllByOrganisationId(
    user_id?: number,
  ): Promise<ResponsablesEntity[]> {
    const organisation = await this.organisationService.findFirstByUserId(
      user_id ?? 0,
    );

    if (!organisation) {
      throw new NotFoundException(
        'Organisation not found for the given user ID',
      );
    }

    const responsables = await this.databaseService.responsables.findMany({
      where: { deleted: false, organisation_id: organisation?.id },
      include: {
        organisation: true,
        membres: true,
      },
    });
    return responsables.map(
      (responsable) => new ResponsablesEntity(responsable),
    );
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
    const whereCondition: Prisma.ResponsablesWhereInput = {
      deleted: false,
      OR: searchResponsable(keyword),
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

    const [responsables, total] = await Promise.all([
      this.databaseService.responsables.findMany({
        where: whereCondition,
        skip,
        take,
      }),
      this.databaseService.responsables.count({ where: whereCondition }),
    ]);

    const datas = responsables.map(
      (organisation) => new ResponsablesEntity(organisation),
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

  async findOne(id: number): Promise<ResponsablesEntity> {
    const responsable = await this.databaseService.responsables.findUnique({
      where: { id: BigInt(id), deleted: false },
      include: {
        organisation: true,
        membres: true,
      },
    });
    if (!responsable) {
      throw new NotFoundException('Responsable not found');
    }
    return new ResponsablesEntity(responsable);
  }

  async update(
    id: number,
    updateResponsableDto: UpdateResponsableDto,
  ): Promise<ResponsablesEntity> {
    const responsableOld = await this.databaseService.responsables.findUnique({
      where: { id: BigInt(id), deleted: false },
    });
    if (!responsableOld) {
      throw new NotFoundException('Responsable not found');
    }

    // Check if the email already exists
    if (
      updateResponsableDto.email &&
      updateResponsableDto.organisation_id &&
      (await this.existEmail(
        updateResponsableDto.email,
        updateResponsableDto.organisation_id,
        id,
      ))
    ) {
      throw new ConflictException('Email already exists');
    }

    const responsable = await this.databaseService.responsables.update({
      where: { id: id },
      data: {
        libelle: updateResponsableDto.libelle ?? responsableOld.libelle,
        email: updateResponsableDto.email ?? responsableOld.email,
        telephone: updateResponsableDto.telephone ?? responsableOld.telephone,
        adresse: updateResponsableDto.adresse ?? responsableOld.adresse,
        version: {
          increment: 1,
        },
      },
    });
    return new ResponsablesEntity(responsable);
  }

  async existEmail(
    email: string,
    organisation_id: number,
    id?: number,
  ): Promise<boolean> {
    // Find the permission by name and is not deleted
    const whereCondition: Prisma.ResponsablesWhereInput = {
      deleted: false,
      email: email,
      organisation_id: organisation_id,
    };

    // If the id is provided, exclude it from the search
    if (id) {
      whereCondition.id = { not: id };
    }

    // Check if the role exists
    const responsable = await this.databaseService.responsables.findFirst({
      where: whereCondition,
    });

    return !!responsable;
  }

  async remove(id: number) {
    const responsableOld = await this.databaseService.responsables.findUnique({
      where: { id: BigInt(id), deleted: false },
    });

    if (!responsableOld) {
      throw new NotFoundException('Type file not found');
    }

    const date = new Date();

    await this.databaseService.responsables.update({
      where: { id, version: responsableOld.version },
      data: {
        deleted: true,
        email: date.getTime() + '-' + responsableOld.email,
        version: { increment: 1 },
      },
    });
  }
}
