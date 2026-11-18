import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCoordinatorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @ApiProperty({ type: String })
  fullName: string;

  @IsEmail()
  @MaxLength(254)
  @ApiProperty({ type: String })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  @ApiProperty({ type: String })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @ApiProperty({ type: String })
  staffId: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @ApiProperty({ type: String })
  password: string;
}
