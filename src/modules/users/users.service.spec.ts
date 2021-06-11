import { getRepositoryToken } from '@nestjs/typeorm';
import { CanActivate, HttpException, HttpStatus, NotFoundException, Param } from '@nestjs/common';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { generateString } from '../../utils/generators.utils';
import { Test } from '@nestjs/testing';
import { JwtService } from "@nestjs/jwt";
import { ValidationException } from "../../exceptions/validation.exception";
import { Repository } from 'typeorm';


describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  
  let passwordGenerated = generateString(60);
  
  const mockValue = {};
  const userEmail = "Desoul40@mail.ru";
  const userId = 'df229c80-7432-4951-9f21-a1c5f803a738';
  const validationMessageHttpExceptionExample = "password - must be between 5 and 14 characters, Must be a string";

  class UserRepositoryFake {
    public async save(): Promise<void> {}
    public async find(): Promise<void> {}
    public async findOne(): Promise<void> {}
  };  
  
  const createUserDataDto = {
      email : "Desoul40@mail.ru",
      password: passwordGenerated,
      name : "slava",
      birthdate: "20.11.1988"
  };

  const createUserExpectedResult = {
      email : "Desoul40@mail.ru",
      password: passwordGenerated,
      role: "USER",
      name : "slava",
      birthdate: "20.11.1988",
      id: "df229c80-7432-4951-9f21-a1c5f803a738"
  };

  const findOneExpectedResult = {
      email : "Desoul40@mail.ru",
      password: passwordGenerated,
      role: "USER",
      name : "slava",
      birthdate: "20.11.1988",
      id: "df229c80-7432-4951-9f21-a1c5f803a738"
  };

  const updateUserDataDto = {
    name : "John",
    birthdate: "20.11.1995"
  };

  const updatedUserExpectedResult = {
    email : "Desoul40@mail.ru",
    password: passwordGenerated,
    role: "USER",
    name : "John",
    birthdate: "20.11.1995",
    id: "df229c80-7432-4951-9f21-a1c5f803a738"
  };

  const getAllUsersExpextedResult = [
    {
      email : "Desoul40@mail.ru",
      password: passwordGenerated,
      role: "USER",
      name : "John",
      birthdate: "20.11.1995",
      id: "df229c80-7432-4951-9f21-a1c5f803a738"
    },
    {
      email : "Jack25@mail.ru",
      password: passwordGenerated,
      role: "USER",
      name : "Jack",
      birthdate: "14.11.1990",
      id: "df229c80-7432-4951-9f21-a1c5f803a738"
    }
  ];


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
          useValue: mockValue
        }
      ],
    })
    .compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    userRepository = moduleRef.get(getRepositoryToken(User));
  });

  describe('createUser', () => {
    it('should call the repository with correct paramaters and return created user object', async () => {
      const userRepositorySaveSpy = jest
      .spyOn(userRepository, 'save')
      .mockResolvedValue(createUserExpectedResult);

      const res = await usersService.createUser(createUserDataDto);

      const userDatatoSave = {...createUserDataDto, role: "USER"};
  
      expect(userRepositorySaveSpy).toHaveBeenCalledTimes(1);
      expect(userRepositorySaveSpy).toHaveBeenCalledWith(userDatatoSave);
      expect(res).toEqual(createUserExpectedResult);
    });

    it('should throw INTERNAL_SERVER_ERROR with status 500', async () => {
      jest
      .spyOn(userRepository, 'save')
      .mockRejectedValue(new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR));

      try {
          await usersService.createUser(createUserDataDto);
      } catch (e) {
          expect(e.message).toBe('INTERNAL_SERVER_ERROR');
          expect(e.status).toBe(500);
      }
    });
  });

  describe('getAllUsers', () => {
    it('should call the repository and return array of users', async () => {
      const userRepositoryFindSpy = jest
      .spyOn(userRepository, 'find')
      .mockResolvedValue(getAllUsersExpextedResult);

      const res = await usersService.getAllUsers();
  
      expect(userRepositoryFindSpy).toHaveBeenCalledTimes(1);
      expect(res).toEqual(getAllUsersExpextedResult);
    });

    it('should throw INTERNAL_SERVER_ERROR with status 500', async () => {
      jest
        .spyOn(userRepository, 'find')
        .mockRejectedValue(
          new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR),
        );

      try {
        await usersService.getAllUsers();
      } catch (e) {
        expect(e.message).toBe('INTERNAL_SERVER_ERROR');
        expect(e.status).toBe(500);
      }
    });
  });

  describe('getUserByEmail', () => {
    it('should call the repository with correct paramaters and return user object', async () => {
      const userRepositoryFindOneSpy = jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValue(findOneExpectedResult);

      const res = await usersService.getUserByEmail(userEmail);
  
      expect(userRepositoryFindOneSpy).toHaveBeenCalledTimes(1);
      expect(res).toEqual(findOneExpectedResult);
    });

    it('should throw INTERNAL_SERVER_ERROR with status 500', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR));

      try {
        await usersService.getUserByEmail(userEmail);
      } catch (e) {
        expect(e.message).toBe('INTERNAL_SERVER_ERROR');
        expect(e.status).toBe(500);
      }
    });
  });

  describe('getUserById', () => {
    it('should call the repository with correct paramaters and return user object', async () => {
      const userRepositoryFindOneSpy = jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValue(findOneExpectedResult);

      const res = await usersService.getUserById(userId);
  
      expect(userRepositoryFindOneSpy).toHaveBeenCalledTimes(1);
      expect(res).toEqual(findOneExpectedResult);
    });

    it('should throw an error with status 404 and message "No such user!"', async () => {
      jest
      .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new NotFoundException("No such user!"));

      try {
        await usersService.getUserById(userId);
      } catch (e) {
        expect(e.message).toBe("No such user!");
        expect(e.status).toBe(404);
      }
    });

    it('should throw INTERNAL_SERVER_ERROR with status 500', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR));

      try {
        await usersService.getUserById(userId);
      } catch (e) {
        expect(e.message).toBe('INTERNAL_SERVER_ERROR');
        expect(e.status).toBe(500);
      }
    });
  });

  describe('updateUser', () => {
    it('should call the repository with correct paramaters and return updated user object', async () => {
      const getUserByIdSpy = jest
        .spyOn(usersService, 'getUserById')
        .mockResolvedValue(findOneExpectedResult);

      const userRepositorySaveSpy = jest
      .spyOn(userRepository, 'save')
      .mockResolvedValue(updatedUserExpectedResult);

      const res = await usersService.updateUser(userId, updateUserDataDto);
  
      expect(getUserByIdSpy).toHaveBeenCalledTimes(1);
      expect(userRepositorySaveSpy).toHaveBeenCalledTimes(1);
      expect(res).toEqual(updatedUserExpectedResult);
    });

    it('should throw an error with status 404 and message "No such user!"', async () => {
      jest
        .spyOn(usersService, 'getUserById')
        .mockRejectedValue(new NotFoundException("No such user!"));

      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(updatedUserExpectedResult);

      try {
        await usersService.updateUser(userId, updateUserDataDto);
      } catch (e) {
        expect(e.message).toBe("No such user!");
        expect(e.status).toBe(404);
      }
    });

    it('should throw INTERNAL_SERVER_ERROR with status 500', async () => {
      jest
        .spyOn(usersService, 'getUserById')
        .mockResolvedValue(findOneExpectedResult);

      jest
        .spyOn(userRepository, 'save')
        .mockRejectedValue(new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR));

      try {
        await usersService.updateUser(userId, updateUserDataDto);
      } catch (e) {
        expect(e.message).toBe('INTERNAL_SERVER_ERROR');
        expect(e.status).toBe(500);
      }
    });
  });
});
  