import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ type: String })
  caseId: string;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @ApiProperty({ type: String })
  followupDate: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @ApiProperty({ type: String })
  followupTime: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @ApiProperty({ type: String })
  note: string;
}
