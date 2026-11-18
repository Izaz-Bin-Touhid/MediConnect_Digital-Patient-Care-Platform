import { IsIn } from 'class-validator';

export class VerifyDoctorDto {
  @IsIn(['APPROVED', 'REJECTED'])
  verification_status: 'APPROVED' | 'REJECTED';
}
