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
import { register_user_data, token_response } from "./test-data/auth.test-data";

describe("AuthController", () => {
  let authController: AuthController;

  const loginUserMock = jest.fn();
  const registerUserMock = jest.fn();
  const mockValue = {};

  let registerUserDataDto: CreateUserDto;
  let loginUserDataDto: LoginUserDto;
  let loginUserExpectedResult: TokenResponse;

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
    it('should call "loginUser" function with passed data once when user try to log in', async () => {
      loginUserDataDto = {...register_user_data, password: generateString(12)};

      await authController.login(loginUserDataDto);
      expect(loginUserMock).toHaveBeenCalledTimes(1);
      expect(loginUserMock).toHaveBeenCalledWith(loginUserDataDto);
    });

    it("should return token when user try to log in with correct login data - success", async () => {
      loginUserDataDto = {...register_user_data, password: generateString(12)};
      loginUserExpectedResult = {...token_response};
      
      loginUserMock.mockResolvedValue(loginUserExpectedResult);
      expect(await authController.login(loginUserDataDto)).toEqual(
        loginUserExpectedResult
      );
    });
  });

  describe("registration", () => {
    it('should call "registerUser" function with passed data once when user try to register', async () => {
      registerUserDataDto = {...register_user_data, password: generateString(12)};

      await authController.registration(registerUserDataDto);
      expect(registerUserMock).toHaveBeenCalledTimes(1);
      expect(registerUserMock).toHaveBeenCalledWith(registerUserDataDto);
    });

    it('should return confirmation message "Registered successfully!" when user try to register with valid data', async () => {
      registerUserDataDto = {...register_user_data, password: generateString(12)};

      registerUserMock.mockResolvedValue(registerUserExpectedResult);
      expect(await authController.registration(registerUserDataDto)).toEqual(
        registerUserExpectedResult
      );
    });

    it('should throw an error with status 400 and error message "User with this email already exists" when user try to register with an email that already exists - fail', async () => {
      registerUserDataDto = {...register_user_data, password: generateString(12)};

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
