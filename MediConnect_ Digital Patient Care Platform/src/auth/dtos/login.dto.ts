import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'P-1001', minLength: 5, maxLength: 10 })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  patientId: string;

  @ApiProperty({ example: 'Patient@123', minLength: 8, maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,20}$/, {
    message:
      'password should have at least one lowercase, one uppercase, one special character, one number and length should be between 8 to 20 characters',
  })
  password: string;
}
