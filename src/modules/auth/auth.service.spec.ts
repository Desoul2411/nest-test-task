import { getRepositoryToken } from '@nestjs/typeorm';
import { CanActivate, HttpException, HttpStatus, NotFoundException, Param, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { generateString } from '../../utils/generators.utils';
import { Test } from '@nestjs/testing';
import { JwtService } from "@nestjs/jwt";
import { ValidationException } from "../../exceptions/validation.exception";
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";


describe('AuthService', () => {
    let usersService: UsersService;
    let authService: AuthService;
    let userRepository: Repository<User>;

/*     jest.mock('bcrypt', () => ({
        hash: jest.fn() 
    }));
 */
/*     jest.mock('../utils/functions-helpers/cipher.utils', () => ({
        encrypt: jest.fn(),
        decrypt: jest.fn(),
        hashToSha256: jest.fn(),
    })); */
    
    class UserRepositoryFake {
        public async save(): Promise<void> {}
        public async find(): Promise<void> {}
        public async findOne(): Promise<void> {}
    };  

    let passwordGenerated = generateString(12);
    let passwordHashed = generateString(60);
    const mockValue = {};
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyODRmNDg1Ni1jODNtLTExZWItkTJlNi0wMjQyYWMxNTAwMDIiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE2MjMyMzIzMDYsImV4cCI6MTYyMzMxODcwNn0.cfCpuIGVKW2j9bzRhCPChTq5CW8iEwajhs63TZk_RZs";
    const signMock = jest.fn(() => token);
    const userEmail = "Desoul40@mail.ru";
    const userId = 'df229c80-7432-4951-9f21-a1c5f803a738';

    const loginUserDataDto = {
        email: "Desoul40@mail.ru",
        password: passwordGenerated
    };

    const userData = {
        email : "Desoul40@mail.ru",
        password: passwordGenerated,
        role: "USER",
        name : "slava",
        birthdate: "20.11.1988",
        id: "df229c80-7432-4951-9f21-a1c5f803a738"
    };

    const registerUserDataDto = {
        email : "Desoul40@mail.ru",
        password: passwordGenerated,
        name : "slava",
        birthdate: "20.11.1988",
    };

    const createUserExpectedResult = {
        email : "Desoul40@mail.ru",
        password: passwordGenerated,
        role: "USER",
        name : "slava",
        birthdate: "20.11.1988",
        id: "df229c80-7432-4951-9f21-a1c5f803a738"
    };

    const loginUserExpectedResult = { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyODRmNDg1Ni1jODNtLTExZWItkTJlNi0wMjQyYWMxNTAwMDIiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE2MjMyMzIzMDYsImV4cCI6MTYyMzMxODcwNn0.cfCpuIGVKW2j9bzRhCPChTq5CW8iEwajhs63TZk_RZs" };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
          providers: [
            AuthService,
            UsersService,
            {
              provide: getRepositoryToken(User),
              useClass: UserRepositoryFake,
            },
            {
              provide: JwtService,
              useValue: {
                sign: signMock
              }
            }
          ],
        })
        .compile();
    
        authService = moduleRef.get<AuthService>(AuthService);
        usersService = moduleRef.get<UsersService>(UsersService);
        userRepository = moduleRef.get(getRepositoryToken(User));
    });


    describe('loginUser', () => {
        it('should call the inetrnal functions with correct parameters and return token object', async () => {
            const validateUserSpy = jest
            .spyOn(authService, 'validateUser')
            .mockResolvedValue(userData);

            const generateTokenSpy = jest
            .spyOn(authService, 'generateToken')
            .mockImplementation(() => loginUserExpectedResult);

            const res = await authService.loginUser(loginUserDataDto);

            expect(validateUserSpy).toHaveBeenCalledTimes(1);
            expect(generateTokenSpy).toHaveBeenCalledTimes(1);
            expect(validateUserSpy).toHaveBeenCalledWith(loginUserDataDto);
            expect(generateTokenSpy).toHaveBeenCalledWith(userData);
            expect(res).toEqual(loginUserExpectedResult);
        });
        
        it('should throw an error with status 401 and validation message "Invalid email or password"', async () => {
            jest
                .spyOn(authService, 'validateUser')
                .mockRejectedValue(new UnauthorizedException({ message: "Invalid email or password" }));

            jest
                .spyOn(authService, 'generateToken')
                .mockImplementation(() => loginUserExpectedResult);
            try {
                await authService.loginUser(loginUserDataDto);
            } catch (e) {
                expect(e.message).toBe('Invalid email or password');
                expect(e.status).toBe(401);
            }
        });

        it('should throw INTERNAL_SERVER_ERROR with status 500', async () => {
            jest
                .spyOn(authService, 'validateUser')
                .mockRejectedValue(new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR));

            jest
                .spyOn(authService, 'generateToken')
                .mockImplementation(() => loginUserExpectedResult);
            try {
                await authService.loginUser(loginUserDataDto);
            } catch (e) {
                expect(e.message).toBe('INTERNAL_SERVER_ERROR');
                expect(e.status).toBe(500);
            }
        });
    });

    describe('registerUser', () => {
        it('should call the internal functions with correct parameters and return registration success message ', async () => {


            const getUserByEmailSpy = jest
            .spyOn(usersService, 'getUserByEmail')
            .mockResolvedValue(undefined);
            //mockValue(passwordHashed)
        /*      (bcrypt.hash as jest.Mock).mockImplementation(
                () => passwordHashed,
            );
        */
            const createUserSpy = jest
            .spyOn(usersService, 'createUser')
            .mockResolvedValue(createUserExpectedResult);

            const res = await authService.registerUser(registerUserDataDto);

            expect(getUserByEmailSpy).toHaveBeenCalledTimes(1);
            expect(createUserSpy).toHaveBeenCalledTimes(1);
            expect(getUserByEmailSpy).toHaveBeenCalledWith(userEmail);
            expect(createUserSpy).toHaveBeenCalledWith({...registerUserDataDto, password: passwordHashed});
            expect(res).toEqual({ message: "Registered successfully!" });
        });
        












        /* it('should throw an error with status 401 and validation message "Invalid email or password"', async () => {
            jest
                .spyOn(usersService, 'getUserByEmail')
                .mockResolvedValue(undefined);

            jest
                .spyOn(authService, 'generateToken')
                .mockImplementation(() => loginUserExpectedResult);
            try {
                await authService.loginUser(loginUserDataDto);
            } catch (e) {
                expect(e.message).toBe('Invalid email or password');
                expect(e.status).toBe(401);
            }
        });

        it('should throw INTERNAL_SERVER_ERROR with status 500', async () => {
            jest
                .spyOn(authService, 'validateUser')
                .mockRejectedValue(new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR));

            jest
                .spyOn(authService, 'generateToken')
                .mockImplementation(() => loginUserExpectedResult);
            try {
                await authService.loginUser(loginUserDataDto);
            } catch (e) {
                expect(e.message).toBe('INTERNAL_SERVER_ERROR');
                expect(e.status).toBe(500);
            }
        }); */
    });
});