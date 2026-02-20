import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

import { NestJwtServiceAdapter } from './jwt/nest-jwt.adapter';
import { JWT_SERVICE } from './auth.constants';

@Module({
    imports: [
        UserModule,
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN') as StringValue,
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        RolesGuard,
        { provide: JWT_SERVICE, useClass: NestJwtServiceAdapter },
    ],
    exports: [AuthService, RolesGuard],
})
export class AuthModule { }
