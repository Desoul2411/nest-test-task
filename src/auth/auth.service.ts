import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { LoginUserDto } from 'src/users/dto/login-user-dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) {}

    async login(userDto: LoginUserDto) {
        const user = await this.validateUser(userDto);
        return this.generateToken(user);
    }

    async registration(userDto: CreateUserDto) {
        const candidate = await this.userService.getUserByEmail(userDto.email);
        if (candidate) {
            throw new HttpException("User with this email already exists", HttpStatus.BAD_REQUEST);
        }

        try {
            const passwordHashed = await bcrypt.hash(userDto.password, 5);
            await this.userService.createUser({...userDto, password: passwordHashed});

            return 'Registered successfully!'
        } catch (error) {
            throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    private generateToken(user: User) {
        const payload = {userId: user.id, role: user.role};
        return {
            token: this.jwtService.sign(payload)
        }
    }

    private async validateUser(userDto: LoginUserDto) {
        const user = await this.userService.getUserByEmail(userDto.email);
        const isPasswordsMatch = await bcrypt.compare(userDto.password, user.password);

        if(user && isPasswordsMatch) {
            return user;
        }

        throw new UnauthorizedException({message: 'Invalid email or password'});
    }
}
