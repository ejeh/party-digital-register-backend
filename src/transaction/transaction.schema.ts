// import { Schema, Document, Types } from 'mongoose';

// export interface Transaction extends Document {
//   userId: Types.ObjectId;
//   cardId: Types.ObjectId;
//   reference: string;
//   amount: number;
//   email: string;
//   status: string;
//   currency: string;
//   createdAt: Date;
// }

// export const TransactionSchema = new Schema<Transaction>(
//   {
//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     }, // Link to User model

//     cardId: {
//       type: Schema.Types.ObjectId,
//       ref: 'IdCard',
//       required: true,
//     }, // Link to idcard model

//     reference: { type: String, required: true, unique: true },
//     amount: { type: Number, required: true },
//     email: { type: String, required: true },
//     status: {
//       type: String,
//       required: true,
//       enum: ['pending', 'successful', 'failed'],
//       default: 'pending',
//     },
//     currency: { type: String, default: 'NGN' },
//     createdAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true },
// );
