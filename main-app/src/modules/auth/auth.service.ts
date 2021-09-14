import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { User } from "../users/entities/user.entity";
import { LoginUserDto } from "../users/dto/login-user-dto";
import {
  TokenResponse,
  ReigestrationSuccessResponse,
} from "src/types/auth.type";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    @Inject("AUTH_LOG_SERVICE") private readonly client: ClientProxy
  ) {}

  async loginUser(userDto: LoginUserDto): Promise<TokenResponse> {
    const user = await this.validateUser(userDto);

    if (user) {
      this.logUser(user.id, user.name, user.email);
      return this.generateToken(user);
    }
  }

  async registerUser(
    userDto: CreateUserDto
  ): Promise<ReigestrationSuccessResponse> {
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

  async generateToken(user: User): Promise<TokenResponse> {
    const payload = {
      userId: user.id,
      role: user.role,
    };

    return {
      token: await this.jwtService.sign(payload),
    };
  }

  async validateUser(userDto: LoginUserDto): Promise<User> {
    const user = await this.userService.getUserByEmail(userDto.email);

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "No such user!",
      });
    }

    const isPasswordsMatch = await bcrypt.compare(
      userDto.password,
      user.password
    );

    if (user && isPasswordsMatch) {
      return user;
    }

    throw new UnauthorizedException({ message: "Invalid password!" });
  }

  private logUser = (id: string, name: string, email: string): void => {
    this.client.emit("log_user", {
      user: { id, name, email },
      login_date: new Date().toLocaleString(),
    });
  };
}
