
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import type { Role } from '../../../common/auth/roles';
import { AuthorizationError } from '../../../common/exceptions';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user as { role?: Role; id?: string } | undefined;

        if (!user?.role) {
            throw new AuthorizationError('Forbidden', {
                reason: 'Missing user role in request context',
                requiredRoles,
            });
        }

        if (!requiredRoles.includes(user.role)) {
            throw new AuthorizationError('Forbidden', {
                reason: 'Insufficient role',
                requiredRoles,
                userRole: user.role,
            });
        }

        return true;
    }
}
