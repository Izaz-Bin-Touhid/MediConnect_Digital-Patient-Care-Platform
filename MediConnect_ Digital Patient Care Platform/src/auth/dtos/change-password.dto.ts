import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Patient@123' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    example: 'NewPatient@123',
    description:
      'Must contain an uppercase letter, lowercase letter, number and special character, and be 8-20 characters long',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,20}$/, {
    message:
      'Password must contain uppercase, lowercase, number and special character, and be 8-20 characters long',
  })
  newPassword: string;
}
