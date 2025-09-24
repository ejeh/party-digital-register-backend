import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';

// Extend Express Request interface to include 'user' and 'tenantId'
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
    tenantId?: string;
  }
}

@Injectable()
export class TenantAuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(TenantAuthenticationGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  // async canActivate(context: ExecutionContext): Promise<boolean> {
  //   const request = context.switchToHttp().getRequest();

  //   // Ensure tenant middleware was applied
  //   if (!request.tenantId) {
  //     throw new UnauthorizedException('Missing tenant id');
  //   }

  //   const tenantId = request.tenantId;

  //   // Check token validity
  //   const token = this.extractTokenFromHeader(request);
  //   if (!token) {
  //     throw new UnauthorizedException('Missing access token');
  //   }

  //   const user = await this.checkTokenValidity(token, tenantId);

  //   // Attach the entire user object to the request
  //   request.user = user;

  //   // Check if the user has the required roles
  //   const requiredRoles = this.reflector.get<string[]>(
  //     'roles',
  //     context.getHandler(),
  //   );
  //   if (requiredRoles) {
  //     const hasRole = requiredRoles.some((role) => user.role?.includes(role));
  //     if (!hasRole) {
  //       throw new ForbiddenException('Insufficient permissions');
  //     }
  //   }

  //   return true;
  // }

  // private async checkTokenValidity(
  //   token: string,
  //   tenantId: string,
  // ): Promise<any> {
  //   try {
  //     // Get secret from tenant-specific database and decrypt it before verifying
  //     const secret =
  //       await this.authService.fetchAccessTokenSecretSigningKey(tenantId);
  //     const payload = await this.jwtService.verify(token, { secret });

  //     // Fetch the full user object from the database or another service
  //     const user = await this.authService.fetchUserById(
  //       payload.userId,
  //       tenantId,
  //     );

  //     if (!user) {
  //       throw new UnauthorizedException('User not found');
  //     }

  //     return user;
  //   } catch (e) {
  //     this.logger.error(`Token validation failed: ${e.message}`);
  //     throw new UnauthorizedException('Invalid token');
  //   }
  // }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    // 🔍 Step 1: decode without verifying
    const decoded: any = this.jwtService.decode(token);
    if (!decoded?.userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // 👑 Step 2: Admin bypass (do not use tenant at all)
    if (decoded.role === 'admin') {
      const admin = await this.authService.fetchAdminUserById(decoded.userId);
      if (!admin) {
        throw new UnauthorizedException('Admin user not found');
      }
      request.user = admin;
    } else {
      // 🔐 Step 3: tenant users must have tenantId
      if (!request.tenantId) {
        throw new UnauthorizedException('Missing tenant id');
      }

      // tenant flow → verify with tenant secret
      request.user = await this.checkTokenValidity(token, request.tenantId);
    }

    // 🎭 Step 4: enforce @Roles if defined
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) =>
        request.user.role?.includes(role),
      );
      if (!hasRole) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }

  private async checkTokenValidity(
    token: string,
    tenantId: string,
  ): Promise<any> {
    try {
      // this will only run for non-admins
      const secret =
        await this.authService.fetchAccessTokenSecretSigningKey(tenantId);
      const payload = await this.jwtService.verify(token, { secret });

      const user = await this.authService.fetchUserById(
        payload.userId,
        tenantId,
      );
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (e) {
      this.logger.error(`Token validation failed: ${e.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    return request.headers.authorization?.split(' ')[1];
  }
}
