import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News } from './schemas/news.schema';
import { Circular } from './schemas/circular.schema';
import { CreateNewsDto } from './dtos/create-news.dto';
import { CreateCircularDto } from './dtos/create-circular.dto';
import { UserRole } from '../users/users.role.enum';
import { CircularAudience, NewsScope } from './constants/news.constants';
import { PROVIDER } from 'src/constant/providers';
import { User, UserDocument } from 'src/users/users.schema';

@Injectable()
export class NewsService {
  constructor(
    @Inject(PROVIDER.CIRCULAR_MODEL)
    @InjectModel(Circular.name)
    private readonly circularModel: Model<Circular>,

    // @Inject(PROVIDER.NEWS_MODEL)
    @InjectModel(News.name)
    private readonly newsModel: Model<News>,

    @InjectModel(User.name) public readonly userModel: Model<UserDocument>,
  ) {}

  async createNews(
    createNewsDto: CreateNewsDto,
    userId: string,
  ): Promise<News> {
    const news = new this.newsModel({
      ...createNewsDto,
      author: userId,
    });
    return news.save();
  }

  async createCircular(
    createCircularDto: CreateCircularDto,
    userId: string,
  ): Promise<Circular> {
    const circular = new this.circularModel({
      ...createCircularDto,
      author: userId,
    });
    return circular.save();
  }

  async updateCircular(id: string, updateCircularDto: any, userId: string) {
    return this.circularModel.findOneAndUpdate(
      { _id: id, author: userId },
      { ...updateCircularDto, updatedAt: new Date() },
      { new: true },
    );
  }

  async deletecircular(id: string, userId: string) {
    return this.circularModel.findOneAndDelete({ _id: id, author: userId });
  }

  // async getNewsForUser(userId: string, userRole: UserRole, userState: string) {
  //   // Step 1: Fetch user info
  //   const user = await this.userModel
  //     .findById(userId)
  //     .select('firstname lastname');

  //   // Step 2: Fetch news items
  //   const newsList = await this.newsModel
  //     .find({
  //       $or: [
  //         { scope: NewsScope.NATIONAL }, // National-level news (visible to everyone)
  //         { scope: NewsScope.STATE, state: userState }, // State-specific news matching user’s state
  //         { author: userId }, // User’s own news (always visible to the creator)
  //       ],
  //       status: 'published', // Only published news
  //     })
  //     .sort({ createdAt: -1 });

  //   // Step 3: Return combined result
  //   return {
  //     user: {
  //       userId,
  //       firstName: user?.firstname,
  //       lastName: user?.lastname,
  //     },
  //     news: newsList,
  //   };
  // }

  async getNewsForUser(userId: string, userRole: UserRole, userState: string) {
    // Step 1: Fetch user info
    const user = await this.userModel
      .findById(userId)
      .select('firstname lastname');

    // Step 2: Fetch news
    const newsList = await this.newsModel
      .find({
        $or: [
          { scope: NewsScope.NATIONAL, status: 'published' }, // National → published only
          {
            scope: NewsScope.STATE,
            state: userState,
            status: 'published',
          }, // State → published only
          { author: userId }, // Author → ALL statuses
        ],
      })
      .sort({ createdAt: -1 });

    // Step 3: Return combined result
    return {
      user: {
        userId,
        firstName: user?.firstname,
        lastName: user?.lastname,
      },
      news: newsList,
    };
  }

  async getCircularsForUser(userRole: UserRole, userId: string) {
    return this.circularModel
      .find({
        $or: [
          // Show all circulars created by the logged-in user
          { author: userId },
          // Show circulars based on audience and user role
          {
            audience: CircularAudience.ALL_MEMBERS,
          },
          {
            audience: CircularAudience.STATE_CHAIRMEN,
            specificRoles: { $in: [userRole] },
          },
          {
            audience: CircularAudience.DELEGATES,
            specificRoles: { $in: [userRole] },
          },
          {
            audience: CircularAudience.REGISTRATION_AGENT,
            specificRoles: { $in: [userRole] },
          },
        ],
      })
      .sort({ createdAt: -1 });
  }

  async acknowledgeCircular(circularId: string, userId: string) {
    // Step 1: Acknowledge the circular
    const updatedCircular = await this.circularModel.findByIdAndUpdate(
      circularId,
      { $set: { [`acknowledgements.${userId}`]: new Date() } },
      { new: true },
    );

    // Step 2: Fetch user info
    const user = await this.userModel
      .findById(userId)
      .select('firstname lastname');

    // Optional: Combine both in a response
    return {
      message: 'Acknowledged successfully',
      circular: updatedCircular,
      user: {
        userId,
        firstName: user?.firstname,
        lastName: user?.lastname,
      },
    };
  }

  async updateNews(id: string, updateNewsDto: any, userId: string) {
    return this.newsModel.findOneAndUpdate(
      { _id: id, author: userId },
      updateNewsDto,
      { new: true },
    );
  }

  async deleteNews(id: string, userId: string) {
    return this.newsModel.findOneAndDelete({ _id: id, author: userId });
  }
}
