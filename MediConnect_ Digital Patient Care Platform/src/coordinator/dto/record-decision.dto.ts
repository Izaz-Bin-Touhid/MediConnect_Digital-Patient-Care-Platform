import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class RecordDecisionDto {
  @IsIn(['accepted', 'declined'])
  @ApiProperty({ type: String })
  decision: 'accepted' | 'declined';
}
