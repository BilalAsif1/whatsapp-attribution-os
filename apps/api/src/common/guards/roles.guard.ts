import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@common/decorators';
import { ROLE_HIERARCHY } from '@wao/shared';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest();
    const userRole = request.workspaceRole as string | undefined;
    if (!userRole) throw new ForbiddenException('Workspace access required');

    const userLevel = ROLE_HIERARCHY[userRole] ?? -1;
    const hasRole = requiredRoles.some((role) => userLevel >= (ROLE_HIERARCHY[role] ?? 999));
    if (!hasRole) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
