import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationError } from '@/common/exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any, info: any) {
        const name = info?.name ?? err?.name;
        const msg = (info?.message ?? err?.message ?? '').toLowerCase();

        const isExpired =
            name === 'TokenExpiredError' || msg.includes('jwt expired');

        if (err || !user) {
            if (isExpired) {
                throw new AuthenticationError('Token expired');
            }
            throw new AuthenticationError('Unauthorized');
        }

        return user;
    }
}