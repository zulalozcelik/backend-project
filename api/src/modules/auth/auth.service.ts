import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from './jwt/jwt-service.interface';
import { JWT_SERVICE } from './auth.constants';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { AuthenticationError, BusinessRuleError } from '@/common/exceptions';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        @Inject(JWT_SERVICE) private readonly jwtService: jwt.IJwtService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.userService.findByEmail(dto.email);
        if (existing) throw new BusinessRuleError('Email already in use');

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const created = await this.userService.create({
            ...dto,
            password: passwordHash,
        } as any);

        return { data: created };
    }

    async login(dto: LoginDto) {
        const user = await this.userService.findAuthByEmail(dto.email);
        if (!user) throw new AuthenticationError('Invalid credentials');

        const ok = await bcrypt.compare(dto.password, user.password);
        if (!ok) throw new AuthenticationError('Invalid credentials');

        const accessToken = await this.jwtService.signAccessToken({ sub: user.id });

        return { data: { accessToken } };
    }
}
