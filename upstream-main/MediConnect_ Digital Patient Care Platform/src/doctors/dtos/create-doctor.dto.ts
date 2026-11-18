import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  full_name: string;

  @IsString()
  @IsNotEmpty()
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
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,20}$/,
    {
      message:
        'password should have at least one lowercase, one uppercase, one special character, one number and length should be between 8 to 20 characters',
    },
  )
  password: string;
}