import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller('consumer')
export class ConsumerController {
  @EventPattern('log_user')
  async login_user(data: string) {
    console.log(data);
  }
}
