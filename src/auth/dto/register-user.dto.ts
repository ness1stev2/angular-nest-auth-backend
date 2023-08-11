import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterUserDto {

    @IsString()
    name: string;
    
    @IsString()
    nSocio: string;

    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

}