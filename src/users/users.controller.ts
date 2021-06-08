import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.auth.decorator';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { ErrorNotAthorized401, ErrorResponse403, ErrorResponse404, ErrorResponse500, ErrorValidation400 } from './error.type';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}
    // @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create user' })
    @ApiResponse({ status: 201, description: 'User created', type: User })
    @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponse500 })
    @ApiResponse({ status: 400, description: 'Validation error', type: ErrorValidation400 })
    @UsePipes(ValidationPipe)
    @Post()
    createUser(@Body() createUserDto: CreateUserDto) {
         return this.userService.createUser(createUserDto);
    }

    // @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Users received', type: [User] })
    @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponse500 })
    @Get()
    getAll() {
         return this.userService.getAllUsers();
    }
    
    @ApiOperation({ summary: 'Update user' })
    @ApiResponse({ status: 200, description: 'User updated', type: User })
    @ApiResponse({ status: 404, description: 'User is not found', type: ErrorResponse404 })
    @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponse500 })
    @ApiResponse({ status: 401, description: 'User is not authorized', type: ErrorNotAthorized401 })
    @ApiResponse({ status: 403, description: 'Access forbidden', type: ErrorResponse403 })
    @ApiResponse({ status: 400, description: 'Validation error', type: ErrorValidation400 })
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @UsePipes(ValidationPipe)
    @Put(':id')
    async updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
         const updatedUser = await this.userService.updateUser(id, updateUserDto);

         if(updatedUser === null) {
               throw new HttpException('No such user!', HttpStatus.NOT_FOUND);
         }
         
         return updatedUser;
    }
}
