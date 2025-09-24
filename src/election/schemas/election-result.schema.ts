import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PollingUnitLocation } from './polling-unit.schema';

@Schema({ timestamps: true })
export class ElectionResult extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Election', required: true })
  electionId: string; // Reference to Election

  @Prop({ type: PollingUnitLocation, required: true })
  location: PollingUnitLocation;

  @Prop({ required: true })
  position: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Candidate' })
  candidateId: string; // Candidate ID or name

  @Prop({ required: true, default: 0 })
  votes: number;

  @Prop({ type: mongoose.Types.ObjectId, required: true, ref: 'User' })
  submittedBy: string; // User ID who submitted

  @Prop()
  images?: string[]; // Evidence photos

  @Prop()
  notes?: string;

  @Prop({ required: true })
  registeredVoters: number;

  @Prop({ required: true })
  accreditedVoters: number;

  @Prop({ required: true })
  votesCast: number;

  @Prop({ required: true })
  validVotes: number;

  @Prop({ required: true })
  rejectedVotes: number;

  @Prop({ type: Map, of: Number }) // candidateId -> votes
  candidateResults: Map<string, number>;

  @Prop()
  videos: string[];

  @Prop()
  documents: string[];

  @Prop({ default: false })
  isApproved: boolean;
}

export const ElectionResultSchema =
  SchemaFactory.createForClass(ElectionResult);

ElectionResultSchema.index({
  electionId: 1,
  'location.state': 1,
  'location.lga': 1,
  'location.ward': 1,
  'location.pollingUnitCode': 1,
  isApproved: 1,
});
