import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

import {
  ActivateParams,
  AuthenticatedUser,
  ForgottenPasswordDto,
  ResetPasswordDto,
} from './auth.interface';
import { getOriginHeader } from './auth';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AppRequest } from 'src/generic/generic.interface';
import config from 'src/config';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('activate/:userId/:activationToken')
  async activate(@Param() params: ActivateParams, @Res() res: Response) {
    const getFrontendBaseUrl = () => {
      return config.isDev
        ? 'http://127.0.0.1:5500'
        : 'https://apc-ereg.bengedms.com';
    };

    const result = await this.authService.activate(params);
    const redirectUrl = result.success
      ? `${getFrontendBaseUrl()}/activation-success.html`
      : `${getFrontendBaseUrl()}/activation-failed.html`;

    return res.redirect(redirectUrl);
  }

  @Post('resend-activation')
  async resendActivationEmail(
    @Body('email') email: string,
    @Req() req: Request,
  ) {
    return await this.authService.resendActivationEmail(
      email,
      getOriginHeader(req),
    );
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiResponse({ type: AuthenticatedUser })
  login(@Req() req: AppRequest) {
    return this.authService.login(req?.user);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgottenPasswordDto, @Req() req: Request) {
    return this.authService.forgottenPassword(body, getOriginHeader(req));
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Post('verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.authService.verifyOtp(email, otp);
  }

  @Post('verify')
  async verifyNIN(@Body() { nin }: { nin: string }) {
    const fakeDB = {
      '12345678901': {
        fullName: 'Godfrey Ejeh',
        dob: '1990-01-01',
        phone: '08079710658',
        state: 'Benue',
        lga: 'Ogbadibo',
      },
      '98765432109': {
        fullName: 'John Doe',
        dob: '1990-01-01',
        phone: '08039710658',
        state: 'Benue',
        lga: 'Gboko',
      },
      '98765432102': {
        fullName: 'Simon Iber',
        dob: '1990-01-01',
        phone: '08033710658',
        state: 'Benue',
        lga: 'Buruku',
      },
      '98765432162': {
        fullName: 'Sheyi shay',
        dob: '1990-01-01',
        phone: '08133710658',
        state: 'Ogun',
        lga: 'Ifo',
      },
      '88765432102': {
        fullName: 'Arome Mbur',
        dob: '1990-01-01',
        phone: '08030710658',
        state: 'Kogi',
        lga: 'Okene',
      },

      '88765432105': {
        fullName: 'Derick Gbaden',
        dob: '1990-01-01',
        phone: '08043710658',
        state: 'Benue',
        lga: 'Gboko',
      },

      '88765432101': {
        fullName: 'Charles Luper',
        dob: '1990-01-01',
        phone: '08043710658',
        state: 'Benue',
        lga: 'Gboko',
      },

      '88765432131': {
        fullName: 'Victor Atir',
        dob: '1990-01-01',
        phone: '08043710666',
        state: 'Benue',
        lga: 'Gboko',
      },

      '88765432132': {
        fullName: 'Ciroma Musa',
        dob: '1990-01-01',
        phone: '08043710661',
        state: 'Abuja',
        lga: 'kuje',
      },
    };

    const data = fakeDB[nin];
    if (!data) throw new BadRequestException('NIN not found');
    return { success: true, data };
  }
}
