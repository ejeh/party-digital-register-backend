// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';
import config from 'src/config';
import { MailerService } from '@nest-modules/mailer';
import { SendEmailDto } from 'src/registration-token/dto/send-email.dto';

@Injectable()
export class MailService {
  private mg: ReturnType<Mailgun['client']>;
  private domain: string;

  constructor(
    private configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
    const mailgun = new Mailgun(formData);
    this.mg = mailgun.client({
      username: 'api',
      key: this.configService.get<string>('MAILGUN_API_KEY'),
    });

    this.domain = this.configService.get<string>('MAILGUN_DOMAIN');
  }

  async sendActivationMail(
    to: string,
    userId: string,
    activationToken: string,
    templateName: string,
  ) {
    const getBaseUrl = (): string =>
      config.isDev
        ? process.env.BASE_URL || 'http://localhost:5000'
        : 'https://api.citizenship.benuestate.gov.ng';

    const activationUrl = `${getBaseUrl()}/api/auth/activate/${userId}/${activationToken}`;

    const context = { link: activationUrl };

    // Skip sending in test mode
    if (config.isTest) {
      console.log(
        `[Mailgun] Test mode: Pretending to send activation to ${to}`,
      );
      return { success: true, dev: true };
    }

    try {
      // In dev (sandbox), make sure recipient is authorized
      if (config.isDev) {
        console.warn(
          `[Mailgun Sandbox] Only authorized recipients can receive emails. Check Mailgun dashboard for ${to}`,
        );
      }

      const templatePath = path.join(
        process.cwd(),
        'templates',
        `${templateName}.hbs`,
      );
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
      }

      const source = fs.readFileSync(templatePath, 'utf-8');
      const compiled = handlebars.compile(source);
      const html = compiled(context);

      const response = await this.mg.messages.create(this.domain, {
        from: `Party Membership System <noreply@${this.domain}>`,
        to,
        subject: 'Welcome to Party membership and Electoral Management System ',
        html,
      });

      return { success: true, response };
    } catch (error) {
      console.error('Mailgun Error:', error);
      return {
        success: false,
        message:
          error?.details || error?.message || 'Failed to send activation email',
        status: error?.status || 500,
      };
    }
  }

  async sendForgottenPasswordMail(to: string, code: string, origin: string) {
    const context = {
      baseUrl: origin,
      code, // 4-digit code to be used in the template
    };

    if (config.isTest) {
      console.log(
        `[Mailgun] Test mode: Pretending to send password reset code to ${to}`,
      );
      return { success: true, dev: true };
    }

    try {
      if (config.isDev) {
        console.warn(
          `[Mailgun Sandbox] Only authorized recipients can receive emails. Check Mailgun dashboard for ${to}`,
        );
      }

      const templatePath = path.join(
        process.cwd(),
        'templates',
        `reset-password.hbs`, // Use a template that expects a code
      );
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
      }

      const source = fs.readFileSync(templatePath, 'utf-8');
      const compiled = handlebars.compile(source);
      const html = compiled(context);

      const response = await this.mg.messages.create(this.domain, {
        from: `Party Membership and Electoral MGT System <noreply@${this.domain}>`,
        to,
        subject: 'Reset Your Password',
        html,
      });

      return { success: true, response };
    } catch (error) {
      console.error('Mailgun Error:', error);
      return {
        success: false,
        message:
          error?.details ||
          error?.message ||
          'Failed to send password reset code email',
        status: error?.status || 500,
      };
    }
  }

  async sendResetPasswordMail(email: string) {
    if (config.isTest) {
      console.log(
        `[Mailgun] Test mode: Pretending to send password reset to ${email}`,
      );
      return { success: true, dev: true };
    }
    try {
      if (config.isDev) {
        console.warn(
          `[Mailgun Sandbox] Only authorized recipients can receive emails. Check Mailgun dashboard for ${email}`,
        );
      }
      const response = await this.mg.messages.create(this.domain, {
        from: `Party Membership System <noreply@${this.domain}>`,
        to: email,
        subject: 'Your password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for your account ${email} has just been changed.\n`,
      });

      // return response;
      return { success: true, response };
    } catch (error) {
      console.error('Mailgun Error:', error);
      return {
        success: false,
        message:
          error?.details ||
          error?.message ||
          'Failed to send password reset email',
        status: error?.status || 500,
      };
    }
  }

  async sendRegistrationTokenMail(dto: SendEmailDto) {
    const context = {
      message: dto.message,
      link: dto.link,
    };

    if (config.isTest) {
      console.log(
        `[Mailgun] Test mode: Pretending to send password reset to ${dto.email}`,
      );
      return { success: true, dev: true };
    }
    try {
      if (config.isDev) {
        console.warn(
          `[Mailgun Sandbox] Only authorized recipients can receive emails. Check Mailgun dashboard for ${dto.email}`,
        );
      }

      const templatePath = path.join(
        process.cwd(),
        'templates',
        `registration-links.hbs`, // Use a template that expects a code
      );
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
      }

      const source = fs.readFileSync(templatePath, 'utf-8');
      const compiled = handlebars.compile(source);
      const html = compiled(context);
      const response = await this.mg.messages.create(this.domain, {
        from: `Party Membership System <noreply@${this.domain}>`,
        to: dto.email,
        subject: dto.subject || 'Private Registration Invitation',
        html,
      });

      // return response;
      return { success: true, response };
    } catch (error) {
      console.error('Mailgun Error:', error);
      return {
        success: false,
        message:
          error?.details ||
          error?.message ||
          'Failed to send password reset email',
        status: error?.status || 500,
      };
    }
  }
  sendMailRequest(email: string, subject: string, body: string) {
    if (!config.isTest) {
      this.mailerService
        .sendMail({
          to: email,
          subject: subject,
          template: 'request-certificate', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
          context: { text: body },
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
}
