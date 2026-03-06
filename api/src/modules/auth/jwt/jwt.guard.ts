import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationError } from '@/common/exceptions';

interface PassportInfo {
  name?: string;
  message?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T>(err: Error | null, user: T, info: PassportInfo | undefined): T {
    const name = info?.name ?? err?.name;
    const msg = (info?.message ?? err?.message ?? '').toLowerCase();

    const isExpired = name === 'TokenExpiredError' || msg.includes('jwt expired');

    if (err || !user) {
      if (isExpired) {
        throw new AuthenticationError('Token expired');
      }
      throw new AuthenticationError('Unauthorized');
    }

    return user;
  }
}
