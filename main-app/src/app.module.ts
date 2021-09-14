import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import ormconfig = require("./config/ormconfig");
import { Connection } from "typeorm";

@Module({
  imports: [TypeOrmModule.forRoot(ormconfig), UsersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
