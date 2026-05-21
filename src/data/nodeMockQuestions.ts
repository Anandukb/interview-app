export interface Question {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  hint: string;
  startingCode: string;
  answerCode: string;
}

export const nodePracticalQuestions: Question[] = [
  {
    id: 'node_q1',
    title: 'Implement Custom EventEmitter',
    difficulty: 'Medium',
    description: 'Implement a basic EventEmitter class with on(event, listener), off(event, listener), and emit(event, ...args) methods.',
    hint: 'Use a Map or plain object to store event names mapped to arrays of callback functions. When emitting, iterate over the callbacks and invoke them with args.',
    startingCode: `class EventEmitter {\n  constructor() {\n    this.events = {};\n  }\n\n  on(event, listener) {\n    // Your code here\n  }\n\n  off(event, listener) {\n    // Your code here\n  }\n\n  emit(event, ...args) {\n    // Your code here\n  }\n}\n\nconst emitter = new EventEmitter();\nconst greet = name => console.log("Hello", name);\nemitter.on("greet", greet);\nemitter.emit("greet", "John");\nemitter.off("greet", greet);\nemitter.emit("greet", "John"); // should not print`,
    answerCode: `class EventEmitter {\n  constructor() {\n    this.events = {};\n  }\n\n  on(event, listener) {\n    if (!this.events[event]) {\n      this.events[event] = [];\n    }\n    this.events[event].push(listener);\n  }\n\n  off(event, listener) {\n    if (!this.events[event]) return;\n    this.events[event] = this.events[event].filter(l => l !== listener);\n  }\n\n  emit(event, ...args) {\n    if (!this.events[event]) return;\n    this.events[event].forEach(listener => listener(...args));\n  }\n}\n\nconst emitter = new EventEmitter();\nconst greet = name => console.log("Hello", name);\nemitter.on("greet", greet);\nemitter.emit("greet", "John");\nemitter.off("greet", greet);\nemitter.emit("greet", "John");`
  },
  {
    id: 'node_q2',
    title: 'Custom Promisify Utility',
    difficulty: 'Easy',
    description: 'Write a utility function that converts a node-style callback function (error-first callback) into a function that returns a Promise.',
    hint: 'The returned function should return a new Promise. Inside, invoke the original function, passing the args and a custom callback function (err, result) => {}.',
    startingCode: `function promisify(fn) {\n  // Your code here\n}\n\n// Dummy callback function\nconst asyncTask = (id, callback) => {\n  setTimeout(() => {\n    if (id < 0) callback(new Error("Invalid ID"));\n    else callback(null, { id, data: "Success" });\n  }, 10);\n};\n\nconst promisified = promisify(asyncTask);\npromisified(42)\n  .then(res => console.log(res))\n  .catch(err => console.error(err.message));`,
    answerCode: `function promisify(fn) {\n  return function (...args) {\n    return new Promise((resolve, reject) => {\n      fn(...args, (err, result) => {\n        if (err) {\n          reject(err);\n        } else {\n          resolve(result);\n        }\n      });\n    });\n  };\n}\n\nconst asyncTask = (id, callback) => {\n  setTimeout(() => {\n    if (id < 0) callback(new Error("Invalid ID"));\n    else callback(null, { id, data: "Success" });\n  }, 10);\n};\n\nconst promisified = promisify(asyncTask);\npromisified(42)\n  .then(res => console.log(res))\n  .catch(err => console.error(err.message));`
  },
  {
    id: 'node_q3',
    title: 'Express-Like Middleware Pipeline',
    difficulty: 'Hard',
    description: 'Implement a middleware pipeline runner similar to Express. It takes request, response objects, and an array of middleware functions, executing them sequentially using next().',
    hint: 'Define an index counter. The next() function should increment this index and execute the next middleware in the queue, passing the next function recursively.',
    startingCode: `function runMiddlewares(req, res, middlewares) {\n  // Your code here\n}\n\nconst req = { url: "/" };\nconst res = { headers: {} };\nconst pipeline = [\n  (req, res, next) => { req.user = "John"; next(); },\n  (req, res, next) => { console.log(req.user); next(); }\n];\n\nrunMiddlewares(req, res, pipeline);`,
    answerCode: `function runMiddlewares(req, res, middlewares) {\n  let index = 0;\n  function next() {\n    if (index < middlewares.length) {\n      const middleware = middlewares[index++];\n      middleware(req, res, next);\n    }\n  }\n  next();\n}\n\nconst req = { url: "/" };\nconst res = { headers: {} };\nconst pipeline = [\n  (req, res, next) => { req.user = "John"; next(); },\n  (req, res, next) => { console.log(req.user); next(); }\n];\n\nrunMiddlewares(req, res, pipeline);`
  },
  {
    id: 'node_q4',
    title: 'Sequential Async Execution',
    difficulty: 'Medium',
    description: 'Write a function that executes an array of asynchronous tasks (functions returning promises) sequentially (one after another) and returns a promise resolving to an array of their results.',
    hint: 'Use Array.prototype.reduce to chain the promises sequentially, or use an async function with a for-of loop and await.',
    startingCode: `async function runSequentially(tasks) {\n  // Your code here\n}\n\nconst tasks = [\n  () => Promise.resolve("A"),\n  () => new Promise(r => setTimeout(() => r("B"), 10)),\n  () => Promise.resolve("C")\n];\n\nrunSequentially(tasks).then(console.log);`,
    answerCode: `async function runSequentially(tasks) {\n  const results = [];\n  for (const task of tasks) {\n    results.push(await task());\n  }\n  return results;\n}\n\nconst tasks = [\n  () => Promise.resolve("A"),\n  () => new Promise(r => setTimeout(() => r("B"), 10)),\n  () => Promise.resolve("C")\n];\n\nrunSequentially(tasks).then(console.log);`
  },
  {
    id: 'node_q5',
    title: 'Limit Concurrent Async Execution (Throttle)',
    difficulty: 'Hard',
    description: 'Implement a function throttleLimit(tasks, limit) that runs an array of promise-returning functions with a concurrency limit. It must return a promise resolving to all results in order.',
    hint: 'Maintain active running list count. Inside a recursive helper, if tasks remain and active count is less than limit, take next task, run it, and when it finishes, decrement active and recurse.',
    startingCode: `function throttleLimit(tasks, limit) {\n  // Your code here\n}\n\nconst tasks = [\n  () => new Promise(r => setTimeout(() => r(1), 30)),\n  () => new Promise(r => setTimeout(() => r(2), 10)),\n  () => new Promise(r => setTimeout(() => r(3), 20))\n];\n\nthrottleLimit(tasks, 2).then(console.log);`,
    answerCode: `function throttleLimit(tasks, limit) {\n  return new Promise((resolve) => {\n    const results = [];\n    let completed = 0;\n    let started = 0;\n\n    function runNext() {\n      if (completed === tasks.length) {\n        return resolve(results);\n      }\n      while (started < tasks.length && started - completed < limit) {\n        const index = started++;\n        tasks[index]().then((res) => {\n          results[index] = res;\n          completed++;\n          runNext();\n        });\n      }\n    }\n    runNext();\n  });\n}\n\nconst tasks = [\n  () => new Promise(r => setTimeout(() => r(1), 30)),\n  () => new Promise(r => setTimeout(() => r(2), 10)),\n  () => new Promise(r => setTimeout(() => r(3), 20))\n];\n\nthrottleLimit(tasks, 2).then(console.log);`
  },
  {
    id: 'node_q7',
    title: 'Async Retry Utility',
    difficulty: 'Medium',
    description: 'Write a utility function retry(fn, retries, delay) that attempts to execute a promise-returning function fn. If it rejects, it waits delay ms and retries. If all retries fail, it rejects with the final error.',
    hint: 'Return a promise. Inside, define a run() function. If fn() succeeds, resolve. If it fails, check remaining retries. If retries > 0, use setTimeout to wait and invoke run() again with retries - 1.',
    startingCode: `function retry(fn, retries, delay) {\n  // Your code here\n}\n\nlet attempts = 0;\nconst flakyTask = () => {\n  return new Promise((resolve, reject) => {\n    attempts++;\n    if (attempts < 3) reject(new Error("Failed"));\n    else resolve("Success!");\n  });\n};\n\nretry(flakyTask, 3, 10)\n  .then(console.log)\n  .catch(err => console.error("Should not fail:", err.message));`,
    answerCode: `function retry(fn, retries, delay) {\n  return new Promise((resolve, reject) => {\n    function run(remaining) {\n      fn()\n        .then(resolve)\n        .catch(err => {\n          if (remaining <= 0) {\n            reject(err);\n          } else {\n            setTimeout(() => run(remaining - 1), delay);\n          }\n        });\n    }\n    run(retries);\n  });\n}\n\nlet attempts = 0;\nconst flakyTask = () => {\n  return new Promise((resolve, reject) => {\n    attempts++;\n    if (attempts < 3) reject(new Error("Failed"));\n    else resolve("Success!");\n  });\n};\n\nretry(flakyTask, 3, 10)\n  .then(console.log)\n  .catch(err => console.error("Should not fail:", err.message));`
  },
  {
    id: 'node_q8',
    title: 'Async Map Limit',
    difficulty: 'Hard',
    description: 'Implement a function mapLimit(arr, limit, iteratee) that takes an array, a concurrency limit, and an async iteratee function. It runs the iteratee on all elements concurrently up to the limit, resolving with the mapped results.',
    hint: 'This is similar to throttleLimit but transforms an array using a callback. Keep track of active indices and store the mapped results in order.',
    startingCode: `function mapLimit(arr, limit, iteratee) {\n  // Your code here\n}\n\nconst nums = [1, 2, 3];\nconst doubleAsync = n => new Promise(r => setTimeout(() => r(n * 2), 10));\n\nmapLimit(nums, 2, doubleAsync).then(console.log);`,
    answerCode: `function mapLimit(arr, limit, iteratee) {\n  return new Promise((resolve) => {\n    const results = [];\n    let completed = 0;\n    let index = 0;\n\n    function next() {\n      if (completed === arr.length) {\n        return resolve(results);\n      }\n      while (index < arr.length && index - completed < limit) {\n        const currentIdx = index++;\n        iteratee(arr[currentIdx]).then((res) => {\n          results[currentIdx] = res;\n          completed++;\n          next();\n        });\n      }\n    }\n    next();\n  });\n}\n\nconst nums = [1, 2, 3];\nconst doubleAsync = n => new Promise(r => setTimeout(() => r(n * 2), 10));\n\nmapLimit(nums, 2, doubleAsync).then(console.log);`
  },
  {
    id: 'node_q9',
    title: 'Deep Object Flattening',
    difficulty: 'Medium',
    description: 'Write a function flattenObject(obj) that flattens a nested object into a single-level object, where keys represent the paths of nesting separated by dots.',
    hint: 'Use recursion. Loop through keys. If a value is an object (and not null/array), recursively call flattenObject with the updated key prefix, merging the result into your accumulator.',
    startingCode: `function flattenObject(obj, prefix = "") {\n  // Your code here\n}\n\nconst nested = {\n  user: {\n    profile: { name: "John", age: 25 },\n    active: true\n  }\n};\n\nconsole.log(flattenObject(nested));`,
    answerCode: `function flattenObject(obj, prefix = "") {\n  const result = {};\n  for (const key in obj) {\n    if (Object.prototype.hasOwnProperty.call(obj, key)) {\n      const newKey = prefix ? \`\${prefix}.\${key}\` : key;\n      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {\n        Object.assign(result, flattenObject(obj[key], newKey));\n      } else {\n        result[newKey] = obj[key];\n      }\n    }\n  }\n  return result;\n}\n\nconst nested = {\n  user: {\n    profile: { name: "John", age: 25 },\n    active: true\n  }\n};\n\nconsole.log(flattenObject(nested));`
  },
  {
    id: 'node_q10',
    title: 'Parse Logs by Severity',
    difficulty: 'Easy',
    description: 'Write a function countLogs(logLines) that accepts an array of raw log strings in format "[TIMESTAMP] [LEVEL] MESSAGE" and returns an object counting the total occurrences of each log level (e.g. INFO, ERROR, WARN).',
    hint: 'Use reduce or loop. Match the level inside square brackets using a regex or split methods, clean it, and increment its count in your accumulator object.',
    startingCode: `function countLogs(logLines) {\n  // Your code here\n}\n\nconst logs = [\n  "[2026-05-21 12:00:00] [INFO] Connection established",\n  "[2026-05-21 12:01:00] [ERROR] Timeout error",\n  "[2026-05-21 12:02:00] [INFO] Data loaded",\n  "[2026-05-21 12:03:00] [WARN] Deprecated API call"\n];\n\nconsole.log(countLogs(logs));`,
    answerCode: `function countLogs(logLines) {\n  return logLines.reduce((acc, log) => {\n    const match = log.match(/\\[([A-Z]+)\\]\\s+[^\\[]*$/);\n    if (match) {\n      const level = match[1];\n      acc[level] = (acc[level] || 0) + 1;\n    }\n    return acc;\n  }, {});\n}\n\nconst logs = [\n  "[2026-05-21 12:00:00] [INFO] Connection established",\n  "[2026-05-21 12:01:00] [ERROR] Timeout error",\n  "[2026-05-21 12:02:00] [INFO] Data loaded",\n  "[2026-05-21 12:03:00] [WARN] Deprecated API call"\n];\n\nconsole.log(countLogs(logs));`
  }
];
