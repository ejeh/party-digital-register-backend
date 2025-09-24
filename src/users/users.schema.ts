import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserPublicData } from './users.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { UserRole } from './users.role.enum';

export type UserMethods = {
  getPublicData: () => UserPublicData;
};

export type UserDocument = User & Document & UserMethods;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class User {
  @ApiProperty()
  @Prop({
    type: mongoose.SchemaTypes.String,
    //  required: true,
    required: function () {
      return this.role !== UserRole.ADMIN;
    },
    unique: false,
  })
  tenantId: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String, required: true, unique: true })
  email: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String, required: true })
  firstname: string;

  @ApiProperty()
  @Prop({
    type: mongoose.SchemaTypes.String,
    //  required: true
    required: function () {
      return this.role !== UserRole.ADMIN;
    },
  })
  party: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String })
  middlename?: string;

  @ApiProperty()
  @Prop({
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true,
  })
  phone: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String, required: true })
  lastname: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.Date })
  DOB?: Date;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String })
  gender?: string;

  @ApiProperty()
  @Prop({ required: false })
  passportPhoto?: string; // File path or URL

  @ApiProperty()
  @Prop({ required: false })
  votersCard?: string; // File path or URL

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String, required: true, unique: true })
  NIN: string;

  @ApiProperty()
  @Prop({
    type: mongoose.SchemaTypes.String,
    default: UserRole.MEMBER,
  })
  role?: UserRole;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String, required: true })
  password: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String })
  voters_card_no?: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String })
  polling_unit?: string;

  @Prop({ type: mongoose.SchemaTypes.String })
  reg_area?: string;

  @Prop({ type: mongoose.SchemaTypes.String })
  membership_no?: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  membership_status?: string;

  @Prop({ type: mongoose.SchemaTypes.String })
  lga: string;

  @Prop({ type: mongoose.SchemaTypes.String })
  ward?: string;

  @Prop({ type: mongoose.SchemaTypes.String })
  state: string;

  @ApiProperty()
  @Prop({ default: false })
  isActive: boolean;

  @ApiProperty()
  @Prop({ default: false })
  otpVerified?: boolean;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String })
  passwordResetToken: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.Number })
  passwordResetExpires: number;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String })
  activationToken: string;

  @ApiProperty()
  @Prop({ type: mongoose.SchemaTypes.String })
  activationExpires: Date;

  @Prop({
    type: {
      cardNumber: { type: String, required: true },
      issueDate: { type: Date, required: true },
      expiryDate: { type: Date, required: true },
      qrCode: { type: String }, // Added qrCode to virtual card
    },
  })
  virtualCard?: {
    cardNumber: string;
    issueDate: Date;
    expiryDate: Date;
    qrCode: string;
  };

  @Prop()
  rejectionReason?: string;

  @Prop()
  rejectedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

/**
 * Methods.
 */
UserSchema.methods.getPublicData = function (): UserPublicData {
  const user = this as UserDocument;

  return {
    email: user.email,
    firstname: user.firstname,
    middlename: user.middlename,
    lastname: user.lastname,
    DOB: user.DOB?.toISOString(),
    phone: user.phone,
    gender: user.gender,
    role: user.role,
    NIN: user.NIN,
    membership_no: user.membership_no,
    voters_card_no: user.voters_card_no,
    polling_unit: user.polling_unit,
    reg_area: user.reg_area,
    membership_status: user.membership_status,
    ward: user.ward,
    lga: user.lga,
    state: user.state,
    party: user.party,
    password: user.password,
    votersCard: user.votersCard,
    passportPhoto: user.passportPhoto,
    virtualCard: user.virtualCard
      ? {
          cardNumber: user.virtualCard.cardNumber,
          issueDate: user.virtualCard.issueDate,
          expiryDate: user.virtualCard.expiryDate,
          qrCode: user.virtualCard.qrCode,
        }
      : undefined,
  };
};
