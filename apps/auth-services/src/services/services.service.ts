import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { DatabaseService } from '@app/common';
import { ServiceEntity } from './entities/service.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createServiceDto: CreateServiceDto): Promise<ServiceEntity> {
    const { name } = createServiceDto;

    // Check if the name already exists
    // If it does, throw a ConflictException
    if (name && (await this.existName(name))) {
      throw new ConflictException('Name already exist');
    }

    const service = await this.databaseService.services.create({
      data: createServiceDto,
    });
    return new ServiceEntity(service);
  }

  async findAll(): Promise<ServiceEntity[]> {
    const services = await this.databaseService.services.findMany();
    return services.map((service) => new ServiceEntity(service));
  }

  async findOne(id: number): Promise<ServiceEntity> {
    const service = await this.databaseService.services.findUnique({
      where: { id: BigInt(id) },
    });
    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return new ServiceEntity(service);
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceEntity> {
    const { name } = updateServiceDto;

    // Check if the name already exists
    // If it does, throw a ConflictException
    if (name && (await this.existName(name, id))) {
      throw new ConflictException('Name already exist');
    }

    const service_version = await this.databaseService.services.findUnique({
      where: { id: BigInt(id), deleted: false },
      select: { version: true },
    });

    if (!service_version) {
      throw new NotFoundException('Service not found');
    }

    try {
      const service = await this.databaseService.services.update({
        where: { id, version: service_version.version },
        data: { ...updateServiceDto, version: { increment: 1 } },
      });

      return new ServiceEntity(service);
    } catch (error) {
      console.error('Faild to update service ' + error);
      throw new ConflictException('Faild to update service');
    }
  }

  async existName(name: string, id?: number): Promise<boolean> {
    // Find the permission by name and is not deleted
    const whereCondition: Prisma.ServicesWhereInput = {
      deleted: false,
      name,
    };

    // If the id is provided, exclude it from the search
    if (id) {
      whereCondition.id = { not: id };
    }

    // Check if the role exists
    const service = await this.databaseService.services.findFirst({
      where: whereCondition,
    });

    // If the permission exists, return true
    // If the permission does not exist, return false
    if (service) {
      return true;
    } else {
      return false;
    }
  }

  async remove(id: number): Promise<void> {
    const serviceOld = await this.databaseService.services.findUnique({
      where: { id: BigInt(id), deleted: false },
    });

    if (!serviceOld) {
      throw new NotFoundException('Service not found');
    }

    const date = new Date();

    await this.databaseService.services.update({
      where: { id, version: serviceOld.version },
      data: {
        deleted: true,
        name: serviceOld.name + '-' + date.getTime(),
        version: { increment: 1 },
      },
    });
  }
}
