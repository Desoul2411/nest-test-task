import { MigrationInterface, QueryRunner } from "typeorm";

export class addAdmin1622810880072 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("INSERT INTO `users` (`email`,`password`, `role`, `name`, `birthdate`) VALUES('Desoul24@mail.ru','$2b$05$x2r6u3hRifB4WENvbT2RP.G7mcBc7hEKcbjGd7b.PUYEvzjIbFSei','ADMIN', 'slava', '20.11.1988')");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DELETE FROM `users` WHERE role = ADMIN");
    }
}
