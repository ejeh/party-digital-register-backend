// import { InternalServerErrorException, Scope } from '@nestjs/common';
// import { REQUEST } from '@nestjs/core';
// import { getConnectionToken } from '@nestjs/mongoose';
// import { Connection } from 'mongoose';
// import { PROVIDER } from 'src/constant/providers';

// export const TenantConnectionProvider = {
//   provide: PROVIDER.TENANT_CONNECTION,
//   useFactory: async (request, connection: Connection) => {
//     if (!request.tenantId) {
//       throw new InternalServerErrorException(
//         'Make sure to use the TenantsMiddleware',
//       );
//       // return connection;
//     }
//     return connection.useDb(`tenant_${request.tenantId}`);
//   },
//   inject: [REQUEST, getConnectionToken()],
// };

import { InternalServerErrorException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { PROVIDER } from 'src/constant/providers';

export const TenantConnectionProvider = {
  provide: PROVIDER.TENANT_CONNECTION,
  scope: Scope.REQUEST,
  useFactory: async (request: any, connection: Connection) => {
    // 👑 If admin (no tenantId) → use default connection
    if (!request.tenantId) {
      // You can optionally check role here if `request.user` is already set
      return connection;
    }

    // 🔐 For tenant users → connect to their tenant DB
    return connection.useDb(`tenant_${request.tenantId}`);
  },
  inject: [REQUEST, getConnectionToken()],
};
