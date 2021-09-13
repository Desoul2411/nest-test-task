import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.auth.decorator";
import { ValidationPipe } from "../../pipes/validation.pipe";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { User } from "./entities/user.entity";
import {
  ErrorEmailExists400,
  ErrorUserIsNotAithorized401,
  ErrorResponse403,
  ErrorResponse404,
} from "../../types/error.type";
import { UserDeleted } from "../../types/user.type";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @ApiOperation({ summary: "Create user" })
  @ApiCreatedResponse({ description: "User created", type: User })
  @ApiBadRequestResponse({
    description: "Bad request",
    type: ErrorEmailExists400,
  })
  @UsePipes(ValidationPipe)
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @ApiOperation({ summary: "Get all users" })
  @ApiOkResponse({ description: "Users received", type: [User] })
  @Get()
  getAll(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @ApiOperation({ summary: "Update user" })
  @ApiOkResponse({ description: "User updated", type: User })
  @ApiNotFoundResponse({
    description: "User is not found",
    type: ErrorResponse404,
  })
  @ApiUnauthorizedResponse({
    description: "User is not authorized!",
    type: ErrorUserIsNotAithorized401,
  })
  @ApiForbiddenResponse({
    description: "Access forbidden",
    type: ErrorResponse403,
  })
  @Roles("ADMIN")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @ApiOperation({ summary: "Delete user" })
  @ApiOkResponse({ description: "User deleted", type: UserDeleted })
  @ApiNotFoundResponse({
    description: "User is not found",
    type: ErrorResponse404,
  })
  @Delete(":id")
  async delete(@Param("id") id: string): Promise<User> {
    return this.userService.deleteUserById(id);
  }
}
