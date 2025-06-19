import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleEntity } from './entities/role.entity';

@Controller('api/auth/v1')
@ApiTags('Roles endpoint')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('role')
  @ApiCreatedResponse({ type: RoleEntity })
  @ApiOperation({ summary: 'Create role' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get('roles')
  @ApiOkResponse({ type: RoleEntity, isArray: true })
  @ApiOperation({ summary: 'Select all role' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('role/:id')
  @ApiOkResponse({ type: RoleEntity })
  @ApiOperation({ summary: 'Select one role' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Put('role/:id')
  @ApiCreatedResponse({ type: RoleEntity })
  @ApiOperation({ summary: 'Update role' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete('role/:id')
  @ApiResponse({ description: 'The role has been successfully deleted.' })
  @ApiOperation({ summary: 'Delete role' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
