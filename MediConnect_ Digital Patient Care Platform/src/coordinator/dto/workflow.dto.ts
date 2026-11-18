import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AssignCaseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  coordinatorId: string;
}

export class RequestDiagnosticTestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  testType: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  notes: string;
}

export class SubmitReportDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  result: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reportFile: string;
}
