import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

@Entity({name: 'users'})
export class User {
    @ApiProperty({ example: '1', description: 'User Id' })
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @ApiProperty({ 
        example: 'desoul2411@gmail.com', 
        description: 'user email' 
    }) 

    @IsNotEmpty()
    @Column({unique: true})
    @IsString()
    email: string;

    @IsNotEmpty()
    @Column()
    @IsString()
    password: string;

    @IsNotEmpty()
    @Column()
    @IsString()
    role: string;

    @IsNotEmpty()
    @Column()
    @IsString()
    name: string;

    @IsNotEmpty()
    @Column()
    @IsString()
    birthdate: string;

 /*    @OneToOne(() => CapitalLocation, capital_location => capital_location.country, {cascade: true})
    @JoinColumn()
    capital_location: Promise<CapitalLocation>;

    @OneToMany(type => Localization, (localization) => localization.country, {cascade: true})
    localizations: Promise<Localization[]>; */
}
