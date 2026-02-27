import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditAction, AuditLog, AuditLogDocument } from './audit-log.schema';

export type CreateAuditLogInput = {
    action: AuditAction;
    entity: string;
    entityId: string;
    oldData: Record<string, unknown> | null;
    newData: Record<string, unknown> | null;
    performedBy: string;
    timestamp: Date;
};

@Injectable()
export class AuditService {
    constructor(
        @InjectModel(AuditLog.name)
        private readonly auditModel: Model<AuditLogDocument>,
    ) { }

    async createLog(input: CreateAuditLogInput): Promise<void> {
        await this.auditModel.create(input);
    }

    async queryLogs(params: {
        entity?: string;
        entityId?: string;
        performedBy?: string;
        action?: AuditAction;
        from?: Date;
        to?: Date;
        limit: number;
        offset: number;
    }): Promise<{ items: AuditLog[]; total: number }> {
        const filter: Record<string, unknown> = {};

        if (params.entity) filter.entity = params.entity;
        if (params.entityId) filter.entityId = params.entityId;
        if (params.performedBy) filter.performedBy = params.performedBy;
        if (params.action) filter.action = params.action;

        if (params.from || params.to) {
            const ts: Record<string, Date> = {};
            if (params.from) ts.$gte = params.from;
            if (params.to) ts.$lte = params.to;
            filter.timestamp = ts;
        }

        const [items, total] = await Promise.all([
            this.auditModel
                .find(filter)
                .sort({ timestamp: -1 })
                .skip(params.offset)
                .limit(params.limit)
                .lean()
                .exec(),
            this.auditModel.countDocuments(filter).exec(),
        ]);

        return { items: items as AuditLog[], total };
    }
}
