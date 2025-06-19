import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTypeFileDto } from './dto/create-type-file.dto';
import { UpdateTypeFileDto } from './dto/update-type-file.dto';
import { DatabaseService } from '@app/common';
import { TypeFilesEntity } from './entities/type-file.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class TypeFilesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createTypeFileDto: CreateTypeFileDto): Promise<TypeFilesEntity> {
    // Check if the libelle already exists for the given service
    if (
      createTypeFileDto.libelle &&
      createTypeFileDto.service_id &&
      (await this.libelleExist(
        createTypeFileDto.libelle,
        createTypeFileDto.service_id,
      ))
    ) {
      throw new Error('Libelle already exists for this service');
    }

    const type_file = await this.databaseService.typeFiles.create({
      data: {
        libelle: createTypeFileDto.libelle ?? '',
        service: {
          connect: {
            id: createTypeFileDto.service_id,
          },
        },
      },
    });

    return new TypeFilesEntity(type_file);
  }

  async findAll(): Promise<TypeFilesEntity[]> {
    const typeFiles = await this.databaseService.typeFiles.findMany({
      where: {
        deleted: false,
      },
      include: {
        service: true,
      },
    });
    return typeFiles.map((typeFile) => new TypeFilesEntity(typeFile));
  }

  async findAllByServiceName(service_name: string): Promise<TypeFilesEntity[]> {
    const typeFiles = await this.databaseService.typeFiles.findMany({
      where: {
        deleted: false,
        service: {
          name: service_name,
        },
      },
      include: {
        service: true,
      },
    });
    return typeFiles.map((typeFile) => new TypeFilesEntity(typeFile));
  }

  async findOne(id: number): Promise<TypeFilesEntity> {
    const typeFile = await this.databaseService.typeFiles.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        service: true,
      },
    });
    if (!typeFile) {
      throw new Error(`TypeFile with id ${id} not found`);
    }
    return new TypeFilesEntity(typeFile);
  }

  async update(
    id: number,
    updateTypeFileDto: UpdateTypeFileDto,
  ): Promise<TypeFilesEntity> {
    const typeFileOld = await this.databaseService.typeFiles.findUnique({
      where: { id: BigInt(id), deleted: false },
    });
    if (!typeFileOld) {
      throw new NotFoundException('Type file not found');
    }
    // Check if the libelle already exists for the given service
    if (
      updateTypeFileDto.libelle &&
      updateTypeFileDto.service_id &&
      (await this.libelleExist(
        updateTypeFileDto.libelle,
        updateTypeFileDto.service_id,
        id,
      ))
    ) {
      throw new Error('Libelle already exists for this service');
    }

    const typeFile = await this.databaseService.typeFiles.update({
      where: {
        id: BigInt(id),
      },
      data: {
        libelle: updateTypeFileDto.libelle ?? typeFileOld.libelle,
        service: {
          connect: {
            id: updateTypeFileDto.service_id,
          },
        },
        version: { increment: 1 },
      },
      include: {
        service: true,
      },
    });

    return new TypeFilesEntity(typeFile);
  }

  async remove(id: number) {
    const typeOld = await this.databaseService.typeFiles.findUnique({
      where: { id: BigInt(id), deleted: false },
    });

    if (!typeOld) {
      throw new NotFoundException('Type file not found');
    }

    const date = new Date();

    await this.databaseService.typeFiles.update({
      where: { id, version: typeOld.version },
      data: {
        deleted: true,
        libelle: typeOld.libelle + '-' + date.getTime(),
        version: { increment: 1 },
      },
    });
  }

  async libelleExist(
    libelle: string,
    service_id: bigint,
    id?: number,
  ): Promise<boolean> {
    // Find the type file by libelle and is not deleted
    const whereCondition: Prisma.TypeFilesWhereInput = {
      deleted: false,
      libelle,
      service: {
        id: service_id,
      },
    };

    // If the id is provided, exclude it from the search
    if (id) {
      whereCondition.id = { not: BigInt(id) };
    }

    // Check if the type file exists
    const typeFile = await this.databaseService.typeFiles.findFirst({
      where: whereCondition,
    });

    // If the type file exists, return true
    // If the type file does not exist, return false
    return !!typeFile;
  }
}
