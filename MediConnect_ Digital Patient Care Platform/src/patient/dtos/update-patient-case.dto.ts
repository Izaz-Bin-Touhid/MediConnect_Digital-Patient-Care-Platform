import { PartialType } from '@nestjs/swagger';
import { CreatePatientCaseDto } from './create-patient-case.dto.js';

export class UpdatePatientCaseDto extends PartialType(CreatePatientCaseDto) {}
