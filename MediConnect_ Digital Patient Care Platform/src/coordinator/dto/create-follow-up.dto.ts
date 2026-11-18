import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateFollowUpDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  caseId: string;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  followupDate: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  followupTime: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  note: string;
}
