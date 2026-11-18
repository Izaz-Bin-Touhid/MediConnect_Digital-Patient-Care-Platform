import { PartialType } from '@nestjs/mapped-types';
import { CreateDoctorProfileDto } from './create-doctor-profile.dto.js';

export class UpdateDoctorProfileDto extends PartialType(
  CreateDoctorProfileDto,
  { skipNullProperties: false },
) {}
