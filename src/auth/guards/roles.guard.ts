import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role, ROLES_KEY } from 'src/auth/decorators/roles.customdecorator';
import { PurchasesService } from 'src/purchases/purchases.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private purchasesService: PurchasesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());

    if (!roles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const token = this.getToken(req.headers);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const userRole = payload.role;
      req.userId = payload.sub;

      if (req.body && !req.body.userId && req.url.includes('purchases')) {
        req.body.userId = req.userId;
      }

      if (userRole === Role.ADMIN) {
        return true;
      }

      const method = req.method;
      const isPurchaseResource = req.url.includes('purchases');
      const isProductResource = req.url.includes('products');

      if (isPurchaseResource) {
        if (method === 'POST') {
          if (req.body.userId && req.body.userId !== req.userId) {
            throw new ForbiddenException(
              'You can only create purchases for yourself',
            );
          }
        } else if (method === 'PATCH' || method === 'DELETE') {
          const purchaseId = req.params.id;
          const purchase = await this.purchasesService.findOne(purchaseId);
          if (!purchase) {
            throw new ForbiddenException('Purchase not found');
          }
          if (purchase.userId.toString() !== req.userId.toString()) {
            throw new ForbiddenException(
              'You can only update or delete your own purchases',
            );
          }
        } else if (method === 'GET') {
          if (userRole === Role.USER) {
            req.query.userId = req.userId;
          }
        }
      }
      if (
        isProductResource &&
        (method === 'POST' || method === 'PATCH' || method === 'DELETE')
      ) {
        throw new ForbiddenException(
          'You cannot create, update, or delete products',
        );
      } else if (isProductResource && method === 'GET') {
        return true;
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private getToken(headers: any) {
    if (!headers['authorization']) return null;
    const [type, token] = headers['authorization'].split(' ');
    return type === 'Bearer' ? token : null;
  }
}
