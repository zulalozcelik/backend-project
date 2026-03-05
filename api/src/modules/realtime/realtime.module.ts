import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { RealtimeGateway } from './realtime.gateway';
import { ConnectionManager } from './connection-manager.service';

@Module({
    imports: [
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
    providers: [RealtimeGateway, ConnectionManager],
    exports: [RealtimeGateway],
})
export class RealtimeModule { }
