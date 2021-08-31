import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { getTokenFromAuthHeader } from "src/helpers/getTokenFromAuthHeader";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const token = getTokenFromAuthHeader(req.headers.authorization);
      const user = this.jwtService.verify(token);
      req.user = user;

      return true;
    } catch (error) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "User is not authorized!",
      });
    }
  }
}
