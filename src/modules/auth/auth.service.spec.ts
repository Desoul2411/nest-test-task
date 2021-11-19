import { getRepositoryToken } from "@nestjs/typeorm";
import {
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { Generator as generator } from "../../utils/generator.utils";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginUserDto } from "../users/dto/login-user-dto";
import { CreateUserDto } from "../users/dto/create-user.dto";
import {
  login_user_data,
  user_data,
  user_data_to_token,
  register_user_data,
  create_user_result,
  token_value,
  user_email,
} from "./test-data/auth.test-data";

describe("AuthService", () => {
  let usersService: UsersService;
  let authService: AuthService;
  let jwtService: JwtService;

  class UserRepositoryFake {
    public async save(): Promise<void> {}
    public async find(): Promise<void> {}
    public async findOne(): Promise<void> {}
  }

  const token: string = token_value;
  const userEmail: string = user_email;
  const signMock = jest.fn(() => token);
  const tokenResult = { token: token_value };

  let loginUserDataDto: LoginUserDto;
  let userData: User;
  let userDataToToken;
  let registerUserDataDto: CreateUserDto;
  let createUserExpectedResult: User;

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
            sign: signMock,
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  describe("loginUser", () => {
    it("should call the inetrnal functions with correct parameters and return token object when user try to log in with correct login data", async () => {
      loginUserDataDto = { ...login_user_data, password: generator.generateString(12) };
      userData = { ...user_data, password: bcrypt.hash(generator.generateString(12), 5) };

      const validateUserSpy = jest
        .spyOn(authService, "validateUser")
        .mockResolvedValue(userData);

      const generateTokenSpy = jest
        .spyOn(authService, "generateToken")
        .mockResolvedValue(tokenResult);

      const res = await authService.loginUser(loginUserDataDto);

      expect(validateUserSpy).toHaveBeenCalledTimes(1);
      expect(generateTokenSpy).toHaveBeenCalledTimes(1);
      expect(validateUserSpy).toHaveBeenCalledWith(loginUserDataDto);
      expect(generateTokenSpy).toHaveBeenCalledWith(userData);
      expect(res).toEqual(tokenResult);
    });

    it('should throw an error with status 401 and validation message "Invalid email or password when user try to log in with invalid password or email"', async () => {
      loginUserDataDto = { ...login_user_data, password: generator.generateString(12) };

      jest
        .spyOn(authService, "validateUser")
        .mockRejectedValue(
          new UnauthorizedException({ message: "Invalid email or password" })
        );

      jest.spyOn(authService, "generateToken").mockResolvedValue(tokenResult);
      try {
        await authService.loginUser(loginUserDataDto);
      } catch (e) {
        expect(e.message).toBe("Invalid email or password");
        expect(e.status).toBe(401);
      }
    });

    it('should throw an error with status 404 and message "No such user!" when user try to log in with an email that is not registered in the database"', async () => {
      loginUserDataDto = { ...login_user_data, password: generator.generateString(12) };

      jest
        .spyOn(authService, "validateUser")
        .mockRejectedValue(new NotFoundException({ message: "No such user!" }));

      jest.spyOn(authService, "generateToken").mockResolvedValue(tokenResult);
      try {
        await authService.loginUser(loginUserDataDto);
      } catch (e) {
        expect(e.message).toBe("No such user!");
        expect(e.status).toBe(404);
      }
    });
  });

  describe("registerUser", () => {
    it("should call the internal functions with correct parameters and return registration success message", async () => {
      registerUserDataDto = {
        ...register_user_data,
        password: generator.generateString(12),
      };
      createUserExpectedResult = {
        ...create_user_result,
        password: bcrypt.hash(generator.generateString(12), 5),
      };

      const getUserByEmailSpy = jest
        .spyOn(usersService, "getUserByEmail")
        .mockResolvedValue(undefined);

      const createUserSpy = jest
        .spyOn(usersService, "createUser")
        .mockResolvedValue(createUserExpectedResult);

      const res = await authService.registerUser(registerUserDataDto);

      expect(getUserByEmailSpy).toHaveBeenCalledTimes(1);
      expect(createUserSpy).toHaveBeenCalledTimes(1);
      expect(getUserByEmailSpy).toHaveBeenCalledWith(userEmail);
      expect(createUserSpy).toHaveBeenCalledWith({
        ...registerUserDataDto,
        password: expect.any(String),
      });
      expect(res).toEqual({ message: "Registered successfully!" });
    });

    it('should throw an error with status 400 and message "User with this email already exists" when user try to register with an email that has already been registered', async () => {
      userData = { ...user_data, password: bcrypt.hash(generator.generateString(12), 5) };
      registerUserDataDto = {
        ...register_user_data,
        password: generator.generateString(12),
      };
      createUserExpectedResult = {
        ...create_user_result,
        password: bcrypt.hash(generator.generateString(12), 5),
      };

      jest.spyOn(usersService, "getUserByEmail").mockResolvedValue(userData);

      jest
        .spyOn(usersService, "createUser")
        .mockResolvedValue(createUserExpectedResult);

      try {
        await authService.registerUser(registerUserDataDto);
      } catch (e) {
        expect(e.message).toBe("User with this email already exists");
        expect(e.status).toBe(400);
      }
    });
  });

  describe("generateToken", () => {
    it("should return token object ", async () => {
      userData = { ...user_data, password: bcrypt.hash(generator.generateString(12), 5) };
      userDataToToken = { ...user_data_to_token };

      const JwtSignSpy = jest
        .spyOn(jwtService, "sign")
        .mockResolvedValue(token as never);

      const res = await authService.generateToken(userData);

      expect(JwtSignSpy).toHaveBeenCalledTimes(1);
      expect(JwtSignSpy).toHaveBeenCalledWith(userDataToToken);
      expect(res).toEqual(tokenResult);
    });
  });

  describe("validateUser", () => {
    loginUserDataDto = { ...login_user_data, password: generator.generateString(12) };
    userData = { ...user_data, password: bcrypt.hash(generator.generateString(12), 5) };

    it("should return user data object if the data provided is valid", async () => {
      const getUsderByEmailSpy = jest
        .spyOn(usersService, "getUserByEmail")
        .mockResolvedValue(userData);
      const comparePasswordsSpy = jest
        .spyOn(bcrypt, "compare")
        .mockResolvedValue(true);

      const res = await authService.validateUser(loginUserDataDto);

      expect(getUsderByEmailSpy).toHaveBeenCalledTimes(1);
      expect(getUsderByEmailSpy).toHaveBeenCalledWith(loginUserDataDto.email);
      expect(comparePasswordsSpy).toHaveBeenCalledTimes(1);
      expect(comparePasswordsSpy).toHaveBeenCalledWith(
        loginUserDataDto.password,
        userData.password
      );
      expect(res).toEqual(userData);
    });

    it('should throw an error with status 404 and message "No such user!" if user with email provided is not found', async () => {
      loginUserDataDto = { ...login_user_data, password: generator.generateString(12) };

      jest.spyOn(usersService, "getUserByEmail").mockResolvedValue(undefined);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      try {
        await authService.validateUser(loginUserDataDto);
      } catch (e) {
        expect(e.message).toBe("No such user!");
        expect(e.status).toBe(404);
      }
    });

    it('should throw an error with status 401 and message "Invalid password!" if password provided is invalid', async () => {
      loginUserDataDto = { ...login_user_data, password: generator.generateString(12) };
      userData = { ...user_data, password: bcrypt.hash(generator.generateString(12), 5) };

      jest.spyOn(usersService, "getUserByEmail").mockResolvedValue(userData);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);
      try {
        await authService.validateUser(loginUserDataDto);
      } catch (e) {
        expect(e.message).toBe("Invalid password!");
        expect(e.status).toBe(401);
      }
    });
  });
});
