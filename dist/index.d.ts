export type AsyncJob = () => Promise<void>;
export interface QueueOptions {
    delayBetweenMessagesMs?: number;
    maxRetries?: number;
}
export declare class MultiQueueManager {
    private queues;
    private readonly options;
    constructor(options?: QueueOptions);
    add(key: string, job: AsyncJob): void;
}
