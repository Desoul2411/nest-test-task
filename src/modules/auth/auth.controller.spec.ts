import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus, NotFoundException, Param } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { generateString } from '../../utils/generators.utils';
import { Test } from '@nestjs/testing';
import { JwtService } from "@nestjs/jwt";


describe('AuthController', () => {
  let authController: AuthController;

  const mockValue = {};

  const loginUserMock = jest.fn();
  const registerUserMock = jest.fn();


  let passwordGeneratedUnhashed = generateString(12);
  let passwordGeneratedHashed = generateString(64);
  let tokenGenerated = generateString(64);
  
  const loginUserDataDto = {
      email: "desoul2411@gmail.com",
      password: passwordGeneratedUnhashed
  };

/*   const invalidLoginUserDataDto = {
    email: "desoul2411@gmail.com",
    password: 233423412
  } */

  const loginUserExpectedResult = {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyODRmNDg1Ni1jODNtLTExZWItkTJlNi0wMjQyYWMxNTAwMDIiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE2MjMyMzIzMDYsImV4cCI6MTYyMzMxODcwNn0.cfCpuIGVKW2j9bzRhCPChTq5CW8iEwajhs63TZk_RZs"
  };

  const registerUserDataDto = {
    email: "desoul2411@gmail.com",
    password: passwordGeneratedUnhashed,
    name: "John",
    birthdate: "20.11.88"
  };

  const registerUserExpectedResult = {
    message: "Registered successfully!"
  };

  //const validationMessageHttpExceptionExample = "password - must be between 5 and 14 characters, Must be a string";


  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthController,
        AuthService,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockValue,
        },
        {
          provide: AuthService,
          useValue: {
            loginUser: loginUserMock,
            registerUser: registerUserMock,
          },
        },
        {
          provide: JwtService,
          useValue: mockValue
        }
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should be called with passed data once', async () => {
      await authController.login(loginUserDataDto);
      expect(loginUserMock).toHaveBeenCalledTimes(1);
      expect(loginUserMock).toHaveBeenCalledWith(loginUserDataDto);
    });

    it('should return token - success', async () => {
      loginUserMock.mockResolvedValue(loginUserExpectedResult);
      expect(await authController.login(loginUserDataDto)).toEqual(loginUserExpectedResult);
    });

    it('should throw an error with status 500 and error message - fail', async () => {
      loginUserMock.mockResolvedValue(new HttpException("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR));
      
      try {
        await authController.login(loginUserDataDto);
      } catch (e) {
        expect(e.message).toBe('INTERNAL_SERVER_ERROR');
        expect(e.status).toBe(500);
      }
    });
  });

  describe('registration', () => {
    it('should be called with passed data once', async () => {
      await authController.registration(registerUserDataDto);
      expect(registerUserMock).toHaveBeenCalledTimes(1);
      expect(registerUserMock).toHaveBeenCalledWith(registerUserDataDto);
    });

    it('should return token - success', async () => {
      registerUserMock.mockResolvedValue(registerUserExpectedResult);
      expect(await authController.registration(registerUserDataDto)).toEqual(registerUserExpectedResult);
    });

    it('should throw an error with status 500 and error message - fail', async () => {
      registerUserMock.mockResolvedValue(new HttpException("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR));
      
      try {
        await authController.login(loginUserDataDto);
      } catch (e) {
        expect(e.message).toBe('INTERNAL_SERVER_ERROR');
        expect(e.status).toBe(500);
      }
    });

    it('should throw an error with status 400 and error message "User with this email already exists" - fail', async () => {
      registerUserMock.mockRejectedValue(new HttpException("User with this email already exists", HttpStatus.BAD_REQUEST));

      try {
        await authController.registration(registerUserDataDto);
      } catch (e) {
        expect(e.message).toBe("User with this email already exists");
        expect(e.status).toBe(400);
      }
    });
  });
});
  