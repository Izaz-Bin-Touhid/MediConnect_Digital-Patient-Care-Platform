import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTestRequestDto {
  @IsInt()
  @Min(1)
  case_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  test_type: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
