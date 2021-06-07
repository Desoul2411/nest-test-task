import { Body, Controller, Get, Param, Post, Put, UseGuards, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.auth.decorator';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @ApiOperation({ summary: 'Create user' })
    @ApiResponse({ status:200, type: User })
    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Post()
    createUser(@Body() createUserDto: CreateUserDto) {
         console.log(createUserDto);
         return this.userService.createUser(createUserDto);
    }

    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status:200, type: [User] })
    @Get()
    getAll() {
         return this.userService.getAllUsers();
    }


    
    @ApiOperation({ summary: 'Update user' })
    @ApiResponse({ status:200, type: User })
    @Roles('ADMIN')
    @UseGuards(JwtAuthGuard)
    @UseGuards(RolesGuard)
    @UsePipes(ValidationPipe)
    @Put(':id')
    updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
         return this.userService.updateUser(id, updateUserDto);
    }
}
