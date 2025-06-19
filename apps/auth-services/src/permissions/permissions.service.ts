import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { DatabaseService } from '@app/common';
import { PermissionEntity } from './entities/permission.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionEntity> {
    const { name } = createPermissionDto;

    // Check if the name already exists
    // If it does, throw a ConflictException
    if (name && (await this.existName(name))) {
      throw new ConflictException('Name already exist');
    }

    const permission = await this.databaseService.permissions.create({
      data: createPermissionDto,
    });
    return new PermissionEntity(permission);
  }

  async findAll(): Promise<PermissionEntity[]> {
    const permissions = await this.databaseService.permissions.findMany();
    return permissions.map((permission) => new PermissionEntity(permission));
  }

  async findOne(id: number): Promise<PermissionEntity> {
    const permission = await this.databaseService.permissions.findUnique({
      where: { id: BigInt(id) },
    });
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    return new PermissionEntity(permission);
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionEntity> {
    const { name } = updatePermissionDto;
    // Check if the name already exists
    // If it does, throw a ConflictException
    if (name && (await this.existName(name, id))) {
      throw new ConflictException('Name already exist');
    }

    const permission_version =
      await this.databaseService.permissions.findUnique({
        where: { id: BigInt(id), deleted: false },
        select: { version: true },
      });

    if (!permission_version) {
      throw new NotFoundException('Profil not found');
    }

    try {
      const permission = await this.databaseService.permissions.update({
        where: { id, version: permission_version.version },
        data: { ...updatePermissionDto, version: { increment: 1 } },
      });

      return new PermissionEntity(permission);
    } catch (error) {
      console.error('Faild to update permission ' + error);
      throw new ConflictException('Faild to update permission');
    }
  }

  async existName(name: string, id?: number): Promise<boolean> {
    // Find the permission by name and is not deleted
    const whereCondition: Prisma.PermissionsWhereInput = {
      deleted: false,
      name,
    };

    // If the id is provided, exclude it from the search
    if (id) {
      whereCondition.id = { not: id };
    }

    // Check if the role exists
    const permission = await this.databaseService.permissions.findFirst({
      where: whereCondition,
    });

    // If the permission exists, return true
    // If the permission does not exist, return false
    if (permission) {
      return true;
    } else {
      return false;
    }
  }

  async remove(id: number): Promise<void> {
    const permissionOld = await this.databaseService.permissions.findUnique({
      where: { id: BigInt(id), deleted: false },
    });

    if (!permissionOld) {
      throw new NotFoundException('Permission not found');
    }

    const date = new Date();

    await this.databaseService.permissions.update({
      where: { id, version: permissionOld.version },
      data: {
        deleted: true,
        name: permissionOld.name + '-' + date.getTime(),
        version: { increment: 1 },
      },
    });
  }
}
