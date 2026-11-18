import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AssignCaseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @ApiProperty({ type: String })
  coordinatorId: string;
}

export class RequestDiagnosticTestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @ApiProperty({ type: String })
  testType: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @ApiProperty({ type: String })
  notes: string;
}

export class SubmitReportDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  @ApiProperty({ type: String })
  result: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @ApiProperty({ type: String })
  reportFile: string;
}
