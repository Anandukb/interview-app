# 100 Senior-Level React & JavaScript Output Prediction Questions

Progression: Easy → Intermediate → Advanced → Senior Interview Level

---

# JavaScript Fundamentals

## 1. Hoisting

```js
console.log(a);
var a = 10;
```

### Answer
```js
undefined
```

---

## 2. Temporal Dead Zone

```js
console.log(a);
let a = 5;
```

### Answer
```js
ReferenceError
```

---

## 3. Function Hoisting

```js
sayHi();

function sayHi() {
  console.log('Hi');
}
```

### Answer
```js
Hi
```

---

## 4. Function Expression Hoisting

```js
sayHi();

var sayHi = function () {
  console.log('Hi');
};
```

### Answer
```js
TypeError
```

---

## 5. Scope

```js
var a = 1;

function test() {
  var a = 2;
  console.log(a);
}

test();
console.log(a);
```

### Answer
```js
2
1
```

---

## 6. Closure

```js
function outer() {
  let count = 0;

  return function () {
    count++;
    console.log(count);
  };
}

const fn = outer();
fn();
fn();
```

### Answer
```js
1
2
```

---

## 7. Arrow Function this

```js
const obj = {
  name: 'React',
  getName: () => {
    console.log(this.name);
  }
};

obj.getName();
```

### Answer
```js
undefined
```

---

## 8. Normal Function this

```js
const obj = {
  name: 'React',
  getName() {
    console.log(this.name);
  }
};

obj.getName();
```

### Answer
```js
React
```

---

## 9. Array Reference

```js
const a = [1, 2];
const b = a;

b.push(3);

console.log(a);
```

### Answer
```js
[1, 2, 3]
```

---

## 10. Object Equality

```js
console.log({} === {});
```

### Answer
```js
false
```

---

## 11. Type Coercion

```js
console.log('5' - 2);
console.log('5' + 2);
```

### Answer
```js
3
52
```

---

## 12. Boolean Conversion

```js
console.log(Boolean([]));
console.log(Boolean(''));
```

### Answer
```js
true
false
```

---

## 13. Null vs Undefined

```js
console.log(null == undefined);
console.log(null === undefined);
```

### Answer
```js
true
false
```

---

## 14. Destructuring

```js
const { a = 10 } = { a: undefined };
console.log(a);
```

### Answer
```js
10
```

---

## 15. Spread Operator

```js
const a = { x: 1 };
const b = { ...a };

b.x = 2;

console.log(a.x);
```

### Answer
```js
1
```

---

# Event Loop & Async

## 16. Promise vs Timeout

```js
console.log(1);

setTimeout(() => console.log(2));

Promise.resolve().then(() => console.log(3));

console.log(4);
```

### Answer
```js
1
4
3
2
```

---

## 17. Async Await

```js
async function test() {
  console.log(1);
  await Promise.resolve();
  console.log(2);
}

test();
console.log(3);
```

### Answer
```js
1
3
2
```

---

## 18. setTimeout Loop with var

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

### Answer
```js
3
3
3
```

---

## 19. setTimeout Loop with let

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

### Answer
```js
0
1
2
```

---

## 20. Nested Promises

```js
Promise.resolve()
  .then(() => {
    console.log(1);
  })
  .then(() => {
    console.log(2);
  });
```

### Answer
```js
1
2
```

---

## 21. Promise Catch

```js
Promise.reject('Error')
  .catch(err => {
    console.log(err);
    return 'Recovered';
  })
  .then(console.log);
```

### Answer
```js
Error
Recovered
```

---

## 22. Async Return

```js
async function test() {
  return 5;
}

test().then(console.log);
```

### Answer
```js
5
```

---

## 23. Queue Priority

```js
setTimeout(() => console.log('timeout'));
queueMicrotask(() => console.log('micro'));
console.log('sync');
```

### Answer
```js
sync
micro
timeout
```

---

## 24. Multiple Awaits

```js
async function test() {
  console.log(1);
  await 1;
  console.log(2);
  await 1;
  console.log(3);
}

test();
console.log(4);
```

### Answer
```js
1
4
2
3
```

---

## 25. Promise.all

```js
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2)
]).then(console.log);
```

### Answer
```js
[1, 2]
```

---

# Advanced JavaScript

## 26. Prototype

```js
function Person(name) {
  this.name = name;
}

Person.prototype.say = function () {
  console.log(this.name);
};

new Person('John').say();
```

### Answer
```js
John
```

---

## 27. Delete Operator

```js
const obj = { a: 1 };
delete obj.a;
console.log(obj.a);
```

### Answer
```js
undefined
```

---

## 28. NaN Equality

```js
console.log(NaN === NaN);
```

### Answer
```js
false
```

---

## 29. Optional Chaining

```js
const obj = null;
console.log(obj?.name);
```

### Answer
```js
undefined
```

---

## 30. Array Map

```js
console.log([1, 2, 3].map(x => x * 2));
```

### Answer
```js
[2, 4, 6]
```

---

## 31. Sparse Array

```js
const arr = [1, , 3];
console.log(arr.length);
```

### Answer
```js
3
```

---

## 32. typeof null

```js
console.log(typeof null);
```

### Answer
```js
object
```

---

## 33. Floating Point

```js
console.log(0.1 + 0.2 === 0.3);
```

### Answer
```js
false
```

---

## 34. Rest Parameters

```js
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}

console.log(sum(1, 2, 3));
```

### Answer
```js
6
```

---

## 35. Function Length

```js
function test(a, b, c = 1) {}
console.log(test.length);
```

### Answer
```js
2
```

---

## 36. Symbol

```js
console.log(Symbol('a') === Symbol('a'));
```

### Answer
```js
false
```

---

## 37. Freeze Object

```js
const obj = Object.freeze({ a: 1 });
obj.a = 2;
console.log(obj.a);
```

### Answer
```js
1
```

---

## 38. Reduce

```js
const result = [1, 2, 3].reduce((a, b) => a + b, 0);
console.log(result);
```

### Answer
```js
6
```

---

## 39. Class Method

```js
class A {
  static test() {
    console.log('Hi');
  }
}

A.test();
```

### Answer
```js
Hi
```

---

## 40. Constructor Return

```js
function Test() {
  this.a = 1;
  return { b: 2 };
}

console.log(new Test());
```

### Answer
```js
{ b: 2 }
```

---

# React Basics

## 41. useState Initial Render

```jsx
function App() {
  const [count] = React.useState(0);
  console.log(count);
  return null;
}
```

### Answer
```js
0
```

---

## 42. State Update

```jsx
function App() {
  const [count, setCount] = React.useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

### Answer
After click:
```js
1
```

---

## 43. Batched Updates

```jsx
setCount(count + 1);
setCount(count + 1);
```

### Answer
```js
+1 only
```

---

## 44. Functional Updates

```jsx
setCount(c => c + 1);
setCount(c => c + 1);
```

### Answer
```js
+2
```

---

## 45. useEffect

```jsx
React.useEffect(() => {
  console.log('Effect');
}, []);
```

### Answer
Runs once after mount.

---

## 46. Cleanup

```jsx
React.useEffect(() => {
  return () => console.log('Cleanup');
}, []);
```

### Answer
Runs on unmount.

---

## 47. Infinite Render

```jsx
function App() {
  const [a, setA] = React.useState(0);
  setA(1);
  return null;
}
```

### Answer
```js
Too many re-renders
```

---

## 48. Same State Value

```jsx
setCount(1);
setCount(1);
```

### Answer
React skips unnecessary rerender.

---

## 49. React.memo

```jsx
const Child = React.memo(() => {
  console.log('Child');
  return null;
});
```

### Answer
Renders only when props change.

---

## 50. Key Prop

```jsx
items.map((item, index) => (
  <div key={index}>{item}</div>
))
```

### Answer
Using index as key may cause UI bugs.

---

# React Hooks

## 51. useRef

```jsx
const ref = React.useRef(0);
ref.current++;
console.log(ref.current);
```

### Answer
```js
1
```

---

## 52. useRef Rerender

### Answer
Changing `ref.current` does not rerender component.

---

## 53. useMemo

```jsx
const value = React.useMemo(() => 5 * 5, []);
console.log(value);
```

### Answer
```js
25
```

---

## 54. useCallback

### Answer
Memoizes function reference.

---

## 55. Stale Closure

```jsx
useEffect(() => {
  setInterval(() => {
    console.log(count);
  }, 1000);
}, []);
```

### Answer
Always logs initial count.

---

## 56. Dependency Missing

### Answer
May cause stale state/props issues.

---

## 57. Custom Hook

```jsx
function useCounter() {
  const [count, setCount] = React.useState(0);
  return { count, setCount };
}
```

### Answer
Each component gets isolated state.

---

## 58. Strict Mode

### Answer
Effects may run twice in development.

---

## 59. useEffect Order

### Answer
Child effects run before parent cleanup.

---

## 60. useLayoutEffect

### Answer
Runs before browser paint.

---

# Rendering & Performance

## 61. Parent Rerender

### Answer
Child rerenders unless memoized.

---

## 62. Inline Function Prop

```jsx
<Child onClick={() => test()} />
```

### Answer
Creates new function every render.

---

## 63. Context Rerender

### Answer
All consumers rerender when context value changes.

---

## 64. Immutable Update

```js
setState(prev => [...prev, 1]);
```

### Answer
Correct immutable update.

---

## 65. Mutation

```js
arr.push(1);
setArr(arr);
```

### Answer
May not rerender properly.

---

## 66. Lazy State

```jsx
const [value] = useState(() => expensive());
```

### Answer
Function runs only initially.

---

## 67. Suspense

### Answer
Displays fallback while waiting.

---

## 68. Concurrent Rendering

### Answer
Rendering may pause/restart.

---

## 69. Fragment

```jsx
<></>
```

### Answer
No extra DOM node.

---

## 70. Controlled Input

### Answer
Value controlled by React state.

---

# Senior JavaScript

## 71. Currying

```js
const add = a => b => a + b;
console.log(add(2)(3));
```

### Answer
```js
5
```

---

## 72. Debounce

### Answer
Delays execution until inactivity.

---

## 73. Throttle

### Answer
Limits execution frequency.

---

## 74. Deep Copy

```js
const b = JSON.parse(JSON.stringify(a));
```

### Answer
Creates deep clone for serializable values.

---

## 75. call

```js
function test() {
  console.log(this.name);
}

test.call({ name: 'JS' });
```

### Answer
```js
JS
```

---

## 76. bind

### Answer
Returns new function with fixed this.

---

## 77. apply

### Answer
Invokes function immediately with array args.

---

## 78. WeakMap

### Answer
Keys must be objects.

---

## 79. Generator

```js
function* gen() {
  yield 1;
  yield 2;
}

const g = gen();
console.log(g.next().value);
```

### Answer
```js
1
```

---

## 80. Event Delegation

### Answer
Uses bubbling to handle events efficiently.

---

# Senior React

## 81. Derived State

### Answer
Avoid duplicating props in state.

---

## 82. Memo Trap

```jsx
const data = {};
<Child data={data} />
```

### Answer
New object every render breaks memoization.

---

## 83. Dependency Trap

```jsx
useEffect(() => {}, [{}]);
```

### Answer
Runs every render.

---

## 84. Hydration Error

### Answer
Server HTML mismatch causes hydration issues.

---

## 85. SSR

### Answer
Effects do not run on server.

---

## 86. useTransition

### Answer
Marks non-urgent updates.

---

## 87. useDeferredValue

### Answer
Defers expensive rendering.

---

## 88. Forward Ref

```jsx
const Input = React.forwardRef((props, ref) => {
  return <input ref={ref} />;
});
```

### Answer
Allows parent access to DOM ref.

---

## 89. Imperative Handle

### Answer
Customizes exposed ref values.

---

## 90. Error Boundary

### Answer
Catches rendering lifecycle errors.

---

# Tricky Senior Output Questions

## 91. Promise Sequence

```js
console.log(1);

Promise.resolve().then(() => {
  console.log(2);
});

setTimeout(() => {
  console.log(3);
}, 0);

console.log(4);
```

### Answer
```js
1
4
2
3
```

---

## 92. Array Fill

```js
const arr = Array(3).fill({});
arr[0].x = 1;
console.log(arr);
```

### Answer
All objects updated because same reference.

---

## 93. Object Keys

```js
const obj = {};
obj[{}] = 'a';
obj[{}] = 'b';

console.log(obj);
```

### Answer
```js
{ '[object Object]': 'b' }
```

---

## 94. ParseInt Map

```js
console.log(['1', '2', '3'].map(parseInt));
```

### Answer
```js
[1, NaN, NaN]
```

---

## 95. Equality

```js
console.log([] == false);
```

### Answer
```js
true
```

---

## 96. Promise Finally

```js
Promise.resolve(1)
  .finally(() => 2)
  .then(console.log);
```

### Answer
```js
1
```

---

## 97. Async Error

```js
async function test() {
  throw new Error('Fail');
}

test().catch(e => console.log(e.message));
```

### Answer
```js
Fail
```

---

## 98. React State Async

```jsx
console.log(count);
setCount(1);
console.log(count);
```

### Answer
Both logs show old value.

---

## 99. useEffect Cleanup Order

### Answer
Cleanup runs before next effect execution.

---

## 100. React Rendering Flow

### Answer
State update → render → commit → effect.

---

# Senior Interview Tips

## Frequently Asked Senior Topics

- Event loop internals
- React rendering lifecycle
- Closure and stale state
- Performance optimization
- Memoization traps
- Concurrent rendering
- Suspense and transitions
- SSR and hydration
- Immutable updates
- useEffect dependency management
- JavaScript execution context
- Prototype chain
- Async race conditions
- Virtual DOM diffing
- Context rerender optimization

---

# Recommended Practice Strategy

1. Predict output before running code.
2. Explain WHY the output occurs.
3. Practice event loop daily.
4. Understand React rendering deeply.
5. Learn stale closure problems.
6. Master memoization and rerendering.
7. Focus on async behavior.
8. Practice debugging mentally.

---

## 101. Advanced Event Loop (Microtask Queue)

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

queueMicrotask(() => {
  console.log("C");
  queueMicrotask(() => console.log("D"));
});

Promise.resolve().then(() => console.log("E"));

console.log("F");
```

### Answer
```js
A
F
C
E
D
B
```

---

## 102. Async/Await Execution Flow

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(() => {
  console.log("setTimeout");
}, 0);

async1();

new Promise((resolve) => {
  console.log("promise1");
  resolve();
}).then(() => {
  console.log("promise2");
});

console.log("script end");
```

### Answer
```js
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
```

---

## 103. Nested Promises and setTimeouts

```js
console.log("Start");

const promise = new Promise((resolve) => {
  console.log("Inside Promise Constructor");
  resolve("Promise Resolved");
});

promise.then((res) => {
  console.log(res);
  setTimeout(() => console.log("Timeout inside then"), 0);
});

setTimeout(() => {
  console.log("Timeout outside");
}, 0);

console.log("End");
```

### Answer
```js
Start
Inside Promise Constructor
End
Promise Resolved
Timeout outside
Timeout inside then
```

---

# End of Document

