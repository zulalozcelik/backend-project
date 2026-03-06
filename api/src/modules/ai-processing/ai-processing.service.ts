import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { AI_PROCESSING_QUEUE, AI_PROCESSING_JOB } from './ai-processing.constants';

type EnqueuePayload = {
  documentId: string;
  text: string;
  requestedBy: string;
};

@Injectable()
export class AiProcessingService {
  constructor(@InjectQueue(AI_PROCESSING_QUEUE) private readonly queue: Queue) {}

  async enqueueDocumentProcessing(payload: EnqueuePayload): Promise<{ jobId: string }> {
    const opts: JobsOptions = {
      attempts: 3,
      backoff: { type: 'exponential', delay: 500 },
      removeOnComplete: 100,
      removeOnFail: 200,
    };
    const job = await this.queue.add(AI_PROCESSING_JOB, payload, opts);
    return { jobId: job.id ?? '' };
  }
}
