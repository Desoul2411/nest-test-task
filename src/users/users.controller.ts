import { Body, Controller, Get, Param, Post, Put, UseGuards, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/rolse.auth.decorator';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Post()
    createUser(@Body() createUserDto: CreateUserDto) {
         console.log(createUserDto);
         return this.userService.createUser(createUserDto);
    }

    @Get()
    getAll() {
         return this.userService.getAllUsers();
    }

    //@UseGuards(JwtAuthGuard)
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @UsePipes(ValidationPipe)
    @Put(':id')
    updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
         return this.userService.updateUser(id, updateUserDto);
    }
}
