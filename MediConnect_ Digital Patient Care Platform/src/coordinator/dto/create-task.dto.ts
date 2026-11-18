import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  requestId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  coordinatorId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  note: string;
}
