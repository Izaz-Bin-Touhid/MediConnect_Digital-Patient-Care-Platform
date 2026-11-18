import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegistrationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  patientId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,20}$/, {
    message:
      'password should have at least one lowercase, one uppercase, one special character, one number and length should be between 8 to 20 characters',
  })
  password: string;
}
