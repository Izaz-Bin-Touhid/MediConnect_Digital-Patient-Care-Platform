import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientCaseDto } from './create-patient-case.dto.js';

export class UpdatePatientCaseDto extends PartialType(CreatePatientCaseDto) {}
