import { PartialType } from '@nestjs/swagger';
import { CreateDoctorProfileDto } from './create-doctor-profile.dto.js';

export class UpdateDoctorProfileDto extends PartialType(
  CreateDoctorProfileDto,
  { skipNullProperties: false },
) {}
