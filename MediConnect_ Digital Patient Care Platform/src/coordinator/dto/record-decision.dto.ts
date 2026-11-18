import { IsIn } from 'class-validator';

export class RecordDecisionDto {
  @IsIn(['accepted', 'declined'])
  decision: 'accepted' | 'declined';
}
