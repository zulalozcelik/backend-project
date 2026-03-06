import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimeEmitter {
  constructor(private readonly gateway: RealtimeGateway) {}

  sendToUser(userId: string, event: string, payload: unknown): void {
    this.gateway.sendToUser(userId, event, payload);
  }

  broadcastToDocument(documentId: string, event: string, payload: unknown): void {
    this.gateway.broadcastToDocument(documentId, event, payload);
  }
}
