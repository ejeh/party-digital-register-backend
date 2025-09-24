import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
@Schema()
export class Tenant extends Document {
  @Prop({ required: true })
  party: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true, unique: true })
  tenantId: string;

  @Prop({ required: false })
  logo?: string; // File path or URL
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
