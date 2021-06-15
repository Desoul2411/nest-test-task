import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { generateString } from '../../utils/generators.utils';
import { Test } from '@nestjs/testing';
import { JwtService } from "@nestjs/jwt";


describe('UsersController', () => {
    let usersController: UsersController;

    const mockValue = {};

    const createUserMock = jest.fn();
    const getAllUserMock = jest.fn();
    const updateUserMock = jest.fn();
    const deleteUserByIdMock = jest.fn();
  
    let passwordGenerated = generateString(64);
    
    const createUserDataDto = {
        email : "Desoul40@mail.ru",
        password: passwordGenerated,
        name : "slava",
        birthdate: "20.11.1988"
    };
  
    const createdUserExpectedResult = {
        email : "Desoul40@mail.ru",
        password: passwordGenerated,
        role: "USER",
        name : "slava",
        birthdate: "20.11.1988"
    };

    const userId = 'df229c80-7432-4951-9f21-a1c5f803a738';

    const updateUserDataDto = {
      name : "John",
      birthdate: "20.11.1995"
    };

    const updatedUserExpectedResult = {
      email : "Desoul40@mail.ru",
      password: passwordGenerated,
      role: "USER",
      name : "John",
      birthdate: "20.11.1995"
    };

    const getAllUsersExpextedResult = [
      {
        email : "Desoul40@mail.ru",
        password: passwordGenerated,
        role: "USER",
        name : "John",
        birthdate: "20.11.1995"
      },
      {
        email : "Jack25@mail.ru",
        password: passwordGenerated,
        role: "USER",
        name : "Jack",
        birthdate: "14.11.1990"
      }
  ];

  const deleteUserExpectedResult = {
    email : "Desoul40@mail.ru",
    password: passwordGenerated,
    role: "USER",
    name : "slava",
    birthdate: "20.11.1988",
  }


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
            deleteUserById: deleteUserByIdMock
          },
        },
        {
          provide: JwtService,
          useValue: mockValue
        }
      ],
    })
    .compile();

    usersController = moduleRef.get<UsersController>(UsersController);
    passwordGenerated = generateString(64);
  });

  describe('getAll', () => {
    it('should be called', async () => {

      await usersController.getAll();
      expect(getAllUserMock).toHaveBeenCalledTimes(1);
    });

    it('should return users array', async () => {
      getAllUserMock.mockResolvedValue(getAllUsersExpextedResult);
      expect(await usersController.getAll()).toEqual(getAllUsersExpextedResult);
    });

    it('should throw an error with status 500 and error message - fail', async () => {
      getAllUserMock.mockResolvedValue(new HttpException("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR));
      try {
        await usersController.getAll();
      } catch (e) {
        expect(e.message).toBe('INTERNAL_SERVER_ERROR');
        expect(e.status).toBe(500);
      }
    });
  });

  describe('create', () => {
    it('should be called with passed data once', async () => {
      await usersController.create(createUserDataDto);
      expect(createUserMock).toHaveBeenCalledTimes(1);
      expect(createUserMock).toHaveBeenCalledWith(createUserDataDto);
    });

    it('should return created user object', async () => {
      createUserMock.mockResolvedValue(createdUserExpectedResult);
      expect(await usersController.create(createUserDataDto)).toEqual(
        createdUserExpectedResult,
      );
    });

    it('should throw an error with status 500 and error message - fail', async () => {
      createUserMock.mockResolvedValue(new HttpException("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR));

      try {
        await usersController.create(createUserDataDto);
      } catch (e) {
        expect(e.message).toBe('INTERNAL_SERVER_ERROR');
        expect(e.status).toBe(500);
      }
    });

    it('should throw an error with status 400 and message "User with this email already exists" - fail', async () => {
      createUserMock.mockResolvedValue(new HttpException("User with this email already exists", HttpStatus.BAD_REQUEST));
      try {
        await usersController.create(createUserDataDto);
      } catch (e) {
        expect(e.message).toBe("User with this email already exists");
        expect(e.status).toBe(400);
      }
    });
  });


  describe('update', () => {
    it('should be called with passed data once - success', async () => {
      await usersController.update(userId, updateUserDataDto);
      expect(updateUserMock).toHaveBeenCalledTimes(1);
      expect(updateUserMock).toHaveBeenCalledWith(userId, updateUserDataDto);
    });

    it('should return updated user object - success', async () => {
      updateUserMock.mockResolvedValue(updatedUserExpectedResult);

      expect(await usersController.update(userId, updateUserDataDto)).toEqual(
        updatedUserExpectedResult,
      );
    });

    it('should throw an error with status 500 and error message - fail', async () => {
      updateUserMock.mockRejectedValue(new HttpException("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR));

      try {
        await usersController.update(userId, updateUserDataDto);
      } catch (e) {
        expect(e.message).toBe('INTERNAL_SERVER_ERROR');
        expect(e.status).toBe(500);
      }
    });

    it('should throw an error with status 404 and error message - fail', async () => {
      updateUserMock.mockRejectedValue(new NotFoundException("No such user!"));

      try {
        await usersController.update(userId, updateUserDataDto);
      } catch (e) {
        expect(e.message).toBe('No such user!');
        expect(e.status).toBe(404);
      }
    });
  });

  describe('delete', () => {
    it('should be called with passed params and return confirmation message - success', async () => {
      deleteUserByIdMock.mockResolvedValue(deleteUserExpectedResult);
      const res = await usersController.delete(userId);
      expect(deleteUserByIdMock).toHaveBeenCalledTimes(1);
      expect(deleteUserByIdMock).toHaveBeenCalledWith(userId);
      expect(res).toEqual(deleteUserExpectedResult);
    });

    it('should throw an error with status 404 and error message - fail', async () => {
      deleteUserByIdMock.mockRejectedValue(new NotFoundException("No such user!"));

      try {
        await usersController.delete(userId);
      } catch (e) {
        expect(e.message).toBe('No such user!');
        expect(e.status).toBe(404);
      }
    });

    it('should throw an error with status 500 and error message - fail', async () => {
      deleteUserByIdMock.mockRejectedValue(new HttpException("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR));

      try {
        await usersController.delete(userId);
      } catch (e) {
        expect(e.message).toBe('INTERNAL_SERVER_ERROR');
        expect(e.status).toBe(500);
      }
    });

    
  });
});
  