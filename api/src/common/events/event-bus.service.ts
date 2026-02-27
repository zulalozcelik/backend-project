import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class EventBusService {
    private readonly emitter = new EventEmitter();

    on<T>(eventName: string, handler: (payload: T) => void): void {
        this.emitter.on(eventName, handler);
    }

    emit<T>(eventName: string, payload: T): void {
        this.emitter.emit(eventName, payload);
    }
}