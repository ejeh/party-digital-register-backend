// import {
//   Injectable,
//   NestMiddleware,
//   BadRequestException,
//   NotFoundException,
// } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import { TenantService } from 'src/tenant/tenant.service';

// @Injectable()
// export class TenantMiddleware implements NestMiddleware {
//   constructor(private tenantService: TenantService) {}
//   async use(req: Request, res: Response, next: NextFunction) {
//     const tenantId = req.headers['x-tenant-id']?.toString();
//     if (!tenantId) {
//       throw new BadRequestException('X-TENANT-ID not provided');
//     }

//     const isTenantExist = await this.tenantService.getTenantBydId(tenantId);
//     if (!isTenantExist) {
//       throw new NotFoundException('Tenant not found');
//     }

//     req['tenantId'] = tenantId;
//     next();
//   }
// }

import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from 'src/tenant/tenant.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private tenantService: TenantService,
    private jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (token) {
      const decoded: any = this.jwtService.decode(token);

      // 👑 If user is admin, bypass tenant checks
      if (decoded?.role === 'admin') {
        return next();
      }
    }

    // 🔐 Otherwise require tenant
    const tenantId = req.headers['x-tenant-id']?.toString();
    if (!tenantId) {
      throw new BadRequestException('X-TENANT-ID not provided');
    }

    const isTenantExist = await this.tenantService.getTenantBydId(tenantId);
    if (!isTenantExist) {
      throw new NotFoundException('Tenant not found');
    }

    req['tenantId'] = tenantId;
    next();
  }
}
