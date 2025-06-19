import {
  DatabaseService,
  FileResponseDto,
  FilesCreateGlobalDto,
} from '@app/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FilesEntity } from './entities/file.entity';
import { ConfigService } from '@nestjs/config';
import { FilesCreateDto } from './dto/files-create.dto';

@Injectable()
export class FileServicesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async create(data: {
    files: FilesCreateGlobalDto[];
  }): Promise<FileResponseDto[]> {
    const response: FileResponseDto[] = [];
    for (const file of data.files) {
      const filesDto = new FilesCreateGlobalDto();
      filesDto.user_id = +file.user_id;
      filesDto.filename = file.filename;
      filesDto.origine_name = file.origine_name;
      filesDto.path = `/home/upload/cyberethik-service/${file.filename}`;
      filesDto.file_dir = `/home/upload/cyberethik-service/`;
      filesDto.mimetype = file.mimetype;
      filesDto.type_file = file.type_file;

      await this.createFileGlobal(filesDto);

      const fileReponse: FileResponseDto = {
        originalname: file.origine_name,
        filename: file.filename,
        uri: `${this.configService.get<string>('FILE_URI')}${file.filename}`,
      };
      response.push(fileReponse);
    }

    return response;
  }

  async createFileGlobal(filesCreateDto: FilesCreateGlobalDto) {
    // select type_file_id from type_files where service_name = filesCreateDto.type_file.service_name
    const typeFile = await this.databaseService.typeFiles.findFirst({
      where: {
        libelle: filesCreateDto.type_file.libelle,
        service: {
          name: filesCreateDto.type_file.service_name,
        },
        deleted: false,
      },
      select: {
        id: true,
        service_id: true,
      },
    });

    if (!typeFile) {
      throw new NotFoundException(
        `Type file with service name ${filesCreateDto.type_file.service_name} not found`,
      );
    }

    return this.databaseService.files.create({
      data: {
        user_id: filesCreateDto.user_id,
        filename: filesCreateDto.filename,
        origine_name: filesCreateDto.origine_name,
        mimetype: filesCreateDto.mimetype,
        path: filesCreateDto.path,
        file_dir: filesCreateDto.file_dir,
        type_file_id: typeFile.id,
      },
      include: {
        type_file: true,
      },
    });
  }

  async createFiles(filesCreateDto: FilesCreateDto) {
    return this.databaseService.files.create({
      data: {
        user_id: filesCreateDto.user_id,
        filename: filesCreateDto.filename,
        origine_name: filesCreateDto.origine_name,
        mimetype: filesCreateDto.mimetype,
        path: filesCreateDto.path,
        file_dir: filesCreateDto.file_dir,
        type_file_id: filesCreateDto.type_file,
      },
      include: {
        type_file: true,
      },
    });
  }

  async findFilesByName(filename: string): Promise<FilesEntity> {
    const file = await this.databaseService.files.findFirst({
      where: {
        filename,
      },
      include: {
        type_file: true,
      },
    });

    if (!file) {
      throw new NotFoundException(`File with name ${filename} not found`);
    }
    return new FilesEntity(file);
  }
}
