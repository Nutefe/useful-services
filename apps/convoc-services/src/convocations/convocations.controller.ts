import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ConvocationsService } from './convocations.service';
import { CreateConvocationDto } from './dto/create-convocation.dto';
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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConvocationsEntity } from './entities/convocation.entity';
import { CreateConvocationEquipeDto } from './dto/create-convocation-equipe.dto';

@Controller('api/convoc/service/v1')
@ApiTags('Convocations endpoint')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAutGuard, RolesGuard, PermissionsGuard, ServicesGuard)
@HasServices(ServiceEnum.SERVICE_AUTH, ServiceEnum.SERVICE_CONVOC)
export class ConvocationsController {
  constructor(private readonly convocationsService: ConvocationsService) {}

  @Post('convocation/save')
  @ApiCreatedResponse({
    description: 'The convocation have been successfully created.',
    type: ConvocationsEntity,
  })
  @ApiOperation({
    summary: 'Create a new convocation with membres',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.CREATE)
  create(
    @Body() createConvocationDto: CreateConvocationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.convocationsService.create(createConvocationDto, user?.id);
  }

  @Post('convocation/equipe/save')
  @ApiCreatedResponse({
    description: 'The convocation have been successfully created.',
    type: ConvocationsEntity,
  })
  @ApiOperation({
    summary: 'Create a new convocation with equipes',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.CREATE)
  createEqueipe(
    @Body() createConvocationDto: CreateConvocationEquipeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.convocationsService.createEquipe(
      createConvocationDto,
      user?.id,
    );
  }

  @Get('convocation/event/equipe/send/:id')
  @ApiOkResponse({
    description: 'The convocations have been successfully selected.',
    type: ConvocationsEntity,
  })
  @ApiOperation({
    summary: 'Select convocations',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.CREATE)
  send(@Param('id') id: number, @CurrentUser() user: JwtPayload) {
    return this.convocationsService.send(id, user?.id);
  }

  @Get('convocations')
  @ApiOkResponse({
    description: 'The convocations have been successfully selected.',
    type: ConvocationsEntity,
  })
  @ApiOperation({
    summary: 'Select convocations',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAll() {
    return this.convocationsService.findAll();
  }

  @Get('convocations/page')
  @ApiOkResponse({
    description: 'The convocations are been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter convocations by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeyword(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
  ): Promise<DataResponse> {
    return this.convocationsService.findAllByPage(query);
  }

  @Get('convocations/organisation/page')
  @ApiOkResponse({
    description:
      'The convocations  of organisation are been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary:
      'Filter convocations of organisation by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeywordAndOrganisation(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<DataResponse> {
    return this.convocationsService.findAllByPage(query, undefined, user?.id);
  }

  @Get('convocations/evenement/page/:id')
  @ApiOkResponse({
    description: 'The convocations  of event are been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter convocations of event by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeywordAndEquipe(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
    @Param('id') id: number,
  ): Promise<DataResponse> {
    return this.convocationsService.findAllByPage(query, id);
  }

  @Get('convocation/:id')
  @ApiOkResponse({
    description: 'The convocation have been successfully selected.',
    type: ConvocationsEntity,
  })
  @ApiOperation({
    summary: 'Select convocation',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findOne(@Param('id') id: number) {
    return this.convocationsService.findOne(id);
  }

  @Get('convocation/slug')
  @ApiOkResponse({
    description: 'The convocation have been successfully selected.',
    type: ConvocationsEntity,
  })
  @ApiOperation({
    summary: 'Select convocation',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findOneBySlug(@Query('slug') slug: string) {
    return this.convocationsService.findBySlug(slug);
  }

  @Delete('convocation/:id')
  @ApiResponse({
    description: 'The convocation have been successfully deleted.',
  })
  @ApiOperation({
    summary: 'Delete convocation',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.DELETE)
  remove(@Param('id') id: number) {
    return this.convocationsService.remove(id);
  }
}
