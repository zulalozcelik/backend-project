import {
    Injectable,
    BadRequestException,
    PayloadTooLargeException,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { FastifyRequest } from 'fastify';
import { createWriteStream, promises as fsp, createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { REPORT_GENERATION_QUEUE } from '../../queue/queue.constants';
import type { ReportJobData } from './report-job.types';

type MultipartFile = {
    file: NodeJS.ReadableStream & { destroy: (err?: Error) => void };
    filename: string;
    mimetype: string;
    fieldname: string;
};

@Injectable()
export class ReportService implements OnModuleInit {
    private readonly logger = new Logger(ReportService.name);
    private readonly uploadDir = resolve(process.cwd(), 'uploads');
    private readonly maxBytes = 2 * 1024 * 1024 * 1024; // 2 GB

    constructor(
        @InjectQueue(REPORT_GENERATION_QUEUE)
        private readonly reportQueue: Queue<ReportJobData>,
    ) { }

    // ─── Lifecycle ──────────────────────────────────────────────────────────────

    async onModuleInit(): Promise<void> {
        await this.ensureUploadDirWritable();
    }

    // ─── Upload ─────────────────────────────────────────────────────────────────

    async streamUploadToDisk(req: FastifyRequest): Promise<{
        jobId: string;
        fileId: string;
        filename: string;
        storedAs: string;
        bytes: number;
        mimetype: string;
    }> {
        const rssBefore = process.memoryUsage().rss;
        this.logger.debug(`[Upload] start — rss=${this.mb(rssBefore)} MB`);

        const mp = req as unknown as { file: () => Promise<MultipartFile | undefined> };
        const part = await mp.file();
        if (!part) throw new BadRequestException('file field is required');

        // ── Idempotent file ID: stable per upload ──────────────────────────────
        const fileId = randomUUID();
        const safeName = this.sanitizeFilename(part.filename || 'file');
        const diskName = `${fileId}__${safeName}`;

        // ── Path traversal guard ───────────────────────────────────────────────
        const fullPath = this.safeJoin(this.uploadDir, diskName);

        let written = 0;
        let aborted = false;

        // ── Byte counter + size limit ──────────────────────────────────────────
        part.file.on('data', (chunk: Buffer) => {
            written += chunk.length;
            if (written > this.maxBytes) {
                part.file.destroy(new Error('MAX_SIZE_EXCEEDED'));
            }
        });

        const out = createWriteStream(fullPath, { flags: 'wx' });

        // ── Client abort / connection drop cleanup ─────────────────────────────
        const onClientClose = () => {
            aborted = true;
            part.file.destroy(new Error('CLIENT_ABORTED'));
            out.destroy();
            this.logger.warn(`[Upload] client disconnected mid-upload — removing ${diskName}`);
            void this.safeUnlink(fullPath);
        };
        req.raw.once('close', onClientClose);

        try {
            await pipeline(part.file, out);
        } catch (e: unknown) {
            await this.safeUnlink(fullPath);
            req.raw.removeListener('close', onClientClose);

            if (aborted) {
                throw new BadRequestException('Upload aborted by client');
            }
            const msg = e instanceof Error ? e.message : String(e);
            if (msg === 'MAX_SIZE_EXCEEDED') {
                throw new PayloadTooLargeException('File exceeds the 2 GB limit');
            }
            this.logger.error(`[Upload] pipeline error: ${msg}`);
            throw new BadRequestException('Upload failed');
        }

        req.raw.removeListener('close', onClientClose);

        const rssAfter = process.memoryUsage().rss;
        this.logger.log(
            `[Upload] complete — ${diskName} | bytes=${written} | ` +
            `rss before=${this.mb(rssBefore)} MB → after=${this.mb(rssAfter)} MB ` +
            `(Δ${this.mb(rssAfter - rssBefore)} MB)`,
        );

        // ── Enqueue ONLY after pipeline resolves (file fully on disk) ──────────
        const jobData: ReportJobData = {
            fileId,
            filePath: fullPath,
            filename: safeName,
            mimetype: part.mimetype,
            bytes: written,
        };

        const job = await this.reportQueue.add('generate', jobData, {
            jobId: fileId,
        });

        this.logger.log(`[Queue] job enqueued id=${job.id} file="${safeName}"`);

        return {
            jobId: job.id as string,
            fileId,
            filename: safeName,
            storedAs: diskName,
            bytes: written,
            mimetype: part.mimetype,
        };
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────


    createFileReadStream(filePath: string) {

        const safe = this.safeJoin(this.uploadDir, filePath.replace(this.uploadDir, '').replace(/^[\\/]/, ''));
        return createReadStream(safe);
    }

    private safeJoin(base: string, name: string): string {
        const resolved = resolve(base, name);
        if (!resolved.startsWith(base + (base.endsWith('/') || base.endsWith('\\') ? '' : '/'))) {
            throw new BadRequestException('Invalid file path');
        }
        return resolved;
    }

    private async ensureUploadDirWritable(): Promise<void> {
        await fsp.mkdir(this.uploadDir, { recursive: true });
        try {
            await fsp.access(this.uploadDir, fsp.constants?.W_OK ?? 2);
            this.logger.log(`[Upload] upload dir ready: ${this.uploadDir}`);
        } catch {
            throw new Error(`Upload directory is not writable: ${this.uploadDir}`);
        }
    }

    private sanitizeFilename(name: string): string {
        return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
    }

    private async safeUnlink(p: string): Promise<void> {
        try {
            await fsp.unlink(p);
        } catch {

        }
    }

    private mb(bytes: number): string {
        return (bytes / 1024 / 1024).toFixed(1);
    }
}
