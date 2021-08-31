jest.useFakeTimers();
jest.setTimeout(80000);

import * as request from 'supertest';
import { CreateUserDto } from '../src/modules/users/dto/create-user.dto';
import { generateString, generateRandomNumber } from '../src/utils/generators.utils';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../src/modules/users/dto/login-user-dto';
import { Connection, createConnection } from 'typeorm';
import { ReigestrationSuccessResponse } from 'src/types/auth.type';
import { downEnv, setupEnv } from './environment';
import { BASE_API_URL } from './constants';

describe('AuthController (e2e)', () => {
  //let environment;
  let connection: Connection;

  let userId: string;
  let passwordGenerated: string;
  let userPasswordHashed: string;
  let createUserDto: CreateUserDto;
  let loginUserDto: LoginUserDto;
  let invalidLoginUserDto;
  let invalidTypeCreateUserDto;
  let invalidPasswordDTO: LoginUserDto;
  let unexistingUserDTO: LoginUserDto;
  let registerUserExpectedResult: ReigestrationSuccessResponse;

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
    passwordGenerated = generateString(12);
    userPasswordHashed = await bcrypt.hash(passwordGenerated, 5);

    createUserDto = {
      email: 'Desoul40@mail.ru',
      password: userPasswordHashed,
      name: 'John',
      birthdate: '20.11.88',
    };

    invalidTypeCreateUserDto = {
      email: 'Desoul40mail.ru',
      password: generateRandomNumber(0, 1000000),
      name: 'John',
      birthdate: '20.11.88',
    };

    registerUserExpectedResult = {
      message: 'Registered successfully!',
    };

    invalidLoginUserDto = {
      email: 'Desoulmail.ru',
      password: generateRandomNumber(0, 1000000),
    };

    invalidPasswordDTO = {
      email: 'Desoul40@mail.ru',
      password: generateString(12),
    };

    unexistingUserDTO = {
      email: 'Desoul45@mail.ru',
      password: generateString(12),
    };
    done();
  });

  it('/auth (POST) - login - success (should return token)', async (done) => {
    const passwordGenerated = generateString(12);
    const userPasswordHashed = await bcrypt.hash(passwordGenerated, 5);

    const createUserDto = {
      email: 'Desoul40@mail.ru',
      password: userPasswordHashed,
      name: 'John',
      birthdate: '20.11.88',
    };

    const loginUserDto = {
      email: 'Desoul40@mail.ru',
      password: passwordGenerated,
    };

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

  it('/auth (POST) - login - fail (response status 400 with some validation message - password and email)', async (done) => {
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

  it('/auth (POST) - login - fail (response status 401 with message "Invalid email or password")', async (done) => {
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

  it('/auth (POST) - login - fail (response status 404 with message "No such user!")', async (done) => {
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

  it('/auth (POST) - registration - success (should create new user and return confirmation message with status 201)', async (done) => {
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

  it('/auth (POST) - registration - fail (response status 400 with message "User with this email already exists"))', async (done) => {
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

  it('/auth (POST) - registration - fail (response status 400 with validation messages)', async (done) => {
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
