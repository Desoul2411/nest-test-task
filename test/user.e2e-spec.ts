
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../src/modules/users/dto/update-user.dto';
import { Connection } from 'typeorm';
import { generateString } from '../src/utils/generators.utils';
import * as bcrypt from "bcrypt";
import { response } from 'express';
import { User } from '../src/modules/users/entities/user.entity';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let userId: string;
    let passwordGenerated = generateString(12);
    let userPasswordHashed;

    let adminUserResponseData: User;
    let createUserDto: CreateUserDto;
    let createSecondUserDto: CreateUserDto;
    let createdUserExpectedResult: User;
    let getAllUsers: User[];


    const invalidTypeCreateUserDto = {
        email: "Desoul40mail.ru",
        password: 123456,
        name: "John",
        birthdate: "20.11.88"
    }
    

    beforeAll(async (done) => {
        const module: TestingModule = await Test.createTestingModule({
          imports: [AppModule],
        }).compile();

        app = module.createNestApplication();
        app.get(Connection);
        await app.init();

    
        const userPasswordHashed  = await bcrypt.hash(passwordGenerated,5);


        createUserDto = {
            email: "Desoul40@mail.ru",
            password: userPasswordHashed,
            name: "John",
            birthdate: "20.11.88"
        };

        createSecondUserDto = {
            email: "Desoul41@mail.ru",
            password: userPasswordHashed,
            name: "Jack",
            birthdate: "20.11.98"
        };

        createdUserExpectedResult = {
            id: "df229c80-7432-4951-9f21-a1c5f803a738",
            email : "Desoul40@mail.ru",
            password: userPasswordHashed,
            role: "USER",
            name : "John",
            birthdate: "20.11.88"
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

    it('/users (POST) - create - success', async (done) => {
        await request(app.getHttpServer())
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

        await request(app.getHttpServer())
            .delete(`/users/${userId}`)
            .expect(200);
        done();
    });

    it('/users (POST) - create - fail (response status 400 with error message "User with this email already exists")', async (done) => {
        await request(app.getHttpServer())
            .post('/users')
            .send(createUserDto)
            .expect(201)
            .then(({ body }: request.Response) => {
                userId = body.id;
            });

        await request(app.getHttpServer())
        .post('/users')
            .send(createUserDto)
            .expect(400, {
                statusCode: 400,
                message: "User with this email already exists"
            });

        await request(app.getHttpServer())
            .delete(`/users/${userId}`)
            .expect(200);
        done();
    });

    it('/users (POST) - create - fail (response status 400 with some validation message - invalid password and email)', async (done) => {
        await request(app.getHttpServer())
            .post('/users')
            .send(invalidTypeCreateUserDto)
            .expect(400, [
                "email - invalid email",
                "password - must be a string"
            ]);
        done();
    });
    
    it('/users (GET) - getAllUsers - success (should return users array)', async (done) => {
        await request(app.getHttpServer())
            .get('/users')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(({ body }: request.Response) => {
                expect(body[0].email).toEqual(adminUserResponseData.email);
                expect(body[0].name).toEqual(adminUserResponseData.name);
                expect(body[0].password).toEqual(expect.any(String));
                expect(body[0].birthdate).toEqual(adminUserResponseData.birthdate);
                expect(body[0].id).toEqual(expect.any(String));
            });
        done();
    });





    afterAll(async (done) => {
        await app.close();
        done();
    });
});