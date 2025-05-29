# in-process-message-queue

🧵 A lightweight, in-process async job queue with per-key isolation, retries, and rate-limiting — perfect for bots, messaging systems, or any task throttling.

[![npm version](https://img.shields.io/npm/v/in-process-message-queue.svg)](https://www.npmjs.com/package/in-process-message-queue)
[![GitHub](https://img.shields.io/github/license/iklougman/in-process-message-queue)](https://github.com/iklougman/in-process-message-queue)

---

## 🚀 Features

* 🧹 **Per-Key Isolation** – Tasks with the same key are processed sequentially, but different keys run concurrently.
* 🖁️ **Automatic Retries** – Define retry logic to gracefully handle failures.
* ⏱️ **Rate Limiting** – Limit how frequently tasks for a specific key or globally are processed.
* �� **Lightweight** – No external dependencies.
* 🧠 **Deterministic Execution** – Avoid race conditions and concurrency bugs common in bot/messaging systems.

---

## 📆 Install

```bash
npm install in-process-message-queue
```

---

## ✍️ Usage

```ts
import { MultiQueueManager } from "in-process-message-queue";

const queue = new MultiQueueManager();

queue.add("chat123", async () => {
  await sendMessageToUser();
});
```

You can submit multiple tasks for different keys:

```ts
queue.add("chat123", async () => {
  await sendMessageToUser("User A");
});

queue.add("chat456", async () => {
  await sendMessageToUser("User B");
});
```

In this case:

* Messages to `chat123` are handled **in order**.
* Messages to `chat456` run **in parallel** with `chat123`.

---

## 🌚 Why Not Just `Promise.all`?

While `Promise.all` runs tasks in parallel, it **lacks control** over:

| Feature              | `Promise.all`    | `in-process-message-queue` |
| -------------------- | ---------------- | -------------------------- |
| Parallel execution   | ✅ Yes            | ✅ Yes                      |
| Ordered execution    | ❌ No (unordered) | ✅ Per-key FIFO             |
| Rate limiting        | ❌ No             | ✅ Built-in                 |
| Per-key queuing      | ❌ No             | ✅ Yes                      |
| Retry mechanism      | ❌ No             | ✅ Optional per task        |
| Fine-grained control | ❌ No             | ✅ Designed for control     |

In real-world applications like bots, chat systems, and task pipelines, **uncontrolled concurrency** leads to:

* Race conditions
* API rate limit violations
* Poor user experience

`in-process-message-queue` offers structure, safety, and consistency for async-heavy codebases.

---

## 📜 Example: Throttled Bot Messaging

```ts
queue.add("user42", async () => {
  await sendTypingIndicator();
  await wait(2000);
  await sendMessage("Hello there!");
});
```

Every user's message queue runs in isolation — like having a personal conveyor belt.

---

## 🔧 Advanced Options (Coming Soon)

* Max retries with backoff
* Global concurrency limits
* Task cancellation
* Idle detection and cleanup

---

## 📂 Project Structure

* `MultiQueueManager` – the main interface to schedule isolated task queues.
* `InProcessQueue` – internal class managing single-key job execution.
* Zero dependencies for full portability.

---

## 🛠️ Contributing

Issues and PRs are welcome! See the [issues](https://github.com/iklougman/in-process-message-queue/issues) tab or suggest features that help async orchestration.

---

## 📄 License

MIT © [iklougman](https://github.com/iklougman)
