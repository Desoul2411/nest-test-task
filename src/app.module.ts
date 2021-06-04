import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      // host: 'localhost',
      host: '172.21.0.2',//process.env.MYSQL_HOST,
      port: +process.env.HTTP_PORT,
      username: 'Desoul2411',//process.env.MYSQL_USER,
      password: '32167', //process.env.MYSQL_PASSWORD,
      database: 'test_db',//process.env.MYSQL_DATABASE,
      entities: [User],
      synchronize: false,
      dropSchema: true,
      cli: {
        "migrationsDir": "src/migrations",
     }
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
