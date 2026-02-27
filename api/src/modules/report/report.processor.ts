import { Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { pipeline } from 'node:stream/promises';
import { createWriteStream, promises as fsp } from 'node:fs';
import { join } from 'node:path';
import { REPORT_GENERATION_QUEUE, DEAD_LETTER_QUEUE } from '../../queue/queue.constants';
import type { ReportJobData } from './report-job.types';
import { ReportService } from './report.service';

@Processor(REPORT_GENERATION_QUEUE, {
    concurrency: 2,
})
export class ReportProcessor extends WorkerHost {
    private readonly logger = new Logger(ReportProcessor.name);

    constructor(
        private readonly reportService: ReportService,
        @InjectQueue(DEAD_LETTER_QUEUE)
        private readonly dlqQueue: Queue<ReportJobData & { failReason: string; originalJobId: string }>,
    ) {
        super();
    }

    // ─── Main processor ────────────────────────────────────────────────────────

    async process(job: Job<ReportJobData>): Promise<{ outputPath: string }> {
        const { fileId, filePath, filename, bytes } = job.data;
        const attempt = job.attemptsMade + 1;
        const maxAttempts = job.opts.attempts ?? 3;

        this.logger.log(
            `[Job ${job.id}] Starting — file="${filename}" size=${this.mb(bytes)} MB ` +
            `attempt=${attempt}/${maxAttempts}`,
        );

        const rssBefore = process.memoryUsage().rss;


        const readStream = this.reportService.createFileReadStream(filePath);

        const outputDir = join(process.cwd(), 'uploads', 'processed');
        const outputName = `${fileId}__processed.pdf`;
        const outputPath = join(outputDir, outputName);

        await fsp.mkdir(outputDir, { recursive: true });
        const writeStream = createWriteStream(outputPath);

        try {
            await pipeline(readStream, writeStream);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`[Job ${job.id}] Pipeline error (attempt ${attempt}/${maxAttempts}): ${msg}`);
            throw err;
        }

        const rssAfter = process.memoryUsage().rss;
        this.logger.log(
            `[Job ${job.id}] Complete → ${outputPath} | ` +
            `rss Δ${this.mb(rssAfter - rssBefore)} MB`,
        );

        return { outputPath };
    }

    // ─── Events ────────────────────────────────────────────────────────────────

    @OnWorkerEvent('failed')
    async onFailed(job: Job<ReportJobData> | undefined, error: Error): Promise<void> {
        if (!job) return;

        const maxAttempts = job.opts.attempts ?? 3;
        const isExhausted = job.attemptsMade >= maxAttempts;

        if (isExhausted) {
            // ── Real DLQ: publish to a separate BullMQ queue ───────────────────
            this.logger.error(
                `[DLQ] job ${job.id} exhausted ${maxAttempts} attempts — ` +
                `file="${job.data.filename}" reason="${error.message}" → moving to DLQ`,
            );
            try {
                await this.dlqQueue.add('dead-letter', {
                    ...job.data,
                    failReason: error.message,
                    originalJobId: String(job.id),
                });
                this.logger.warn(`[DLQ] job ${job.id} published to "${DEAD_LETTER_QUEUE}"`);
            } catch (dlqErr: unknown) {
                const dlqMsg = dlqErr instanceof Error ? dlqErr.message : String(dlqErr);
                this.logger.error(`[DLQ] Failed to publish to DLQ: ${dlqMsg}`);
            }
        } else {
            const delaySec = Math.pow(2, job.attemptsMade - 1);
            this.logger.warn(
                `[Job ${job.id}] failed (attempt ${job.attemptsMade}/${maxAttempts}) — ` +
                `retrying in ${delaySec}s | reason="${error.message}"`,
            );
        }
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job<ReportJobData>): void {
        this.logger.log(`[Job ${job.id}] completed successfully.`);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private mb(bytes: number): string {
        return (bytes / 1024 / 1024).toFixed(1);
    }
}
