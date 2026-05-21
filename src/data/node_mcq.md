# Node.js Output Prediction Questions

## 1. Top-Level NextTick vs Promise vs Timers
What is the output of the following Node.js script when run at the top level?
```js
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

process.nextTick(() => {
  console.log('3');
});

Promise.resolve().then(() => {
  console.log('4');
});

setImmediate(() => {
  console.log('5');
});

console.log('6');
```

### Answer
```
1
6
3
4
2
5
```

---

## 2. Timers vs setImmediate inside I/O Callback
What is the output of the following code?
```js
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('Timeout');
  }, 0);

  setImmediate(() => {
    console.log('Immediate');
  });
});
```

### Answer
```
Immediate
Timeout
```

---

## 3. EventEmitter Listener Execution Order
What is the output of this EventEmitter execution?
```js
const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('data', () => {
  console.log('Listener 1');
});

emitter.on('data', () => {
  console.log('Listener 2');
});

console.log('Before Emit');
emitter.emit('data');
console.log('After Emit');
```

### Answer
```
Before Emit
Listener 1
Listener 2
After Emit
```

---

## 4. Module Caching and State Mutation
Imagine we have `counter.js` exporting an object, and we require it twice in `app.js` with modifications:
```js
// counter.js
module.exports = { count: 0 };

// app.js
const counterA = require('./counter');
counterA.count++;

const counterB = require('./counter');
console.log(counterB.count);

counterB.count = 10;
const counterC = require('./counter');
console.log(counterC.count);
```
What is printed by `app.js`?

### Answer
```
1
10
```

---

## 5. EventEmitter once() listener modification
What does the following snippet log?
```js
const EventEmitter = require('events');
const emitter = new EventEmitter();

let count = 0;

emitter.once('increment', () => {
  count++;
  console.log(`Once: ${count}`);
});

emitter.on('increment', () => {
  count++;
  console.log(`On: ${count}`);
});

emitter.emit('increment');
emitter.emit('increment');
```

### Answer
```
Once: 1
On: 2
On: 3
```

---

## 6. Uncaught Error Event Behavior
What happens when the following script runs?
```js
const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.emit('error', new Error('Something went wrong'));
console.log('Will this print?');
```

### Answer
```
Uncaught Error Crash
```

---

## 7. Recursive process.nextTick Starvation
What is the output behavior of the following code?
```js
let runs = 0;

function tick() {
  runs++;
  if (runs <= 3) {
    console.log(`Tick ${runs}`);
    process.nextTick(tick);
  }
}

setTimeout(() => {
  console.log('Timeout');
}, 0);

process.nextTick(tick);
console.log('Start');
```

### Answer
```
Start
Tick 1
Tick 2
Tick 3
Timeout
```

---

## 8. EventEmitter Listeners addition inside emit
What is the output of the following code?
```js
const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('event', () => {
  console.log('A');
  emitter.on('event', () => {
    console.log('B');
  });
});

emitter.emit('event');
console.log('---');
emitter.emit('event');
```

### Answer
```
A
---
A
B
```

---

## 9. Buffer memory sharing via slice
What is the output of the following script?
```js
const buf1 = Buffer.from('hello');
const buf2 = buf1.slice(1, 3);
buf2[0] = 111; // ASCII value for 'o'

console.log(buf1.toString());
console.log(buf2.toString());
```

### Answer
```
hollo
ol
```

---

## 10. process.nextTick inside setTimeout vs setImmediate
What is the output of the following script?
```js
setTimeout(() => {
  console.log('Timeout');
  process.nextTick(() => console.log('NextTick'));
  Promise.resolve().then(() => console.log('Promise'));
}, 0);

setImmediate(() => {
  console.log('Immediate');
});
```

### Answer
```
Timeout
NextTick
Promise
Immediate
```

---

## 11. Module exports vs module.exports reference replacement
What is printed by `app.js`?
```js
// math.js
exports.add = (a, b) => a + b;
module.exports = { subtract: (a, b) => a - b };

// app.js
const math = require('./math');
console.log(typeof math.add);
console.log(typeof math.subtract);
```

### Answer
```
undefined
function
```

---

## 12. EventEmitter prepending listeners
What does the following EventEmitter sequence print?
```js
const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('msg', () => console.log('A'));
emitter.prependListener('msg', () => console.log('B'));
emitter.on('msg', () => console.log('C'));

emitter.emit('msg');
```

### Answer
```
B
A
C
```

---

## 13. Event Loop with unhandled promise rejection
What is the output of the following code?
```js
process.on('unhandledRejection', (reason) => {
  console.log('Handled:', reason.message);
});

Promise.reject(new Error('Rejected!'));
console.log('Script end');
```

### Answer
```
Script end
Handled: Rejected!
```

---

## 14. EventEmitter error emission inside event listener
What is the output of the following code?
```js
const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('error', (err) => {
  console.log('Caught Error:', err.message);
});

emitter.on('data', () => {
  throw new Error('Data Failure');
});

try {
  emitter.emit('data');
} catch (err) {
  console.log('Caught in Try:', err.message);
}
```

### Answer
```
Caught in Try: Data Failure
```

---

## 15. NextTick and setImmediate execution inside process.nextTick
What is the output of the following code?
```js
process.nextTick(() => {
  console.log('nextTick 1');
  setImmediate(() => console.log('immediate 1'));
  process.nextTick(() => console.log('nextTick 2'));
});

setImmediate(() => {
  console.log('immediate 2');
});
```

### Answer
```
nextTick 1
nextTick 2
immediate 2
immediate 1
```
