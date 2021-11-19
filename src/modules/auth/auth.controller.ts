import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ValidationPipe } from "../../pipes/validation.pipe";
import {
  ReigestrationSuccessResponse,
  TokenResponse,
} from "../../types/auth.type";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginUserDto } from "../users/dto/login-user-dto";
import {
  ErrorEmailExists400,
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
  @ApiCreatedResponse({ description: "Logged in", type: TokenResponse })
  @ApiUnauthorizedResponse({ description: "Invalid password!", type: ErrorNotAthorized401 })
  @ApiNotFoundResponse({ description: "No such user!", type: ErrorResponse404 })
  @ApiBadRequestResponse({ description: "Validation error", type: ErrorValidation400 })
  @UsePipes(ValidationPipe)
  @Post("/login")
  login(@Body() userDto: LoginUserDto): Promise<TokenResponse> {
    return this.authService.loginUser(userDto);
  }

  @ApiOperation({ summary: "Register" })
  @ApiCreatedResponse({ description: "User registered", type: ReigestrationSuccessResponse })
  @ApiBadRequestResponse({ description: "Bad request", type: ErrorEmailExists400 })
  @UsePipes(ValidationPipe)
  @Post("/registration")
  registration(
    @Body() userDto: CreateUserDto
  ): Promise<ReigestrationSuccessResponse> {
    return this.authService.registerUser(userDto);
  }
}
