import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const { email, password, name, birthdate } = dto;
    const user = new User();
    user.email = email;
    user.password = password;
    user.role = "USER";
    user.name = name;
    user.birthdate = birthdate;

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if (error.errno == 1062) {
        throw new HttpException(
          "User with this email already exists",
          HttpStatus.BAD_REQUEST
        );
      }
    }
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find();

    return users;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ email });

    return user;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ id });

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: "No such user!",
      });
    }

    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const { name, birthdate } = dto;
    const user = await this.getUserById(id);
    user.name = name;
    user.birthdate = birthdate;

    return this.userRepository.save(user);
  }

  async deleteUserById(id: string): Promise<User> {
    const user = await this.getUserById(id);
    return this.userRepository.remove(user);
  }
}
