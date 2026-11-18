import {
  IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  full_name: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,20}$/, {
    message: 'password must contain uppercase, lowercase, number and special character, with 8 to 20 characters',
  })
  password: string;
}
