import { ApiProperty } from "@nestjs/swagger";
import { User } from "../modules/users/entities/user.entity";

export class UserDeleted {
  @ApiProperty({
    example: "desoul2411@gmail.com",
    description: "user email",
  })
  email: string;

  @ApiProperty({
    example: "XbsfRuHRPP5iY2YLssrX0eyhWgY8eddMTzjZICj8W2sEbLG6MnbxC",
    description: "user password hashed",
  })
  password: string;

  @ApiProperty({
    example: "USER",
    description: "user role",
  })
  role: string;

  @ApiProperty({
    example: "Slava",
    description: "user name",
  })
  name: string;

  @ApiProperty({
    example: "20.11.88",
    description: "user birthdate",
  })
  birthdate: string;
}
