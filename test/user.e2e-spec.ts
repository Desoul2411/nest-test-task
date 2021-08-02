jest.useFakeTimers();
jest.setTimeout(80000);

import * as request from 'supertest';
import { CreateUserDto } from '../src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../src/modules/users/dto/update-user.dto';
import { Connection, createConnection } from 'typeorm';
import { generateString, generateRandomNumber } from '../src/utils/generators.utils';
import * as bcrypt from 'bcrypt';
import { User } from '../src/modules/users/entities/user.entity';
import { LoginUserDto } from '../src/modules/users/dto/login-user-dto';
import { UserDeleted } from '../src/types/user.type';
import { downEnv, setupEnv } from './environment';
import { BASE_API_URL } from './constants';

describe('UsersController (e2e)', () => {
  let connection: Connection;

  let userId: string;
  let unexistingUserId: string;
  let passwordGenerated: string;
  let userPasswordHashed: string;
  let createUserDto: CreateUserDto;
  let invalidTypeCreateUserDto;
  let deletedUserResponseData: UserDeleted;
  let createdUserExpectedResult: User;
  let updateUserDto: UpdateUserDto;
  let invalidUpdateUserDto;
  let updatedUserExpectedResult: User;
  let loginAdminDto: LoginUserDto;
  let loginUserDto: LoginUserDto;
  let token: string;

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

    unexistingUserId = 'df229c80-7432-4951-9f21-a1c5f803a333';
    passwordGenerated = generateString(12);
    userPasswordHashed = await bcrypt.hash(passwordGenerated, 5);

    loginAdminDto = {
      email: 'Desoul25@mail.ru',
      password: passwordGenerated,
    };

    createUserDto = {
      email: 'Desoul40@mail.ru',
      password: userPasswordHashed,
      name: 'John',
      birthdate: '20.11.88',
    };

    invalidTypeCreateUserDto = {
      email: 'Desoul40mail.ru',
      password: generateRandomNumber(0, 100000),
      name: 'John',
      birthdate: '20.11.88',
    };

    loginUserDto = {
      email: 'Desoul40@mail.ru',
      password: passwordGenerated,
    };

    deletedUserResponseData = {
      email: 'Desoul40@mail.ru',
      password: userPasswordHashed,
      role: 'USER',
      name: 'John',
      birthdate: '20.11.88',
    };

    createdUserExpectedResult = {
      id: 'df229c80-7432-4951-9f21-a1c5f803a738',
      email: 'Desoul40@mail.ru',
      password: userPasswordHashed,
      role: 'USER',
      name: 'John',
      birthdate: '20.11.88',
    };

    updateUserDto = {
      name: 'Slava',
      birthdate: '20.11.90',
    };

    invalidUpdateUserDto = {
      name: 3773,
      birthdate: '',
    };

    updatedUserExpectedResult = {
      id: 'df229c80-7432-4951-9f21-a1c5f803a738',
      email: 'Desoul40@mail.ru',
      password: userPasswordHashed,
      role: 'USER',
      name: 'Slava',
      birthdate: '20.11.90',
    };

    done();
  });

  it('/users (POST) - create - success (should return created user)', async (done) => {
    await request(BASE_API_URL)
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
        expect(body.email).toEqual(createdUserExpectedResult.email);
        expect(body.name).toEqual(createdUserExpectedResult.name);
        expect(body.password).toEqual(createdUserExpectedResult.password);
        expect(body.birthdate).toEqual(createdUserExpectedResult.birthdate);
        expect(body.id).toEqual(expect.any(String));
      });

    await request(BASE_API_URL).delete(`/users/${userId}`).expect(200);

    done();
  });

  it('/users (POST) - create - fail (response status 400 with error message "User with this email already exists")', async (done) => {
    await request(BASE_API_URL)
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    await request(BASE_API_URL).post('/users').send(createUserDto).expect(400, {
      statusCode: 400,
      message: 'User with this email already exists',
    });

    await request(BASE_API_URL).delete(`/users/${userId}`).expect(200);

    done();
  });

  it('/users (POST) - create - fail (response status 400 with some validation message - invalid password and email)', async (done) => {
    await request(BASE_API_URL)
      .post('/users')
      .send(invalidTypeCreateUserDto)
      .expect(400, ['email - invalid email', 'password - must be a string']);

    done();
  });

  it('/users (GET) - getAllUsers - success (should return users array)', async (done) => {
    await request(BASE_API_URL)
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    await request(BASE_API_URL)
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body.length).toBeGreaterThan(0);
        expect(body[0].email).toBeDefined();
        expect(body[0].name).toBeDefined();
        expect(body[0].password).toBeDefined();
        expect(body[0].birthdate).toBeDefined();
        expect(body[0].id).toBeDefined();
      });

    await request(BASE_API_URL).delete(`/users/${userId}`).expect(200);

    done();
  });

  it('/users (UPDATE) - update - success (should return updated user)', async (done) => {
    await request(BASE_API_URL)
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    await connection.query(
      "INSERT INTO `users` (`email`,`password`, `role`, `name`, `birthdate`) VALUES('Desoul25@mail.ru','" +
        userPasswordHashed +
        "','ADMIN', 'slava', '20.11.1988')",
    );

    const { body } = await request(BASE_API_URL).post('/auth/login').send(loginAdminDto);

    token = body.token;

    await request(BASE_API_URL)
      .put(`/users/${userId}`)
      .set('Authorization', 'Bearer ' + token)
      .send(updateUserDto)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body.email).toEqual(updatedUserExpectedResult.email);
        expect(body.name).toEqual(updatedUserExpectedResult.name);
        expect(body.password).toEqual(createdUserExpectedResult.password);
        expect(body.birthdate).toEqual(updatedUserExpectedResult.birthdate);
        expect(body.id).toEqual(expect.any(String));
      });

    await request(BASE_API_URL).delete(`/users/${userId}`).expect(200);

    await connection.query("DELETE FROM `users` WHERE `email`='Desoul25@mail.ru'");

    done();
  });

  it('/users (UPDATE) - update - fail (response status 401 with message "User is not authorized!")', async (done) => {
    await request(BASE_API_URL).put(`/users/${userId}`).send(updateUserDto).expect(401, {
      statusCode: 401,
      message: 'User is not authorized!',
    });

    done();
  });

  it('/users (UPDATE) - update - fail (response status 403 with message "Access forbidden!" when role is USER)', async (done) => {
    await request(BASE_API_URL)
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    const { body } = await request(BASE_API_URL).post('/auth/login').send(loginUserDto);

    token = body.token;

    await request(BASE_API_URL)
      .put(`/users/${userId}`)
      .set('Authorization', 'Bearer ' + token)
      .send(updateUserDto)
      .expect(403, {
        statusCode: 403,
        message: 'Access forbidden!',
      });

    await request(BASE_API_URL).delete(`/users/${userId}`).expect(200);

    done();
  });

  it('/users (UPDATE) - update - fail (response status 404 with message "No such user!")', async (done) => {
    await connection.query(
      "INSERT INTO `users` (`email`,`password`, `role`, `name`, `birthdate`) VALUES('Desoul25@mail.ru','" +
        userPasswordHashed +
        "','ADMIN', 'slava', '20.11.1988')",
    );

    const { body } = await request(BASE_API_URL).post('/auth/login').send(loginAdminDto);

    token = body.token;

    await request(BASE_API_URL)
      .put(`/users/${unexistingUserId}`)
      .set('Authorization', 'Bearer ' + token)
      .send(updateUserDto)
      .expect(404, {
        statusCode: 404,
        message: 'No such user!',
      });

    await connection.query("DELETE FROM `users` WHERE `email`='Desoul25@mail.ru'");

    done();
  });

  it('/users (UPDATE) - update - fail (response status 400 with some validation message)', async (done) => {
    await request(BASE_API_URL)
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    await connection.query(
      "INSERT INTO `users` (`email`,`password`, `role`, `name`, `birthdate`) VALUES('Desoul25@mail.ru','" +
        userPasswordHashed +
        "','ADMIN', 'slava', '20.11.1988')",
    );

    const { body } = await request(BASE_API_URL).post('/auth/login').send(loginAdminDto);

    token = body.token;

    await request(BASE_API_URL)
      .put(`/users/${userId}`)
      .set('Authorization', 'Bearer ' + token)
      .send(invalidUpdateUserDto)
      .expect(400, ['name - must be a string', 'birthdate - The field must not be empty!']);

    await request(BASE_API_URL).delete(`/users/${userId}`).expect(200);

    await connection.query("DELETE FROM `users` WHERE `email`='Desoul25@mail.ru'");

    done();
  });

  it('/users (DELETE) - delete - success (should return deleted user object with status 200")', async (done) => {
    await request(BASE_API_URL)
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    await request(BASE_API_URL).delete(`/users/${userId}`).expect(200, deletedUserResponseData);

    done();
  });

  it('/users (DELETE) - delete - fail (should return 404 with message "No such user!")', async (done) => {
    await request(BASE_API_URL)
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    await request(BASE_API_URL).delete(`/users/${unexistingUserId}`).expect(404, {
      statusCode: 404,
      message: 'No such user!',
    });

    await request(BASE_API_URL).delete(`/users/${userId}`).expect(200, deletedUserResponseData);

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
