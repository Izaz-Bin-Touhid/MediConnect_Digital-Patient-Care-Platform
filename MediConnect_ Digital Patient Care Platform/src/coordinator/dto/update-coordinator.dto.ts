import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCoordinatorDto } from './create-coordinator.dto.js';

export class UpdateCoordinatorDto extends PartialType(
  OmitType(CreateCoordinatorDto, ['password'] as const),
  { skipNullProperties: false },
) {}
