import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ _id: false })
export class PollingUnitLocation {
  @Prop({
    required: true,
    uppercase: true, // Store as uppercase
  })
  state: string;

  @Prop({
    required: true,
    uppercase: true,
  })
  lga: string;

  @Prop({
    required: true,
    uppercase: true,
  })
  ward: string;

  @Prop({
    required: true,
    uppercase: true,
  })
  pollingUnitCode: string;
}

@Schema()
export class PollingUnit extends Document {
  @Prop({ type: PollingUnitLocation, required: true })
  location: PollingUnitLocation;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  registeredVoters: number;

  @Prop({ default: 0 })
  accreditedVoters: number;

  @Prop()
  address?: string;

  @Prop()
  gpsCoordinates?: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', required: true })
  createdBy: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const PollingUnitSchema = SchemaFactory.createForClass(PollingUnit);
