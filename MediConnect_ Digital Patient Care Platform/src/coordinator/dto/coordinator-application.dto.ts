import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { CreateCoordinatorDto } from './create-coordinator.dto.js';

export class CreateCoordinatorApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @ApiProperty({ type: String })
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  @ApiProperty({ type: String })
  phone: string;
}

export class ApproveCoordinatorApplicationDto extends OmitType(
  CreateCoordinatorDto,
  ['fullName', 'phone'] as const,
) {}
