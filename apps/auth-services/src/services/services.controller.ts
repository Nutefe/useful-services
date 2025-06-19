import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceEntity } from './entities/service.entity';
import { JwtAutLocalGuard } from '../auth/guards/jwt-auth-local.guard';
import { RolesLocalGuard } from '../auth/guards/roles-local.guard';
import { PermissionsLocalGuard } from '../auth/guards/permissions-local.guard';
import { HasPermissions, HasRoles, HasServices } from '@app/common';
import { RoleEnum } from '../roles/entities/role.enum';
import { PermissionEnum } from '../permissions/entities/permission.enum';
import { ServiceEnum } from './entities/service.enum';
import { ServicesLocalGuard } from '../auth/guards/services-local.guard';

@Controller('api/auth/v1')
@ApiTags('Services endpoint')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(
  JwtAutLocalGuard,
  RolesLocalGuard,
  PermissionsLocalGuard,
  ServicesLocalGuard,
)
@HasServices(ServiceEnum.SERVICE_AUTH)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post('service')
  @ApiCreatedResponse({ type: ServiceEntity })
  @ApiOperation({ summary: 'Create service' })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get('services')
  @ApiOkResponse({ type: ServiceEntity, isArray: true })
  @ApiOperation({ summary: 'Select all service' })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAll() {
    return this.servicesService.findAll();
  }

  @Get('service/:id')
  @ApiOkResponse({ type: ServiceEntity })
  @ApiOperation({ summary: 'Select one service' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Put('service/:id')
  @ApiCreatedResponse({ type: ServiceEntity })
  @ApiOperation({ summary: 'Update service' })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete('service/:id')
  @ApiResponse({
    description: 'The permission has been successfully deleted.',
  })
  @ApiOperation({ summary: 'Delete one permission' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
