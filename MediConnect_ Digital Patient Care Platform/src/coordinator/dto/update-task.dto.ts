import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  note: string;
}
