import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RegistrationTokenService } from './registration-token.service';
import { CreateRegistrationLinkDto } from './dto/create-registration-link.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { TenantAuthenticationGuard } from 'src/common/guards/tenent.auth.guard';
import { UserRole } from 'src/users/users.role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('api/registration-links')
@UseGuards(TenantAuthenticationGuard)
export class RegistrationTokenController {
  constructor(
    private readonly registrationTokensService: RegistrationTokenService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createRegistrationLinkDto: CreateRegistrationLinkDto,
    @Request() req,
  ) {
    const userId = req.user._id;
    return this.registrationTokensService.create(
      createRegistrationLinkDto,
      userId,
    );
  }

  @Post('datatable')
  @Roles(UserRole.ADMIN)
  async findAllDatatable(@Body() body: any, @Request() req) {
    const { _id } = req.user;
    return this.registrationTokensService.findAllDatatables(body, _id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async revoke(@Param('id') id: string, @Request() req) {
    const userId = req.user._id;
    await this.registrationTokensService.revoke(id, userId);
    return { success: true };
  }

  @Post('send-email')
  @Roles(UserRole.ADMIN)
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    await this.registrationTokensService.sendEmail(sendEmailDto);
    return { success: true };
  }
}
