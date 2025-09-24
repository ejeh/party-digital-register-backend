import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ElectionResult } from '../schemas/election-result.schema';

@Injectable()
export class ElectionAggregatorUtil {
  constructor(
    @InjectModel(ElectionResult.name)
    private resultModel: Model<ElectionResult>,
  ) {}

  async aggregateWardResults(electionId: string, wardId: string) {
    return this.resultModel.aggregate([
      {
        $match: {
          election: electionId,
          'location.ward': wardId,
          isApproved: true,
        },
      },
      {
        $group: {
          _id: {
            position: '$position',
            candidate: '$candidate',
          },
          totalVotes: { $sum: '$votes' },
        },
      },
      {
        $sort: { totalVotes: -1 },
      },
    ]);
  }

  async aggregateLGAResults(electionId: string, lgaId: string) {
    console.log('electionId', electionId);
    console.log('lgaId', lgaId);
    return this.resultModel.aggregate([
      {
        $match: {
          election: electionId,
          'location.lga': lgaId,
          isApproved: true,
        },
      },
      {
        $group: {
          _id: {
            position: '$position',
            candidate: '$candidate',
          },
          totalVotes: { $sum: '$votes' },
        },
      },
      {
        $sort: { totalVotes: -1 },
      },
    ]);
  }

  async aggregateStateResults(electionId: string, stateId: string) {
    console.log('electionId', electionId);
    console.log('stateId', stateId);

    return this.resultModel.aggregate([
      {
        $match: {
          election: electionId,
          'location.state': stateId,
          isApproved: true,
        },
      },
      {
        $group: {
          _id: {
            position: '$position',
            candidate: '$candidate',
          },
          totalVotes: { $sum: '$votes' },
        },
      },
      {
        $sort: { totalVotes: -1 },
      },
    ]);
  }

  async aggregateNationalResults(electionId: string) {
    return this.resultModel.aggregate([
      {
        $match: {
          election: electionId,
          isApproved: true,
        },
      },
      {
        $group: {
          _id: {
            position: '$position',
            candidate: '$candidate',
          },
          totalVotes: { $sum: '$votes' },
        },
      },
      {
        $sort: { totalVotes: -1 },
      },
    ]);
  }
}
