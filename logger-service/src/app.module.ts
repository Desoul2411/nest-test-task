import { Module } from '@nestjs/common';
import { ConsumerModule } from './modules/consumer/consumer.module';
import { ConsumerController } from './modules/consumer/consumer.controller';

@Module({
  imports: [ConsumerModule],
  controllers: [ConsumerController],
  providers: [],
})
export class AppModule {}
