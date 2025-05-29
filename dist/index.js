"use strict";
// src/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiQueueManager = void 0;
class SingleQueue {
    constructor(options) {
        var _a, _b;
        this.queue = [];
        this.isProcessing = false;
        this.delay = (_a = options.delayBetweenMessagesMs) !== null && _a !== void 0 ? _a : 1000;
        this.maxRetries = (_b = options.maxRetries) !== null && _b !== void 0 ? _b : 3;
    }
    add(job) {
        this.queue.push(() => this.wrapJobWithRetry(job));
        this.processQueue();
    }
    async processQueue() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        while (this.queue.length > 0) {
            const job = this.queue.shift();
            if (!job)
                continue;
            try {
                await job();
            }
            catch (err) {
                console.error("Job failed permanently:", err);
            }
            await this.sleep(this.delay);
        }
        this.isProcessing = false;
    }
    async wrapJobWithRetry(job) {
        var _a, _b;
        let attempts = 0;
        while (attempts < this.maxRetries) {
            try {
                await job();
                return;
            }
            catch (err) {
                if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.error_code) === 429) {
                    const retryAfter = ((_b = err.response.parameters) === null || _b === void 0 ? void 0 : _b.retry_after) || 5;
                    await this.sleep(retryAfter * 1000);
                    attempts++;
                }
                else {
                    throw err;
                }
            }
        }
        throw new Error(`Job failed after ${this.maxRetries} attempts.`);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
class MultiQueueManager {
    constructor(options) {
        var _a, _b;
        this.queues = new Map();
        this.options = {
            delayBetweenMessagesMs: (_a = options === null || options === void 0 ? void 0 : options.delayBetweenMessagesMs) !== null && _a !== void 0 ? _a : 1000,
            maxRetries: (_b = options === null || options === void 0 ? void 0 : options.maxRetries) !== null && _b !== void 0 ? _b : 3,
        };
    }
    add(key, job) {
        if (!this.queues.has(key)) {
            this.queues.set(key, new SingleQueue(this.options));
        }
        const queue = this.queues.get(key);
        queue.add(job);
    }
}
exports.MultiQueueManager = MultiQueueManager;
