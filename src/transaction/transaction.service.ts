// import { Injectable } from '@nestjs/common';
// import mongoose, { Model, Types } from 'mongoose';
// import { Transaction } from './transaction.schema';
// import { InjectModel } from '@nestjs/mongoose';
// import axios from 'axios';
// import { IndigeneCertificateService } from 'src/indigene-certificate/indigene-certificate.service';

// @Injectable()
// export class TransactionService {
//   constructor(
//     @InjectModel('Transaction')
//     private readonly transactionModel: Model<Transaction>,
//     private readonly indigeneCertificateService: IndigeneCertificateService,
//   ) {}
//   private readonly baseUrl = 'https://api.credodemo.com'; // Update if needed
//   private readonly secretKey = process.env.CREDO_SECRET_KEY; // Store in .env

//   async initializePayment(data: {
//     cardId: string;
//     userId: string;
//     amount: number;
//     email: string;
//     currency?: string;
//   }) {
//     const reference = `ref_${Date.now()}`;
//     const bearer = 0;

//     // Store transaction with user ID
//     const newTransaction = new this.transactionModel({
//       cardId: new mongoose.Types.ObjectId(data.cardId), // Ensure it's an ObjectId
//       userId: new mongoose.Types.ObjectId(data.userId), // Ensure it's an ObjectId
//       reference,
//       amount: data.amount,
//       email: data.email,
//       status: 'pending',
//       currency: data.currency || 'NGN',
//     });
//     await newTransaction.save();

//     // Call Credo API
//     const url = `${this.baseUrl}/transaction/initialize`;
//     const payload = { ...data, bearer, reference, amount: data.amount * 100 };
//     const headers = {
//       Authorization: `${this.secretKey}`,
//       'Content-Type': 'application/json',
//     };

//     const response = await axios.post(url, payload, { headers });

//     return response.data;
//   }

//   async verifyPayment(reference: string) {
//     const url = `${this.baseUrl}/transaction/${reference}/verify`;
//     const headers = { Authorization: `${this.secretKey}` };

//     const transaction = await this.transactionModel.findOne({
//       reference,
//     });

//     if (!transaction) {
//       throw new Error('Transaction not found');
//     }

//     if (transaction.status !== 'pending') {
//       throw new Error('Transaction already processed');
//     }

//     const response = await axios.get(url, { headers });

//     if (response.data.status === 200) {
//       await this.transactionModel.findOneAndUpdate(
//         { reference },
//         { status: 'successful' },
//       );
//     } else {
//       await this.transactionModel.findOneAndUpdate(
//         { reference },
//         { status: 'failed' },
//       );
//     }

//     return response.data;
//   }

//   async getUserTransactions(userId: string) {
//     return this.transactionModel.find({ userId }).sort({ createdAt: -1 });
//   }

//   async getPaginatedData(page: number, limit: number) {
//     const skip = (page - 1) * limit;
//     const data = await this.transactionModel
//       .find()
//       .skip(skip)
//       .limit(limit)
//       .exec();
//     const totalCount = await this.transactionModel.countDocuments().exec();
//     return {
//       data,
//       hasNextPage: skip + limit < totalCount,
//     };
//   }

//   async getApprovedItems(): Promise<any[]> {
//     // Fetch payments with status 'successful'
//     const completedPayments = await this.transactionModel
//       .find({ status: 'successful' })
//       .populate('cardId') // Populate item details
//       .exec();

//     console.log('Completed Payments:', completedPayments);

//     // Extract item IDs from completed payments
//     const itemIds = completedPayments.map((payment) => {
//       if (!Types.ObjectId.isValid(payment.cardId)) {
//         throw new Error(`Invalid ObjectId: ${payment.cardId}`);
//       }
//       return payment.cardId.toString();
//     });

//     console.log('Item IDs:', itemIds);

//     // Fetch items corresponding to the item IDs
//     const approvedItems =
//       await this.indigeneCertificateService.findByIds(itemIds);
//     console.log(approvedItems);
//     return approvedItems;
//   }
// }
