// src/registration-tokens/schemas/registration-token.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type RegistrationTokenDocument = RegistrationToken & Document;

@Schema({ timestamps: true })
export class RegistrationToken {
  @Prop({ required: true, unique: true })
  tokenId: string;

  @Prop({ required: true })
  hash: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  expiration: Date;

  @Prop({ default: false })
  used: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  createdBy: string;

  createdAt: Date;
}

export const RegistrationTokenSchema =
  SchemaFactory.createForClass(RegistrationToken);
