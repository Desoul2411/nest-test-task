import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    async createUser(dto: CreateUserDto) {
        const {email, password, name, birthdate}  = dto;

        try {
            const user = new User();
            user.email = email;
            user.password = password;
            user.role = 'USER';
            user.name = name;
            user.birthdate = birthdate;
      
            return this.userRepository.save(user);
        } catch (error) {
            throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllUsers(){
        try {
            const users = await this.userRepository.find();
            return users;
        } catch (error) {
            throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({ email });

        return user;
    }

    async updateUser(id: number, dto: UpdateUserDto) {
        try {
            const { name, birthdate }  = dto;
            const user = await this.userRepository.findOne({ id });

            if (!user) 
            return null;

            user.name = name;
            user.birthdate = birthdate;

            return this.userRepository.save(user);
        } catch (error) {
              throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
