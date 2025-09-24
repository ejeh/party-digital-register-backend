// import {
//   Body,
//   Controller,
//   Get,
//   Param,
//   Post,
//   Query,
//   Req,
//   Res,
//   UseGuards,
// } from '@nestjs/common';
// import { TransactionService } from './transaction.service';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// import { Roles } from 'src/common/decorators/roles.decorator';
// import { UserRole } from 'src/users/users.role.enum';
// import { RolesGuard } from 'src/common/guards/roles.guard';

// @Controller('api/transaction')
// export class TransactionController {
//   constructor(private readonly transactionService: TransactionService) {}

//   @UseGuards(JwtAuthGuard) // Protect endpoint
//   @Post('pay')
//   async initializePayment(
//     @Body()
//     data: {
//       cardId: string;
//       userId: string;
//       amount: number;
//       email: string;
//     },
//   ) {
//     console.log(data);
//     return this.transactionService.initializePayment(data);
//   }

//   @Get('approved-items')
//   async getApprovedItems() {
//     return this.transactionService.getApprovedItems();
//   }
//   @Roles(UserRole.SUPER_ADMIN)
//   @UseGuards(JwtAuthGuard, RolesGuard) // Protect endpoint
//   @Get('verify/:reference')
//   async verifyPayment(@Param('reference') reference: string) {
//     return this.transactionService.verifyPayment(reference);
//   }

//   @UseGuards(JwtAuthGuard)
//   @Get(':userId')
//   async getUserTransactions(@Param('userId') userId: string) {
//     return this.transactionService.getUserTransactions(userId);
//   }

//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserRole.SUPER_ADMIN)
//   @Get()
//   async getPaginatedData(
//     @Query('page') page: number = 1,
//     @Query('limit') limit: number = 10,
//   ) {
//     return this.transactionService.getPaginatedData(page, limit);
//   }
// }
