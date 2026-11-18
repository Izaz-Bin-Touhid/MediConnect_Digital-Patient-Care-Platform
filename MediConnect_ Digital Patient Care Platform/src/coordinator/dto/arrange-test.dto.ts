import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ArrangeTestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @ApiProperty({ type: String })
  centerId: string;
}
