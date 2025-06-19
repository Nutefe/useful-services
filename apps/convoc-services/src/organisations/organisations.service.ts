import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import {
  DatabaseService,
  DataResponse,
  FileResponseDto,
  FilesCreateGlobalDto,
  FiltersDto,
  formatPage,
  JwtPayload,
  TypeDataDto,
} from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { OrganisationsEntity } from './entities/organisation.entity';
import { Prisma } from '@prisma/client';
import { searchOrganisation } from './entities/organisation.utils';

@Injectable()
export class OrganisationsService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(process.env.FILE_SERVICE ?? 'file-service')
    private readonly fileServicesService: ClientProxy,
  ) {}

  async create(
    createOrganisationDto: CreateOrganisationDto,
    file: Express.Multer.File,
    user: JwtPayload,
    jwt: string,
  ): Promise<OrganisationsEntity> {
    // Check if the name already exists
    if (
      createOrganisationDto.nom &&
      (await this.existName(createOrganisationDto.nom))
    ) {
      throw new ConflictException('Name already exist');
    }

    const type_file: TypeDataDto = {
      libelle: 'logo',
      service_name: user.curent_service_name ?? 'convoc-service',
    };

    const filesDto = new FilesCreateGlobalDto();
    filesDto.user_id = Number(user.id);
    filesDto.filename = file.filename;
    filesDto.origine_name = file.originalname;
    filesDto.path = `/home/upload/cyberethik-service/${file.filename}`;
    filesDto.file_dir = `/home/upload/cyberethik-service/`;
    filesDto.mimetype = file.mimetype;
    filesDto.type_file = type_file;

    const files: FilesCreateGlobalDto[] = [filesDto];

    const res: FileResponseDto[] = await lastValueFrom(
      this.fileServicesService.send('create-file', { files, jwt }),
    );

    const organisation = await this.databaseService.organisations.create({
      data: {
        ...createOrganisationDto,
        equipe_max: createOrganisationDto.equipeMax
          ? Number(createOrganisationDto.equipeMax)
          : undefined,
        evenement_actifs: createOrganisationDto.evenementActifs
          ? Number(createOrganisationDto.evenementActifs)
          : undefined,
        membre_equipe_actifs: createOrganisationDto.membreEquipeActifs
          ? Number(createOrganisationDto.membreEquipeActifs)
          : undefined,
        membre_event_max: createOrganisationDto.membreEventMax
          ? Number(createOrganisationDto.membreEventMax)
          : undefined,
        membre_actifs: createOrganisationDto.membreActifs
          ? Number(createOrganisationDto.membreActifs)
          : undefined,
        convoc_max: createOrganisationDto.convocMax
          ? Number(createOrganisationDto.convocMax)
          : undefined,
        logo: res[0].uri,
      },
    });

    return new OrganisationsEntity(organisation);
  }

  async addUserToOrganisation(users: number[], organisation_id: number) {
    const organisation = await this.databaseService.organisations.findUnique({
      where: { id: BigInt(organisation_id), deleted: false },
    });
    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }
    const userOrganisations = users.map((userId) => ({
      user_id: BigInt(userId),
      organisation_id: BigInt(organisation_id),
    }));

    await this.databaseService.userOrganisations.createMany({
      data: userOrganisations,
      skipDuplicates: true, // Skip duplicates if any
    });
  }

  async findAll(): Promise<OrganisationsEntity[]> {
    const organisations = await this.databaseService.organisations.findMany({
      where: { deleted: false },
      orderBy: { created_at: 'desc' },
    });
    return organisations.map(
      (organisation) => new OrganisationsEntity(organisation),
    );
  }

  async findAllByPage(filter: FiltersDto): Promise<DataResponse> {
    const { take, page, skip, keyword } = formatPage(
      filter.take,
      filter.page,
      filter.keyword,
    );

    // Define the where condition for the search
    const whereCondition: Prisma.OrganisationsWhereInput = {
      deleted: false,
      OR: searchOrganisation(keyword),
    };

    const [organisations, total] = await Promise.all([
      this.databaseService.organisations.findMany({
        where: whereCondition,
        skip,
        take,
      }),
      this.databaseService.organisations.count({ where: whereCondition }),
    ]);

    const datas = organisations.map(
      (organisation) => new OrganisationsEntity(organisation),
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

  async findAllByUserId(userId: number): Promise<OrganisationsEntity[]> {
    const organisations = await this.databaseService.organisations.findMany({
      where: {
        deleted: false,
        user_organisations: {
          some: {
            user_id: BigInt(userId),
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return organisations.map(
      (organisation) => new OrganisationsEntity(organisation),
    );
  }

  async findFirstByUserId(userId: number): Promise<OrganisationsEntity> {
    const organisation = await this.databaseService.organisations.findFirst({
      where: {
        deleted: false,
        user_organisations: {
          some: {
            user_id: BigInt(userId),
          },
        },
      },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found for this user');
    }

    return new OrganisationsEntity(organisation);
  }

  async findOne(id: number): Promise<OrganisationsEntity> {
    const organisation = await this.databaseService.organisations.findUnique({
      where: { id },
    });
    if (!organisation) {
      throw new Error(`Organisation with id ${id} not found`);
    }
    return new OrganisationsEntity(organisation);
  }

  async update(
    id: number,
    updateOrganisationDto: UpdateOrganisationDto,
    file: Express.Multer.File,
    user: JwtPayload,
    jwt: string,
  ) {
    const organisationOld = await this.databaseService.organisations.findUnique(
      {
        where: { id, deleted: false },
      },
    );
    if (!organisationOld) {
      throw new NotFoundException('Organisation not found');
    }
    // Check if the name already exists
    if (
      updateOrganisationDto.nom &&
      (await this.existName(updateOrganisationDto.nom, id))
    ) {
      throw new ConflictException('Name already exist');
    }

    const type_file: TypeDataDto = {
      libelle: 'logo',
      service_name: user.curent_service_name ?? 'convoc-service',
    };

    const filesDto = new FilesCreateGlobalDto();
    filesDto.user_id = Number(user.id);
    filesDto.filename = file.filename;
    filesDto.origine_name = file.originalname;
    filesDto.path = `/home/upload/cyberethik-service/${file.filename}`;
    filesDto.file_dir = `/home/upload/cyberethik-service/`;
    filesDto.mimetype = file.mimetype;
    filesDto.type_file = type_file;

    const files: FilesCreateGlobalDto[] = [filesDto];

    const res: FileResponseDto[] = await lastValueFrom(
      this.fileServicesService.send('create-file', { files, jwt }),
    );

    const organisation = await this.databaseService.organisations.update({
      where: { id },
      data: {
        nom: updateOrganisationDto.nom ?? organisationOld.nom,
        devise: updateOrganisationDto.devise ?? organisationOld.devise,
        desciption:
          updateOrganisationDto.desciption ?? organisationOld.desciption,
        equipe_max: updateOrganisationDto.equipeMax
          ? Number(updateOrganisationDto.equipeMax)
          : organisationOld.equipe_max,
        evenement_actifs: updateOrganisationDto.evenementActifs
          ? Number(updateOrganisationDto.evenementActifs)
          : organisationOld.evenement_actifs,
        membre_equipe_actifs: updateOrganisationDto.membreEquipeActifs
          ? Number(updateOrganisationDto.membreEquipeActifs)
          : organisationOld.membre_equipe_actifs,
        membre_event_max: updateOrganisationDto.membreEventMax
          ? Number(updateOrganisationDto.membreEventMax)
          : organisationOld.membre_event_max,
        membre_actifs: updateOrganisationDto.membreActifs
          ? Number(updateOrganisationDto.membreActifs)
          : organisationOld.membre_actifs,
        convoc_max: updateOrganisationDto.convocMax
          ? Number(updateOrganisationDto.convocMax)
          : organisationOld.convoc_max,
        logo: res[0].uri,
        version: { increment: 1 },
      },
    });

    return new OrganisationsEntity(organisation);
  }

  async existName(name: string, id?: number): Promise<boolean> {
    // Find the permission by name and is not deleted
    const whereCondition: Prisma.OrganisationsWhereInput = {
      deleted: false,
      nom: name,
    };

    // If the id is provided, exclude it from the search
    if (id) {
      whereCondition.id = { not: id };
    }

    // Check if the role exists
    const service = await this.databaseService.organisations.findFirst({
      where: whereCondition,
    });

    // If the permission exists, return true
    // If the permission does not exist, return false
    return !!service;
  }

  async remove(id: number) {
    const organisationOld = await this.databaseService.organisations.findUnique(
      {
        where: { id: BigInt(id), deleted: false },
      },
    );

    if (!organisationOld) {
      throw new NotFoundException('Type file not found');
    }

    const date = new Date();

    await this.databaseService.organisations.update({
      where: { id, version: organisationOld.version },
      data: {
        deleted: true,
        nom: organisationOld.nom + '-' + date.getTime(),
        version: { increment: 1 },
      },
    });
  }
}
