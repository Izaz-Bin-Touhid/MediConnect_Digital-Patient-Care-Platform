import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DemoPaymentDto {
  @ApiProperty({ example: 'PAY001', minLength: 5, maxLength: 10 })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  paymentId: string;

  @ApiProperty({ example: 'C-1001', minLength: 5, maxLength: 10 })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  caseId: string;

  @ApiProperty({ enum: ['success', 'failed'], example: 'success' })
  @IsString()
  @Matches(/^(success|failed)$/, {
    message: 'result must be success or failed',
  })
  result: string;
}
