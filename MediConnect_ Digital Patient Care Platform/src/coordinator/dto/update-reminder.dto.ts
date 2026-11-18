import { PartialType } from '@nestjs/mapped-types';
import { IsIn, ValidateIf } from 'class-validator';
import { CreateReminderDto } from './create-reminder.dto.js';

export class UpdateReminderDto extends PartialType(CreateReminderDto, {
  skipNullProperties: false,
}) {
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(['sent', 'failed', 'acknowledged'])
  responseStatus?: 'sent' | 'failed' | 'acknowledged';
}
