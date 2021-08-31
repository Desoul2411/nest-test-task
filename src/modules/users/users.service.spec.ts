import { getRepositoryToken } from "@nestjs/typeorm";
import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { generateString } from "../../utils/generators.utils";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserDeleted } from "src/types/user.type";

describe("UsersService", () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  const passwordGenerated = generateString(60);

  const mockValue = {};
  const userEmail = "Desoul40@mail.ru";
  const userId = "df229c80-7432-4951-9f21-a1c5f803a738";

  class UserRepositoryFake {
    public async save(): Promise<void> {}
    public async find(): Promise<void> {}
    public async findOne(): Promise<void> {}
    public async remove(): Promise<void> {}
  }

  const createUserDataDto: CreateUserDto = {
    email: "Desoul40@mail.ru",
    password: passwordGenerated,
    name: "slava",
    birthdate: "20.11.1988",
  };

  const createUserExpectedResult: User = {
    email: "Desoul40@mail.ru",
    password: passwordGenerated,
    role: "USER",
    name: "slava",
    birthdate: "20.11.1988",
    id: "df229c80-7432-4951-9f21-a1c5f803a738",
  };

  const findOneExpectedResult: User = {
    email: "Desoul40@mail.ru",
    password: passwordGenerated,
    role: "USER",
    name: "slava",
    birthdate: "20.11.1988",
    id: "df229c80-7432-4951-9f21-a1c5f803a738",
  };

  const updateUserDataDto: UpdateUserDto = {
    name: "John",
    birthdate: "20.11.1995",
  };

  const updatedUserExpectedResult: User = {
    email: "Desoul40@mail.ru",
    password: passwordGenerated,
    role: "USER",
    name: "John",
    birthdate: "20.11.1995",
    id: "df229c80-7432-4951-9f21-a1c5f803a738",
  };

  const getAllUsersExpextedResult: User[] = [
    {
      email: "Desoul40@mail.ru",
      password: passwordGenerated,
      role: "USER",
      name: "John",
      birthdate: "20.11.1995",
      id: "df229c80-7432-4951-9f21-a1c5f803a738",
    },
    {
      email: "Jack25@mail.ru",
      password: passwordGenerated,
      role: "USER",
      name: "Jack",
      birthdate: "14.11.1990",
      id: "df229c80-7432-4951-9f21-a1c5f803a738",
    },
  ];

  const removeExpectedResultSuccess: UserDeleted = {
    email: "Desoul40@mail.ru",
    password: passwordGenerated,
    role: "USER",
    name: "slava",
    birthdate: "20.11.1988",
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: UserRepositoryFake,
        },
        {
          provide: JwtService,
          useValue: mockValue,
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    userRepository = moduleRef.get(getRepositoryToken(User));
  });

  describe("createUser", () => {
    it("should call the repository with correct paramaters and return created user object when create user - success", async () => {
      const userRepositorySaveSpy = jest
        .spyOn(userRepository, "save")
        .mockResolvedValue(createUserExpectedResult);

      const res = await usersService.createUser(createUserDataDto);

      const userDatatoSave = { ...createUserDataDto, role: "USER" };

      expect(userRepositorySaveSpy).toHaveBeenCalledTimes(1);
      expect(userRepositorySaveSpy).toHaveBeenCalledWith(userDatatoSave);
      expect(res).toEqual(createUserExpectedResult);
    });

    it('should throw an error with status 400 and message "User with this email already exists" if email provided already exists in database - fail', async () => {
      jest
        .spyOn(userRepository, "save")
        .mockRejectedValue(
          new HttpException(
            "User with this email already exists",
            HttpStatus.BAD_REQUEST
          )
        );

      try {
        await usersService.createUser(createUserDataDto);
      } catch (e) {
        expect(e.message).toBe("User with this email already exists");
        expect(e.status).toBe(400);
      }
    });
  });

  describe("getAllUsers", () => {
    it("should call the repository and return array of users when called", async () => {
      const userRepositoryFindSpy = jest
        .spyOn(userRepository, "find")
        .mockResolvedValue(getAllUsersExpextedResult);

      const res = await usersService.getAllUsers();

      expect(userRepositoryFindSpy).toHaveBeenCalledTimes(1);
      expect(res).toEqual(getAllUsersExpextedResult);
    });
  });

  describe("getUserByEmail", () => {
    it("should call the repository with correct paramaters and return user object if called with an user email that exists in the database", async () => {
      const userRepositoryFindOneSpy = jest
        .spyOn(userRepository, "findOne")
        .mockResolvedValue(findOneExpectedResult);

      const res = await usersService.getUserByEmail(userEmail);

      expect(userRepositoryFindOneSpy).toHaveBeenCalledTimes(1);
      expect(res).toEqual(findOneExpectedResult);
    });
  });

  describe("getUserById", () => {
    it("should call the repository with correct paramaters and return user object if called with an userId that exists in the database", async () => {
      const userRepositoryFindOneSpy = jest
        .spyOn(userRepository, "findOne")
        .mockResolvedValue(findOneExpectedResult);

      const res = await usersService.getUserById(userId);

      expect(userRepositoryFindOneSpy).toHaveBeenCalledTimes(1);
      expect(res).toEqual(findOneExpectedResult);
    });

    it('should throw an error with status 404 and message "No such user!" if called with an userId that doesnt exist in the database', async () => {
      jest
        .spyOn(userRepository, "findOne")
        .mockRejectedValue(new NotFoundException("No such user!"));

      try {
        await usersService.getUserById(userId);
      } catch (e) {
        expect(e.message).toBe("No such user!");
        expect(e.status).toBe(404);
      }
    });
  });

  describe("updateUser", () => {
    it("should call internal functions with correct paramaters and return updated user object if called with valid data", async () => {
      const getUserByIdSpy = jest
        .spyOn(usersService, "getUserById")
        .mockResolvedValue(findOneExpectedResult);

      const userRepositorySaveSpy = jest
        .spyOn(userRepository, "save")
        .mockResolvedValue(updatedUserExpectedResult);

      const res = await usersService.updateUser(userId, updateUserDataDto);

      expect(getUserByIdSpy).toHaveBeenCalledTimes(1);
      expect(userRepositorySaveSpy).toHaveBeenCalledTimes(1);
      expect(res).toEqual(updatedUserExpectedResult);
    });

    it('should throw an error with status 404 and message "No such user!" if called with an userId that doesnt exist in the database', async () => {
      jest
        .spyOn(usersService, "getUserById")
        .mockRejectedValue(new NotFoundException("No such user!"));

      jest
        .spyOn(userRepository, "save")
        .mockResolvedValue(updatedUserExpectedResult);

      try {
        await usersService.updateUser(userId, updateUserDataDto);
      } catch (e) {
        expect(e.message).toBe("No such user!");
        expect(e.status).toBe(404);
      }
    });
  });

  describe("deleteUserById", () => {
    it("should call internal functions with correct paramaters and return deleted user object if called with userId that exists in database", async () => {
      const getUserByIdSpy = jest
        .spyOn(usersService, "getUserById")
        .mockResolvedValue(findOneExpectedResult);

      const userRepositoryRemoveSpy = jest
        .spyOn(userRepository, "remove")
        .mockResolvedValue(removeExpectedResultSuccess as User);

      const res = await usersService.deleteUserById(userId);

      expect(getUserByIdSpy).toHaveBeenCalledTimes(1);
      expect(getUserByIdSpy).toHaveBeenCalledTimes(1);
      expect(userRepositoryRemoveSpy).toHaveBeenCalledWith(
        findOneExpectedResult
      );
      expect(res).toEqual(removeExpectedResultSuccess);
    });

    it('should throw an error with status 404 and message "No such user!" if called with userId that doesnt exists in database', async () => {
      jest
        .spyOn(usersService, "getUserById")
        .mockRejectedValue(new NotFoundException("No such user!"));

      jest
        .spyOn(userRepository, "remove")
        .mockResolvedValue(removeExpectedResultSuccess as User);

      try {
        await usersService.updateUser(userId, updateUserDataDto);
      } catch (e) {
        expect(e.message).toBe("No such user!");
        expect(e.status).toBe(404);
      }
    });
  });
});
