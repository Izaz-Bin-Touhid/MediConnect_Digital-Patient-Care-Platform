import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class TestDecisionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(accepted|declined)$/, {
    message: 'patientDecision must be accepted or declined',
  })
  patientDecision: string;
}
