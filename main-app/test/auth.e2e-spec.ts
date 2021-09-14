jest.useFakeTimers();
jest.setTimeout(80000);

import * as request from 'supertest';
import { CreateUserDto } from '../src/modules/users/dto/create-user.dto';
import { Generator as generator }  from '../src/utils/generator.utils';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../src/modules/users/dto/login-user-dto';
import { Connection, createConnection } from 'typeorm';
import { ReigestrationSuccessResponse } from 'src/types/auth.type';
import { downEnv, setupEnv } from './environment';
import { BASE_API_URL } from './constants';
import {
  create_user_dto,
  login_user_dto,
  invalid_type_create_user_dto,
  register_user_result,
  invalid_login_user_dto,
  invalid_password_dto,
  unexisting_user_dto,
} from './test-data/auth-user.test-data';

describe('AuthController (e2e)', () => {
  let connection: Connection;
  let userId: string;
  let createUserDto: CreateUserDto;
  let invalidLoginUserDto;
  let invalidTypeCreateUserDto;
  let invalidPasswordDTO: LoginUserDto;
  let unexistingUserDTO: LoginUserDto;
  let registerUserExpectedResult: ReigestrationSuccessResponse;
  let password: string;
  let userPasswordHashed: string;

  beforeAll(async (done) => {
    try {
      await setupEnv();

      connection = await createConnection({
        type: 'mysql',
        host: process.env.MYSQL_DOCKER_OUTER_HOST,
        port: +process.env.MYSQL_DOCKER_OUTER_PORT,
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
      });
    } catch (error) {
      console.log(error);
    }

    done();
  });

  beforeEach(async (done) => {
    password = generator.generateString(12);
    userPasswordHashed = await bcrypt.hash(password, 5);
    createUserDto = { ...create_user_dto, password: userPasswordHashed };

    done();
  });

  it('/auth (POST) - login - success (should return token when user try to log in with valid and correct data)', async (done) => {
    const loginUserDto = { ...login_user_dto, password };

    await request(BASE_API_URL)
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    await request(BASE_API_URL)
      .post('/auth/login')
      .send(loginUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        expect(body.token).toBeDefined();
        expect(body.token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
      });

    await request(BASE_API_URL).delete(`/users/${userId}`).expect(200);

    done();
  });

  it('/auth/login (POST) - login - fail (response status 400 with some validation message when user try to log in with invalid email or password)', async (done) => {
    invalidLoginUserDto = { ...invalid_login_user_dto, password: generator.generateRandomNumber(0, 10000) };

    await request(BASE_API_URL)
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    await request(BASE_API_URL)
      .post('/auth/login')
      .send(invalidLoginUserDto)
      .expect(400, ['email - Invalid email', 'password - must be between 5 and 14 characters, must be a string']);

    await request(BASE_API_URL).delete(`/users/${userId}`).expect(200);

    done();
  });

  it('/auth/login (POST) - login - fail (response status 401 with message "Invalid email or password" when user try to login with incorrect email or password)', async (done) => {
    invalidPasswordDTO = { ...invalid_password_dto, password: generator.generateString(12) };

    await request(BASE_API_URL)
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    await request(BASE_API_URL)
      .post('/auth/login')
      .send(invalidPasswordDTO)
      .expect(401, {
        message: 'Invalid password!',
      })
      .then(({ body }: request.Response) => {
        expect(body.token).not.toBeDefined();
      });

    await request(BASE_API_URL).delete(`/users/${userId}`).expect(200);

    done();
  });

  it('/auth/login (POST) - login - fail (response status 404 with message "No such user!" when user try to login with email that doesnt exist in the database)', async (done) => {
    unexistingUserDTO = { ...unexisting_user_dto, password: generator.generateString(12) };

    await request(BASE_API_URL)
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    await request(BASE_API_URL).post('/auth/login').send(unexistingUserDTO).expect(404, {
      statusCode: 404,
      message: 'No such user!',
    });

    await request(BASE_API_URL).delete(`/users/${userId}`).expect(200);

    done();
  });

  it('/auth/registration (POST) - registration - success (should create new user and return confirmation message with status 201 when user try to register with valid data)', async (done) => {
    registerUserExpectedResult = { ...register_user_result };

    await request(BASE_API_URL)
      .post('/auth/registration')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        expect(body).toEqual(registerUserExpectedResult);
      });

    await connection.query("DELETE FROM `users` WHERE `email`='Desoul40@mail.ru'");

    done();
  });

  it('/auth/registration (POST) - registration - fail (response status 400 with message "User with this email already exists" when user try to register with email that already exists in the database))', async (done) => {
    registerUserExpectedResult = { ...register_user_result };

    await request(BASE_API_URL)
      .post('/auth/registration')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        expect(body).toEqual(registerUserExpectedResult);
      });

    await request(BASE_API_URL).post('/auth/registration').send(createUserDto).expect(400, {
      statusCode: 400,
      message: 'User with this email already exists',
    });

    await connection.query("DELETE FROM `users` WHERE `email`='Desoul40@mail.ru'");

    done();
  });

  it('/auth (POST) - registration - fail (response status 400 with validation messages when user try to register with invalid data)', async (done) => {
    invalidTypeCreateUserDto = { ...invalid_type_create_user_dto, password: generator.generateRandomNumber(0, 1000000) };

    await request(BASE_API_URL)
      .post('/auth/registration')
      .send(invalidTypeCreateUserDto)
      .expect(400, ['email - invalid email', 'password - must be a string']);

    await connection.query("DELETE FROM `users` WHERE `email`='Desoul40@mail.ru'");

    done();
  });

  afterAll(async (done) => {
    try {
      await connection.close();
      await downEnv();
    } catch (error) {
      console.log(error);
    }

    done();
  });
});
