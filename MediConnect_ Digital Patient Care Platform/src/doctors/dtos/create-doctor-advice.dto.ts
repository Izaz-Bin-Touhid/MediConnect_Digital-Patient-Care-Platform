import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDoctorAdviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @ApiProperty({ type: String, example: 'CASE001' })
  case_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  @ApiProperty({ type: String, example: 'Follow-up consultation is recommended.' })
  advice_note: string;
}
