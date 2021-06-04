import {MigrationInterface, QueryRunner} from "typeorm";

export class addAdmin1622810880072 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("INSERT INTO `users` (`id`,`email`,`password`, `role`, `name`, `birthdate`) VALUES('37bae34a-4a77-4ffc-9882-2d92270d8df0','Desoul24@mail.ru','$2b$05$x2r6u3hRifB4WENvbT2RP.G7mcBc7hEKcbjGd7b.PUYEvzjIbFSei','ADMIN', 'slava', '20.11.1988')");
 
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DELETE FROM `users` WHERE role = ADMIN");
    }

}
