import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConnectionManager } from './connection-manager.service';

interface JwtPayload {
  sub: string;
}

interface SocketData {
  userId?: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly connectionManager: ConnectionManager,
  ) {}

  async handleConnection(socket: Socket) {
    const auth = socket.handshake.auth as Record<string, unknown> | undefined;
    const token: string | undefined =
      (typeof auth?.token === 'string' ? auth.token : undefined) ??
      socket.handshake.headers['authorization']?.toString().replace('Bearer ', '');

    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      (socket.data as SocketData).userId = payload.sub;
      this.connectionManager.add(payload.sub, socket.id);
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = (socket.data as SocketData).userId;
    if (userId) {
      this.connectionManager.remove(userId, socket.id);
    }
  }

  @SubscribeMessage('join-document')
  handleJoinDocument(@ConnectedSocket() socket: Socket, @MessageBody() documentId: string) {
    const room = `document:${documentId}`;
    void socket.join(room);
  }

  sendToUser(userId: string, event: string, data: unknown) {
    const sockets = this.connectionManager.getSockets(userId);
    for (const socketId of sockets) {
      this.server.to(socketId).emit(event, data);
    }
  }

  broadcastToDocument(documentId: string, event: string, data: unknown) {
    const room = `document:${documentId}`;
    this.server.to(room).emit(event, data);
  }
}
