import { getRepositoryToken } from "@nestjs/typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { generateString } from "../../utils/generators.utils";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { LoginUserDto } from "../users/dto/login-user-dto";
import {
  ReigestrationSuccessResponse,
  TokenResponse,
} from "src/types/auth.type";
import { CreateUserDto } from "../users/dto/create-user.dto";

describe("AuthController", () => {
  let authController: AuthController;

  const loginUserMock = jest.fn();
  const registerUserMock = jest.fn();
  const mockValue = {};

  const passwordGenerated = generateString(12);

  const loginUserDataDto: LoginUserDto = {
    email: "desoul2411@gmail.com",
    password: passwordGenerated,
  };

  const loginUserExpectedResult: TokenResponse = {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyODRmNDg1Ni1jODNtLTExZWItkTJlNi0wMjQyYWMxNTAwMDIiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE2MjMyMzIzMDYsImV4cCI6MTYyMzMxODcwNn0.cfCpuIGVKW2j9bzRhCPChTq5CW8iEwajhs63TZk_RZs",
  };

  const registerUserDataDto: CreateUserDto = {
    email: "desoul2411@gmail.com",
    password: passwordGenerated,
    name: "John",
    birthdate: "20.11.88",
  };

  const registerUserExpectedResult: ReigestrationSuccessResponse = {
    message: "Registered successfully!",
  };

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
          useValue: mockValue,
        },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
  });

  describe("login", () => {
    it("should be called with passed data once", async () => {
      await authController.login(loginUserDataDto);
      expect(loginUserMock).toHaveBeenCalledTimes(1);
      expect(loginUserMock).toHaveBeenCalledWith(loginUserDataDto);
    });

    it("should return token - success", async () => {
      loginUserMock.mockResolvedValue(loginUserExpectedResult);
      expect(await authController.login(loginUserDataDto)).toEqual(
        loginUserExpectedResult
      );
    });

    it("should throw an error with status 500 and error message - fail", async () => {
      loginUserMock.mockResolvedValue(
        new HttpException(
          "INTERNAL_SERVER_ERROR",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      try {
        await authController.login(loginUserDataDto);
      } catch (e) {
        expect(e.message).toBe("INTERNAL_SERVER_ERROR");
        expect(e.status).toBe(500);
      }
    });
  });

  describe("registration", () => {
    it("should be called with passed data once", async () => {
      await authController.registration(registerUserDataDto);
      expect(registerUserMock).toHaveBeenCalledTimes(1);
      expect(registerUserMock).toHaveBeenCalledWith(registerUserDataDto);
    });

    it('should return confirmation message "Registered successfully!"', async () => {
      registerUserMock.mockResolvedValue(registerUserExpectedResult);
      expect(await authController.registration(registerUserDataDto)).toEqual(
        registerUserExpectedResult
      );
    });

    it("should throw an error with status 500 and error message - fail", async () => {
      registerUserMock.mockResolvedValue(
        new HttpException(
          "INTERNAL_SERVER_ERROR",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      try {
        await authController.login(loginUserDataDto);
      } catch (e) {
        expect(e.message).toBe("INTERNAL_SERVER_ERROR");
        expect(e.status).toBe(500);
      }
    });

    it('should throw an error with status 400 and error message "User with this email already exists" - fail', async () => {
      registerUserMock.mockRejectedValue(
        new HttpException(
          "User with this email already exists",
          HttpStatus.BAD_REQUEST
        )
      );

      try {
        await authController.registration(registerUserDataDto);
      } catch (e) {
        expect(e.message).toBe("User with this email already exists");
        expect(e.status).toBe(400);
      }
    });
  });
});
