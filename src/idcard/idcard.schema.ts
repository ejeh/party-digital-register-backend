import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class IdCard extends Document {
  @ApiProperty({
    description: 'User ID',
    example: '1234567890',
  })
  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String, required: true })
  firstname: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String, required: true })
  middlename: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String, required: true })
  lastname: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String, required: true, unique: true })
  email: string;

  @ApiProperty()
  @Prop({
    type: mongoose.SchemaTypes.String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  })
  status: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String })
  rejectionReason?: string;

  @Prop({ default: true })
  resubmissionAllowed: boolean;

  @Prop({ default: 0 })
  resubmissionAttempts: number;

  @ApiProperty()
  @Prop({ default: false })
  downloaded: Boolean;

  @Prop({ required: true, default: new Date().toISOString() })
  dateOfIssue: Date;

  @Prop({ required: true, default: new Date().toISOString() })
  dateOfExpiration: Date;

  @Prop({ required: false, default: null })
  qrCodeUrl?: string; // URL for the QR code
  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String, required: false, default: null })
  voters_card_no?: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String, required: false, default: null })
  polling_unit?: string;

  @Prop({ required: false, default: null })
  membership_no?: string; // URL for the QR code

  @Prop({ required: false, default: null })
  lga?: string; // URL for the QR code

  @Prop({ required: false, default: null })
  ward?: string; // URL for the QR code

  @ApiProperty()
  @Prop({
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true,
  })
  phone: string;
}

export const IdCardSchema = SchemaFactory.createForClass(IdCard);
