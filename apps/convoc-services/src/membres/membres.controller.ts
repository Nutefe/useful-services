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
import { MembresService } from './membres.service';
import { CreateMembreDto } from './dto/create-membre.dto';
import { UpdateMembreDto } from './dto/update-membre.dto';
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
import { MembresEntity } from './entities/membre.entity';

@Controller('api/convoc/service/v1')
@ApiTags('Membres endpoint')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAutGuard, RolesGuard, PermissionsGuard, ServicesGuard)
@HasServices(ServiceEnum.SERVICE_AUTH, ServiceEnum.SERVICE_CONVOC)
export class MembresController {
  constructor(private readonly membresService: MembresService) {}

  @Post('membre/save')
  @ApiCreatedResponse({
    description: 'The member have been successfully created.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Create a new member',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.CREATE)
  create(
    @Body() createMembreDto: CreateMembreDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.membresService.create(createMembreDto, Number(user.id));
  }

  @Get('membres')
  @ApiOkResponse({
    description: 'The member have been successfully selected.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Select a member',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAll() {
    return this.membresService.findAll();
  }

  @Get('membres/evenement/:id')
  @ApiOkResponse({
    description: 'The members of event are been successfully selected.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Select a members of event',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByEvenement(@Param('id') id: number) {
    return this.membresService.findAllByEvenementId(id);
  }

  @Get('membres/equipe/:id')
  @ApiOkResponse({
    description: 'The members of team are been successfully selected.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Select a members of team',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByEquipe(@Param('id') id: number) {
    return this.membresService.findAllByEquipeId(id);
  }

  @Get('membres/equipe/actif/:id')
  @ApiOkResponse({
    description: 'The members of team are been successfully selected.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Select a members of team',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findActitByEquipe(@Param('id') id: number) {
    return this.membresService.findAllActifByEquipeId(id);
  }

  @Post('membres/equipes/actif')
  @ApiOkResponse({
    description: 'The members of team are been successfully selected.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Select a members of team',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findActitByEquipeIds(@Body() idsDto: IdsDto) {
    return this.membresService.findAllActifByEquipeIds(idsDto.ids);
  }

  @Get('membres/equipe/actif/not/:id')
  @ApiOkResponse({
    description: 'The members of team are been successfully selected.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Select a members of team',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findNotActitByEquipe(
    @Param('id') id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.membresService.findAllNotActifByEquipeId(id, user.id);
  }

  @Get('membres/organisation')
  @ApiOkResponse({
    description: 'The members of organisation are been successfully selected.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Select a members of organisation',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByOrganisation(@CurrentUser() user: JwtPayload) {
    return this.membresService.findAllByOrganisationId(user.id);
  }

  @Get('membres/organisation/actif')
  @ApiOkResponse({
    description: 'The members of organisation are been successfully selected.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Select a members of organisation',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findActifByOrganisation(@CurrentUser() user: JwtPayload) {
    return this.membresService.findAllActifByOrganisationId(user.id);
  }

  @Get('membres/invite/evenement/:id')
  @ApiOkResponse({
    description: 'The members invite of event are been successfully selected.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Select a members invite of event',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findInviteByEvente(@Param('id') id: number) {
    return this.membresService.findAllInviteByEvenementId(id);
  }

  @Get('membres/page')
  @ApiOkResponse({
    description: 'The member have been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter member by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeyword(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
  ): Promise<DataResponse> {
    return this.membresService.findAllByPage(query);
  }

  @Get('membres/organisation/page')
  @ApiOkResponse({
    description: 'The member  of organisation have been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter member of organisation by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeywordAndOrganisation(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<DataResponse> {
    return this.membresService.findAllByPage(query, undefined, user?.id);
  }

  @Get('membres/equipe/page/:id')
  @ApiOkResponse({
    description: 'The member  of organisation have been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter member of organisation by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeywordAndEquipe(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
    @Param('id') id: number,
  ): Promise<DataResponse> {
    return this.membresService.findAllByPage(query, id);
  }

  @Get('membres/convocations/evenement/page/:id')
  @ApiOkResponse({
    description: 'The member  of event have been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter member of event by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeywordAndEvenement(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
    @Param('id') id: number,
  ): Promise<DataResponse> {
    return this.membresService.findAllByPage(query, id);
  }

  @Get('membre/:id')
  @ApiOkResponse({
    description: 'The member have been successfully selected.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Select a member',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findOne(@Param('id') id: number) {
    return this.membresService.findOne(id);
  }

  @Get('membre/check/email/exist')
  @ApiOkResponse({
    description: 'The member have been successfully selected.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Select a member',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  checkEmailExist(@Query('email') email: string) {
    return this.membresService.existEmail(email);
  }

  @Get('membre/check/email/exist/:id')
  @ApiOkResponse({
    description: 'The member have been successfully selected.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Select a member',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  checkEmailExistUpdate(
    @Param('id') id: number,
    @Query('email') email: string,
  ) {
    return this.membresService.existEmail(email, id);
  }

  @Put('membre/add/equipe/:id')
  @ApiCreatedResponse({
    description: 'The member have been successfully added.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Add a new member',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.UPDATE)
  addMembreEquipe(
    @Param('id') id: number,
    @Body() idsDto: IdsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.membresService.addMembreEquip(id, idsDto, Number(user.id));
  }

  @Put('membre/update/:id')
  @ApiCreatedResponse({
    description: 'The member have been successfully updated.',
    type: MembresEntity,
  })
  @ApiOperation({
    summary: 'Update a new member',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.UPDATE)
  update(
    @Param('id') id: number,
    @Body() updateMembreDto: UpdateMembreDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.membresService.update(id, updateMembreDto, Number(user.id));
  }

  @Delete('membre/delete/:id')
  @ApiResponse({
    description: 'The member have been successfully deleted.',
  })
  @ApiOperation({
    summary: 'Delet an member',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.UPDATE)
  remove(@Param('id') id: number) {
    return this.membresService.remove(id);
  }

  @Delete('membres/equipes/delete/:id')
  @ApiResponse({
    description: 'The member have been successfully deleted.',
  })
  @ApiOperation({
    summary: 'Delet an member',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.UPDATE)
  removeMemberFromEqui(@Param('id') id: number, @Body() idsDto: IdsDto) {
    return this.membresService.removeMembreFromEquipe(id, idsDto);
  }
}
