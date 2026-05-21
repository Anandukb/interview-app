# Node.js Theory Questions

## 1. What is Node.js and how does it work?

Node.js is an open-source, cross-platform JavaScript runtime environment built on Chrome's V8 engine. It allows developers to run JavaScript on the server side.

### How it Works:
- **Single-Threaded Event Loop**: Unlike traditional multithreaded servers (like Apache) that create a new thread for each client request, Node.js runs on a single main thread.
- **Non-Blocking, Asynchronous I/O**: Operations like file system reads, database queries, and network requests are offloaded to the operating system or the Node.js internal thread pool (libuv). While these operations run in the background, the main thread is free to handle other incoming requests.
- **Libuv and V8**: V8 compiles and executes the JS code, while the Libuv C library manages the event loop, thread pool (default 4 threads), and asynchronous tasks.

---

## 2. Explain the Event Loop phases in Node.js

The event loop is what allows Node.js to perform non-blocking I/O operations by offloading tasks to the system kernel whenever possible.

The event loop consists of **6 main phases**, executed in a loop:
1. **Timers**: Executes callbacks scheduled by `setTimeout()` and `setInterval()`.
2. **Pending Callbacks**: Executes I/O callbacks deferred to the next loop iteration (e.g., certain TCP errors).
3. **Idle, Prepare**: Used only internally by Node.
4. **Poll**: Retrieves new I/O events; executes I/O-related callbacks. If the queue is empty, the loop will block here and wait for connections, unless a `setImmediate` is scheduled.
5. **Check**: Executes callbacks scheduled by `setImmediate()`.
6. **Close Callbacks**: Executes close events (e.g., `socket.on('close', ...)`).

*Note*: **Microtasks** (promises and `process.nextTick()`) are not part of the event loop itself. They are executed **between phases** of the event loop as soon as the current operation completes.

---

## 3. What is the difference between `process.nextTick()` and `setImmediate()`?

Both schedule execution for a future point, but they execute at completely different stages of the event loop:

- **`process.nextTick()`**: Schedules a callback to be run in the **microtask queue** immediately after the current operation finishes, *before* the event loop continues to the next phase. Recursively calling `process.nextTick()` can starve the event loop by preventing it from reaching the next phase.
- **`setImmediate()`**: Schedules a callback to be run in the **Check phase** of the event loop, which occurs *after* the Poll phase completes.

### Example:
```js
setTimeout(() => console.log('Timeout'), 0);
setImmediate(() => console.log('Immediate'));
process.nextTick(() => console.log('NextTick'));

// Output order:
// 1. NextTick (Runs immediately after the current script)
// 2. Timeout (Scheduled in the Timers phase)
// 3. Immediate (Scheduled in the Check phase)
```

---

## 4. What are Streams in Node.js and what are their types?

Streams are collection-like structures—similar to arrays or strings—but the data is processed in chunks rather than all at once. This makes them highly memory efficient when working with large volumes of data.

### Types of Streams:
1. **Readable**: Streams from which data can be read (e.g., `fs.createReadStream()`, `http.IncomingMessage`).
2. **Writable**: Streams to which data can be written (e.g., `fs.createWriteStream()`, `http.ServerResponse`).
3. **Duplex**: Streams that are both Readable and Writable (e.g., TCP sockets).
4. **Transform**: Duplex streams that can modify or transform the data as it is written and read (e.g., `zlib.createGzip()` for compression).

### Example:
```js
const fs = require('fs');
const readable = fs.createReadStream('largeFile.txt');
const writable = fs.createWriteStream('copyFile.txt');

// Pipe reads to write chunk-by-chunk automatically
readable.pipe(writable);
```

---

## 5. How does the `EventEmitter` class work?

The `EventEmitter` class (from the `events` module) is the core of Node.js's event-driven architecture. Many built-in modules (like Streams and HTTP servers) inherit from it.

It allows you to define custom events, listen to them, and trigger them:
- **`.on(event, listener)`**: Adds a listener function for the specified event.
- **`.emit(event, ...args)`**: Synchronously calls each of the listeners registered for the event, passing the supplied arguments.
- **`.once(event, listener)`**: Adds a listener that will be invoked at most once.

### Example:
```js
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

myEmitter.on('greet', (name) => {
  console.log(`Hello, ${name}!`);
});

myEmitter.emit('greet', 'Anandu'); // Logs: "Hello, Anandu!"
```

---

## 6. Explain the difference between CommonJS (`require`) and ES Modules (`import`)

Node.js supports two different module systems:

| Feature | CommonJS (CJS) | ES Modules (ESM) |
|---|---|---|
| **Syntax** | `const module = require('./module')` | `import module from './module.js'` |
| **Loading** | Synchronous (blocking) | Asynchronous (non-blocking) |
| **Parsing** | Resolved at runtime | Resolved at parse/compile time (static) |
| **`this` context** | Points to `exports` object | `undefined` |
| **Default in Node** | Filenames ending in `.js` (by default) | Filenames ending in `.mjs` or `"type": "module"` |
| **Global variables** | Has `__dirname`, `__filename` | Needs `import.meta.url` to derive paths |

---

## 7. What is the `cluster` module and how does it differ from `worker_threads`?

Both are used to run JavaScript concurrently, but they target different scenarios:

- **`cluster`**: Spawns multiple instances of the *same* Node.js process (child processes). Each process runs on its own CPU core, has its own memory space, and listens on a shared port. Communication is done via IPC (Inter-Process Communication). Best for scaling web servers to utilize all CPU cores.
- **`worker_threads`**: Spawns separate threads within the *same* process. These threads share the same memory space, enabling fast data sharing via `SharedArrayBuffer`. Best for offloading CPU-intensive calculations (like image processing or cryptography) without blocking the main event loop.

---

## 8. What is backpressure in streams and how is it handled?

Backpressure occurs when the data-producing stream (Readable) writes data faster than the data-consuming stream (Writable) can process and write it.

If backpressure is not handled, unconsumed chunks accumulate in memory (buffers), which can lead to high RAM usage and process crashes.

### How it is handled:
- The `.write()` method of a Writable stream returns `false` when its internal buffer is full, signaling the Readable stream to pause.
- When the buffer drains, the Writable stream emits a `drain` event, signaling the Readable stream to resume.
- **Best Practice**: Using `.pipe()` handles backpressure automatically.
```js
// pipe automatically manages pausing and resuming on backpressure
readable.pipe(writable);
```

---

## 9. Explain the difference between `spawn`, `fork`, `exec`, and `execFile` in the `child_process` module

These methods are used to launch external commands or scripts:

1. **`exec`**: Runs a command in a shell and buffers the output. Returns the entire output at once in a callback. Ideal for running short shell commands where output size is small (buffers up to 1MB).
2. **`execFile`**: Similar to `exec`, but executes the file directly without spawning a shell, making it slightly more efficient and secure.
3. **`spawn`**: Spawns a new process asynchronously and streams the output via stdout/stderr. Ideal for long-running processes or when outputting large amounts of data.
4. **`fork`**: A special case of `spawn` designed specifically to run other Node.js files. It establishes a dedicated IPC channel between the parent and child, allowing message passing via `process.send()`.

---

## 10. What is the purpose of the `Buffer` class in Node.js?

The `Buffer` class is a global class in Node.js designed to handle raw binary data directly in memory. It represents a fixed-size chunk of memory allocated outside the V8 heap.

### Usage:
- Buffers are primarily used when reading files, receiving network streams, or handling binary protocols (like cryptography or TCP sockets).
- It allows easy conversions between raw bytes and various encodings (like `utf-8`, `hex`, `base64`).

### Example:
```js
const buf = Buffer.from('Hello', 'utf-8');
console.log(buf); // <Buffer 48 65 6c 6c 6f>
console.log(buf.toString('base64')); // SGVsbG8=
```

---

## 11. How do you handle uncaught exceptions and unhandled promise rejections in Node.js?

By default, uncaught errors and unhandled promise rejections will cause the Node.js process to exit with a non-zero exit code. You can register process-level event listeners to catch them:

- **Uncaught Exceptions**:
  ```js
  process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
    // Best Practice: Log, clean up connections, and restart the process
    process.exit(1);
  });
  ```
- **Unhandled Promise Rejections**:
  ```js
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Restart process recommended
    process.exit(1);
  });
  ```

*Warning*: Keeping a process running after an uncaught exception is dangerous because the application state may be corrupted or unstable.

---

## 12. What is the role of `package-lock.json` and how does it differ from `package.json`?

- **`package.json`**: Defines the project's metadata, dependencies, scripts, and target version ranges (often using semver ranges like `^1.2.0` or `~1.2.0`). It tells NPM *which* versions are compatible.
- **`package-lock.json`**: Automatically generated when running `npm install`. It locks down the **exact versions** of every package and its nested dependencies that were installed. This guarantees that every developer, server, or CI/CD container installs the exact same dependency tree, preventing "works on my machine" issues.

---

## 13. What is the REPL in Node.js?

REPL stands for **Read-Eval-Print Loop**. It is an interactive computer programming environment (shell) that takes single user inputs, evaluates them, and returns the result to the user.

Node.js comes with a built-in REPL environment. It is extremely useful to test simple JavaScript/Node.js code snippets quickly. You can launch it by running `node` in your terminal with no arguments.

---

## 14. What is the purpose of the `crypto` module in Node.js?

The `crypto` module provides cryptographic functionality that includes a set of wrappers for OpenSSL's hash, HMAC, cipher, decipher, sign, and verify methods.

It is commonly used for:
- Hashing passwords (using algorithms like PBKDF2 or scrypt).
- Encrypting and decrypting data (AES encryption).
- Generating secure random tokens or keys (via `crypto.randomBytes()`).

---

## 15. What is the difference between `dns.lookup()` and `dns.resolve()`?

Both are used to resolve domain names to IP addresses, but they do it differently:

- **`dns.lookup()`**: Uses the operating system's underlying resolution facilities (e.g., `getaddrinfo` system call). This is a **synchronous, blocking** call in the OS, so Node.js executes it in the **libuv thread pool**. It respects the local `/etc/hosts` configurations.
- **`dns.resolve()`**: Makes an actual network request to a DNS server over the network and performs resolution **asynchronously** without using the libuv thread pool. It completely bypasses local `/etc/hosts` configurations.

---

## 16. How does garbage collection differ between Node.js and browser JS?

While both run on V8, their environments offer different tools and memory constraints:

1. **Memory Configuration**: In Node.js, you can manually configure the maximum size of V8's heap memory using flags like `--max-old-space-size=4096` (e.g. to set it to 4GB). In browsers, this is controlled strictly by the browser process limits.
2. **Programmatic Collection**: Node.js allows exposing the Garbage Collector using the command-line flag `--expose-gc`. This lets developers invoke `global.gc()` in code to manually trigger garbage collection, which is highly useful during memory leak profiling or testing.
3. **Process Lifespan**: Node.js processes can run indefinitely (long-running servers), making them far more susceptible to slow-growing memory leaks than a browser tab, which is frequently closed or reloaded.

---

## 17. What is the purpose of `perf_hooks` in Node.js?

The `perf_hooks` module provides an implementation of the W3C Web Performance APIs, allowing developers to collect detailed performance metrics from their application.

It is primarily used to measure the execution time of code blocks or monitor Event Loop lag:
```js
const { performance, PerformanceObserver } = require('perf_hooks');

const obs = new PerformanceObserver((items) => {
  console.log(items.getEntries()[0].duration);
});
obs.observe({ entryTypes: ['measure'] });

performance.mark('A');
// Execute code
performance.mark('B');
performance.measure('A to B', 'A', 'B');
```

---

## 18. Explain the concept of Thread Pool size adjustment in Node.js

Node.js offloads heavy operations (like file system `fs`, cryptography `crypto`, compression `zlib`, and dns lookups `dns.lookup`) to an internal thread pool managed by Libuv.

By default, the thread pool size is set to **4**. If you run many concurrent cryptographic operations or file reads, they will queue up, slowing down your server.

You can increase the thread pool size by setting the environmental variable `UV_THREADPOOL_SIZE` before starting your app (up to a maximum of **1024**):
```bash
UV_THREADPOOL_SIZE=16 node app.js
```

---

## 19. What are the key differences between `fs.readFile` and `fs.createReadStream`?

- **`fs.readFile()`**: Reads the entire file into memory (RAM) buffer all at once before calling the callback. If the file is 2GB, it consumes 2GB of RAM, and will throw a RangeError if the file size exceeds V8's maximum buffer limit (approx 2GB).
- **`fs.createReadStream()`**: Reads the file in small, sequential chunks (default chunk size is 64KB) and emits them via events. It consumes very little memory (only enough to buffer the current chunk) and can handle files of infinite size.

---

## 20. What is the difference between `process.exit(0)` and `process.exit(1)`?

- **`process.exit(0)`**: Instructs Node.js to terminate the current process with an exit code of `0`. In Unix/Windows environments, `0` indicates a **successful exit** (no errors).
- **`process.exit(1)`**: Instructs Node.js to terminate the process with an exit code of `1` (or any non-zero integer). This indicates that the process terminated due to an **unhandled error, failure, or crash**. Process managers like PM2 or Kubernetes use this exit code to decide whether they should automatically restart the crashed container.
