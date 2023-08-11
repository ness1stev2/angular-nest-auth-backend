import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import * as bcryptjs from "bcryptjs";

import { CreateUserDto, RegisterUserDto, UpdateAuthDto, LoginDto } from './dto/';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

@Injectable()
export class AuthService {

  constructor(
    // Inyección del modelo Mongoose para el usuario y el servicio de JWT
    @InjectModel(User.name) // Inyección del modelo Mongoose para el usuario definido en User.name
    private userModel: Model<User>, // Variable que contendrá el modelo del usuario para interactuar con la base de datos
    private jwtService: JwtService, // Variable que contendrá el servicio de JWT para manejar tokens de autenticación
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {

      // 1.- Encriptar la contraseña
      //Desestructuramos el password de createUserDto y lo demas lo guardamos en la propiedad userData
      const { password, ...userData } = createUserDto;
      const newUser = new this.userModel({
        // Incriptamos el password  
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });

      // 2.- Guardar el usuario
      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();
      return user;

    } catch (error) {
      // si el error es igual a 11000
      if (error.code === 11000) {
        // hacemos una excepcion he imprimimos el email y agregamos mensaje ya existe!
        throw new BadRequestException(`${createUserDto.email} already exist!`)
      }
      // Sino imprimimos un error de servidor con un mensaje
      console.log(error)
      throw new InternalServerErrorException('Something terrible happen!!')
    }

  }


  async register( registerDto: RegisterUserDto ): Promise<LoginResponse> {
    const user = await this.create( registerDto )

    return {
      user: user,
      token: this.getJwtToken( {id: user._id} )
    }
  }


  async login( loginDto: LoginDto ): Promise<LoginResponse> {
    // regrese el User { _id, name, email, roles } y el token de acceso

    const { email, password } = loginDto;

    // si se encuentra un usuario en la base de datos se guardara en user
    const user = await this.userModel.findOne({ email });

    // si no existe manda un mensaje de error
    if( !user ){
      // No mandar mensaje en produccion que es el email el que esta mal 
      throw new UnauthorizedException('Nor valid credentials - email')
    }
    
    // Si la contraseña ingresada no hace match con la contraseña en la BD mandamos un error
    if ( !bcryptjs.compareSync( password, user.password )){
      throw new UnauthorizedException('Nor valid credentials - password')
    }

    // renombramos la propiedad password para no mandarla y lo deas lo guardamos en la propiedad rest
    const { password:_, ...rest } = user.toJSON();
    
    return {
      user: rest,
      token: this.getJwtToken({ id: user.id})
    }

  }


  findAll(): Promise<User[]> {
    return this.userModel.find()
  }

  async findUserById( id: string ) {
    const user = await this.userModel.findById( id );
    const { password, ...rest } = user.toJSON();
    return rest
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken( payload: JwtPayload ){
    const token = this.jwtService.sign(payload)
    return token;
  }
}