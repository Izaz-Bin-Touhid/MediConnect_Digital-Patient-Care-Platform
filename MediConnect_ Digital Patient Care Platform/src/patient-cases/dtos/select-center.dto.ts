import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SelectCenterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  centerId: string;
}
