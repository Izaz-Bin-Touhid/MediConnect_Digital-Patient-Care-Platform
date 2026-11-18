import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AccountLoginDto {
  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;
}
