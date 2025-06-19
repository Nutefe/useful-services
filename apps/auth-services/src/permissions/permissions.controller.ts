import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionEntity } from './entities/permission.entity';

@Controller('api/auth/v1')
@ApiTags('Permissions endpoint')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('permission')
  @ApiCreatedResponse({ type: PermissionEntity })
  @ApiOperation({ summary: 'Create a permission' })
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionEntity> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get('permissions')
  @ApiOkResponse({ type: PermissionEntity, isArray: true })
  @ApiOperation({ summary: 'select all permission' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('permission/:id')
  @ApiOkResponse({ type: PermissionEntity })
  @ApiOperation({ summary: 'select one permission' })
  findOne(@Param('id') id: number) {
    return this.permissionsService.findOne(+id);
  }

  @Put('permission/:id')
  @ApiCreatedResponse({ type: PermissionEntity })
  @ApiOperation({ summary: 'update a permission' })
  update(
    @Param('id') id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete('permission/:id')
  @ApiResponse({
    description: 'The permission has been successfully deleted.',
  })
  @ApiOperation({ summary: 'Delete one permission' })
  remove(@Param('id') id: number) {
    return this.permissionsService.remove(+id);
  }
}
