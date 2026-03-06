import { Inject, Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AI_PROVIDER_TOKEN } from '../../core/ai/ai.constants';
import type { IAIProvider } from '../../core/ai/ai-provider.interface';
import { AI_PROCESSING_QUEUE, AI_PROCESSING_JOB } from './ai-processing.constants';
import { RealtimeEmitter } from '../realtime/realtime-emitter.service';

type JobData = {
  documentId: string;
  text: string;
  requestedBy: string;
};

type AiSuccessPayload = {
  documentId: string;
  summary: string;
  tags: string[];
  jobId: string | null;
};

type AiErrorPayload = {
  documentId: string;
  jobId: string | null;
  error: string;
};

@Processor(AI_PROCESSING_QUEUE)
@Injectable()
export class AiProcessingWorker extends WorkerHost {
  constructor(
    @Inject(AI_PROVIDER_TOKEN) private readonly ai: IAIProvider,
    private readonly realtime: RealtimeEmitter,
  ) {
    super();
  }

  async process(job: Job<JobData>): Promise<AiSuccessPayload> {
    if (job.name !== AI_PROCESSING_JOB) {
      throw new Error(`Unknown job name: ${job.name}`);
    }

    const { documentId, text, requestedBy } = job.data;

    try {
      const [summary, tags] = await Promise.all([
        this.ai.summarize(text),
        this.ai.generateTags(text),
      ]);

      const payload: AiSuccessPayload = {
        documentId,
        summary,
        tags,
        jobId: job.id ?? null,
      };

      this.realtime.broadcastToDocument(documentId, 'ai-processing-completed', payload);
      if (requestedBy) {
        this.realtime.sendToUser(requestedBy, 'ai-processing-completed', payload);
      }

      return payload;
    } catch (e: unknown) {
      const errorPayload: AiErrorPayload = {
        documentId,
        jobId: job.id ?? null,
        error: String((e as Error)?.message ?? 'AI processing failed'),
      };

      this.realtime.broadcastToDocument(documentId, 'ai-processing-failed', errorPayload);
      if (requestedBy) {
        this.realtime.sendToUser(requestedBy, 'ai-processing-failed', errorPayload);
      }

      throw e;
    }
  }
}
