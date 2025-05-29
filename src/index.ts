// src/index.ts

export type AsyncJob = () => Promise<void>;

export interface QueueOptions {
  delayBetweenMessagesMs?: number;
  maxRetries?: number;
}

class SingleQueue {
  private queue: AsyncJob[] = [];
  private isProcessing = false;
  private readonly delay: number;
  private readonly maxRetries: number;

  constructor(options: QueueOptions) {
    this.delay = options.delayBetweenMessagesMs ?? 1000;
    this.maxRetries = options.maxRetries ?? 3;
  }

  public add(job: AsyncJob) {
    this.queue.push(() => this.wrapJobWithRetry(job));
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) continue;

      try {
        await job();
      } catch (err) {
        console.error("Job failed permanently:", err);
      }

      await this.sleep(this.delay);
    }

    this.isProcessing = false;
  }

  private async wrapJobWithRetry(job: AsyncJob): Promise<void> {
    let attempts = 0;
    while (attempts < this.maxRetries) {
      try {
        await job();
        return;
      } catch (err: any) {
        if (err.response?.error_code === 429) {
          const retryAfter = err.response.parameters?.retry_after || 5;
          await this.sleep(retryAfter * 1000);
          attempts++;
        } else {
          throw err;
        }
      }
    }
    throw new Error(`Job failed after ${this.maxRetries} attempts.`);
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class MultiQueueManager {
  private queues = new Map<string, SingleQueue>();
  private readonly options: QueueOptions;

  constructor(options?: QueueOptions) {
    this.options = {
      delayBetweenMessagesMs: options?.delayBetweenMessagesMs ?? 1000,
      maxRetries: options?.maxRetries ?? 3,
    };
  }

  public add(key: string, job: AsyncJob) {
    if (!this.queues.has(key)) {
      this.queues.set(key, new SingleQueue(this.options));
    }
    const queue = this.queues.get(key)!;
    queue.add(job);
  }
}
