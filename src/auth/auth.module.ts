import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    // Importación del módulo de configuración de NestJS
    ConfigModule.forRoot(),

    // Importación del módulo Mongoose para trabajar con MongoDB
    MongooseModule.forFeature([
      {
        // Definición del nombre del modelo y su respectivo esquema
        name: User.name,
        schema: UserSchema
      }
    ]),
    // Importación del módulo JWT para trabajar con autenticación basada en tokens
    JwtModule.register({
      // Configuración global del módulo JWT
      global: true,
      // Clave secreta para firmar y verificar tokens (tomada de las variables de entorno)
      secret: process.env.JWT_SEED,
      // Opciones de firma del token (en este caso, expira en 6 horas)
      signOptions: { expiresIn: '6h' },
    }),
  ]
})
export class AuthModule {}
