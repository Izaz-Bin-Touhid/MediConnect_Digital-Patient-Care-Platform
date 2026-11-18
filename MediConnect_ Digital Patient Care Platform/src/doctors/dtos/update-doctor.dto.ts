import {
  OmitType,
  PartialType,
} from '@nestjs/mapped-types';

import { CreateDoctorDto } from './create-doctor.dto.js';

export class UpdateDoctorDto extends PartialType(
  OmitType(CreateDoctorDto, ['password'] as const),
  { skipNullProperties: false },
) {}