import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAutLocalGuard } from '../auth/guards/jwt-auth-local.guard';
import { RolesLocalGuard } from '../auth/guards/roles-local.guard';
import { PermissionsLocalGuard } from '../auth/guards/permissions-local.guard';
import { ServicesLocalGuard } from '../auth/guards/services-local.guard';
import { HasPermissions, HasRoles, HasServices } from '@app/common';
import { ServiceEnum } from '../services/entities/service.enum';
import { UserEntity } from './entities/user.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { RoleEnum } from '../roles/entities/role.enum';
import { PermissionEnum } from '../permissions/entities/permission.enum';

@Controller('api/auth/v1')
@ApiTags('Users endpoint')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(
  JwtAutLocalGuard,
  RolesLocalGuard,
  PermissionsLocalGuard,
  ServicesLocalGuard,
)
@HasServices(ServiceEnum.SERVICE_AUTH)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('user')
  @ApiCreatedResponse({ type: UserEntity })
  @ApiOperation({ summary: 'Create user' })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.CREATE)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('users')
  @ApiOkResponse({ type: UserEntity })
  @ApiOperation({ summary: 'Selecte all users' })
  @HasRoles(RoleEnum.ROLE_ADMIN)
  @HasPermissions(PermissionEnum.READ)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('user/:id')
  @ApiOkResponse({ type: UserEntity })
  @ApiOperation({ summary: 'Selecte one user' })
  @HasPermissions(PermissionEnum.READ)
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Put('user/:id')
  @ApiCreatedResponse({ type: UserEntity })
  @ApiOperation({ summary: 'Update user' })
  @HasPermissions(PermissionEnum.UPDATE)
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put('user/update/password/:id')
  @ApiCreatedResponse()
  @ApiOperation({ summary: 'Update user' })
  updatePassword(
    @Param('id') id: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(id, updatePasswordDto);
  }

  @Delete('user/:id')
  @ApiResponse({ type: UserEntity })
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
