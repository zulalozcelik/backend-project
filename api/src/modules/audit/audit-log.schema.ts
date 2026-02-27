import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

@Schema({ collection: 'audit_logs', timestamps: false })
export class AuditLog {
    @Prop({ type: String, required: true, enum: ['CREATE', 'UPDATE', 'DELETE'] })
    action!: AuditAction;

    @Prop({ type: String, required: true })
    entity!: string;

    @Prop({ type: String, required: true })
    entityId!: string;

    @Prop({ type: Object, required: false, default: null })
    oldData!: Record<string, unknown> | null;

    @Prop({ type: Object, required: false, default: null })
    newData!: Record<string, unknown> | null;

    @Prop({ type: String, required: true })
    performedBy!: string;

    @Prop({ type: Date, required: true })
    timestamp!: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 });
AuditLogSchema.index({ performedBy: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });
