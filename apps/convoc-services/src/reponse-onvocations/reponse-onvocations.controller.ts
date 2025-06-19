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
import { ReponseOnvocationsService } from './reponse-onvocations.service';
import { CreateReponseOnvocationDto } from './dto/create-reponse-onvocation.dto';
import { UpdateReponseOnvocationDto } from './dto/update-reponse-onvocation.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
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
import { ReponseConvocationsEntity } from './entities/reponse-onvocation.entity';

@Controller('api/convoc/service/v1')
@ApiTags('Reponses convocation endpoint')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAutGuard, RolesGuard, PermissionsGuard, ServicesGuard)
@HasServices(ServiceEnum.SERVICE_AUTH, ServiceEnum.SERVICE_CONVOC)
export class ReponseOnvocationsController {
  constructor(
    private readonly reponseOnvocationsService: ReponseOnvocationsService,
  ) {}

  @Post('reponse/save')
  @ApiCreatedResponse({
    description: 'The response convocation have been successfully created.',
    type: ReponseConvocationsEntity,
  })
  @ApiOperation({
    summary: 'Create a new response convocation',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.CREATE)
  create(@Body() createReponseOnvocationDto: CreateReponseOnvocationDto) {
    return this.reponseOnvocationsService.create(createReponseOnvocationDto);
  }

  @Get('reponse/convocations')
  @ApiOkResponse({
    description: 'The responses of convocation have been successfully seleted.',
    type: ReponseConvocationsEntity,
  })
  @ApiOperation({
    summary: 'Selete reponse of convocation',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAll() {
    return this.reponseOnvocationsService.findAll();
  }

  @Get('status/reponse/encours')
  @ApiOkResponse({
    description: 'The responses of convocation have been successfully seleted.',
    type: ReponseConvocationsEntity,
  })
  @ApiOperation({
    summary: 'Selete reponse of convocation',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAllEncours(@CurrentUser() user: JwtPayload) {
    return this.reponseOnvocationsService.reponseEncours(user?.id ?? 0);
  }

  @Get('reponses/page')
  @ApiOkResponse({
    description: 'The reponses of convocations are been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter reponses ofconvocations by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeyword(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
  ): Promise<DataResponse> {
    return this.reponseOnvocationsService.findAllByPage(query);
  }

  @Get('reponses/organisation/page')
  @ApiOkResponse({
    description:
      'The reponse convocations  of organisation are been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary:
      'Filter reponse convocations of organisation by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeywordAndOrganisation(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<DataResponse> {
    return this.reponseOnvocationsService.findAllByPage(
      query,
      undefined,
      user?.id,
    );
  }

  @Get('reponses/evenement/page')
  @ApiOkResponse({
    description:
      'The reponse of convocations  of event are been successfully select.',
    type: DataResponse,
  })
  @ApiOperation({
    summary:
      'Filter reponse of convocations of event by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeywordAndEquipe(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
    @Param('id') id: number,
  ): Promise<DataResponse> {
    return this.reponseOnvocationsService.findAllByPage(query, id);
  }

  @Get('reponse/convocation/:id')
  @ApiOkResponse({
    description: 'The response of convocation have been successfully seleted.',
    type: ReponseConvocationsEntity,
  })
  @ApiOperation({
    summary: 'Selete reponse of convocation',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findOne(@Param('id') id: number) {
    return this.reponseOnvocationsService.findOne(id);
  }

  @Put('reponse/convocation/:id')
  @ApiCreatedResponse({
    description: 'The response of convocation have been successfully updated.',
    type: ReponseConvocationsEntity,
  })
  @ApiOperation({
    summary: 'Update reponse of convocation',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.UPDATE)
  update(
    @Param('id') id: number,
    @Body() updateReponseOnvocationDto: UpdateReponseOnvocationDto,
  ) {
    return this.reponseOnvocationsService.update(
      id,
      updateReponseOnvocationDto,
    );
  }

  @Delete('reponse/onvocation/:id')
  remove(@Param('id') id: number) {
    return this.reponseOnvocationsService.remove(id);
  }
}
