import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { FileServicesService } from './file-services.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { DataUploadDto } from './dto/data-upload.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesCreateDto } from './dto/files-create.dto';
import {
  editFileName,
  FileResponseDto,
  FilesCreateGlobalDto,
  HasServices,
  JwtAutGuard,
  PermissionsGuard,
  RolesGuard,
  ServiceEnum,
  ServicesGuard,
} from '@app/common';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';

@Controller('api/files/service/v1')
@ApiTags('Files service endpoint')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAutGuard, RolesGuard, PermissionsGuard, ServicesGuard) //
@HasServices(ServiceEnum.SERVICE_AUTH, ServiceEnum.SERVICE_FILES)
export class FileServicesController {
  constructor(
    private readonly fileServicesService: FileServicesService,
    private readonly configService: ConfigService,
    @Inject(process.env.AUTH_SERVICE ?? 'auth-service')
    private readonly authService: ClientProxy,
  ) {}

  @Post('multiple')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of cats',
    type: DataUploadDto,
  })
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: '/home/upload/cyberethik-service',
        filename: editFileName,
      }),
    }),
  )
  async uploadMultipleFiles(
    @Body() dataUpload: DataUploadDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const response: FileResponseDto[] = [];
    for (const file of files) {
      const filesDto = new FilesCreateDto();
      filesDto.user_id = +dataUpload.user_id;
      filesDto.filename = file.filename;
      filesDto.origine_name = file.originalname;
      filesDto.path = `/home/upload/cyberethik-service/${file.filename}`;
      filesDto.file_dir = `/home/upload/cyberethik-service/`;
      filesDto.mimetype = file.mimetype;
      filesDto.type_file = +dataUpload.type_file;
      await this.fileServicesService.createFiles(filesDto);

      const fileReponse: FileResponseDto = {
        originalname: file.originalname,
        filename: file.filename,
        uri: `${this.configService.get<string>('FILE_URI')}${file.filename}`,
      };
      response.push(fileReponse);
    }
    return response;
  }

  @MessagePattern('create-file')
  @UsePipes(new ValidationPipe())
  async create(
    @Payload() data: { files: FilesCreateGlobalDto[]; jwt: string },
  ) {
    const response = await this.fileServicesService.create(data);

    return response;
  }

  @Get('loadfile/:filename')
  async seeUploadedFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const file = await this.fileServicesService.findFilesByName(filename);
    return res.sendFile(filename, { root: `${file.file_dir}` });
  }

  @Get('download/:filename')
  async download(@Param('filename') filename: string, @Res() res: Response) {
    const file = await this.fileServicesService.findFilesByName(filename);

    return res.download(`${file.file_dir}${filename}`);
  }
}
