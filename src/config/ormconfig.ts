import { ConnectionOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const ormconfig: TypeOrmModuleOptions = {
    type: "mysql",
    host: "172.21.0.2",
    port: 3306,
    username: "Desoul2411",
    password: "32167", 
    database: "test_db",
    entities: ['dist' + '/**/*.entity{.ts,.js}'],
    dropSchema:  false,
    synchronize: false,
    migrationsRun: false,
    logging: false,
    migrations: [__dirname + '/..' + '/migrations/*{.ts,.js}'],
    cli: {
        migrationsDir: 'src/migrations'
    }
};

export = ormconfig;