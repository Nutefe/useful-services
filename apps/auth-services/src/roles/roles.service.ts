import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DatabaseService } from '@app/common';
import { RoleEntity } from './entities/role.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    const { service_id, ...rest } = createRoleDto;

    // Check if the name already exists
    // If it does, throw a ConflictException
    if (
      createRoleDto.name &&
      service_id &&
      (await this.existName(createRoleDto.name, service_id))
    ) {
      throw new ConflictException('Name already exist');
    }

    const role = await this.databaseService.roles.create({
      data: {
        ...rest,
        service: {
          connect: {
            id: BigInt(service_id),
          },
        },
        role_permissions: {
          create: createRoleDto.permissions.map((permission) => ({
            permission: {
              connect: {
                name: permission,
              },
            },
          })),
        },
      },
    });
    return new RoleEntity(role);
  }

  async findAll(): Promise<RoleEntity[]> {
    const roles = await this.databaseService.roles.findMany({
      include: {
        service: true,
      },
    });
    return roles.map((role) => new RoleEntity(role));
  }

  async findOne(id: number): Promise<RoleEntity> {
    const role = await this.databaseService.roles.findUnique({
      where: { id: BigInt(id) },
      include: {
        service: true,
      },
    });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return new RoleEntity(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleEntity> {
    const { service_id, permissions, ...rest } = updateRoleDto;

    // Check if the name already exists
    // If it does, throw a ConflictException
    if (
      updateRoleDto.name &&
      service_id &&
      (await this.existName(updateRoleDto.name, service_id, id))
    ) {
      throw new ConflictException('Name already exist');
    }

    const role_version = await this.databaseService.roles.findUnique({
      where: { id: BigInt(id), deleted: false },
      select: { version: true },
    });
    if (!role_version) {
      throw new NotFoundException('Role not found');
    }
    try {
      const role = await this.databaseService.roles.update({
        where: { id, version: role_version.version },
        data: {
          ...rest,
          service: {
            connect: {
              id: BigInt(service_id),
            },
          },
          role_permissions: {
            create: permissions.map((permission) => ({
              permission: {
                connect: {
                  name: permission,
                },
              },
            })),
          },
          version: { increment: 1 },
        },
      });
      return new RoleEntity(role);
    } catch (error) {
      console.error('Failed to update role: ' + error);
      throw new ConflictException('Faild to update role');
    }
  }

  async existName(
    name: string,
    service_id: number,
    id?: number,
  ): Promise<boolean> {
    // Find the permission by name and is not deleted
    const whereCondition: Prisma.RolesWhereInput = {
      deleted: false,
      name,
      service_id: BigInt(service_id),
    };

    // If the id is provided, exclude it from the search
    if (id) {
      whereCondition.id = { not: id };
    }

    // Check if the role exists
    const service = await this.databaseService.roles.findFirst({
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
    const roleOld = await this.databaseService.roles.findUnique({
      where: { id: BigInt(id), deleted: false },
    });

    if (!roleOld) {
      throw new NotFoundException('Role not found');
    }

    const date = new Date();

    await this.databaseService.roles.update({
      where: { id, version: roleOld.version },
      data: {
        deleted: true,
        name: roleOld.name + '-' + date.getTime(),
        version: { increment: 1 },
      },
    });
  }
}
