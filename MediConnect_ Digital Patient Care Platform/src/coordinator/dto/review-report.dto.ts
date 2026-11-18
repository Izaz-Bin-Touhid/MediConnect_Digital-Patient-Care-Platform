import { IsIn } from 'class-validator';

export class ReviewReportDto {
  @IsIn(['verified', 'rejected'])
  checkStatus: 'verified' | 'rejected';
}
