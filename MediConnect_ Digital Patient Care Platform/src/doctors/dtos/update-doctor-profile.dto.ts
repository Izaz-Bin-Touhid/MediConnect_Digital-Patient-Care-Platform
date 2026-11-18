import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateDoctorProfileDto } from './create-doctor-profile.dto.js';

export class UpdateDoctorProfileDto extends PartialType(
  OmitType(CreateDoctorProfileDto, ['doctor_id'] as const),
  { skipNullProperties: false },
) {}
