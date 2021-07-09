import { ApiProperty } from "@nestjs/swagger";

export class TokenResponse {
  @ApiProperty({
    default:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyODRmNDg1Ni1jODNtLTExZWItYTJlNi0wMjQyYWMxNTAwMDIiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE2MjMyMzIzMDYsImV4cCI6MTYyMzMxODcwNn0.cfCpuIGVKW2j9bzRhCPChTq5CW8iEwajhs63TZk_RZs",
  })
  token: string;
};

export class ReigestrationSuccessResponse {
  @ApiProperty({
    default: "Registered successfully!",
  })
  message: string;
};
