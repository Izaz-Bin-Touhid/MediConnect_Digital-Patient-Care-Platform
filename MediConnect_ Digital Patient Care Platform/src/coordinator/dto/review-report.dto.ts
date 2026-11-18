import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class ReviewReportDto {
  @IsIn(['verified', 'rejected'])
  @ApiProperty({ type: String })
  checkStatus: 'verified' | 'rejected';
}
