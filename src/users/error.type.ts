import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse500 {
    @ApiProperty({
      default: 500,
    })
    statusCode: number;
    @ApiProperty({
      default: 'Internal server error',
    })
    message: string;
}


export class ErrorResponse403 {
    @ApiProperty({
      default: 403,
    })
    statusCode: number;
    @ApiProperty({
      default: 'Access forbidden!',
    })
    message: string;
}
  
  export class ErrorResponse404 {
    @ApiProperty({
      default: 404,
    })
    statusCode: number;
    @ApiProperty({
      default: 'No such user!',
    })
    message: string;
  }

export class ErrorResponse401 {
    @ApiProperty({
    default: 401,
    })
    statusCode: number;
    @ApiProperty({
    default: 'Invalid email or password',
    })
    message: string;
}

export class ErrorNotAthorized401 {
    @ApiProperty({
    default: 401,
    })
    statusCode: number;
    @ApiProperty({
    default: 'Invalid email or password',
    })
    message: string;
}

export class ErrorValidation400 {
    @ApiProperty({
    default: 400,
    })
    statusCode: number;
    @ApiProperty({
    default: "password - must be between 5 and 14 characters, Must be a string",
    })
    message: string;
}

export class ErrorEmailExists400 {
    @ApiProperty({
    default: 400,
    })
    statusCode: number;
    @ApiProperty({
    default: 'User with this email already exists',
    })
    message: string;
}





