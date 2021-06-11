import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { User } from "../users/entities/user.entity";
import { LoginUserDto } from "../users/dto/login-user-dto";

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  async loginUser(userDto: LoginUserDto) {
    const user = await this.validateUser(userDto);
    if (user)
    return this.generateToken(user);
  }

  async registerUser(userDto: CreateUserDto) {
    const candidate = await this.userService.getUserByEmail(userDto.email);
    if (candidate) {
      throw new HttpException(
        "User with this email already exists",
        HttpStatus.BAD_REQUEST
      );
    }

    const passwordHashed = await bcrypt.hash(userDto.password, 5);
    await this.userService.createUser({ ...userDto, password: passwordHashed });

    return { message: "Registered successfully!" };
  }

  generateToken(user: User) {
    const payload = { userId: user.id, role: user.role };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async validateUser(userDto: LoginUserDto): Promise<User | void> {
    const user = await this.userService.getUserByEmail(userDto.email);
    const isPasswordsMatch = await bcrypt.compare(
      userDto.password,
      user.password
    );

    if (user && isPasswordsMatch) {
      return user;
    };

    throw new UnauthorizedException({ message: "Invalid email or password" });
  }
}
