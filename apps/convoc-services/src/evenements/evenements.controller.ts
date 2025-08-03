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
  ValidationPipe,
} from '@nestjs/common';
import { EvenementsService } from './evenements.service';
import { CreateEvenementDto } from './dto/create-evenement.dto';
import { UpdateEvenementDto } from './dto/update-evenement.dto';
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
import { EvenementsEntity } from './entities/evenement.entity';

@Controller('api/convoc/service/v1')
@ApiTags('Evenements endpoint')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAutGuard, RolesGuard, PermissionsGuard, ServicesGuard)
@HasServices(ServiceEnum.SERVICE_AUTH, ServiceEnum.SERVICE_CONVOC)
export class EvenementsController {
  constructor(private readonly evenementsService: EvenementsService) {}

  @Post('evenement/save')
  @ApiCreatedResponse({
    description: 'The event have been successfully created.',
    type: EvenementsEntity,
  })
  @ApiOperation({
    summary: 'Create a new event',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.CREATE)
  create(
    @Body() createEvenementDto: CreateEvenementDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.evenementsService.create(createEvenementDto, user.id);
  }

  @Get('evenements')
  @ApiOkResponse({
    description: 'The events are been successfully selected.',
    type: EvenementsEntity,
  })
  @ApiOperation({
    summary: 'Select all events',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAll() {
    return this.evenementsService.findAll();
  }

  @Get('evenements/equipe/:id')
  @ApiOkResponse({
    description: 'The events for team are been successfully selected.',
    type: EvenementsEntity,
  })
  @ApiOperation({
    summary: 'Select all events for team',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAllByEquipe(@Param('id') id: number) {
    return this.evenementsService.findAllByEquipeId(id);
  }

  @Get('evenements/membre/:id')
  @ApiOkResponse({
    description: 'The events are been successfully selected.',
    type: EvenementsEntity,
  })
  @ApiOperation({
    summary: 'Select all events',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAllByMembre(@Param('id') id: number) {
    return this.evenementsService.findAllByMembreId(id);
  }

  @Get('evenements/organisation')
  @ApiOkResponse({
    description: 'The events are been successfully selected.',
    type: EvenementsEntity,
  })
  @ApiOperation({
    summary: 'Select all events',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAllByOrganisation(@CurrentUser() user: JwtPayload) {
    return this.evenementsService.findAllByOrganisationId(Number(user.id));
  }

  @Get('evenements/page')
  @ApiOkResponse({
    description: 'The evnts are been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter evnts by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeyword(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
  ): Promise<DataResponse> {
    return this.evenementsService.findAllByPage(query);
  }

  @Get('evenements/organisation/page')
  @ApiOkResponse({
    description: 'The evnts  of organisation are been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter evnts of organisation by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeywordAndOrganisation(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<DataResponse> {
    return this.evenementsService.findAllByPage(query, undefined, user?.id);
  }

  @Get('evenements/equipe/page/:id')
  @ApiOkResponse({
    description: 'The evnts  of team are been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter evnts of team by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeywordAndEquipe(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
    @Param('id') id: number,
  ): Promise<DataResponse> {
    return this.evenementsService.findAllByPage(query, id);
  }

  @Get('evenement/:id')
  @ApiOkResponse({
    description: 'The event have been successfully selected.',
    type: EvenementsEntity,
  })
  @ApiOperation({
    summary: 'Select an events',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findOne(@Param('id') id: number) {
    return this.evenementsService.findOne(id);
  }

  @Get('evenement/suivi/:id')
  @ApiOkResponse({
    description: 'The event have been successfully selected.',
    type: EvenementsEntity,
  })
  @ApiOperation({
    summary: 'Select an events',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  status(@Param('id') id: number) {
    return this.evenementsService.costumeEtatEvenement(id);
  }

  @Get('status/evenement/encours')
  @ApiOkResponse({
    description: 'The evnts status have been successfully select.',
    type: Number,
  })
  @ApiOperation({
    summary: 'Select evnts status have',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  countEventEncours(@CurrentUser() user: JwtPayload): Promise<number> {
    return this.evenementsService.countEvenementEncours(user?.id);
  }

  @Put('evenement/update/:id')
  @ApiCreatedResponse({
    description: 'The event have been successfully updated.',
    type: EvenementsEntity,
  })
  @ApiOperation({
    summary: 'Update an event',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.UPDATE)
  update(
    @Param('id') id: number,
    @Body() updateEvenementDto: UpdateEvenementDto,
  ) {
    return this.evenementsService.update(id, updateEvenementDto);
  }

  @Delete('evenement/delete/:id')
  @ApiResponse({
    description: 'The event have been successfully deleted.',
  })
  @ApiOperation({
    summary: 'Delete an event',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.DELETE)
  remove(@Param('id') id: number) {
    return this.evenementsService.remove(id);
  }
}
