import { forwardRef, Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import * as dotenv from "dotenv";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { PassportModule } from "@nestjs/passport";
dotenv.config();

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.PRIVATE_KEY,
      signOptions: {
        expiresIn: "24h",
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,  JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
