# JavaScript Advanced Theory Questions (Curriculum Gaps)

## 1. Explain Memory Management in JavaScript

JavaScript uses automatic memory management through a garbage collector. Memory allocation and deallocation happen without explicit developer intervention.

### Memory Lifecycle:
1. **Allocation**: Memory is allocated when variables, objects, or functions are declared.
2. **Usage**: Reading and writing to the allocated memory (using variables, calling functions).
3. **Release (Garbage Collection)**: Memory is freed when it is no longer reachable.

### How Memory is Allocated:
- **Stack Memory**: Stores primitive values (numbers, strings, booleans) and function call frames. Fast access, fixed size, LIFO order.
- **Heap Memory**: Stores reference types (objects, arrays, functions). Dynamic size, slower access, managed by GC.

```js
// Stack allocation (primitives)
let age = 25; // stored directly on stack
let name = "John"; // reference to string pool

// Heap allocation (objects)
let user = { name: "John", age: 25 }; // object on heap, reference on stack
let arr = [1, 2, 3]; // array on heap
```

### Common Memory Leaks:
1. Global variables (unintentional)
2. Forgotten timers/intervals
3. Detached DOM nodes
4. Closures holding large references
5. Event listeners not removed

---

## 2. How does Garbage Collection work in JavaScript?

Garbage Collection (GC) is the process of automatically identifying and freeing memory that is no longer referenced or reachable by the program.

### Mark-and-Sweep Algorithm (Modern engines):
1. **Mark Phase**: Starting from "roots" (global object, local variables in active functions), the GC traverses all reachable objects and marks them as "alive."
2. **Sweep Phase**: Any objects NOT marked are considered unreachable and their memory is freed.

### Reference Counting (Legacy, rarely used now):
Tracks how many references point to each object. When reference count drops to zero, memory is freed. Problem: cannot handle circular references.

```js
// Circular reference problem (Reference Counting fails here)
function circular() {
  let objA = {};
  let objB = {};
  objA.ref = objB;
  objB.ref = objA;
  // Both objects reference each other, but are unreachable after function returns
  // Mark-and-Sweep handles this correctly
}

// Memory leak example — timer holding reference
let heavyData = new Array(1000000).fill("data");
setInterval(() => {
  console.log(heavyData.length); // heavyData can never be GC'd
}, 1000);
```

### Generational GC (V8 Engine):
- **Young Generation (Nursery)**: New objects. Frequently collected (Scavenge algorithm).
- **Old Generation**: Objects that survive multiple GC cycles. Less frequently collected (Mark-Sweep-Compact).

---

## 3. What are Symbols in JavaScript and when would you use them?

A Symbol is a primitive data type introduced in ES6 that creates a unique, immutable identifier. Every Symbol is guaranteed to be unique, even if two Symbols have the same description.

### Key Characteristics:
- Created using `Symbol()` (never `new Symbol()`)
- Each symbol is unique: `Symbol('id') !== Symbol('id')`
- Not auto-converted to strings (throws TypeError in string concatenation)
- Hidden from `for...in`, `Object.keys()`, and `JSON.stringify()`

```js
// Creating symbols
const id = Symbol('id');
const anotherId = Symbol('id');
console.log(id === anotherId); // false (always unique)

// Using as object keys (avoids name collisions)
const user = {
  name: "John",
  [id]: 123 // hidden property
};

console.log(user[id]); // 123
console.log(Object.keys(user)); // ["name"] — symbol key hidden

// Well-known symbols (customizing built-in behavior)
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        return current <= end
          ? { value: current++, done: false }
          : { done: true };
      }
    };
  }
}

for (const num of new Range(1, 5)) {
  console.log(num); // 1, 2, 3, 4, 5
}
```

### Use Cases:
1. Unique property keys (avoiding collisions in shared objects)
2. Implementing iterators (`Symbol.iterator`)
3. Customizing type coercion (`Symbol.toPrimitive`)
4. Creating "private-like" properties

---

## 4. What are WeakMap and WeakSet, and how do they differ from Map and Set?

WeakMap and WeakSet are special collections that hold "weak" references to their keys/values, allowing garbage collection of entries when no other references exist.

### WeakMap:
- Keys MUST be objects (not primitives)
- Keys are held weakly — if no other reference to the key exists, it's garbage collected along with its value
- NOT iterable (no `forEach`, `keys()`, `values()`, `size`)
- Methods: `get()`, `set()`, `has()`, `delete()`

### WeakSet:
- Values MUST be objects
- Values are held weakly
- NOT iterable, no `size` property
- Methods: `add()`, `has()`, `delete()`

```js
// WeakMap — private data storage
const privateData = new WeakMap();

class User {
  constructor(name, password) {
    this.name = name;
    privateData.set(this, { password }); // private, GC-friendly
  }
  checkPassword(input) {
    return privateData.get(this).password === input;
  }
}

let user = new User("John", "secret123");
console.log(user.checkPassword("secret123")); // true
user = null; // WeakMap entry is automatically garbage collected

// WeakSet — tracking visited objects
const visited = new WeakSet();

function processNode(node) {
  if (visited.has(node)) return; // already processed
  visited.add(node);
  // process node...
}
```

### Key Differences from Map/Set:
| Feature | Map/Set | WeakMap/WeakSet |
|---------|---------|-----------------|
| Key types | Any value | Objects only |
| GC | Prevents GC of keys | Allows GC |
| Iterable | Yes | No |
| Size property | Yes | No |
| Use case | General storage | Caching, metadata |

---

## 5. Explain the Browser Rendering Pipeline (Critical Rendering Path)

The Critical Rendering Path is the sequence of steps the browser takes to convert HTML, CSS, and JavaScript into pixels on the screen.

### Steps:
1. **Parse HTML → DOM Tree**: Browser parses HTML markup into a tree of DOM nodes.
2. **Parse CSS → CSSOM Tree**: CSS is parsed into a CSS Object Model tree.
3. **JavaScript Execution**: JS can modify both DOM and CSSOM (blocks rendering if not async/defer).
4. **Render Tree**: DOM + CSSOM are combined. Only visible nodes are included (excludes `display: none`).
5. **Layout (Reflow)**: Calculates exact position and size of each element (geometry).
6. **Paint**: Fills in pixels — colors, borders, shadows, text.
7. **Composite**: Layers are combined and drawn to the screen (GPU-accelerated for transforms/opacity).

```
HTML → DOM
CSS → CSSOM        → Render Tree → Layout → Paint → Composite
JS (can modify DOM/CSSOM)
```

### Performance Implications:
- **Reflow (Layout)**: Triggered by changing geometry (width, height, position, font-size). Expensive — affects children and siblings.
- **Repaint**: Triggered by visual changes that don't affect layout (color, background, visibility). Less expensive than reflow.
- **Composite-only changes**: `transform` and `opacity` only trigger compositing (cheapest — GPU-handled).

```js
// Bad — triggers reflow on each iteration
for (let i = 0; i < 100; i++) {
  element.style.left = element.offsetLeft + 1 + 'px'; // read + write = forced reflow
}

// Good — batch DOM reads and writes
const left = element.offsetLeft; // read once
for (let i = 0; i < 100; i++) {
  element.style.left = left + i + 'px'; // write
}
```

---

## 6. Explain the Execution Context and Execution Stack in JavaScript

An Execution Context is the environment in which JavaScript code is evaluated and executed. Every time a function is called, a new execution context is created.

### Types of Execution Context:
1. **Global Execution Context (GEC)**: Created when the script first runs. Sets up the global object (`window`/`globalThis`) and `this`.
2. **Function Execution Context (FEC)**: Created every time a function is invoked.
3. **Eval Execution Context**: Created inside an `eval()` call (discouraged).

### Phases of Execution Context:
1. **Creation Phase**:
   - Creates the Variable Object (hoists declarations)
   - Creates the Scope Chain (current scope + all parent scopes)
   - Determines the value of `this`
2. **Execution Phase**:
   - Assigns values to variables
   - Executes code line by line

### Execution Stack (Call Stack):
A LIFO stack that manages execution contexts. When a function is called, its context is pushed. When it returns, it's popped.

```js
function first() {
  console.log("first");
  second();
  console.log("first end");
}

function second() {
  console.log("second");
  third();
}

function third() {
  console.log("third");
}

first();
// Call Stack progression:
// [Global] → [Global, first] → [Global, first, second] → [Global, first, second, third]
// → [Global, first, second] → [Global, first] → [Global]
```

---

## 7. Explain Microtasks vs Macrotasks in the Event Loop

The Event Loop processes two types of task queues with different priorities:

### Macrotasks (Task Queue):
- `setTimeout`, `setInterval`
- `setImmediate` (Node.js)
- I/O operations
- UI rendering events
- `requestAnimationFrame`

### Microtasks (Microtask Queue):
- `Promise.then/catch/finally` callbacks
- `queueMicrotask()`
- `MutationObserver`
- `process.nextTick()` (Node.js — even higher priority)

### Execution Order:
1. Execute current synchronous code (call stack empties)
2. Process ALL microtasks in the queue (until empty)
3. Render UI updates (if needed)
4. Pick ONE macrotask from the queue and execute it
5. Repeat from step 2

```js
console.log("1 - Sync");

setTimeout(() => console.log("2 - Macrotask"), 0);

Promise.resolve().then(() => {
  console.log("3 - Microtask 1");
  Promise.resolve().then(() => console.log("4 - Microtask 2"));
});

queueMicrotask(() => console.log("5 - Microtask 3"));

console.log("6 - Sync");

// Output: 1, 6, 3, 5, 4, 2
// All microtasks (including nested ones) run before the macrotask
```

---

## 8. What is the Lexical Environment in JavaScript?

A Lexical Environment is a specification type (internal engine concept) that defines the association between identifiers (variable/function names) and their values within a specific scope.

### Structure:
Every Lexical Environment has two components:
1. **Environment Record**: The actual storage for variable and function declarations in this scope.
2. **Outer Reference**: A pointer to the parent Lexical Environment (enables scope chain lookup).

```js
// Global Lexical Environment
const globalVar = "I'm global";

function outer() {
  // outer's Lexical Environment → outer reference points to Global
  const outerVar = "I'm outer";
  
  function inner() {
    // inner's Lexical Environment → outer reference points to outer()
    const innerVar = "I'm inner";
    console.log(innerVar, outerVar, globalVar); // All accessible via scope chain
  }
  inner();
}
outer();
```

### Closures and Lexical Environment:
When a function is created, it captures a reference to its surrounding Lexical Environment. This is WHY closures work — the inner function retains access to the outer scope's variables even after the outer function returns.

```js
function createCounter() {
  let count = 0; // stored in createCounter's Environment Record
  return () => ++count; // captures reference to createCounter's Lexical Environment
}

const counter = createCounter();
counter(); // 1 — accesses count through the captured environment
counter(); // 2
```

---

## 9. What are Iterators and the Iterable Protocol in JavaScript?

The Iterable Protocol defines a standard way to produce a sequence of values. Any object implementing `[Symbol.iterator]()` is iterable and can be used with `for...of`, spread operator, and destructuring.

### Iterator Protocol:
An iterator is an object with a `next()` method that returns `{ value, done }`.

```js
// Custom iterable
const fibonacci = {
  [Symbol.iterator]() {
    let prev = 0, curr = 1;
    return {
      next() {
        const value = curr;
        [prev, curr] = [curr, prev + curr];
        return { value, done: value > 100 };
      }
    };
  }
};

for (const num of fibonacci) {
  console.log(num); // 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89
}

// Spread works too
console.log([...fibonacci]); // [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
```

### Built-in Iterables:
- String, Array, Map, Set, TypedArray, arguments, NodeList

---

## 10. What are Generators in JavaScript and how do they work?

Generators are special functions (declared with `function*`) that can pause and resume execution. They return a Generator object that conforms to both the iterable and iterator protocols.

### Key Features:
- `yield` pauses execution and returns a value
- `.next(value)` resumes execution, optionally passing a value back
- Lazy evaluation — values are computed on demand
- Can represent infinite sequences

```js
function* idGenerator() {
  let id = 1;
  while (true) {
    const reset = yield id++;
    if (reset) id = 1;
  }
}

const gen = idGenerator();
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next(true).value); // 1 (reset triggered)

// Practical: Paginated data fetching
function* paginate(items, pageSize) {
  for (let i = 0; i < items.length; i += pageSize) {
    yield items.slice(i, i + pageSize);
  }
}

const pages = paginate([1,2,3,4,5,6,7,8,9,10], 3);
console.log(pages.next().value); // [1, 2, 3]
console.log(pages.next().value); // [4, 5, 6]
```

---

## 11. What is Event Delegation and why is it useful?

Event Delegation is a pattern where a single event listener is attached to a parent element to handle events from its child elements, leveraging event bubbling.

### Benefits:
1. **Memory efficient**: One listener instead of many
2. **Dynamic elements**: Works with elements added after listener attachment
3. **Cleaner code**: Centralized event handling

```js
// Without delegation (bad for dynamic lists)
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', handleClick);
});

// With delegation (handles current and future elements)
document.getElementById('button-container').addEventListener('click', (e) => {
  if (e.target.matches('.btn')) {
    handleClick(e);
  }
  // Can handle multiple types
  if (e.target.matches('.delete-btn')) {
    handleDelete(e);
  }
});
```

---

## 12. Explain DOM Manipulation methods and best practices

The DOM (Document Object Model) is a tree-like representation of the HTML document. JavaScript can manipulate it to dynamically update content, structure, and styles.

### Key Methods:
```js
// Selection
document.getElementById('id');
document.querySelector('.class');
document.querySelectorAll('div.item');

// Creation & Modification
const el = document.createElement('div');
el.textContent = 'Hello';
el.innerHTML = '<span>World</span>'; // caution: XSS risk
el.setAttribute('data-id', '123');
el.classList.add('active');
el.style.color = 'red';

// Insertion
parent.appendChild(el);
parent.insertBefore(newEl, referenceEl);
parent.append(el1, el2, 'text'); // multiple nodes + text
element.insertAdjacentHTML('beforeend', '<p>New</p>');

// Removal
element.remove();
parent.removeChild(child);

// Traversal
element.parentElement;
element.children;
element.nextElementSibling;
element.closest('.ancestor');
```

### Performance Best Practices:
1. **Batch DOM operations** using DocumentFragment
2. **Minimize reflows** — read all, then write all
3. **Use `textContent`** over `innerHTML` when possible (safer, faster)
4. **Cache DOM references** instead of querying repeatedly
5. **Use event delegation** for multiple similar listeners

```js
// DocumentFragment for batch insertion
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}
document.getElementById('list').appendChild(fragment); // Single reflow
```

---

## 13. What is the Virtual DOM concept?

The Virtual DOM is an in-memory lightweight representation of the actual DOM. Libraries like React use it to optimize UI updates by minimizing expensive direct DOM manipulations.

### How it works:
1. When state changes, a new Virtual DOM tree is created
2. The new tree is compared (diffed) with the previous one
3. Only the differences (patches) are applied to the real DOM (reconciliation)

### Benefits:
- **Batched updates**: Multiple state changes produce a single DOM update
- **Cross-platform**: Virtual DOM can target different renderers (web, native, etc.)
- **Declarative UI**: Describe what the UI should look like, not how to update it

```js
// Conceptual Virtual DOM node
const vNode = {
  type: 'div',
  props: { className: 'container' },
  children: [
    { type: 'h1', props: {}, children: ['Hello World'] },
    { type: 'p', props: {}, children: ['Welcome'] }
  ]
};

// Diffing would detect:
// Old: { type: 'h1', children: ['Hello'] }
// New: { type: 'h1', children: ['Hello World'] }
// Patch: Update text content of h1 only
```

---

## 14. Implement a Polyfill for Array.prototype.map

A polyfill is code that implements a feature on browsers/environments that do not natively support it.

```js
// Array.map polyfill
if (!Array.prototype.myMap) {
  Array.prototype.myMap = function(callback, thisArg) {
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    const result = [];
    for (let i = 0; i < this.length; i++) {
      if (i in this) { // handles sparse arrays
        result[i] = callback.call(thisArg, this[i], i, this);
      }
    }
    return result;
  };
}

// Array.filter polyfill
Array.prototype.myFilter = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

// Array.reduce polyfill
Array.prototype.myReduce = function(callback, initialValue) {
  let accumulator = initialValue;
  let startIndex = 0;
  if (accumulator === undefined) {
    accumulator = this[0];
    startIndex = 1;
  }
  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this);
    }
  }
  return accumulator;
};
```

---

## 15. Implement Deep Clone in JavaScript

Deep cloning creates a completely independent copy of an object including all nested structures.

```js
// Method 1: structuredClone (modern, best option)
const clone1 = structuredClone(original);

// Method 2: JSON (simple but limited — loses functions, undefined, Dates, etc.)
const clone2 = JSON.parse(JSON.stringify(original));

// Method 3: Custom recursive implementation
function deepClone(obj, seen = new WeakMap()) {
  // Handle primitives and null
  if (obj === null || typeof obj !== 'object') return obj;
  
  // Handle circular references
  if (seen.has(obj)) return seen.get(obj);
  
  // Handle Date
  if (obj instanceof Date) return new Date(obj.getTime());
  
  // Handle RegExp
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
  
  // Handle Map
  if (obj instanceof Map) {
    const mapClone = new Map();
    seen.set(obj, mapClone);
    obj.forEach((val, key) => mapClone.set(deepClone(key, seen), deepClone(val, seen)));
    return mapClone;
  }
  
  // Handle Set
  if (obj instanceof Set) {
    const setClone = new Set();
    seen.set(obj, setClone);
    obj.forEach(val => setClone.add(deepClone(val, seen)));
    return setClone;
  }
  
  // Handle Array and Object
  const clone = Array.isArray(obj) ? [] : {};
  seen.set(obj, clone);
  
  for (const key of Reflect.ownKeys(obj)) {
    clone[key] = deepClone(obj[key], seen);
  }
  return clone;
}
```

---

## 16. Implement Debounce and Throttle from scratch

```js
// DEBOUNCE: Delays execution until after wait ms have elapsed since last call
function debounce(fn, wait, immediate = false) {
  let timeoutId;
  return function(...args) {
    const callNow = immediate && !timeoutId;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) fn.apply(this, args);
    }, wait);
    if (callNow) fn.apply(this, args);
  };
}

// THROTTLE: Ensures function is called at most once per wait ms
function throttle(fn, wait) {
  let lastTime = 0;
  let timeoutId = null;
  return function(...args) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);
    if (remaining <= 0) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastTime = now;
      fn.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now();
        timeoutId = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

// Usage
const search = debounce((query) => fetch(`/api?q=${query}`), 300);
const scroll = throttle(() => console.log('scrolled'), 200);
```

---

## 17. Implement Currying in JavaScript

Currying transforms a function with multiple arguments into a sequence of functions that each take a single argument.

```js
// Basic curry implementation
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...args2) {
      return curried.apply(this, args.concat(args2));
    };
  };
}

// Usage
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6

// Practical example: creating reusable utility functions
const multiply = curry((a, b) => a * b);
const double = multiply(2);
const triple = multiply(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// Infinite currying (sum of any number of calls)
function infiniteCurry(fn) {
  return function inner(...args) {
    if (args.length === 0) {
      return fn();
    }
    return infiniteCurry(() => fn() + args.reduce((a, b) => a + b, 0));
  };
}

const sum = infiniteCurry(() => 0);
console.log(sum(1)(2)(3)()); // 6
```

---

## 18. Implement Memoization in JavaScript

Memoization is an optimization technique that caches the results of expensive function calls and returns the cached result when the same inputs occur again.

```js
// Basic memoize
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// With LRU cache (limited size)
function memoizeLRU(fn, maxSize = 100) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      const value = cache.get(key);
      // Move to end (most recently used)
      cache.delete(key);
      cache.set(key, value);
      return value;
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    if (cache.size > maxSize) {
      // Delete oldest entry (first key)
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    return result;
  };
}

// Usage
const expensiveCalc = memoize((n) => {
  console.log('Computing...');
  return n * n;
});

expensiveCalc(4); // "Computing..." → 16
expensiveCalc(4); // 16 (cached, no log)
```

---

## 19. Implement Promise.all Polyfill

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    
    const results = [];
    let completed = 0;
    const total = promises.length;
    
    if (total === 0) return resolve([]);
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then((value) => {
          results[index] = value;
          completed++;
          if (completed === total) {
            resolve(results);
          }
        })
        .catch(reject); // Reject immediately on first failure
    });
  });
}

// Promise.allSettled polyfill
function promiseAllSettled(promises) {
  return Promise.all(
    promises.map(promise =>
      Promise.resolve(promise)
        .then(value => ({ status: 'fulfilled', value }))
        .catch(reason => ({ status: 'rejected', reason }))
    )
  );
}

// Promise.race polyfill
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach(promise => {
      Promise.resolve(promise).then(resolve).catch(reject);
    });
  });
}
```

---

## 20. What are Truthy and Falsy values in JavaScript?

JavaScript evaluates values as either "truthy" or "falsy" in boolean contexts (if statements, logical operators, ternary).

### Falsy Values (only 8):
```js
false
0
-0
0n          // BigInt zero
""          // empty string
null
undefined
NaN
```

### Everything else is truthy, including:
```js
// Commonly surprising truthy values:
"0"         // non-empty string
"false"     // non-empty string
[]          // empty array
{}          // empty object
function(){} // functions
new Date()  // objects
-1          // negative numbers
Infinity
```

### Practical Implications:
```js
// Gotcha with || operator
const count = 0;
const display = count || "No items"; // "No items" — 0 is falsy!
const correct = count ?? "No items"; // 0 — nullish coalescing only checks null/undefined

// Checking for existence
if (value) { } // fails for 0, "", false (may be valid values)
if (value != null) { } // only excludes null and undefined
if (value !== undefined) { } // most precise
```

---

