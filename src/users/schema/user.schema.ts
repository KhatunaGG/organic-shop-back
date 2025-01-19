import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Role } from 'src/auth/decorators/roles.customdecorator';

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase',
    },
  ])
  purchases: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: String,
    enum: [Role.ADMIN, Role.USER],
    default: Role.USER,
  })
  role: Role;
}

export const UserScheme = SchemaFactory.createForClass(User);
