import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ArrangeTestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  centerId: string;
}
