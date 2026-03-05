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

@WebSocketGateway({
    cors: { origin: '*' },
})
export class RealtimeGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    constructor(
        private readonly jwtService: JwtService,
        private readonly connectionManager: ConnectionManager,
    ) { }

    async handleConnection(socket: Socket) {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers['authorization']
                ?.toString()
                .replace('Bearer ', '');

        if (!token) {
            socket.disconnect();
            return;
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            socket.data.userId = payload.sub;
            this.connectionManager.add(payload.sub, socket.id);
        } catch {
            socket.disconnect();
        }
    }

    handleDisconnect(socket: Socket) {
        const userId = socket.data.userId;
        if (userId) {
            this.connectionManager.remove(userId, socket.id);
        }
    }

    @SubscribeMessage('join-document')
    handleJoinDocument(
        @ConnectedSocket() socket: Socket,
        @MessageBody() documentId: string,
    ) {
        const room = `document:${documentId}`;
        socket.join(room);
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
