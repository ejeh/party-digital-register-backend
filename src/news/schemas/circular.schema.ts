import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { CircularAudience } from '../constants/news.constants';

@Schema({ timestamps: true })
export class Circular extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: String,
    enum: Object.values(CircularAudience),
    required: true,
  })
  audience: CircularAudience;

  @Prop()
  specificRoles?: string[];

  @Prop()
  imageUrl?: string;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  author: string; // User ID who created the circular

  @Prop({ default: false })
  requiresAcknowledgement: boolean;

  @Prop({ type: Map, of: Date })
  acknowledgements?: Map<string, Date>; // userID -> timestamp
}

export const CircularSchema = SchemaFactory.createForClass(Circular);
