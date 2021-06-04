import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEAN, IsEmail, Length } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'desoul2411@gmail.com', description: 'user email' })
    @IsEmail({},{message: 'invalid email'})
    @IsString({message: 'must be a string'})
    @IsNotEmpty({message: 'The field must not be empty!'})
    readonly email: string;

    @ApiProperty({ example: 'Of0klnHCtNmzdO6qCNDejkfebDCGTh1HdESK7uf1Awl3a', description: 'user password hashed' })
    @IsString({message: 'Must be a string'})
    @IsNotEmpty({message: 'The field must not be empty!'})
    @Length(5,14, {message: 'must be between 5 and 14 characters'})
    readonly password: string;
/*     readonly role: string; */

    @ApiProperty({ example: 'Slava', description: 'user name' })
    @IsString({message: 'must be a string'})
    @IsNotEmpty({message: 'The field must not be empty!'})
    readonly name: string;

    @ApiProperty({ example: '20.11.88', description: 'user bithdate' })
    @IsString({message: 'must be a string'})
    @IsNotEmpty({message: 'The field must not be empty!'})
    readonly birthdate: string;
}