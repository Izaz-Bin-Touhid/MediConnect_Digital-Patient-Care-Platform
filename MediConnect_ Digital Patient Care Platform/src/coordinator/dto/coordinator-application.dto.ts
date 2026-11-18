import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { CreateCoordinatorDto } from './create-coordinator.dto.js';

export class CreateCoordinatorApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  phone: string;
}

export class ApproveCoordinatorApplicationDto extends OmitType(
  CreateCoordinatorDto,
  ['fullName', 'phone'] as const,
) {}
