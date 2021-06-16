import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseFilters,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.auth.decorator";
import { ValidationPipe } from "../../pipes/validation.pipe";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "./entities/user.entity";
import {
  ErrorEmailExists400,
  ErrorUserIsNotAithorized401,
  ErrorResponse403,
  ErrorResponse404,
  ErrorResponse500,
} from "../../types/error.type";
import { HttpExceptionFilter } from "../../filters/http-exeption.filter";
import { UserDeleted } from "../../types/user.type";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Create user" })
  @ApiResponse({ status: 201, description: "User created", type: User })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: ErrorResponse500,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorEmailExists400,
  })
  @UsePipes(ValidationPipe)
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "Users received", type: [User] })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: ErrorResponse500,
  })
  @Get()
  getAll(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @ApiOperation({ summary: "Update user" })
  @ApiResponse({ status: 200, description: "User updated", type: User })
  @ApiResponse({
    status: 404,
    description: "User is not found",
    type: ErrorResponse404,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: ErrorResponse500,
  })
  @ApiResponse({
    status: 401,
    description: "User is not authorized!",
    type: ErrorUserIsNotAithorized401,
  })
  @ApiResponse({
    status: 403,
    description: "Access forbidden",
    type: ErrorResponse403,
  })
  @Roles("ADMIN")
  @UseGuards(RolesGuard)
  // @UseFilters(new HttpExceptionFilter())
  @Put(":id")
  async update (
    @Param("id") id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @ApiOperation({ summary: "Delete user" })
  @ApiResponse({ status: 200, description: "User deleted", type: UserDeleted })
  @ApiResponse({
    status: 404,
    description: "User is not found",
    type: ErrorResponse404,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: ErrorResponse500,
  })
  @Delete(":id")
	async delete(@Param("id") id: string)  {
		return this.userService.deleteUserById(id);
	}
}
