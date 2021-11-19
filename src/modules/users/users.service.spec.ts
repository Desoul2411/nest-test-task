import { getRepositoryToken } from "@nestjs/typeorm";
import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { Generator as generator } from "../../utils/generator.utils";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserDeleted } from "src/types/user.type";
import {
  create_user_dto,
  create_user_result,
  user_id,
  email,
  update_user_dto,
  update_user_result,
  get_all_users_result,
  delete_user_result,
  find_one_expected_result
} from "./test-data/users.test-data";

describe("UsersService", () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  const mockValue = {};
  const userEmail: string = email;
  const userId: string = user_id;

  class UserRepositoryFake {
    public async save(): Promise<void> {}
    public async find(): Promise<void> {}
    public async findOne(): Promise<void> {}
    public async remove(): Promise<void> {}
  }

  let createUserDataDto: CreateUserDto;
  let createUserExpectedResult: User;
  let findOneExpectedResult: User;
  let updateUserDataDto: UpdateUserDto;
  let updatedUserExpectedResult: User;
  let getAllUsersExpextedResult: User[];
  let removeExpectedResultSuccess: UserDeleted;

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
      createUserDataDto = { ...create_user_dto, password: generator.generateString(12) };
      createUserExpectedResult = {...create_user_result, password: generator.generateString(12)};

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
      createUserDataDto = { ...create_user_dto, password: generator.generateString(12) };
      
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
      getAllUsersExpextedResult = { ...get_all_users_result };

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
      findOneExpectedResult = { ...find_one_expected_result, password: generator.generateString(12) };
      
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
      findOneExpectedResult = { ...find_one_expected_result, password: generator.generateString(12) };
      
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
      findOneExpectedResult = { ...find_one_expected_result, password: generator.generateString(12) };
      updateUserDataDto = { ...update_user_dto };
      updatedUserExpectedResult = { ...update_user_result, password: generator.generateString(12) };

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
      updateUserDataDto = {...update_user_dto};
      updatedUserExpectedResult = { ...update_user_result, password: generator.generateString(12) };
      
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
      findOneExpectedResult = { ...find_one_expected_result, password: generator.generateString(12) };
      removeExpectedResultSuccess = { ...delete_user_result, password: generator.generateString(12) };

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
      updateUserDataDto = {...update_user_dto};
      
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
