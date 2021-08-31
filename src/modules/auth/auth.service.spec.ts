import { getRepositoryToken } from "@nestjs/typeorm";
import {
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { generateString } from "../../utils/generators.utils";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginUserDto } from "../users/dto/login-user-dto";
import { CreateUserDto } from "../users/dto/create-user.dto";

describe("AuthService", () => {
  let usersService: UsersService;
  let authService: AuthService;
  let jwtService: JwtService;

  class UserRepositoryFake {
    public async save(): Promise<void> {}
    public async find(): Promise<void> {}
    public async findOne(): Promise<void> {}
  }

  const passwordGenerated = generateString(12);
  const passwordHashed = bcrypt.hash(passwordGenerated, 5);
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyODRmNDg1Ni1jODNtLTExZWItkTJlNi0wMjQyYWMxNTAwMDIiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE2MjMyMzIzMDYsImV4cCI6MTYyMzMxODcwNn0.cfCpuIGVKW2j9bzRhCPChTq5CW8iEwajhs63TZk_RZs";
  const userEmail = "Desoul40@mail.ru";
  const signMock = jest.fn(() => token);

  const loginUserDataDto: LoginUserDto = {
    email: "Desoul40@mail.ru",
    password: passwordGenerated,
  };

  const userData: User = {
    email: "Desoul40@mail.ru",
    password: passwordHashed,
    role: "USER",
    name: "slava",
    birthdate: "20.11.1988",
    id: "df229c80-7432-4951-9f21-a1c5f803a738",
  };

  const userDataToToken = {
    userId: "df229c80-7432-4951-9f21-a1c5f803a738",
    role: "USER",
  };

  const registerUserDataDto: CreateUserDto = {
    email: "Desoul40@mail.ru",
    password: passwordGenerated,
    name: "slava",
    birthdate: "20.11.1988",
  };

  const createUserExpectedResult: User = {
    email: "Desoul40@mail.ru",
    password: passwordHashed,
    role: "USER",
    name: "slava",
    birthdate: "20.11.1988",
    id: "df229c80-7432-4951-9f21-a1c5f803a738",
  };

  const tokenResult = {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyODRmNDg1Ni1jODNtLTExZWItkTJlNi0wMjQyYWMxNTAwMDIiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE2MjMyMzIzMDYsImV4cCI6MTYyMzMxODcwNn0.cfCpuIGVKW2j9bzRhCPChTq5CW8iEwajhs63TZk_RZs",
  };

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
