import { ApiProperty } from '@nestjs/swagger';
import { DataResponseType } from '../type';

export class DataResponse {
  @ApiProperty()
  total: number;
  @ApiProperty()
  per_page: number;
  @ApiProperty()
  current_page: number;
  @ApiProperty()
  last_page: number;
  @ApiProperty()
  next_page: number;
  @ApiProperty()
  prev_page: number;
  @ApiProperty({ type: [Object] })
  data: DataResponseType[];

  constructor(
    total: number,
    per_page: number,
    current_page: number,
    last_page: number,
    next_page: number,
    prev_page: number,
    data: DataResponseType[],
  ) {
    this.data = data;
    this.total = total;
    this.per_page = per_page;
    this.current_page = current_page;
    this.last_page = last_page > 0 ? last_page : 1;
    this.next_page = next_page > this.last_page ? this.last_page : next_page;
    this.prev_page = prev_page;
  }
}
