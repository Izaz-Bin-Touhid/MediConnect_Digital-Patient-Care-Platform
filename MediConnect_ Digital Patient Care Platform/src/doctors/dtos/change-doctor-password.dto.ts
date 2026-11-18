import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class ChangeDoctorPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ type: String, example: 'OldDemo@12345', format: 'password', writeOnly: true })
  current_password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,20}$/, {
    message: 'new_password must contain uppercase, lowercase, number and special character, with 8 to 20 characters',
  })
  @ApiProperty({ type: String, example: 'NewDemo@12345', format: 'password', writeOnly: true })
  new_password: string;
}
