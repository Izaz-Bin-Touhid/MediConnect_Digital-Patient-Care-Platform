import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCoordinatorDto } from './create-coordinator.dto.js';

export class UpdateCoordinatorDto extends PartialType(
  OmitType(CreateCoordinatorDto, ['password'] as const),
  { skipNullProperties: false },
) {}
