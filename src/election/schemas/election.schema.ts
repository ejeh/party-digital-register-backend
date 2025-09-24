// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';
// import {
//   ElectionType,
//   ElectionStatus,
//   ElectionLevel,
// } from '../constants/election.constants';

// @Schema({ timestamps: true })
// export class Election extends Document {
//   @Prop({ required: true })
//   title: string;

//   @Prop({
//     type: String,
//     enum: Object.values(ElectionType),
//     required: true,
//   })
//   type: ElectionType; // 'primary' | 'general'

//   @Prop({ required: true })
//   startDate: Date;

//   @Prop({ required: true })
//   endDate: Date;

//     @Prop({ required: true })
//   candidateRegistrationStart: Date;

//   @Prop({ required: true })
//   candidateRegistrationEnd: Date;

//   @Prop({
//     type: String,
//     enum: Object.values(ElectionStatus),
//     default: ElectionStatus.UPCOMING,
//   })
//   status: ElectionStatus;

//   @Prop({ type: String, required: true,
//       validate: {
//       validator: function(positions: string[]) {
//         return positions.length > 0;
//       },
//       message: 'At least one position is required'
//     }
//    })
//   positions: string[]; // List of positions being contested

//   @Prop({
//     maxlength: 500
//   })
//   description?: string;

//   @Prop()
//   location?: string;

//   @Prop({
//     type: String,
//     enum: Object.values(ElectionLevel),
//   })
//   level: ElectionLevel;
// }

// export const ElectionSchema = SchemaFactory.createForClass(Election);

// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';
// import {
//   ElectionType,
//   ElectionStatus,
//   ElectionLevel,
// } from '../constants/election.constants';

// @Schema({ timestamps: true })
// export class Election extends Document {
//   @Prop({ required: true, maxlength: 100 })
//   title: string;

//   @Prop({
//     type: String,
//     enum: Object.values(ElectionType),
//     required: true,
//     index: true,
//   })
//   type: ElectionType;

//   @Prop({
//     type: String,
//     enum: Object.values(ElectionLevel),
//   })
//   level: ElectionLevel;

//   @Prop({ required: true, index: true })
//   startDate: Date;

//   @Prop({ required: true })
//   endDate: Date;

//   @Prop({ required: true })
//   candidateRegistrationStart: Date;

//   @Prop({ required: true })
//   candidateRegistrationEnd: Date;

//   @Prop({
//     type: String,
//     enum: Object.values(ElectionStatus),
//     default: ElectionStatus.UPCOMING,
//     index: true,
//   })
//   status: ElectionStatus;

//   @Prop({
//     type: [String],
//     required: true,
//     validate: {
//       validator: function (positions: string[]) {
//         return positions.length > 0;
//       },
//       message: 'At least one position is required',
//     },
//   })
//   positions: string[];

//   @Prop({ maxlength: 500 })
//   description?: string;

//   // Geographical scope
//   @Prop({ required: true, default: 'Nigeria' })
//   country: string;

//   @Prop({ index: true })
//   state?: string; // For state-level elections
// }

// export const ElectionSchema = SchemaFactory.createForClass(Election);

// // Create compound indexes for common queries
// ElectionSchema.index({ type: 1, state: 1 });
// ElectionSchema.index({ state: 1, lga: 1 });
// ElectionSchema.index({ status: 1, startDate: 1 });
// ElectionSchema.index({ country: 1, type: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  ElectionType,
  ElectionStatus,
  ElectionLevel,
} from '../constants/election.constants';

@Schema({ timestamps: true })
export class Election extends Document {
  @Prop({ required: true, maxlength: 100 })
  title: string;

  @Prop({
    type: String,
    enum: Object.values(ElectionType),
    required: true,
    index: true,
  })
  type: ElectionType;

  @Prop({
    type: String,
    enum: Object.values(ElectionLevel),
    required: true,
    index: true,
  })
  level: ElectionLevel;

  @Prop({ required: true, index: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  candidateRegistrationStart: Date;

  @Prop({ required: true })
  candidateRegistrationEnd: Date;

  @Prop({
    type: String,
    enum: Object.values(ElectionStatus),
    default: ElectionStatus.UPCOMING,
    index: true,
  })
  status: ElectionStatus;

  @Prop({
    type: [String],
    required: true,
    validate: {
      validator: (positions: string[]) => positions.length > 0,
      message: 'At least one position is required',
    },
  })
  positions: string[];

  @Prop({ maxlength: 500 })
  description?: string;

  @Prop({ required: true, default: 'Nigeria' })
  country: string;

  @Prop({ index: true })
  state?: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const ElectionSchema = SchemaFactory.createForClass(Election);

// Compound unique index for business uniqueness
ElectionSchema.index(
  { type: 1, level: 1, state: 1, startDate: 1 },
  { unique: true, sparse: true },
);

// Other useful indexes for queries
ElectionSchema.index({ type: 1, state: 1 });
ElectionSchema.index({ state: 1, lga: 1 });
ElectionSchema.index({ status: 1, startDate: 1 });
ElectionSchema.index({ country: 1, type: 1 });
