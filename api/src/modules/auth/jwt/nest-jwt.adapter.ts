import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtService } from './jwt-service.interface';

@Injectable()
export class NestJwtServiceAdapter implements IJwtService {
    constructor(private readonly jwt: JwtService) { }

    signAccessToken(payload: { sub: string }) {
        return this.jwt.signAsync(payload);
    }
}
