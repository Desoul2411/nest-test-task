import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginUserDto } from 'src/users/dto/login-user-dto';
import { ErrorResponse401, ErrorEmailExists400, ErrorResponse500, ErrorValidation400 } from 'src/users/error.type';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}


    @ApiOperation({ summary: 'Log in' })
    @ApiResponse({ status: 200, description: 'Logged in' })
    @ApiResponse({ status: 401, description: 'Invalid email and password', type: ErrorResponse401 })
    @ApiResponse({ status: 400, description: 'Validation error', type: ErrorValidation400 })
    @UsePipes(ValidationPipe)
    @Post('/login')
    login(@Body() userDto: LoginUserDto) {
        return this.authService.login(userDto);
    }

    @ApiOperation({ summary: 'Register' })
    @ApiResponse({ status: 200, description: 'User registered' })
    @ApiResponse({ status: 400, description: 'Bad request', type: ErrorEmailExists400 })
    @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponse500 })
    @UsePipes(ValidationPipe)
    @Post('/registration')
    registration(@Body() userDto: CreateUserDto) {
        return this.authService.registration(userDto);
    }
}
