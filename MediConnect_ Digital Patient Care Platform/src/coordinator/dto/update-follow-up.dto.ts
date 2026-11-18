import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OmitType, PartialType } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { CreateFollowUpDto } from './create-follow-up.dto.js';

export class UpdateFollowUpDto extends PartialType(
  OmitType(CreateFollowUpDto, ['caseId'] as const),
  { skipNullProperties: false },
) {
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(['scheduled', 'completed', 'cancelled'])
  @ApiPropertyOptional({ type: String })
  status?: 'scheduled' | 'completed' | 'cancelled';

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @ApiPropertyOptional({ type: String })
  outcome?: string;
}
