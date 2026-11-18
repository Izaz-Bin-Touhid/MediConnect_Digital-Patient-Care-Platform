import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTestRequestDto } from './create-test-request.dto.js';

export class UpdateTestRequestDto extends PartialType(
  OmitType(CreateTestRequestDto, ['case_id'] as const),
  { skipNullProperties: false },
) {}
