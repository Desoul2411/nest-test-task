import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ValidationPipe } from "../../pipes/validation.pipe";
import {
  ReigestrationSuccessResponse,
  TokenResponse,
} from "../../types/auth.type";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginUserDto } from "../users/dto/login-user-dto";
import {
  ErrorEmailExists400,
  ErrorResponse500,
  ErrorValidation400,
  ErrorResponse404,
  ErrorNotAthorized401,
} from "../../types/error.type";
import { AuthService } from "./auth.service";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "Log in" })
  @ApiResponse({
    status: 201,
    description: "Logged in",
    type: TokenResponse,
  })
  @ApiResponse({
    status: 401,
    description: "Invalid password!",
    type: ErrorNotAthorized401,
  })
  @ApiResponse({
    status: 404,
    description: "No such user!",
    type: ErrorResponse404,
  })
  @ApiResponse({
    status: 400,
    description: "Validation error",
    type: ErrorValidation400,
  })
  @UsePipes(ValidationPipe)
  @Post("/login")
  login(@Body() userDto: LoginUserDto): Promise<TokenResponse> {
    return this.authService.loginUser(userDto);
  }

  @ApiOperation({ summary: "Register" })
  @ApiResponse({
    status: 201,
    description: "User registered",
    type: ReigestrationSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
    type: ErrorEmailExists400,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: ErrorResponse500,
  })
  @UsePipes(ValidationPipe)
  //@UseFilters(new HttpExceptionFilter())
  @Post("/registration")
  registration(
    @Body() userDto: CreateUserDto
  ): Promise<ReigestrationSuccessResponse> {
    return this.authService.registerUser(userDto);
  }
}
