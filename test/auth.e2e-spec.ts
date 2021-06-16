import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/modules/users/dto/create-user.dto';
import { generateString } from '../src/utils/generators.utils';
import * as bcrypt from "bcrypt";
import { User } from '../src/modules/users/entities/user.entity';
import { LoginUserDto } from '../src/modules/users/dto/login-user-dto';
import { Any, QueryRunner } from "typeorm";
import { Connection, getConnection } from 'typeorm';
import { UserDeleted } from 'src/types/user.type';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let queryRunner: QueryRunner;
    let connection: Connection;

    let userId: string;
    let unexistingUserId: string;
    let passwordGenerated: string;
    let userPasswordHashed: string;
    let adminUserResponseData: User;
    let createUserDto: CreateUserDto;
    let deletedUserResponseData: UserDeleted;
    let createdUserExpectedResult: User;
    let updatedUserExpectedResult: User;
    let loginUserDto: LoginUserDto;
    let invalidLoginUserDto;
    let invalidPasswordDTO: LoginUserDto;
    let unexistingUserDTO: LoginUserDto;
    let token: string;

    const invalidTypeCreateUserDto = {
        email: "Desoul40mail.ru",
        password: 123456,
        name: "John",
        birthdate: "20.11.88"
    };
    

    beforeAll(async (done) => {
        const module: TestingModule = await Test.createTestingModule({
          imports: [AppModule],
        }).compile();

        app = module.createNestApplication();
        app.get(Connection);
        await app.init();

        connection = getConnection();
        queryRunner = connection.createQueryRunner();
        await queryRunner.connect();

        unexistingUserId = 'df229c80-7432-4951-9f21-a1c5f803a333';
        passwordGenerated = generateString(12);
        userPasswordHashed  = await bcrypt.hash(passwordGenerated,5);

        createUserDto = {
            email: "Desoul40@mail.ru",
            password: userPasswordHashed,
            name: "John",
            birthdate: "20.11.88"
        };

        loginUserDto = {
            email: "Desoul40@mail.ru",
            password: passwordGenerated
        };

        invalidLoginUserDto = {
            email: "Desoulmail.ru",
            password: 233424234
        };

        invalidPasswordDTO = {
            email: "Desoul40@mail.ru",
            password: 'Kdasd34e3423r',
        };

        unexistingUserDTO = {
            email: "Desoul45@mail.ru",
            password: 'Kdasd34e3423r',
        }

        deletedUserResponseData = {
            email: "Desoul40@mail.ru",
            password: userPasswordHashed,
            role: "USER",
            name: "John",
            birthdate: "20.11.88"
        };

        createdUserExpectedResult = {
            id: "df229c80-7432-4951-9f21-a1c5f803a738",
            email : "Desoul40@mail.ru",
            password: userPasswordHashed,
            role: "USER",
            name : "John",
            birthdate: "20.11.88"
        };

        updatedUserExpectedResult = {
            id: "df229c80-7432-4951-9f21-a1c5f803a738",
            email : "Desoul40@mail.ru",
            password: userPasswordHashed,
            role: "USER",
            name: "Slava",
            birthdate: "20.11.90"
        };

        adminUserResponseData = {
            id: '7e5b1333-cdec-11eb-8230-0242ac150002',
            email: 'Desoul24@mail.ru',
            password: userPasswordHashed,
            role: 'ADMIN',
            name: 'slava',
            birthdate: '20.11.1988'
        };

        done();
    });

    it('/auth (POST) - login - success (should return token)', async (done) => {
        await request(app.getHttpServer())
            .post('/users')
            .send(createUserDto)
            .expect(201)
            .then(({ body }: request.Response) => {
                userId = body.id;
            });

        await request(app.getHttpServer())
            .post('/auth/login')
            .send(loginUserDto)
            .expect(201)
            .then(({ body }: request.Response) => {
                expect(body.token).toEqual(expect.any(String));
            });

        await request(app.getHttpServer())
            .delete(`/users/${userId}`)
            .expect(200);

        done();
    });

    it('/auth (POST) - login - fail (response status 400 with some validation message - password and email)', async (done) => {
        await request(app.getHttpServer())
            .post('/users')
            .send(createUserDto)
            .expect(201)
            .then(({ body }: request.Response) => {
                userId = body.id;
            });

        await request(app.getHttpServer())
            .post('/auth/login')
            .send(invalidLoginUserDto)
            .expect(400, [
                'email - Invalid email',
                'password - must be between 5 and 14 characters, must be a string'
            ]);

        await request(app.getHttpServer())
            .delete(`/users/${userId}`)
            .expect(200);

        done();
    });

    it('/auth (POST) - login - fail (response status 401 with message "Invalid email or password")', async (done) => {
        await request(app.getHttpServer())
            .post('/users')
            .send(createUserDto)
            .expect(201)
            .then(({ body }: request.Response) => {
                userId = body.id;
            });

        await request(app.getHttpServer())
            .post('/auth/login')
            .send(invalidPasswordDTO)
            .expect(401, {
                "message": "Invalid password!"
              });

        await request(app.getHttpServer())
            .delete(`/users/${userId}`)
            .expect(200);

        done();
    });

    it('/auth (POST) - login - fail (response status 404 with message "No such user!")', async (done) => {
        await request(app.getHttpServer())
            .post('/users')
            .send(createUserDto)
            .expect(201)
            .then(({ body }: request.Response) => {
                userId = body.id;
            });
            console.log('unexistingUserDTO', unexistingUserDTO);

        await request(app.getHttpServer())
            .post('/auth/login')
            .send(unexistingUserDTO)
            .expect(404, {
                "statusCode": 404,
                "message": "No such user!"
              });

        await request(app.getHttpServer())
            .delete(`/users/${userId}`)
            .expect(200);

        done();
    });

    afterAll(async (done) => {
        await app.close();
        done();
    });
});

