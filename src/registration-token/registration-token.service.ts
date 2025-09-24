// src/registration-tokens/registration-tokens.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RegistrationToken,
  RegistrationTokenDocument,
} from './registration-token.schema';
import { CreateRegistrationLinkDto } from './dto/create-registration-link.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { RegistrationLinkResponseDto } from './dto/registration-link-response.dto';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class RegistrationTokenService {
  constructor(
    @InjectModel(RegistrationToken.name)
    private registrationTokenModel: Model<RegistrationTokenDocument>,
    private mailService: MailService,
  ) {}

  async create(
    createRegistrationLinkDto: CreateRegistrationLinkDto,
    createdBy: string,
  ): Promise<{ registrationLink: string; expiration: Date }> {
    const { email, expiration = 48 } = createRegistrationLinkDto;

    // Generate token
    const tokenId = uuidv4();
    const secret = process.env.REGISTRATION_SECRET || 'your-secret-key';
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + expiration);

    // Create hash
    const hash = crypto
      .createHmac('sha256', secret)
      .update(`${tokenId}:${email}:${expirationDate.getTime()}`)
      .digest('hex');

    // Create and save the registration token
    const createdToken = new this.registrationTokenModel({
      tokenId,
      hash,
      email,
      expiration: expirationDate,
      createdBy,
    });

    await createdToken.save();

    // Create registration link
    const registrationLink = `${process.env.FRONTEND_URL}/register.html?token=${tokenId}&email=${encodeURIComponent(email)}`;

    return { registrationLink, expiration: expirationDate };
  }

  async findAllDatatables(params: any, createdBy: string) {
    const { start, length, search, order, columns, draw } = params;

    const query: any = { createdBy };

    // 🔍 Search filter
    if (search?.value) {
      query.$or = [{ email: { $regex: search.value, $options: 'i' } }];
    }

    // 🔢 Ordering
    let sort: any = { createdAt: -1 }; // default sort
    if (order?.length > 0) {
      const colIndex = order[0].column;
      const colName = columns[colIndex]?.data || 'createdAt';
      const dir = order[0].dir === 'asc' ? 1 : -1;
      sort = { [colName]: dir };
    }

    // 📊 Fetch filtered data
    const [recordsTotal, recordsFiltered, data] = await Promise.all([
      this.registrationTokenModel.countDocuments({ createdBy }), // total
      this.registrationTokenModel.countDocuments(query), // filtered
      this.registrationTokenModel
        .find(query)
        .sort(sort)
        .skip(Number(start) || 0)
        .limit(Number(length) || 10)
        .exec(), // paginated
    ]);

    // 🛠️ Map data to DTO
    const mappedData = data.map((token) => {
      let status: 'active' | 'expired' | 'used' = 'active';

      if (token.used) {
        status = 'used';
      } else if (new Date() > token.expiration) {
        status = 'expired';
      }

      return {
        id: token._id.toString(),
        email: token.email,
        created: token.createdAt,
        expiration: token.expiration,
        status,
        link: `${process.env.FRONTEND_URL}/private-registration.html?token=${token.tokenId}&email=${encodeURIComponent(token.email)}`,
      };
    });

    // 📦 Return DataTables response
    return {
      draw: Number(draw) || 1,
      recordsTotal,
      recordsFiltered,
      data: mappedData,
    };
  }

  async revoke(id: string, userId: string): Promise<void> {
    const token = await this.registrationTokenModel.findById(id);

    if (!token) {
      throw new Error('Registration link not found');
    }

    if (token.createdBy.toString() !== userId.toString()) {
      throw new Error('You do not have permission to revoke this link');
    }

    // Mark token as used (revoked)
    token.used = true;
    await token.save();
  }

  async sendEmail(sendEmailDto: SendEmailDto): Promise<void> {
    await this.mailService.sendRegistrationTokenMail(
      sendEmailDto,

      //     {
      //     to: email,
      //     subject: subject || 'Private Registration Invitation',
      //     html: emailContent,
      //   }
    );
  }
}
