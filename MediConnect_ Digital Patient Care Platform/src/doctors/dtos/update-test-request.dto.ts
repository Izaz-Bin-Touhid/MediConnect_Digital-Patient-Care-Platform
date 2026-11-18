import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTestRequestDto } from './create-test-request.dto.js';

export class UpdateTestRequestDto extends PartialType(
  OmitType(CreateTestRequestDto, ['case_id'] as const),
  { skipNullProperties: false },
) {}
