# JavaScript Advanced Output Prediction Questions

## 1. Generator Function Output

```js
function* gen() {
  yield 1;
  yield 2;
  return 3;
}

const g = gen();
console.log(g.next());
console.log(g.next());
console.log(g.next());
console.log(g.next());
```

### Answer
```js
{ value: 1, done: false }
{ value: 2, done: false }
{ value: 3, done: true }
{ value: undefined, done: true }
```

---

## 2. Symbol Equality

```js
const s1 = Symbol('id');
const s2 = Symbol('id');

console.log(s1 === s2);
console.log(typeof s1);
```

### Answer
```js
false
symbol
```

---

## 3. WeakMap Behavior

```js
const wm = new WeakMap();
let obj = { name: "test" };
wm.set(obj, 42);

console.log(wm.has(obj));
console.log(wm.get(obj));

obj = null;
console.log(wm.has(obj));
```

### Answer
```js
true
42
false
```

---

## 4. Microtask Priority

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => {
  console.log("C");
  Promise.resolve().then(() => console.log("D"));
});

setTimeout(() => console.log("E"), 0);

console.log("F");
```

### Answer
```js
A
F
C
D
B
E
```

---

## 5. Generator with next() passing values

```js
function* calc() {
  const x = yield "Enter x";
  const y = yield "Enter y";
  return x + y;
}

const g = calc();
console.log(g.next().value);
console.log(g.next(10).value);
console.log(g.next(20).value);
```

### Answer
```js
Enter x
Enter y
30
```

---

## 6. Symbol.iterator Custom Iterable

```js
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { done: true };
      }
    };
  }
};

console.log([...range]);
```

### Answer
```js
[1, 2, 3]
```

---

## 7. Currying Output

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
}

const add = curry((a, b, c) => a + b + c);

console.log(add(1)(2)(3));
console.log(add(1, 2)(3));
console.log(add(1)(2, 3));
```

### Answer
```js
6
6
6
```

---

## 8. Debounce Behavior

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const log = debounce((x) => console.log(x), 100);

log("a");
log("b");
log("c");

// After 100ms, what gets logged?
```

### Answer
```js
c
```

---

## 9. Promise.allSettled Output

```js
const promises = [
  Promise.resolve(1),
  Promise.reject("error"),
  Promise.resolve(3)
];

Promise.allSettled(promises).then(results => {
  console.log(results.length);
  console.log(results[0].status);
  console.log(results[1].status);
  console.log(results[1].reason);
});
```

### Answer
```js
3
fulfilled
rejected
error
```

---

## 10. Object.keys with Symbol

```js
const sym = Symbol('hidden');
const obj = {
  name: "John",
  age: 25,
  [sym]: "secret"
};

console.log(Object.keys(obj));
console.log(Object.getOwnPropertySymbols(obj).length);
```

### Answer
```js
["name", "age"]
1
```

---

## 11. Memoize Function Output

```js
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

let callCount = 0;
const square = memoize((n) => {
  callCount++;
  return n * n;
});

console.log(square(4));
console.log(square(4));
console.log(square(5));
console.log(callCount);
```

### Answer
```js
16
16
25
2
```

---

## 12. Event Loop with async/await and setTimeout

```js
async function foo() {
  console.log("foo start");
  await bar();
  console.log("foo end");
}

async function bar() {
  console.log("bar");
}

console.log("start");
foo();
console.log("end");
```

### Answer
```js
start
foo start
bar
end
foo end
```

---

## 13. Prototype Chain

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return this.name + " makes a sound";
};

function Dog(name) {
  Animal.call(this, name);
}
Dog.prototype = Object.create(Animal.prototype);

const d = new Dog("Rex");
console.log(d.speak());
console.log(d instanceof Dog);
console.log(d instanceof Animal);
```

### Answer
```js
Rex makes a sound
true
true
```

---

## 14. Nullish Coalescing with Optional Chaining

```js
const user = {
  name: "John",
  address: {
    city: null
  }
};

console.log(user.address?.city ?? "Unknown");
console.log(user.address?.zip ?? "No zip");
console.log(user.phone?.number ?? "No phone");
```

### Answer
```js
Unknown
No zip
No phone
```

---

## 15. queueMicrotask vs setTimeout

```js
console.log(1);

queueMicrotask(() => console.log(2));

setTimeout(() => console.log(3), 0);

queueMicrotask(() => console.log(4));

console.log(5);
```

### Answer
```js
1
5
2
4
3
```

---

## 16. WeakRef and FinalizationRegistry concept

```js
let obj = { data: "important" };
const weak = new WeakRef(obj);

console.log(weak.deref()?.data);
obj = null;
// After GC (not guaranteed timing):
// weak.deref() would return undefined
console.log(typeof weak.deref());
```

### Answer
```js
important
object
```

---

## 17. for...of with Map

```js
const map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3]
]);

const keys = [];
const values = [];

for (const [key, value] of map) {
  keys.push(key);
  values.push(value);
}

console.log(keys);
console.log(values);
```

### Answer
```js
["a", "b", "c"]
[1, 2, 3]
```

---

## 18. Proxy Object

```js
const handler = {
  get(target, prop) {
    return prop in target ? target[prop] : `${prop} not found`;
  }
};

const user = new Proxy({ name: "John", age: 25 }, handler);

console.log(user.name);
console.log(user.age);
console.log(user.email);
```

### Answer
```js
John
25
email not found
```

---

## 19. Tagged Template Literals

```js
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? `[${values[i]}]` : '');
  }, '');
}

const name = "World";
const count = 42;
console.log(highlight`Hello ${name}, you have ${count} items`);
```

### Answer
```js
Hello [World], you have [42] items
```

---

## 20. structuredClone vs spread

```js
const original = {
  name: "John",
  scores: [90, 85, 92],
  meta: { level: 5 }
};

const shallow = { ...original };
const deep = structuredClone(original);

shallow.scores.push(100);
deep.meta.level = 10;

console.log(original.scores.length);
console.log(original.meta.level);
```

### Answer
```js
4
5
```

---

