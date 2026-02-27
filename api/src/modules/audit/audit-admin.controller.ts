import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';

@ApiTags('audit-logs')
@ApiBearerAuth('bearer')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AuditAdminController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    async findMany(@Query() q: AuditQueryDto) {
        const from = q.from ? new Date(q.from) : undefined;
        const to = q.to ? new Date(q.to) : undefined;

        const { items, total } = await this.auditService.queryLogs({
            entity: q.entity,
            entityId: q.entityId,
            performedBy: q.performedBy,
            action: q.action,
            from,
            to,
            limit: q.limit,
            offset: q.offset,
        });

        return {
            data: items,
            meta: { total, limit: q.limit, offset: q.offset, isCached: false },
        };
    }
}
