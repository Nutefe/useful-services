import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty()
  filename: string;
  @ApiProperty()
  originalname: string;
  @ApiProperty()
  uri: string;
}
