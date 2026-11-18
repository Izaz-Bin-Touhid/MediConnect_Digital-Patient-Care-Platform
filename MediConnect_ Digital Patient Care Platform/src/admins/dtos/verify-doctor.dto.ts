import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class VerifyDoctorDto {
  @IsIn(['APPROVED', 'REJECTED'])
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'], example: 'APPROVED' })
  verification_status: 'APPROVED' | 'REJECTED';
}
