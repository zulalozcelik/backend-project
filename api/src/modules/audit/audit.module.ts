import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLog, AuditLogSchema } from './audit-log.schema';
import { AuditService } from './audit.service';
import { AuditAdminController } from './audit-admin.controller';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { LoggingModule } from '../../common/logging/logging.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        LoggingModule,
        UserModule,
        MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
    ],
    controllers: [AuditAdminController],
    providers: [
        AuditService,
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditInterceptor,
        },
    ],
    exports: [AuditService],
})
export class AuditModule { }
