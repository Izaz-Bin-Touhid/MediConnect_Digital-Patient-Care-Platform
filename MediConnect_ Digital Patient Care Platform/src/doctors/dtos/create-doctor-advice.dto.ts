import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDoctorAdviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  case_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  advice_note: string;
}
