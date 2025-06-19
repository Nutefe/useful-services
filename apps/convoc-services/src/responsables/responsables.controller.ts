import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ResponsablesService } from './responsables.service';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CurrentUser,
  DataResponse,
  FiltersDto,
  HasPermissions,
  HasRoles,
  HasServices,
  JwtAutGuard,
  JwtPayload,
  PermissionEnum,
  PermissionsGuard,
  RoleEnum,
  RolesGuard,
  ServiceEnum,
  ServicesGuard,
} from '@app/common';
import { ResponsablesEntity } from './entities/responsable.entity';

@Controller('api/convoc/service/v1')
@ApiTags('Responsables endpoint')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAutGuard, RolesGuard, PermissionsGuard, ServicesGuard)
@HasServices(ServiceEnum.SERVICE_AUTH, ServiceEnum.SERVICE_CONVOC)
export class ResponsablesController {
  constructor(private readonly responsablesService: ResponsablesService) {}

  @Post('responsable')
  @ApiCreatedResponse({
    description: 'The accountable have been successfully created.',
    type: ResponsablesEntity,
  })
  @ApiOperation({
    summary: 'Create a new responsable',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.CREATE)
  create(@Body() createResponsableDto: CreateResponsableDto) {
    return this.responsablesService.create(createResponsableDto);
  }

  @Get('responsables')
  @ApiOkResponse({
    description: 'The accountables have been successfully select.',
    type: ResponsablesEntity,
  })
  @ApiOperation({
    summary: 'Select all accountables',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAll() {
    return this.responsablesService.findAll();
  }

  @Get('responsables/organistion')
  @ApiOkResponse({
    description: 'The organisation accountable have been successfully select.',
    type: ResponsablesEntity,
  })
  @ApiOperation({
    summary: 'Select all organisation accountable',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAllByOrganistion(@CurrentUser() user: JwtPayload) {
    return this.responsablesService.findAllByOrganisationId(user?.id);
  }

  @Get('responsables/page')
  @ApiOkResponse({
    description: 'The accountable have been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter accountables by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeyword(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
  ): Promise<DataResponse> {
    return this.responsablesService.findAllByPage(query);
  }

  @Get('responsables/organisation/page')
  @ApiOkResponse({
    description: 'The organisation accountable has been successfully selected.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter organisation accountable by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeywordAndOrganisation(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<DataResponse> {
    return this.responsablesService.findAllByPage(query, user?.id);
  }

  @Get('responsable/:id')
  @ApiOkResponse({
    description: 'The accountable has been successfully selected.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Select one accountable',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findOne(@Param('id') id: number) {
    return this.responsablesService.findOne(id);
  }

  @Put('responsable/:id')
  @ApiCreatedResponse({
    description: 'The accountable has been successfully updated.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Update an accountable',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.UPDATE)
  update(
    @Param('id') id: number,
    @Body() updateResponsableDto: UpdateResponsableDto,
  ) {
    return this.responsablesService.update(id, updateResponsableDto);
  }

  @Delete('responsable/:id')
  @ApiResponse({
    description: 'The accountable has been successfully deleted.',
  })
  @ApiOperation({
    summary: 'Delete an accountable',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.DELETE)
  remove(@Param('id') id: number) {
    return this.responsablesService.remove(id);
  }
}
