import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class ChangeAdminPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  current_password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,20}$/, {
    message:
      'new_password must contain uppercase, lowercase, number and special character, with 8 to 20 characters',
  })
  new_password: string;
}
