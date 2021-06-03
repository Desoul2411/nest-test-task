import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'desoul2411@gmail.com', description: 'user email' })
    @IsString()
    @IsNotEmpty()
    readonly email: string;

    @ApiProperty({ example: 'Of0klnHCtNmzdO6qCNDejkfebDCGTh1HdESK7uf1Awl3a', description: 'user password hashed' })
    @IsString()
    @IsNotEmpty()
    readonly password: string;
/*     readonly role: string; */

    @ApiProperty({ example: 'Slava', description: 'user name' })
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ example: '20.11.88', description: 'user bithdate' })
    @IsString()
    @IsNotEmpty()
    readonly birthdate: string;
}