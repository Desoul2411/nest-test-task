import { HttpStatus, UnauthorizedException } from "@nestjs/common";

export const getTokenFromAuthHeader = (authHeader: string | undefined) => {
  const authHeaderArr = authHeader?.split(" ");
  const bearer = authHeaderArr && authHeaderArr[0];
  const token = authHeaderArr && authHeaderArr[1];

  if (bearer !== "Bearer" || !token) {
    throw new UnauthorizedException({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: "User is not authorized!",
    });
  }

  return token;
};
