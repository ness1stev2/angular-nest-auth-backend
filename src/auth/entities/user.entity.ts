import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {

    _id: string; // esto lo agrega mongo automaticamente

    @Prop( { unique: true, required: true} )
    email: string;

    @Prop( {require: true} )
    name: string;
    
    @Prop( {require: false} )
    apellidos: string;

    @Prop( { required: false, unique: true })
    nSocio: number; 

    @Prop( { minlength: 6, required: true } )
    password?: string;

    @Prop( { default: true } )
    isActive: boolean;

    @Prop( { type: [String], default: ['user'] } ) // ['user', 'admin']
    roles: string[];

}


export const UserSchema = SchemaFactory.createForClass( User )
