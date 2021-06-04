import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({name: 'users'})
export class User {
    @ApiProperty({ example: '1', description: 'id' })
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @ApiProperty({ 
        example: 'desoul2411@gmail.com', 
        description: 'user email' 
    }) 

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column()
    role: string;

    @Column()
    name: string;

    @Column()
    birthdate: string;

 /*    @OneToOne(() => CapitalLocation, capital_location => capital_location.country, {cascade: true})
    @JoinColumn()
    capital_location: Promise<CapitalLocation>;

    @OneToMany(type => Localization, (localization) => localization.country, {cascade: true})
    localizations: Promise<Localization[]>; */
}
