import { Injectable } from '@nestjs/common';

@Injectable()
export class ConnectionManager {
    private userSockets = new Map<string, Set<string>>();

    add(userId: string, socketId: string) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socketId);
    }

    remove(userId: string, socketId: string) {
        const sockets = this.userSockets.get(userId);
        if (!sockets) return;
        sockets.delete(socketId);
        if (sockets.size === 0) {
            this.userSockets.delete(userId);
        }
    }

    getSockets(userId: string): string[] {
        return Array.from(this.userSockets.get(userId) ?? []);
    }
}
