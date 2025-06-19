import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FiltersDto {
  @ApiProperty({ required: false, default: '' })
  @Type(() => String)
  @IsString()
  @IsOptional()
  keyword?: string = '';

  @ApiProperty({ default: 1 })
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ default: 10 })
  @Type(() => Number)
  @IsNumber()
  take?: number = 10;
}

export class FilterFormatDto {
  take: number;
  page: number;
  skip: number;
  keyword: string;

  constructor(take: number, page: number, keyword: string) {
    this.take = take;
    this.page = page;
    this.skip = (page - 1) * take;
    this.keyword = keyword;
  }
}
