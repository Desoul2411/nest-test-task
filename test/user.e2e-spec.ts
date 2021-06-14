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
import { User } from 'src/modules/users/entities/user.entity';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let userId: string;
    let passwordGenerated = generateString(12);
    let userPasswordHashed;

    let createUserDto: CreateUserDto;
    let createdUserExpectedResult: User;

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

        createdUserExpectedResult = {
            id: "df229c80-7432-4951-9f21-a1c5f803a738",
            email : "Desoul40@mail.ru",
            password: userPasswordHashed,
            role: "USER",
            name : "John",
            birthdate: "20.11.88"
        };

        done();
    });

    it('/users (POST) - create - success', async (done) => {
        return await request(app.getHttpServer())
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
                done();
            });
    });
    






    afterAll(async (done) => {
        await app.close();
        done();
    });
});