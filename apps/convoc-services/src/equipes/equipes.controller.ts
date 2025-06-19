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
import { EquipesService } from './equipes.service';
import { CreateEquipeDto } from './dto/create-equipe.dto';
import { UpdateEquipeDto } from './dto/update-equipe.dto';
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
  IdsDto,
  JwtAutGuard,
  JwtPayload,
  PermissionEnum,
  PermissionsGuard,
  RoleEnum,
  RolesGuard,
  ServiceEnum,
  ServicesGuard,
} from '@app/common';
import { EquipesEntity } from './entities/equipe.entity';

@Controller('api/convoc/service/v1')
@ApiTags('Equipes endpoint')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAutGuard, RolesGuard, PermissionsGuard, ServicesGuard)
@HasServices(ServiceEnum.SERVICE_AUTH, ServiceEnum.SERVICE_CONVOC)
export class EquipesController {
  constructor(private readonly equipesService: EquipesService) {}

  @Post('equipe/save')
  @ApiCreatedResponse({
    description: 'The team have been successfully created.',
    type: EquipesEntity,
  })
  @ApiOperation({
    summary: 'Create a new team',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.CREATE)
  create(@Body() createEquipeDto: CreateEquipeDto) {
    return this.equipesService.create(createEquipeDto);
  }

  @Get('equipes')
  @ApiOkResponse({
    description: 'The team have been successfully selected.',
    type: EquipesEntity,
  })
  @ApiOperation({
    summary: 'Select all team',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAll() {
    return this.equipesService.findAll();
  }

  @Get('equipes/membre/actif/not/:id')
  @ApiOkResponse({
    description: 'The teams have been successfully selected.',
    type: EquipesEntity,
  })
  @ApiOperation({
    summary: 'Select all teams exclude current member team',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findExcludeMembresEquipe(@Param('id') id: number) {
    return this.equipesService.findAllByOrganisationExcludeMembreEquipe(id);
  }

  @Get('equipes/evenement/:id')
  @ApiOkResponse({
    description: 'The teams have been successfully selected.',
    type: EquipesEntity,
  })
  @ApiOperation({
    summary: 'Select all teams by event id',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByEvenement(@Param('id') id: number) {
    return this.equipesService.findAllByEvenementId(id);
  }

  @Get('equipes/organisation')
  @ApiOkResponse({
    description: 'The organisation equipe have been successfully select.',
    type: EquipesEntity,
  })
  @ApiOperation({
    summary: 'Select all organisation equipe',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAllByOrganistion(@CurrentUser() user: JwtPayload) {
    return this.equipesService.findAllByOrganisationId(user?.id);
  }

  @Get('equipes/page')
  @ApiOkResponse({
    description: 'The equipes have been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter equipes by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeyword(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
  ): Promise<DataResponse> {
    return this.equipesService.findAllByPage(query);
  }

  @Get('equipes/organisation/page')
  @ApiOkResponse({
    description: 'The organisation equipe has been successfully selected.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter organisation equipe by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeywordAndOrganisation(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<DataResponse> {
    return this.equipesService.findAllByPage(query, user?.id);
  }

  @Get('equipe/:id')
  @ApiOkResponse({
    description: 'The team have been successfully selected.',
    type: EquipesEntity,
  })
  @ApiOperation({
    summary: 'Select one team',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findOne(@Param('id') id: number) {
    return this.equipesService.findOne(id);
  }

  @Put('equipe/update/:id')
  @ApiCreatedResponse({
    description: 'The team have been successfully updated.',
    type: EquipesEntity,
  })
  @ApiOperation({
    summary: 'Update an team',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.UPDATE)
  update(@Param('id') id: number, @Body() updateEquipeDto: UpdateEquipeDto) {
    return this.equipesService.update(id, updateEquipeDto);
  }

  @Put('equipe/add/membre/:id')
  @ApiCreatedResponse({
    description: 'The membres are been successfully add in team.',
    type: EquipesEntity,
  })
  @ApiOperation({
    summary: 'Add member in team',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.UPDATE)
  addMembre(@Param('id') id: number, @Body() idsDto: IdsDto) {
    return this.equipesService.addMembreEquipe(id, idsDto);
  }

  @Delete('equipe/delete/:id')
  @ApiResponse({
    description: 'The team have been successfully deleted.',
  })
  @ApiOperation({
    summary: 'Delete an team',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.DELETE)
  remove(@Param('id') id: number) {
    return this.equipesService.remove(id);
  }

  @Delete('equipes/membre/delete/:id')
  @ApiResponse({
    description: 'The member in team have been successfully deleted.',
  })
  @ApiOperation({
    summary: 'Delete an member in team',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.DELETE)
  removeMember(@Param('id') id: number, @Body() idsDto: IdsDto) {
    return this.equipesService.removeMembreInEqueipe(id, idsDto);
  }
}
