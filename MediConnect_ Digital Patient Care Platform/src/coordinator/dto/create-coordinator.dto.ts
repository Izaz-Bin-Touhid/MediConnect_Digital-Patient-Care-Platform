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
  fullName: string;

  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  staffId: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
