import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: "users" })
export class User {
  @ApiProperty({
    example: "4df98d32-87fc-41f5-a787-f2db34580286",
    description: "user id",
  })
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @ApiProperty({
    example: "desoul2411@gmail.com",
    description: "user email",
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: "XbsfRuHRPP5iY2YLssrX0eyhWgY8eddMTzjZICj8W2sEbLG6MnbxC",
    description: "user password hashed",
  })
  @Column()
  password: string;

  @ApiProperty({
    example: "USER",
    description: "user role",
  })
  @Column()
  role: string;

  @ApiProperty({
    example: "Slava",
    description: "user name",
  })
  @Column()
  name: string;

  @ApiProperty({
    example: "20.11.88",
    description: "user birthdate",
  })
  @Column()
  birthdate: string;
}
