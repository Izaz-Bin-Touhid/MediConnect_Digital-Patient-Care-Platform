import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateDoctorAdviceDto } from './create-doctor-advice.dto.js';

export class UpdateDoctorAdviceDto extends PartialType(
  OmitType(CreateDoctorAdviceDto, ['case_id'] as const),
  { skipNullProperties: false },
) {}
