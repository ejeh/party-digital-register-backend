import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Delete,
  Patch,
  Request,
  SetMetadata,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dtos/create-news.dto';
import { CreateCircularDto } from './dtos/create-circular.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/users.role.enum';
import { TenantAuthenticationGuard } from 'src/common/guards/tenent.auth.guard';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('api/news')
@UseGuards(TenantAuthenticationGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @Roles(UserRole.STATE_CHAIRMAN, UserRole.NATIONAL_CHAIRMAN)
  async createNews(@Body() createNewsDto: CreateNewsDto, @Request() req) {
    return this.newsService.createNews(createNewsDto, req.user._id);
  }

  @Post('circular')
  @Roles(UserRole.NATIONAL_CHAIRMAN, UserRole.STATE_CHAIRMAN)
  async createCircular(
    @Body() createCircularDto: CreateCircularDto,
    @Request() req,
  ) {
    return this.newsService.createCircular(createCircularDto, req.user._id);
  }

  @Patch('circular/:id')
  @Roles(UserRole.NATIONAL_CHAIRMAN, UserRole.STATE_CHAIRMAN)
  async updateCircular(
    @Param('id') id: string,
    @Body() updateCircularDto: any,
    @Request() req,
  ) {
    return this.newsService.updateCircular(id, updateCircularDto, req.user._id);
  }

  @Public()
  @Get()
  async getNews(@Request() req) {
    return this.newsService.getNewsForUser(
      req.user._id,
      req.user.role,
      req.user.state,
    );
  }

  @Get('circular')
  async getCirculars(@Request() req) {
    return this.newsService.getCircularsForUser(req.user.role, req.user._id);
  }

  @Post('circular/:id/acknowledge')
  async acknowledgeCircular(@Param('id') id: string, @Request() req) {
    return this.newsService.acknowledgeCircular(id, req.user._id);
  }

  @Patch(':id')
  @Roles(UserRole.STATE_CHAIRMAN)
  async updateNews(
    @Param('id') id: string,
    @Body() updateNewsDto: any,
    @Request() req,
  ) {
    console.log(id, updateNewsDto, req.user._id);
    return this.newsService.updateNews(id, updateNewsDto, req.user._id);
  }

  @Delete('circular/:id')
  @Roles(UserRole.STATE_CHAIRMAN)
  async deletecircular(@Param('id') id: string, @Request() req) {
    return this.newsService.deletecircular(id, req.user._id);
  }

  @Delete(':id')
  @Roles(UserRole.STATE_CHAIRMAN)
  async deleteNews(@Param('id') id: string, @Request() req) {
    return this.newsService.deleteNews(id, req.user._id);
  }
}
