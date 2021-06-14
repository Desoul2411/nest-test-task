import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEmail, Length } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "desoul2411@gmail.com", description: "user email" })
  @IsEmail({}, { message: "invalid email" })
  @IsString({ message: "must be a string" })
  @IsNotEmpty({ message: "The field must not be empty!" })
  readonly email: string;

  @ApiProperty({
    example: "asdw33fdfgFss",
    description: "user password hashed",
  })
  @IsString({ message: "must be a string" })
  @IsNotEmpty({ message: "the field must not be empty!" })
  readonly password: string;
  /*     readonly role: string; */

  @ApiProperty({ example: "Slava", description: "user name" })
  @IsString({ message: "must be a string" })
  @IsNotEmpty({ message: "The field must not be empty!" })
  readonly name: string;

  @ApiProperty({ example: "20.11.88", description: "user bithdate" })
  @IsString({ message: "must be a string" })
  @IsNotEmpty({ message: "The field must not be empty!" })
  readonly birthdate: string;
}
