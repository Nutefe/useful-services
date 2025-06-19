import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TypeFilesService } from './type-files.service';
import { CreateTypeFileDto } from './dto/create-type-file.dto';
import { UpdateTypeFileDto } from './dto/update-type-file.dto';
import { TypeFilesEntity } from './entities/type-file.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  HasPermissions,
  HasRoles,
  HasServices,
  JwtAutGuard,
  PermissionEnum,
  PermissionsGuard,
  RoleEnum,
  RolesGuard,
  ServiceEnum,
  ServicesGuard,
} from '@app/common';

@Controller('api/files/service/v1')
@ApiTags('Type files endpoint')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAutGuard, RolesGuard, PermissionsGuard, ServicesGuard)
@HasServices(ServiceEnum.SERVICE_AUTH, ServiceEnum.SERVICE_FILES)
export class TypeFilesController {
  constructor(private readonly typeFilesService: TypeFilesService) {}

  @Post('type')
  @ApiCreatedResponse({ type: TypeFilesEntity })
  @ApiOperation({ summary: 'Create type file' })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.CREATE)
  async create(
    @Body() createTypeFileDto: CreateTypeFileDto,
  ): Promise<TypeFilesEntity> {
    return this.typeFilesService.create(createTypeFileDto);
  }

  @Get('types')
  @ApiOkResponse({ type: TypeFilesEntity })
  @ApiOperation({ summary: 'Select type file' })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  async findAll(): Promise<TypeFilesEntity[]> {
    return this.typeFilesService.findAll();
  }

  @Get('type/:id')
  @ApiOkResponse({ type: TypeFilesEntity })
  @ApiOperation({ summary: 'Select type file' })
  @HasPermissions(PermissionEnum.READ)
  async findOne(@Param('id') id: number): Promise<TypeFilesEntity> {
    return this.typeFilesService.findOne(id);
  }

  @Get('type/service')
  @ApiOkResponse({ type: TypeFilesEntity })
  @ApiOperation({ summary: 'Select type file' })
  @HasPermissions(PermissionEnum.READ)
  async findByServiceName(
    @Query('service_name') service_name: string,
  ): Promise<TypeFilesEntity[]> {
    return this.typeFilesService.findAllByServiceName(service_name);
  }

  @Put('type/:id')
  @ApiCreatedResponse({ type: TypeFilesEntity })
  @ApiOperation({ summary: 'Update type file' })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.UPDATE)
  async update(
    @Param('id') id: number,
    @Body() updateTypeFileDto: UpdateTypeFileDto,
  ): Promise<TypeFilesEntity> {
    return this.typeFilesService.update(id, updateTypeFileDto);
  }

  @Delete('type/:id')
  @ApiResponse({ description: 'The file type has been successfully deleted.' })
  @ApiOperation({ summary: 'Delete type file' })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.DELETE)
  remove(@Param('id') id: number) {
    return this.typeFilesService.remove(id);
  }
}
