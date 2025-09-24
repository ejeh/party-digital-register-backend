import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { NewsScope, NewsStatus } from '../constants/news.constants';

@Schema({ timestamps: true })
export class News extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: String,
    enum: Object.values(NewsScope),
    required: true,
  })
  scope: NewsScope;

  @Prop({
    required: function () {
      return this.scope === NewsScope.STATE;
    },
  })
  state?: string;

  @Prop({
    type: String,
    enum: Object.values(NewsStatus),
    default: NewsStatus.PUBLISHED,
  })
  status: NewsStatus;

  @Prop()
  imageUrl?: string;

  @Prop()
  attachments?: string[];

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  author: string; // User ID who created the news

  @Prop({ default: false })
  isCircular: boolean;

  @Prop()
  expiryDate?: Date;
}

export const NewsSchema = SchemaFactory.createForClass(News);
