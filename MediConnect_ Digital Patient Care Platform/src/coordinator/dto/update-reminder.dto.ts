import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsIn, ValidateIf } from 'class-validator';
import { CreateReminderDto } from './create-reminder.dto.js';

export class UpdateReminderDto extends PartialType(CreateReminderDto, {
  skipNullProperties: false,
}) {
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(['sent', 'failed', 'acknowledged'])
  @ApiPropertyOptional({ type: String })
  responseStatus?: 'sent' | 'failed' | 'acknowledged';
}
