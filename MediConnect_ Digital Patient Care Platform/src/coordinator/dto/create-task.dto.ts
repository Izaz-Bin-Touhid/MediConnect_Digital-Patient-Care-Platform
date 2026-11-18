import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsInt()
  @Min(1)
  @ApiProperty({ type: Number })
  requestId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @ApiProperty({ type: String })
  coordinatorId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @ApiProperty({ type: String })
  note: string;
}
