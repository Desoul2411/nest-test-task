jest.useFakeTimers();
jest.setTimeout(60000);

/* import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common"; */
import * as path from "path";
import * as request from "supertest";
const fetch = require('node-fetch');
const superagent = require('superagent');
import { AppModule } from "../src/app.module";
import { CreateUserDto } from "../src/modules/users/dto/create-user.dto";
import { generateString } from "../src/utils/generators.utils";
import * as bcrypt from "bcrypt";
import { LoginUserDto } from "../src/modules/users/dto/login-user-dto";
import { QueryRunner } from "typeorm";
import { Connection, getConnection } from "typeorm";
import { ReigestrationSuccessResponse } from "src/types/auth.type";
import { downEnv, Environment, setupEnv } from './environment';
import { DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait } from 'testcontainers';
//import  { createUserDto } from './test-data';

describe("AuthController (e2e)", () => {
  let environment;
 // let app: INestApplication;
  let queryRunner: QueryRunner;
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
    const composeFile = 'docker-compose.e2e.yml';
    const composeFilePath = path.resolve(__dirname, `..`);

    //await setupEnv(); // setup environment
    
    console.log("1");
    try {
      environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
      .withEnv('PORT', process.env.PORT as string)
      .withEnv('MYSQL_HOST', process.env.MYSQL_HOST)
      .withEnv('MYSQL_ROOT_PASSWORD', process.env.MYSQL_ROOT_PASSWORD as string)
      .withEnv('MYSQL_USER', process.env.MYSQL_USER as string)
      .withEnv('MYSQL_PASSWORD', process.env.MYSQL_PASSWORD as string)
      .withEnv('MYSQL_DATABASE', process.env.MYSQL_DATABASE as string)
      .withEnv('DEFAULT_DB_RUN_MIGRATIONS', process.env.DEFAULT_DB_RUN_MIGRATIONS as string)
      .withEnv('DEFAULT_DB_DROP_SCHEMA', process.env.DEFAULT_DB_DROP_SCHEMA as string)
      .withEnv('DEFAULT_DB_LOGGING', process.env.DEFAULT_DB_LOGGING as string)
      .withEnv('PRIVATE_KEY', process.env.PRIVATE_KEY as string)
      //.withWaitStrategy('nest-test-app', Wait.forLogMessage(/Server started on port = 9000/))
      //.withWaitStrategy("mysql-e2e-test", Wait.forHealthCheck())
      .up();

      console.log('2'); // no log
    } catch (error) {
      console.log(error);
    }
    console.log('Environment up and running'); // no log
    
    connection = getConnection();
    queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    passwordGenerated = generateString(12);
    userPasswordHashed = await bcrypt.hash(passwordGenerated, 5);

    createUserDto = {
      email: "Desoul40@mail.ru",
      password: userPasswordHashed,
      name: "John",
      birthdate: "20.11.88",
    };

    invalidTypeCreateUserDto = {
      email: "Desoul40mail.ru",
      password: 123456,
      name: "John",
      birthdate: "20.11.88",
    };

    registerUserExpectedResult = {
      message: "Registered successfully!",
    };

    loginUserDto = {
      email: "Desoul40@mail.ru",
      password: passwordGenerated,
    };

    invalidLoginUserDto = {
      email: "Desoulmail.ru",
      password: 233424234,
    };

    invalidPasswordDTO = {
      email: "Desoul40@mail.ru",
      password: "Kdasd34e3423r",
    };

    unexistingUserDTO = {
      email: "Desoul45@mail.ru",
      password: "Kdasd34e3423r",
    };

    done();
  });

  it("/auth (POST) - login - success (should return token)", async (done) => {
    console.log('createUserDto',createUserDto);
    /* try {
      const res = await superagent.post('http://localhost:9000/api/users')
      .send(createUserDto);
      console.log(res);
    } catch (err) {
      console.error(err);
    }  */

 /*    createUserDto = {
      email: "Desoul40@mail.ru",
      password: userPasswordHashed,
      name: "John",
      birthdate: "20.11.88",
    }; */
    

/*     fetch('http://localhost:9000/api/users', 
    { 
      method: 'POST',
      body: JSON.stringify(createUserDto ),
    })
    .then(res => res.json()) 
    .then(json => console.log(json));
 */

    await request('http://localhost:9000/api')
      .get("/users")
      .expect(200)
      .then(({ body }: request.Response) => {
        console.log(body);
      });


    await request('http://localhost:9000/api')
      .post("/users")
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        console.log('result',createUserDto);
        userId = body.id;
      });

    await request('http://localhost:9000/api')
      .post("/auth/login")
      .send(loginUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        expect(body.token).toBeDefined();
        expect(body.token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
      });

    await request('http://localhost:9000/api').delete(`/users/${userId}`).expect(200);

    done();
  });

  /* it("/auth (POST) - login - fail (response status 400 with some validation message - password and email)", async (done) => {
    await request(app.getHttpServer())
      .post("/users")
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    await request(app.getHttpServer())
      .post("/auth/login")
      .send(invalidLoginUserDto)
      .expect(400, [
        "email - Invalid email",
        "password - must be between 5 and 14 characters, must be a string",
      ]);

    await request(app.getHttpServer()).delete(`/users/${userId}`).expect(200);

    done();
  });

  it('/auth (POST) - login - fail (response status 401 with message "Invalid email or password")', async (done) => {
    await request(app.getHttpServer())
      .post("/users")
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    await request(app.getHttpServer())
      .post("/auth/login")
      .send(invalidPasswordDTO)
      .expect(401, {
        message: "Invalid password!",
      }).then(({ body }: request.Response) => {
        expect(body.token).not.toBeDefined();
      });

    await request(app.getHttpServer()).delete(`/users/${userId}`).expect(200);

    done();
  });

  it('/auth (POST) - login - fail (response status 404 with message "No such user!")', async (done) => {
    await request(app.getHttpServer())
      .post("/users")
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        userId = body.id;
      });

    await request(app.getHttpServer())
      .post("/auth/login")
      .send(unexistingUserDTO)
      .expect(404, {
        statusCode: 404,
        message: "No such user!",
      });

    await request(app.getHttpServer()).delete(`/users/${userId}`).expect(200);

    done();
  });

  it("/auth (POST) - registration - success (should create new user and return confirmation message with status 201)", async (done) => {
    await request(app.getHttpServer())
      .post("/auth/registration")
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        expect(body).toEqual(registerUserExpectedResult);
      });

    await queryRunner.query(
      "DELETE FROM `users` WHERE `email`='Desoul40@mail.ru'"
    );

    done();
  });

  it('/auth (POST) - registration - fail (response status 400 with message "User with this email already exists"))', async (done) => {
    await request(app.getHttpServer())
      .post("/auth/registration")
      .send(createUserDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        expect(body).toEqual(registerUserExpectedResult);
      });

    await request(app.getHttpServer())
      .post("/auth/registration")
      .send(createUserDto)
      .expect(400, {
        statusCode: 400,
        message: "User with this email already exists",
      });

    await queryRunner.query(
      "DELETE FROM `users` WHERE `email`='Desoul40@mail.ru'"
    );

    done();
  });

  it("/auth (POST) - registration - fail (response status 400 with validation messages)", async (done) => {
    await request(app.getHttpServer())
      .post("/auth/registration")
      .send(invalidTypeCreateUserDto)
      .expect(400, ["email - invalid email", "password - must be a string"]);

    await queryRunner.query(
      "DELETE FROM `users` WHERE `email`='Desoul40@mail.ru'"
    );

    done();
  }); */

  afterAll(async (done) => {
   // await app.close();
   // await downEnv();
   await environment.down();
    done();
  });
});
