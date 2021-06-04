import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEAN, IsEmail, Length } from 'class-validator';

export class UpdateUserDto {
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