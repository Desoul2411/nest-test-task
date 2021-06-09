import { Injectable, NotFoundException } from "@nestjs/common";
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

  async createUser(dto: CreateUserDto) {
    const { email, password, name, birthdate } = dto;
    const user = new User();
    user.email = email;
    user.password = password;
    user.role = "USER";
    user.name = name;
    user.birthdate = birthdate;

    return this.userRepository.save(user);
  }

  async getAllUsers() {
    const users = await this.userRepository.find();
    return users;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ email });
    return user;
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({ id });

    if (!user) {
      throw new NotFoundException("No such user!");
    }

    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const { name, birthdate } = dto;
    const user = await this.getUserById(id);
    user.name = name;
    user.birthdate = birthdate;

    return this.userRepository.save(user);
  }
}
