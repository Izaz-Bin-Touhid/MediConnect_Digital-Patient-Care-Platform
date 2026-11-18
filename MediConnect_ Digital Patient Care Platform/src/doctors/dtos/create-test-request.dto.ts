import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTestRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @ApiProperty({ type: String, example: 'CASE001' })
  case_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @ApiProperty({ type: String, example: 'CBC' })
  test_type: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  @ApiPropertyOptional({ type: String, example: 'Please arrange the requested test.' })
  notes?: string;
}
