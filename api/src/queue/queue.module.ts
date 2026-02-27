import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { REPORT_GENERATION_QUEUE, DEAD_LETTER_QUEUE } from './queue.constants';

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const url = config.get<string>('REDIS_URL');
                if (!url) throw new Error('REDIS_URL is missing');
                // Parse redis://[password@]host:port so we share the same Redis config
                const parsed = new URL(url);
                return {
                    connection: {
                        host: parsed.hostname,
                        port: Number(parsed.port) || 6379,
                        password: parsed.password || undefined,
                    },
                };
            },
        }),
        // Main queue — exponential backoff: delay * 2^(attempt-1)  →  1s, 2s, 4s
        BullModule.registerQueue({
            name: REPORT_GENERATION_QUEUE,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000, // attempt 2 → 1s, attempt 3 → 2s
                },
                removeOnComplete: 100,
                removeOnFail: 500,
            },
        }),
        // Dead Letter Queue — jobs land here after exhausting all retries
        BullModule.registerQueue({
            name: DEAD_LETTER_QUEUE,
            defaultJobOptions: {
                attempts: 1,
                removeOnComplete: false, // keep DLQ jobs for inspection
                removeOnFail: false,
            },
        }),
    ],
    exports: [BullModule],
})
export class QueueModule { }
