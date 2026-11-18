import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDoctorAdviceDto {
  @IsInt()
  @Min(1)
  case_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  advice_note: string;
}
