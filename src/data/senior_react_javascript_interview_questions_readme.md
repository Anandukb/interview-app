# JavaScript, React & Next.js Interview Preparation

A complete collection of JavaScript, React, Next.js, Redux, HTML/CSS, and practical coding interview questions categorized into:

- Multiple Choice Questions (MCQs)
- Theory Questions
- Practical Coding Questions
- Output Prediction Questions

---

# Table of Contents

- JavaScript MCQ Questions
- JavaScript Theory Questions
- React Questions
- Next.js Questions
- State Management Questions
- Performance Optimization Questions
- Practical Coding Questions
- Output Prediction Questions

---

# JavaScript MCQ Questions

1. Difference between `let`, `const`, and `var`
2. Difference between `==` and `===`
3. Difference between `every()` and `some()`
4. Difference between `map()` and `forEach()`
5. Difference between `Promise.all()` and `Promise.race()`
6. Difference between shallow copy and deep copy
7. Difference between synchronous and asynchronous execution
8. Difference between function declaration and function expression
9. Difference between `setTimeout` and `setInterval`
10. Difference between `localStorage` and `sessionStorage`
11. Difference between event bubbling and event capturing
12. Difference between `for...in` and `for...of`
13. Difference between `slice`, `splice`, and `substring`
14. Difference between mutable and immutable objects
15. Difference between `fetch` and `axios`
16. Difference between `useMemo` and `useCallback`
17. Difference between state and props
18. Difference between absolute and relative positioning
19. Difference between client-side rendering and server-side rendering
20. Difference between SSG, SSR, and CSR in Next.js
21. Difference between `useState` and `useReducer`
22. Difference between class components and functional components
23. Difference between Promises and async/await
24. Difference between deep comparison and shallow comparison
25. Difference between React hooks and lifecycle methods
26. Difference between controlled and uncontrolled components
27. Difference between debounce and throttle
28. Difference between map, filter, and reduce
29. Difference between null, undefined, and NaN
30. Difference between call, apply, and bind

---

# JavaScript Theory Questions

## Basics

1. What is hoisting?
2. What is the Temporal Dead Zone (TDZ)?
3. What is a callback function?
4. What is a closure?
5. What is lexical scope?
6. What is the event loop?
7. What is the call stack?
8. What is a Promise?
9. What is Promise chaining?
10. What is event delegation and why use it?
11. What is `this` in JavaScript?
12. What are Higher-Order Functions (HOF)?
13. What are IIFEs?
14. What are Modules in JavaScript?
15. What is async/await?
16. What are Generators in JavaScript?
17. What is memoization?
18. What is a Polyfill?
19. What are ES6+ features you use often?
20. What is currying in JavaScript?
21. Explain `bind`, `call`, and `apply`
22. Explain garbage collection in JavaScript
23. Explain prototype and prototypal inheritance
24. What are template literals?
25. What are arrow functions?
26. Explain destructuring
27. Explain spread operator
28. Explain rest operator
29. Explain string methods:
    - split
    - includes
    - startsWith
    - endsWith
    - trim
    - trimEnd
    - join
30. What is synchronous and asynchronous execution?
31. Explain deep copy and shallow copy
32. What is event bubbling?
33. What is event capturing?
34. What is debounce?
35. What is throttle?
36. What are semantic tags in HTML?
37. What is GraphQL?

---

# React Questions

1. What is React and why use it?
2. Explain Virtual DOM
3. What are React hooks?
4. Explain commonly used hooks
5. Explain lifecycle methods
6. What is JSX?
7. What are keys in React?
8. What is prop drilling and how to avoid it?
9. Explain Context API
10. Explain Redux
11. What is a Pure Component?
12. What is a custom hook? Give example.
13. What are Semantic tags?
14. How does React event handling work?
15. What are React Fragments?
16. How do you optimize React performance?
17. What are React Portals?
18. What is reconciliation in React?
19. What is batching in React updates?
20. Difference between `useMemo` and `useCallback`
21. Difference between `useState` and `useReducer`
22. What is React Fiber?
23. What are error boundaries?
24. What is lazy loading?
25. What is Suspense?
26. What is React.memo?
27. What are controlled and uncontrolled components?
28. How do you handle forms in React?
29. How do you handle side effects in React?
30. Explain the `useEffect` hook
31. Explain lifting state up
32. What is reconciliation?
33. How does React diffing algorithm work?
34. What are Higher Order Components (HOC)?
35. What are React Portals and where are they used?

---

# Next.js Questions

1. What is Next.js?
2. Difference between SSG, SSR, and CSR
3. How does routing work in Next.js?
4. What is ISR?
5. What are middleware functions in Next.js?
6. How do you implement API routes?
7. How does Next.js help with SEO?
8. What are `getStaticProps`, `getServerSideProps`, and `getStaticPaths`?
9. How do you optimize performance in Next.js?
10. How do you handle authentication in Next.js?
11. What is code splitting in Next.js?
12. What is dynamic routing in Next.js?

---

# State Management Questions

1. What is Redux?
2. Explain Redux data flow
3. What is Redux Toolkit?
4. Alternatives to Redux
5. How do you persist state?
6. Difference between local state and global state
7. Best practices for state management
8. What is Redux Thunk?
9. What is Redux Saga?
10. What is Zustand?
11. What is Recoil?
12. When should you use Context API instead of Redux?

---

# Performance Optimization Questions

1. How do you identify performance bottlenecks?
2. Common causes of unnecessary re-renders
3. How do you optimize bundle size?
4. What is lazy loading?
5. Explain memoization in React
6. Explain code splitting
7. Image optimization techniques
8. SSR optimization strategies
9. How do you optimize API calls?
10. Explain debounce and throttle practically
11. How do you prevent unnecessary re-renders?
12. How does `React.memo` work?
13. What are common React performance issues?

---

# Practical Coding Questions

## 1. Capitalize First Letter of Every Word

```js
const str = "hey hello world";

const splitstr = str.split(" ");

const data = splitstr
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

console.log(data);
```

Expected Output:

```js
Hey Hello World
```

---

## 2. Convert Array into Grouped Object

```js
const users = [
  { name: "John", role: "admin" },
  { name: "Jane", role: "user" },
  { name: "Mike", role: "admin" }
];

const getUserByRole = () => {
  return users.reduce((acc, user) => {

    if (!acc[user.role]) {
      acc[user.role] = [];
    }

    acc[user.role].push(user.name);

    return acc;

  }, {});
};

console.log(getUserByRole());
```

Expected Output:

```js
{
  admin: ["John", "Mike"],
  user: ["Jane"]
}
```

---

## 3. Find Duplicate Words

```js
function findDuplicateWords(str) {

  const words = str.split(" ");

  const count = {};

  const duplicates = [];

  for (const word of words) {

    count[word] = (count[word] || 0) + 1;

    if (count[word] === 2) {
      duplicates.push(word);
    }

  }

  return duplicates;
}

console.log(findDuplicateWords("react is great and react is fast"));
```

Expected Output:

```js
["react", "is"]
```

---

## 4. Anagram Problem

```js
function isAnagram(str1, str2) {

  return str1
    .split("")
    .sort()
    .join("") === str2
    .split("")
    .sort()
    .join("");

}

console.log(isAnagram("listen", "silent"));
```

Expected Output:

```js
true
```

---

## 5. Reverse a String

```js
function reverseString(str) {
  return str.split("").reverse().join("");
}

console.log(reverseString("hello"));
```

Expected Output:

```js
"olleh"
```

---

## Additional Coding Questions

1. Remove duplicates from array
2. Flatten nested arrays
3. Find maximum repeated character
4. Find missing number in array
5. Palindrome checker
6. Fibonacci series
7. Debounce implementation
8. Throttle implementation
9. Implement custom map method
10. Implement custom filter method
11. Implement custom reduce method
12. Implement Promise.all polyfill
13. Deep clone an object
14. Implement currying function
15. Create custom hook example
16. Build debounce search input in React
17. Build infinite scrolling
18. Build todo app using Context API
19. Build counter app using Redux
20. Implement lazy loading in React

---

# Output Prediction Questions

## 1. Event Loop Output

```js
console.log("Start");

setTimeout(() => {
  console.log("Timeout");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise");
});

console.log("End");
```

Expected Output:

```js
Start
End
Promise
Timeout
```

---

## 2. var with setTimeout

```js
for (var i = 0; i < 3; i++) {

  setTimeout(() => {
    console.log(i);
  }, 1000);

}
```

Expected Output:

```js
3
3
3
```

---

## 3. let with setTimeout

```js
for (let i = 0; i < 3; i++) {

  setTimeout(() => {
    console.log(i);
  }, 1000);

}
```

Expected Output:

```js
0
1
2
```

---

## 4. Promise vs setTimeout

```js
setTimeout(() => console.log("Timeout"));

Promise.resolve().then(() => console.log("Promise"));

console.log("Sync");
```

Expected Output:

```js
Sync
Promise
Timeout
```

---

## 5. Hoisting Example

```js
console.log(a);

var a = 10;
```

Expected Output:

```js
undefined
```

---

## 6. TDZ Example

```js
console.log(a);

let a = 10;
```

Expected Output:

```js
ReferenceError
```

---

## 7. Closure Example

```js
function outer() {

  let count = 0;

  return function inner() {
    count++;
    console.log(count);
  };

}

const counter = outer();

counter();
counter();
counter();
```

Expected Output:

```js
1
2
3
```

---

## 8. call, apply, bind

```js
const person = {
  name: "John"
};

function greet(city) {
  console.log(this.name + " from " + city);
}

greet.call(person, "Doha");
```

Expected Output:

```js
John from Doha
```

---

## 9. Async Await Output

```js
async function test() {

  console.log(1);

  await Promise.resolve();

  console.log(2);

}

console.log(3);

test();

console.log(4);
```

Expected Output:

```js
3
1
4
2
```

---

## 10. Promise Chain Output

```js
Promise.resolve(1)
  .then(res => {
    console.log(res);
    return res + 1;
  })
  .then(res => {
    console.log(res);
  });
```

Expected Output:

```js
1
2
```

---

## 11. Function Hoisting Output

```js
sayHello();

function sayHello() {
  console.log("Hello");
}
```

Expected Output:

```js
Hello
```

---

## 12. Function Expression Output

```js
sayHello();

var sayHello = function () {
  console.log("Hello");
};
```

Expected Output:

```js
TypeError
```

---

## 13. this Keyword Output

```js
const user = {
  name: "John",
  greet() {
    console.log(this.name);
  }
};

user.greet();
```

Expected Output:

```js
John
```

---

## 14. Array map Output

```js
const arr = [1, 2, 3];

const data = arr.map(num => num * 2);

console.log(data);
```

Expected Output:

```js
[2, 4, 6]
```

---

## 15. Array reduce Output

```js
const arr = [1, 2, 3, 4];

const total = arr.reduce((acc, curr) => {
  return acc + curr;
}, 10);

console.log(total);
```

Expected Output:

```js
20
```

---

## 16. Object key evaluation (String coercion)

```js
const a = {};
const b = { key: 'b' };
const c = { key: 'c' };

a[b] = 123;
a[c] = 456;

console.log(a[b]);
```

Expected Output:

```js
456
```

---

## 17. Shallow copy mutation

```js
const obj1 = { name: "John", details: { age: 25 } };
const obj2 = { ...obj1 };
obj2.name = "John";
obj2.details.age = 30;

console.log(obj1.name);
console.log(obj1.details.age);
```

Expected Output:

```js
John
30
```

---

## 18. Arrow functions `this` resolution

```js
const obj = {
  name: "John",
  regularFn: function() {
    console.log(this.name);
  },
  arrowFn: () => {
    console.log(this.name);
  }
};

obj.regularFn();
obj.arrowFn();
```

Expected Output:

```js
John
undefined
```

---

## 19. Nested setTimeout & Promise Event Loop

```js
console.log("Start");

setTimeout(() => {
  console.log("Timeout 1");
  Promise.resolve().then(() => console.log("Promise inside Timeout"));
}, 0);

Promise.resolve().then(() => {
  console.log("Promise 1");
  setTimeout(() => console.log("Timeout inside Promise"), 0);
});

console.log("End");
```

Expected Output:

```js
Start
End
Promise 1
Timeout 1
Promise inside Timeout
Timeout inside Promise
```

---

## 20. Array filter and map combination

```js
const items = [1, 2, 3, 4];
const result = items
  .filter(x => x % 2 === 0)
  .map(x => x * 3);

console.log(result);
```

Expected Output:

```js
[6, 12]
```

---

## 21. Logical OR vs Nullish Coalescing

```js
const speed = 0;
const defaultSpeed1 = speed || 10;
const defaultSpeed2 = speed ?? 10;

console.log(defaultSpeed1);
console.log(defaultSpeed2);
```

Expected Output:

```js
10
0
```

---

## 22. Scope & Closures TDZ inside a function

```js
let x = 10;
function test() {
  console.log(x);
  let x = 20;
}
test();
```

Expected Output:

```js
ReferenceError
```

---

## 23. IIFE and global variable assignment leak

```js
(function() {
  var a = b = 5;
})();

console.log(typeof a);
console.log(typeof b);
```

Expected Output:

```js
undefined
number
```

---

## 24. Array push return value

```js
const arr = [1, 2];
const res = arr.push(3);
console.log(res);
```

Expected Output:

```js
3
```

---

## 25. Object freeze property mutations

```js
const obj = { age: 20 };
Object.freeze(obj);
obj.age = 30;
obj.name = "Test";

console.log(obj.age);
console.log(obj.name);
```

Expected Output:

```js
20
undefined
```