import { Connection } from 'mongoose';
import { PROVIDER } from 'src/constant/providers';
import {
  Candidate,
  CandidateSchema,
} from 'src/election/schemas/candidate.schema';
import {
  ElectionResult,
  ElectionResultSchema,
} from 'src/election/schemas/election-result.schema';
import { Election, ElectionSchema } from 'src/election/schemas/election.schema';
import {
  PollingUnit,
  PollingUnitSchema,
} from 'src/election/schemas/polling-unit.schema';
import { IdCard, IdCardSchema } from 'src/idcard/idcard.schema';
import { Circular, CircularSchema } from 'src/news/schemas/circular.schema';
import { News, NewsSchema } from 'src/news/schemas/news.schema';

export const TenantModels = {
  idCardModel: {
    provide: PROVIDER.IDCARD_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(IdCard.name, IdCardSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  // newsModel: {
  //   provide: PROVIDER.NEWS_MODEL,
  //   useFactory: async (newsConnection: Connection) => {
  //     return newsConnection.model(News.name, NewsSchema);
  //   },
  //   inject: [PROVIDER.TENANT_CONNECTION],
  // },

  circularModel: {
    provide: PROVIDER.CIRCULAR_MODEL,
    useFactory: async (circularConnection: Connection) => {
      return circularConnection.model(Circular.name, CircularSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  electionModel: {
    provide: PROVIDER.ELECTION_MODEL,
    useFactory: async (circularConnection: Connection) => {
      return circularConnection.model(Election.name, ElectionSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },
  candidateModel: {
    provide: PROVIDER.CANDIDATE_MODEL,
    useFactory: async (circularConnection: Connection) => {
      return circularConnection.model(Candidate.name, CandidateSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  electionResultModel: {
    provide: PROVIDER.ELECTIONRESULT_MODEL,
    useFactory: async (circularConnection: Connection) => {
      return circularConnection.model(
        ElectionResult.name,
        ElectionResultSchema,
      );
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  pollingUnitModel: {
    provide: PROVIDER.POLLING_UNIT,
    useFactory: async (circularConnection: Connection) => {
      return circularConnection.model(PollingUnit.name, PollingUnitSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },
};
