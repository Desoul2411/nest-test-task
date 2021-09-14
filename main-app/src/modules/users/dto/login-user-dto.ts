import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEmail, Length } from "class-validator";

export class LoginUserDto {
  @ApiProperty({ example: "desoul2411@gmail.com", description: "user email" })
  @IsEmail({}, { message: "Invalid email" })
  @IsString({ message: "must be a string" })
  @IsNotEmpty({ message: "The field must not be empty!" })
  readonly email: string;

  @ApiProperty({ example: "232chipsvcS", description: "user password hashed" })
  @IsString({ message: "must be a string" })
  @IsNotEmpty({ message: "the field must not be empty!" })
  @Length(5, 14, { message: "must be between 5 and 14 characters" })
  readonly password: string;
}
