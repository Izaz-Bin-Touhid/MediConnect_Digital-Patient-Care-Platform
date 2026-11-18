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
  case_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  test_type: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
