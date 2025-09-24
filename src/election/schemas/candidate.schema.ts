// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoose, { Document } from 'mongoose';

// @Schema()
// export class Candidate extends Document {
//   @Prop({ type: mongoose.Types.ObjectId, ref: 'User', required: true })
//   userId: string;

//   @Prop({ type: mongoose.Types.ObjectId, ref: 'Election', required: true })
//   electionId: string; // Reference to Election

//   @Prop({ required: true })
//   position: string;

//   @Prop({ required: true })
//   party: string; // 'APC' or other parties if needed

//   @Prop()
//   manifesto?: string;

//   @Prop()
//   imageUrl?: string;

//   @Prop({ default: 0 })
//   totalVotes?: number;

//   @Prop({ default: false })
//   isWinner?: boolean;
// }

// export const CandidateSchema = SchemaFactory.createForClass(Candidate);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ElectionType } from '../constants/election.constants';

@Schema({ timestamps: true })
export class Candidate extends Document {
  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: string;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'Election',
    required: true,
    index: true,
  })
  electionId: string;

  @Prop({ required: true, index: true })
  position: string;

  @Prop({
    required: true,
    enum: ['APC', 'PDP', 'LP', 'NNPP', 'OTHER'],
    uppercase: true,
  })
  party: string;

  @Prop({
    type: String,
    maxlength: 2000,
  })
  manifesto?: string;

  @Prop({
    validate: {
      validator: function (url: string) {
        if (!url) return true;
        return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i.test(url);
      },
      message:
        'Image URL must be a valid image file (png, jpg, jpeg, gif, webp)',
    },
  })
  imageUrl?: string;

  @Prop({
    default: 0,
    min: 0,
  })
  totalVotes?: number;

  @Prop({ default: false })
  isWinner?: boolean;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: string;

  @Prop()
  rejectionReason?: string;

  // Election type and location fields
  @Prop({
    required: true,
    enum: ElectionType,
  })
  electionType: ElectionType;

  @Prop()
  state?: string;

  @Prop()
  lga?: string;

  @Prop()
  ward?: string;

  @Prop({ default: false })
  deleted: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);

// Create compound indexes for better query performance
CandidateSchema.index({ electionId: 1, position: 1 });
CandidateSchema.index({ electionId: 1, party: 1 });
CandidateSchema.index({ electionId: 1, userId: 1 }, { unique: true });
CandidateSchema.index({ electionType: 1, state: 1, lga: 1, ward: 1 });
