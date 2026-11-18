import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  note: string;
}
