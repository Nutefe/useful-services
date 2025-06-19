import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
  Put,
  UseGuards,
  Req,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  CurrentUser,
  DataResponse,
  editFileName,
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
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AddUserOrganisationDto } from './dto/add-user-organisation.dto';
import { OrganisationsEntity } from './entities/organisation.entity';

@Controller('api/convoc/service/v1')
@ApiTags('Organisatios endpoint')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAutGuard, RolesGuard, PermissionsGuard, ServicesGuard)
@HasServices(ServiceEnum.SERVICE_AUTH, ServiceEnum.SERVICE_CONVOC)
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Post('organisation/save')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new organisation',
    type: CreateOrganisationDto,
  })
  @UseInterceptors(
    FilesInterceptor('file', 20, {
      storage: diskStorage({
        destination: '/home/upload/cyberethik-service',
        filename: editFileName,
      }),
    }),
  )
  @ApiCreatedResponse({
    description: 'The organisation has been successfully created.',
    type: OrganisationsEntity,
  })
  @ApiOperation({
    summary: 'Create an organisation',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.CREATE)
  async create(
    @Body() dataUpload: CreateOrganisationDto,
    @UploadedFiles() file: Array<Express.Multer.File>,
    @CurrentUser() user: JwtPayload,
    @Req()
    req: Request,
  ) {
    const authHeader = req.headers['authorization'] as string;
    const jwt = authHeader?.split(' ')[1];
    return this.organisationsService.create(dataUpload, file[0], user, jwt);
  }

  @Get('organisations')
  @ApiOkResponse({
    description: 'The organisations has been successfully selected.',
    type: OrganisationsEntity,
  })
  @ApiOperation({
    summary: 'Select all organisations',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAll() {
    return this.organisationsService.findAll();
  }

  @Get('organisations/page')
  @ApiOkResponse({
    description: 'The organisations has been successfully selected.',
    type: DataResponse,
  })
  @ApiOperation({
    summary: 'Filter organisations by pagination and search keyword',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findByKeyword(
    @Query(new ValidationPipe({ transform: true })) query: FiltersDto,
  ): Promise<DataResponse> {
    return this.organisationsService.findAllByPage(query);
  }

  @Get('organisations/user')
  @ApiOkResponse({
    description: 'The User organisations have been successfully selected.',
    type: OrganisationsEntity,
  })
  @ApiOperation({
    summary: 'Select all user organisations',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAllUser(@CurrentUser() user: JwtPayload) {
    return this.organisationsService.findAllByUserId(Number(user.id));
  }

  @Get('organisation/:id')
  @ApiOkResponse({
    description: 'The organisation has been successfully selected.',
    type: OrganisationsEntity,
  })
  @ApiOperation({
    summary: 'Select an organisation by ID',
  })
  @HasPermissions(PermissionEnum.READ)
  findOne(@Param('id') id: number) {
    return this.organisationsService.findOne(id);
  }

  @Put('organisation/user/add/:id')
  @ApiCreatedResponse({ type: AddUserOrganisationDto })
  @ApiOperation({ summary: 'Add multiple users to organisation' })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.UPDATE)
  addUsersOganisation(
    @Param('id') id: number,
    @Body() userOrganisationDto: AddUserOrganisationDto,
  ) {
    return this.organisationsService.addUserToOrganisation(
      userOrganisationDto.users,
      id,
    );
  }

  @Put('organisation/update/:id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of cats',
    type: UpdateOrganisationDto,
  })
  @UseInterceptors(
    FilesInterceptor('file', 20, {
      storage: diskStorage({
        destination: '/home/upload/cyberethik-service',
        filename: editFileName,
      }),
    }),
  )
  @ApiCreatedResponse({
    description: 'The organisation has been successfully updated.',
    type: OrganisationsEntity,
  })
  @ApiOperation({
    summary: 'Update an organisation',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.UPDATE)
  async update(
    @Param('id') id: number,
    @Body() dataUpload: UpdateOrganisationDto,
    @UploadedFiles() file: Array<Express.Multer.File>,
    @CurrentUser() user: JwtPayload,
    @Req()
    req: Request,
  ) {
    const authHeader = req.headers['authorization'] as string;
    const jwt = authHeader?.split(' ')[1];
    return this.organisationsService.update(id, dataUpload, file[0], user, jwt);
  }

  @Delete('organisation/delete/:id')
  @ApiResponse({
    description: 'The organisation has been successfully removed.',
  })
  @ApiOperation({
    summary: 'Delete an organisation',
  })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.DELETE)
  remove(@Param('id') id: number) {
    return this.organisationsService.remove(id);
  }
}
