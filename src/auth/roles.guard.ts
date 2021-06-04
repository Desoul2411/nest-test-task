import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { ROLE_KEY } from './rolse.auth.decorator';


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector
        ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const requiredRole = this.reflector.getAllAndOverride<string>(ROLE_KEY, [
                context.getHandler(),
                context.getClass()
            ]);

            if (!requiredRole) {
                return true;
            }

            const req = context.switchToHttp().getRequest();
            const authHeader = req.headers.authorization;
            const bearer = authHeader.split(' ')[0];
            const token = authHeader.split(' ')[1];

            if (bearer !== 'Bearer' || !token) {
                throw new UnauthorizedException({ message: 'User is not authorized!' });
            }

            const user = this.jwtService.verify(token);
            req.user = user;
        
            if (requiredRole.includes(user.role)) {
                return true
            }
            throw new HttpException({ message: 'Access forbidden!' }, HttpStatus.FORBIDDEN);

        } catch (e) {
            throw new HttpException({ message: 'Access forbidden!' }, HttpStatus.FORBIDDEN);
        }
    }
}