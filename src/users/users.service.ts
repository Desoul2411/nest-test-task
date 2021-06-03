import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    async createUser(dto: CreateUserDto) {
        const {email, password, /* role,  */name, birthdate}  = dto;

        try {
            const user = new User();
            user.email = email;
            user.password = password;
            user.role = 'user';
            user.name = name;
            user.birthdate = birthdate;
      
            return this.userRepository.save(user);
          } catch (error) {
              throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }

    async getAllUsers(){
       const users = await this.userRepository.find();
       return users;
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({ email });
        return user;
    }
}
