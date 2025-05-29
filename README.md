# in-process-message-queue

🧵 A lightweight, in-process async job queue with per-key isolation, retries, and rate-limiting — perfect for bots, messaging systems, or any task throttling.

## Install

```bash
npm install in-process-message-queue
```

import { MultiQueueManager } from "in-process-message-queue";

const queue = new MultiQueueManager();

queue.add("chat123", async () => {
await sendMessageToUser();
});
