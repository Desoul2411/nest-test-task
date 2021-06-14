import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const ormconfig: TypeOrmModuleOptions = {
  type: "mysql",
  host: process.env.MYSQL_HOST,
  port: +process.env.HTTP_PORT,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: ["dist" + "/**/*.entity{.ts,.js}"],
  autoLoadEntities: true,
  dropSchema: true,
  synchronize: false,
  migrationsRun: JSON.parse(process.env.DEFAULT_DB_RUN_MIGRATIONS),
  logging: JSON.parse(process.env.DEFAULT_DB_LOGGING),
  migrations: [__dirname + "/.." + "/migrations/*{.ts,.js}"],
  cli: {
    migrationsDir: "src/migrations",
  },
};

export = ormconfig;
