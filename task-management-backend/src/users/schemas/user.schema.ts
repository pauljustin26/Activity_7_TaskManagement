import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // In a real app, this must be hashed (bcrypt)

  @Prop({ default: 'developer' })
  role: string; // 'admin', 'project_manager', 'developer'
}

export const UserSchema = SchemaFactory.createForClass(User);