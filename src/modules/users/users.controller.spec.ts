import { getRepositoryToken } from "@nestjs/typeorm";
import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { generateString } from "../../utils/generators.utils";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserDeleted } from "src/types/user.type";
import {
  create_user_dto,
  create_user_result,
  user_id,
  update_user_dto,
  update_user_result,
  get_all_users_result,
  delete_user_result,
} from "./test-data/users.test-data";

describe("UsersController", () => {
  let usersController: UsersController;

  const mockValue = {};

  const createUserMock = jest.fn();
  const getAllUserMock = jest.fn();
  const updateUserMock = jest.fn();
  const deleteUserByIdMock = jest.fn();
  const userId: string = user_id;

  let createUserDataDto: CreateUserDto;
  let createdUserExpectedResult: User;
  let updateUserDataDto: UpdateUserDto;
  let updatedUserExpectedResult: User;
  let getAllUsersExpextedResult: User[];
  let deleteUserExpectedResult: UserDeleted;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersController,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockValue,
        },
        {
          provide: UsersService,
          useValue: {
            createUser: createUserMock,
            getAllUsers: getAllUserMock,
            updateUser: updateUserMock,
            deleteUserById: deleteUserByIdMock,
          },
        },
        {
          provide: JwtService,
          useValue: mockValue,
        },
      ],
    }).compile();

    usersController = moduleRef.get<UsersController>(UsersController);
  });

  describe("getAll", () => {
    it('should call "getAllUser" function once when called', async () => {
      await usersController.getAll();
      expect(getAllUserMock).toHaveBeenCalledTimes(1);
    });

    it("should return users array when called", async () => {
      getAllUsersExpextedResult = [...get_all_users_result];

      getAllUserMock.mockResolvedValue(getAllUsersExpextedResult);
      expect(await usersController.getAll()).toEqual(getAllUsersExpextedResult);
    });
  });

  describe("create", () => {
    it('should call "createUser" function with passed data once during user creation', async () => {
      createUserDataDto = { ...create_user_dto, password: generateString(12) };

      await usersController.create(createUserDataDto);
      expect(createUserMock).toHaveBeenCalledTimes(1);
      expect(createUserMock).toHaveBeenCalledWith(createUserDataDto);
    });

    it("should return created user object during user creation", async () => {
      const createUserDataDto = {
        ...create_user_dto,
        password: generateString(12),
      };
      createdUserExpectedResult = {
        ...create_user_result,
        password: generateString(12),
      };

      createUserMock.mockResolvedValue(createdUserExpectedResult);
      expect(await usersController.create(createUserDataDto)).toEqual(
        createdUserExpectedResult
      );
    });

    it('should throw an error with status 400 and message "User with this email already exists" if user with email provided has been already registered  - fail', async () => {
      createUserDataDto = { ...create_user_dto, password: generateString(12) };

      createUserMock.mockResolvedValue(
        new HttpException(
          "User with this email already exists",
          HttpStatus.BAD_REQUEST
        )
      );
      try {
        await usersController.create(createUserDataDto);
      } catch (e) {
        expect(e.message).toBe("User with this email already exists");
        expect(e.status).toBe(400);
      }
    });
  });

  describe("update", () => {
    it("should be called with passed data once during user update - success", async () => {
      updateUserDataDto = { ...update_user_dto };

      await usersController.update(userId, updateUserDataDto);
      expect(updateUserMock).toHaveBeenCalledTimes(1);
      expect(updateUserMock).toHaveBeenCalledWith(userId, updateUserDataDto);
    });

    it("should return updated user object if update data provided is valid - success", async () => {
      updateUserDataDto = { ...update_user_dto };
      updatedUserExpectedResult = {
        ...update_user_result,
        password: generateString(12),
      };

      updateUserMock.mockResolvedValue(updatedUserExpectedResult);

      expect(await usersController.update(userId, updateUserDataDto)).toEqual(
        updatedUserExpectedResult
      );
    });

    it("should throw an error with status 404 and error message if userId provided doesn't exist in the database - fail", async () => {
      updateUserDataDto = { ...update_user_dto };

      updateUserMock.mockRejectedValue(new NotFoundException("No such user!"));

      try {
        await usersController.update(userId, updateUserDataDto);
      } catch (e) {
        expect(e.message).toBe("No such user!");
        expect(e.status).toBe(404);
      }
    });
  });

  describe("delete", () => {
    it('should call "deleteUserById" function with passed params and return confirmation message - success', async () => {
      deleteUserExpectedResult = { ...delete_user_result };

      deleteUserByIdMock.mockResolvedValue(deleteUserExpectedResult);
      const res = await usersController.delete(userId);
      expect(deleteUserByIdMock).toHaveBeenCalledTimes(1);
      expect(deleteUserByIdMock).toHaveBeenCalledWith(userId);
      expect(res).toEqual(deleteUserExpectedResult);
    });

    it("should throw an error with status 404 and error message if userId provided doesn't exist in the database - fail", async () => {
      deleteUserByIdMock.mockRejectedValue(
        new NotFoundException("No such user!")
      );

      try {
        await usersController.delete(userId);
      } catch (e) {
        expect(e.message).toBe("No such user!");
        expect(e.status).toBe(404);
      }
    });
  });
});
