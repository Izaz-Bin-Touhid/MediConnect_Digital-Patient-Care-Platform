import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  @ApiPropertyOptional({ type: Number, default: 1 })
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({ type: Number, default: 20 })
  limit = 20;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
