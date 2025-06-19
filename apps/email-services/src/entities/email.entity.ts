import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EmailsQueryInput } from './email.type';
import { UserEntity } from '@app/common';

export class EmailEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;
  @ApiProperty({ type: 'string', default: null })
  subject?: string | null;
  @ApiProperty({ type: 'string', default: null })
  body?: string | null;
  @ApiProperty({ type: 'array', default: [] })
  user?: UserEntity;
  @ApiProperty()
  created_at?: string;
  @ApiProperty()
  updated_at?: string;

  constructor();

  constructor(data: EmailsQueryInput);

  constructor(data?: EmailsQueryInput) {
    if (!data) return;
    this.id = data?.id;
    if ('subject' in data) {
      this.subject = data?.subject;
      this.body = data?.body;
      this.user = new UserEntity(data.user);
      this.created_at = data?.created_at.toJSON();
      this.updated_at = data?.updated_at.toJSON();
    }
  }
}
