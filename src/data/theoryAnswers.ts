// Theory Answers Database for React & JS Questions
// Maps normalized questions to detailed answers containing explanations and code examples.

export const theoryAnswers: Record<string, string> = {
  // Let, const, var
  "differencebetweenletconstandvar": `
In JavaScript, \`var\`, \`let\`, and \`const\` differ in scoping, hoisting, and re-assignment capabilities:

1. **Scope**:
   - \`var\` is function-scoped. It is accessible anywhere inside the function it is defined in.
   - \`let\` and \`const\` are block-scoped (contained within \`{}\`).

2. **Hoisting**:
   - \`var\` variables are hoisted and initialized as \`undefined\`.
   - \`let\` and \`const\` are hoisted but NOT initialized, staying in the **Temporal Dead Zone (TDZ)** until their declaration is evaluated.

3. **Re-assignment**:
   - \`var\` and \`let\` can be re-assigned.
   - \`const\` binds a value permanently and cannot be re-assigned (though object properties inside a \`const\` object can be mutated).

Example:
\`\`\`js
function scopeTest() {
  if (true) {
    var functionScoped = "I am var";
    let blockScoped = "I am let";
  }
  console.log(functionScoped); // Works (var is function-scoped)
  // console.log(blockScoped); // ReferenceError (let is block-scoped)
}
\`\`\`
`,

  // == vs ===
  "differencebetweenand": `
The difference between loose equality (\`==\`) and strict equality (\`===\`) is type coercion:

- **\`==\` (Loose Equality)**: Compares two values for equality after performing implicit type conversion (coercion) if their types differ.
- **\`===\` (Strict Equality)**: Compares both the value and the type. No type coercion is performed. If the types are different, it immediately returns \`false\`.

Example:
\`\`\`js
console.log(5 == "5");  // true (string "5" is coerced to number 5)
console.log(5 === "5"); // false (types differ: number vs string)
console.log(null == undefined);  // true
console.log(null === undefined); // false
\`\`\`

**Best Practice**: Always use \`===\` to prevent unexpected bugs caused by implicit coercion.
`,

  // every() vs some()
  "differencebetweeneveryandsome": `
Both \`every()\` and \`some()\` are JavaScript array iteration methods that test elements against a callback function, but they differ in completion conditions:

- **\`every()\`**: Returns \`true\` if **all** elements in the array pass the test. It short-circuits (returns \`false\`) as soon as it finds one failing element.
- **\`some()\`**: Returns \`true\` if **at least one** element passes the test. It short-circuits (returns \`true\`) as soon as it finds one passing element.

Example:
\`\`\`js
const nums = [1, 2, -3, 4];

const allPositive = nums.every(n => n > 0); // false
const hasNegative = nums.some(n => n < 0);  // true
\`\`\`
`,

  // map() vs forEach()
  "differencebetweenmapandforeach": `
Both methods iterate over arrays, but they serve different purposes:

- **\`map()\`**: Creates and returns a **new array** containing the results of calling the provided function on every element. It is pure and does not mutate the original array.
- **\`forEach()\`**: Executes a provided function once for each array element. It **returns \`undefined\`** and is used to perform side effects (e.g., logging, modifying external state).

Example:
\`\`\`js
const numbers = [1, 2, 3];

// map returns a new array
const doubled = numbers.map(num => num * 2); // [2, 4, 6]

// forEach performs a side effect
numbers.forEach(num => console.log(num)); // logs 1, 2, 3
\`\`\`

**Best Practice**: Use \`map()\` when you need to transform data, and \`forEach()\` when you need side effects. Never use \`map()\` if you aren't using the returned array.
`,

  // Promise.all() vs Promise.race()
  "differencebetweenpromiseallandpromiserace": `
These methods handle concurrent promises differently:

- **\`Promise.all()\`**: Takes an array of promises and returns a single Promise that resolves when **all** input promises resolve, or rejects immediately when **any** promise rejects (fail-fast).
- **\`Promise.race()\`**: Resolves or rejects as soon as **any one** of the input promises settles (either resolves or rejects).

Example:
\`\`\`js
const p1 = new Promise(resolve => setTimeout(() => resolve('P1 Fast'), 100));
const p2 = new Promise(resolve => setTimeout(() => resolve('P2 Slow'), 500));

Promise.all([p1, p2]).then(console.log);  // ['P1 Fast', 'P2 Slow'] (takes 500ms)
Promise.race([p1, p2]).then(console.log); // 'P1 Fast' (takes 100ms)
\`\`\`
`,

  // Shallow vs Deep copy
  "differencebetweenshallowcopyanddeepcopy": `
Shallow copying and deep copying determine how nested objects are copied:

- **Shallow Copy**: Copies the top-level properties. If a property is a reference type (like an object or array), it copies the reference address, meaning both the copy and the original share the nested object.
- **Deep Copy**: Copies all levels of the object recursively, creating new memory addresses for all nested structures. Modifying the deep copy has no effect on the original.

Example:
\`\`\`js
const original = { name: "John", details: { city: "Doha" } };

// Shallow copy using spread
const shallow = { ...original };
shallow.details.city = "London";
console.log(original.details.city); // "London" (original mutated!)

// Deep copy using structuredClone
const deep = structuredClone(original);
deep.details.city = "Tokyo";
console.log(original.details.city); // "London" (original untouched)
\`\`\`
`,
  "explaindeepcopyandshallowcopy": `
Shallow copying and deep copying determine how nested objects are copied:

- **Shallow Copy**: Copies the top-level properties. If a property is a reference type (like an object or array), it copies the reference address, meaning both the copy and the original share the nested object.
- **Deep Copy**: Copies all levels of the object recursively, creating new memory addresses for all nested structures. Modifying the deep copy has no effect on the original.

Example:
\`\`\`js
const original = { name: "John", details: { city: "Doha" } };

// Shallow copy using spread
const shallow = { ...original };
shallow.details.city = "London";
console.log(original.details.city); // "London" (original mutated!)

// Deep copy using structuredClone
const deep = structuredClone(original);
deep.details.city = "Tokyo";
console.log(original.details.city); // "London" (original untouched)
\`\`\`
`,

  // Sync vs Async
  "differencebetweensynchronousandasynchronousexecution": `
Execution models in JavaScript handle tasks differently:

- **Synchronous Execution**: Code is executed line-by-line in sequential order. Each statement blocks the execution of subsequent code until it finishes.
- **Asynchronous Execution**: Tasks (like API calls or timeouts) are offloaded to Web APIs, allowing the main execution thread to continue running other code. Once complete, they enter a queue and execute without blocking the main flow.

Example:
\`\`\`js
// Synchronous
console.log("1");
console.log("2"); // logs: 1, 2

// Asynchronous
console.log("1");
setTimeout(() => console.log("2"), 100);
console.log("3"); // logs: 1, 3, 2
\`\`\`
`,
  "whatissynchronousandasynchronousexecution": `
Execution models in JavaScript handle tasks differently:

- **Synchronous Execution**: Code is executed line-by-line in sequential order. Each statement blocks the execution of subsequent code until it finishes.
- **Asynchronous Execution**: Tasks (like API calls or timeouts) are offloaded to Web APIs, allowing the main execution thread to continue running other code. Once complete, they enter a queue and execute without blocking the main flow.

Example:
\`\`\`js
// Synchronous
console.log("1");
console.log("2"); // logs: 1, 2

// Asynchronous
console.log("1");
setTimeout(() => console.log("2"), 100);
console.log("3"); // logs: 1, 3, 2
\`\`\`
`,

  // function declaration vs function expression
  "differencebetweenfunctiondeclarationandfunctionexpression": `
The primary difference is **hoisting** behavior:

- **Function Declaration**: Loaded into memory before execution begins. Can be called *before* they are declared in the code.
- **Function Expression**: Created when the execution reaches that line. Since they are usually assigned to variables (\`var\`, \`let\`, \`const\`), they follow variable hoisting rules (calling them before definition triggers an error).

Example:
\`\`\`js
// Declaration works before line
greetDecl(); // "Hello!"
function greetDecl() { console.log("Hello!"); }

// Expression fails before line
greetExpr(); // TypeError or ReferenceError
var greetExpr = function() { console.log("Hi!"); };
\`\`\`
`,

  // setTimeout vs setInterval
  "differencebetweensettimeoutandsetinterval": `
Both are timer methods in JavaScript but have different recurring behaviors:

- **\`setTimeout()\`**: Executes a callback function **exactly once** after a specified delay.
- **\`setInterval()\`**: Repeatedly executes a callback function **at intervals** of a specified delay.

Example:
\`\`\`js
// Runs once after 1 second
setTimeout(() => console.log("Hello"), 1000);

// Runs every 1 second continuously
const id = setInterval(() => console.log("Tick"), 1000);
// To stop it:
clearInterval(id);
\`\`\`
`,

  // localStorage vs sessionStorage
  "differencebetweenlocalstorageandsessionstorage": `
Both are web storage APIs storing key-value pairs in the browser as strings, but they differ in lifetime:

- **\`localStorage\`**: Persists data with **no expiration date**. Data remains even if the browser tab/window is closed and reopened. Must be cleared programmatically or manually.
- **\`sessionStorage\`**: Keeps data only for the duration of the page session. Data is **wiped out** when the browser tab/window is closed.

Example:
\`\`\`js
// Persists indefinitely
localStorage.setItem("user", "John");

// Deleted when tab closes
sessionStorage.setItem("session_token", "xyz123");
\`\`\`
`,

  // Event Bubbling vs Event Capturing
  "differencebetweeneventbubblingandeventcapturing": `
These are the two phases of event propagation in the DOM:

- **Event Bubbling**: The event starts at the target element that triggered it and bubbles **upward** through its parent elements in the DOM tree. (Default behavior).
- **Event Capturing (Trickling)**: The event starts at the top of the DOM tree (Document/Window) and trickles **downward** to the target element.

Example:
\`\`\`js
// Capture phase (third param true)
element.addEventListener("click", handler, true);

// Bubbling phase (default, third param false)
element.addEventListener("click", handler, false);
\`\`\`
`,

  // for...in vs for...of
  "differencebetweenforinandforof": `
Both iterate over structures but target different values:

- **\`for...in\`**: Iterates over the enumerable **keys (properties)** of an object (including prototype keys).
- **\`for...of\`**: Iterates over the iterable **values** of an iterable object (like Arrays, Strings, Sets, Maps).

Example:
\`\`\`js
const arr = ["a", "b"];

for (let key in arr) {
  console.log(key); // "0", "1" (indexes)
}

for (let val of arr) {
  console.log(val); // "a", "b" (elements)
}
\`\`\`
`,

  // slice, splice, substring
  "differencebetweenslicespliceandsubstring": `
These methods extract or modify parts of arrays/strings:

1. **\`slice(start, end)\`**: (Array & String) Extracts a section and returns a **new** array/string without mutating the original. Supports negative indexes.
2. **\`splice(start, count, ...items)\`**: (Array only) Adds/removes elements to/from the original array and **mutates** it.
3. **\`substring(start, end)\`**: (String only) Similar to \`slice\`, but doesn't support negative indexes (treats them as \`0\`).

Example:
\`\`\`js
// Array slice (no mutation)
const arr = [1, 2, 3];
const sliced = arr.slice(0, 2); // [1, 2]

// Array splice (mutates)
arr.splice(1, 1, 9); // arr is now [1, 9, 3]
\`\`\`
`,

  // Mutable vs Immutable
  "differencebetweenmutableandimmutableobjects": `
- **Mutable**: Objects whose state/content can be modified after creation (Objects, Arrays, Functions in JS).
- **Immutable**: Values that cannot be changed once created (Primitives: Numbers, Strings, Booleans, Symbol, null, undefined). If you modify a string, a new string is allocated in memory.

Example:
\`\`\`js
// Mutable
const user = { name: "John" };
user.name = "Doe"; // Modified in-place

// Immutable (making an object shallowly immutable)
const frozenUser = Object.freeze({ name: "John" });
frozenUser.name = "Doe"; // Silent failure or error in strict mode
\`\`\`
`,

  // fetch vs axios
  "differencebetweenfetchandaxios": `
- **\`fetch\`**: Native Web API built into modern browsers. It returns a Promise, but does not reject on HTTP errors (e.g., 404, 500) — you must manually check \`response.ok\`. It also requires a manual call to \`.json()\` to parse the response body.
- **\`axios\`**: Third-party library. Automatically transforms JSON data, rejects the promise on HTTP error codes, supports request/response interceptors, and can cancel requests.

Example:
\`\`\`js
// Native fetch
fetch('/api/data')
  .then(res => {
    if (!res.ok) throw new Error("HTTP error");
    return res.json();
  })
  .then(data => console.log(data));

// Axios
axios.get('/api/data')
  .then(res => console.log(res.data));
\`\`\`
`,

  // Absolute vs Relative positioning
  "differencebetweenabsoluteandrelativepositioning": `
These are CSS position properties:

- **\`position: relative\`**: Element is positioned relative to its **normal flow position**. It reserves its original space in the layout, and offsets do not disrupt other elements.
- **\`position: absolute\`**: Element is removed from the normal document flow. It is positioned relative to its **nearest positioned ancestor** (an ancestor with a position other than \`static\`). If none exists, it positions relative to the initial containing block (viewport/html).

Example:
\`\`\`css
.parent {
  position: relative; /* Anchor for absolute children */
}
.child {
  position: absolute;
  top: 10px;
  right: 10px;
}
\`\`\`
`,

  // CSR vs SSR
  "differencebetweenclientsiderenderingandserversiderendering": `
- **Client-Side Rendering (CSR)**: The server sends a barebones HTML file and a bundle of JavaScript. The browser downloads the JS and builds the entire page client-side.
  - *Pros*: Fast transitions after initial load, rich interactions.
  - *Cons*: Slow initial load (FCP), poorer SEO since crawlers see empty HTML initially.
- **Server-Side Rendering (SSR)**: The server renders the HTML for the requested page on the fly for each request and sends the fully populated HTML to the browser.
  - *Pros*: Excellent SEO, fast First Contentful Paint.
  - *Cons*: Server load is higher, page transitions require a roundtrip to the server unless optimized.
`,

  // SSG vs SSR vs CSR (and Next.js)
  "differencebetweenssgssrandcsrinextjs": `
Next.js supports multiple rendering paradigms depending on page requirements:

1. **Static Site Generation (SSG)**: HTML is built **once at build time** (via \`getStaticProps\`). Best for content that does not change on a per-user basis (e.g., blogs, documentation). Extremely fast (served from CDN).
2. **Server-Side Rendering (SSR)**: HTML is generated **on each request** (via \`getServerSideProps\`). Best for dynamic pages containing personalized or real-time data.
3. **Client-Side Rendering (CSR)**: Standard React rendering inside the browser. Data is fetched in \`useEffect\` or via SWR/React Query.

Example:
\`\`\`js
// Next.js Page (SSG example)
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data } };
}
\`\`\`
`,
  "differencebetweenssgssrandcsr": `
Next.js supports multiple rendering paradigms depending on page requirements:

1. **Static Site Generation (SSG)**: HTML is built **once at build time** (via \`getStaticProps\`). Best for content that does not change on a per-user basis (e.g., blogs, documentation). Extremely fast (served from CDN).
2. **Server-Side Rendering (SSR)**: HTML is generated **on each request** (via \`getServerSideProps\`). Best for dynamic pages containing personalized or real-time data.
3. **Client-Side Rendering (CSR)**: Standard React rendering inside the browser. Data is fetched in \`useEffect\` or via SWR/React Query.

Example:
\`\`\`js
// Next.js Page (SSG example)
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data } };
}
\`\`\`
`,

  // useState vs useReducer
  "differencebetweenusestateandusereducer": `
Both are React state hooks, but cater to different complexity levels:

- **\`useState\`**: Simple state management. Best for independent, primitive states (e.g., toggles, inputs).
- **\`useReducer\`**: Complex state logic. Best for managing state objects containing multiple sub-values, or when the next state depends on the previous one. It forces unidirectional data flow via actions and a reducer function.

Example:
\`\`\`jsx
// useReducer reducer pattern
const reducer = (state, action) => {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    default: return state;
  }
};
const [state, dispatch] = useReducer(reducer, { count: 0 });
// dispatch({ type: 'increment' })
\`\`\`
`,

  // Class vs Functional
  "differencebetweenclasscomponentsandfunctionalcomponents": `
- **Class Components**: Legacy React components using ES6 classes. State is managed via \`this.state\` and updates via \`this.setState()\`. Lifecycle methods like \`componentDidMount\` and \`componentWillUnmount\` are used to handle side effects.
- **Functional Components**: Modern standard React components using simple functions. Hooks (\`useState\`, \`useEffect\`) are used to manage state and lifecycles. They are easier to read, write, and test, and enable better tree-shaking optimizations.

Example:
\`\`\`jsx
// Functional Component
function Greet({ name }) {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Clicked {count}</button>;
}
\`\`\`
`,

  // Promises vs async/await
  "differencebetweenpromisesandasyncawait": `
\`async/await\` is built on top of Promises, providing syntactic sugar:

- **Promises**: Use chainable methods like \`.then()\` and \`.catch()\` to handle async outcomes, which can lead to nested boilerplate.
- **\`async/await\`**: Writes asynchronous code that looks and behaves like synchronous code. Utilizes standard \`try/catch\` blocks for error handling.

Example:
\`\`\`js
// Promise chaining
fetchData()
  .then(res => res.json())
  .catch(err => console.error(err));

// Async/await
async function get() {
  try {
    const res = await fetchData();
    const data = await res.json();
  } catch (err) {
    console.error(err);
  }
}
\`\`\`
`,

  // Deep comparison vs Shallow comparison
  "differencebetweendeepcomparisonandshallowcomparison": `
Comparison strategies check properties inside objects:

- **Shallow Comparison**: Checks references (e.g., \`obj1 === obj2\`) and properties at the first level. If references match or all first-level properties match, they are considered equal.
- **Deep Comparison**: Recursively checks references and values of all nested properties inside the objects to see if their structures are identical.

Example:
\`\`\`js
const o1 = { details: { id: 1 } };
const o2 = { details: { id: 1 } };

// Shallow comparison fails because details references differ
console.log(o1.details === o2.details); // false

// Deep comparison (e.g., using lodash isEqual) would return true
\`\`\`
`,

  // React hooks vs lifecycles
  "differencebetweenreacthooksandlifecyclemethods": `
- **Lifecycle Methods**: Exclusive to Class components (\`componentDidMount\`, \`componentDidUpdate\`, \`componentWillUnmount\`). Logic is partitioned by the lifecycle stage, often splitting related code (e.g., timer creation in mount, removal in unmount) across different methods.
- **React Hooks**: Exclusively for Functional components (\`useEffect\`). Let you group side effects by feature instead of lifecycle stage, simplifying code and facilitating state reuse across custom hooks.

Example:
\`\`\`jsx
// useEffect encapsulates setup and cleanup in one block
useEffect(() => {
  const id = setInterval(() => console.log("tick"), 1000);
  return () => clearInterval(id);
}, []);
\`\`\`
`,

  // Controlled vs Uncontrolled
  "differencebetweencontrolledanduncontrolledcomponents": `
Refers to how form input values are managed:

- **Controlled Component**: Input value is driven by React state. React is the "single source of truth". Any changes update the state, which triggers a re-render to update the input's visual value.
- **Uncontrolled Component**: Input value is managed by the DOM. You query the DOM directly using a React \`ref\` when you need to read the value (e.g., on submit).

Example:
\`\`\`jsx
// Controlled
const [val, setVal] = useState("");
<input value={val} onChange={e => setVal(e.target.value)} />

// Uncontrolled
const inputRef = useRef(null);
<input ref={inputRef} /> // read value via inputRef.current.value
\`\`\`
`,

  // Debounce vs Throttle
  "differencebetweendebounceandthrottle": `
Both rate-limit execution, but serve different scenarios:

- **Debounce**: Delays execution of a function until after a specific amount of time has elapsed since the **last time** the function was triggered. Best for search inputs, where you only run the API request after the user stops typing.
- **Throttle**: Ensures a function is called **at most once** within a specified time window. Best for scroll listeners, resize handlers, or mouse movement tracking.

Example:
\`\`\`js
// Debounce search
const handleSearch = debounce((query) => searchAPI(query), 300);
\`\`\`
`,
  "explaindebounceandthrottlepractically": `
Both rate-limit execution, but serve different scenarios:

- **Debounce**: Delays execution of a function until after a specific amount of time has elapsed since the **last time** the function was triggered. Best for search inputs, where you only run the API request after the user stops typing.
- **Throttle**: Ensures a function is called **at most once** within a specified time window. Best for scroll listeners, resize handlers, or mouse movement tracking.

Example:
\`\`\`js
// Debounce search
const handleSearch = debounce((query) => searchAPI(query), 300);
\`\`\`
`,

  // map, filter, reduce
  "differencebetweenmapfilterandreduce": `
Array methods that transform data:

- **\`map()\`**: Transforms each element and returns a **new array** of the same length.
- **\`filter()\`**: Evaluates elements against a boolean check and returns a **new array** containing only matching elements.
- **\`reduce()\`**: Processes array elements and aggregates them into a **single output value** (like a sum, object, or new list).

Example:
\`\`\`js
const nums = [1, 2, 3, 4];

const doubled = nums.map(n => n * 2); // [2, 4, 6, 8]
const evens = nums.filter(n => n % 2 === 0); // [2, 4]
const sum = nums.reduce((acc, curr) => acc + curr, 0); // 10
\`\`\`
`,

  // null, undefined, NaN
  "differencebetweennullundefinedandnan": `
- **\`undefined\`**: Variable is declared but **no value has been assigned** to it yet.
- **\`null\`**: Representation of an **intentional absence** of value (assigned explicitly).
- **\`NaN\`** (Not a Number): Represents an invalid numerical calculation (e.g. \`0 / 0\` or \`parseInt("hello")\`).

Example:
\`\`\`js
let a;
console.log(a); // undefined

let b = null;
console.log(b); // null

console.log("text" * 2); // NaN
\`\`\`
`,

  // call, apply, bind
  "differencebetweencallapplyandbind": `
Methods to control the value of \`this\` in JavaScript functions:

- **\`call()\`**: Invokes the function immediately. Arguments are passed **individually** (comma-separated).
- **\`apply()\`**: Invokes the function immediately. Arguments are passed as an **array**.
- **\`bind()\`**: Does not execute the function. Returns a **new function** with its \`this\` keyword bound permanently to the provided object.

Example:
\`\`\`js
function greet(city) { console.log(\`\${this.name} from \${city}\`); }
const person = { name: "John" };

greet.call(person, "Doha"); // "John from Doha"
greet.apply(person, ["Doha"]); // "John from Doha"
const bound = greet.bind(person, "Doha");
bound(); // "John from Doha"
\`\`\`
`,
  "explainbindcallandapply": `
Methods to control the value of \`this\` in JavaScript functions:

- **\`call()\`**: Invokes the function immediately. Arguments are passed **individually** (comma-separated).
- **\`apply()\`**: Invokes the function immediately. Arguments are passed as an **array**.
- **\`bind()\`**: Does not execute the function. Returns a **new function** with its \`this\` keyword bound permanently to the provided object.

Example:
\`\`\`js
function greet(city) { console.log(\`\${this.name} from \${city}\`); }
const person = { name: "John" };

greet.call(person, "Doha"); // "John from Doha"
greet.apply(person, ["Doha"]); // "John from Doha"
const bound = greet.bind(person, "Doha");
bound(); // "John from Doha"
\`\`\`
`,

  // state vs props
  "differencebetweenstateandprops": `
In React, state and props represent different types of data:

- **Props** (Properties): Read-only variables passed from a parent component down to a child. They allow components to be configured and reused. A component cannot change its own props.
- **State**: Locally owned, private data that can change over time. When state changes (via the setter callback like \`setState\`), the component re-renders to reflect the updates.

Example:
\`\`\`jsx
// Parent
function CounterParent() {
  const [count, setCount] = useState(0); // State
  return <CounterChild count={count} />; // Passing as prop
}

// Child
function CounterChild(props) {
  // props.count is read-only
  return <h1>Count: {props.count}</h1>;
}
\`\`\`
`,

  // useMemo vs useCallback
  "differencebetweenusememoandusecallback": `
Both are React optimization hooks used to prevent unnecessary computations and re-renders:

- **\`useMemo\`**: Memorizes the **result of a calculation**. Runs only when dependencies change.
- **\`useCallback\`**: Memorizes the **function definition itself**. Prevates children receiving new function references on every re-render (which breaks \`React.memo\`).

Example:
\`\`\`jsx
// Memoizes the calculated array
const sortedItems = useMemo(() => items.sort(), [items]);

// Memoizes the callback handler reference
const handleClick = useCallback(() => console.log("clicked"), []);
\`\`\`
`,

  // Hoisting
  "whatishoisting": `
Hoisting is a JavaScript mechanism where variable and function declarations are moved to the top of their containing scope before code execution begins.

- **Function Declarations**: Completely hoisted (both declaration and implementation are moved).
- **\`var\` variables**: Hoisted but initialized to \`undefined\`.
- **\`let\` and \`const\` variables**: Hoisted but stay in the Temporal Dead Zone (TDZ). Calling them before they are declared yields a \`ReferenceError\`.

Example:
\`\`\`js
console.log(x); // undefined (var is hoisted and initialized to undefined)
var x = 5;

sayHello(); // "Hello!" (Function declaration is fully hoisted)
function sayHello() { console.log("Hello!"); }
\`\`\`
`,

  // Temporal Dead Zone
  "whatisthetemporaldeadzonetdz": `
The Temporal Dead Zone (TDZ) is the period between variable hosting and the line of code where the variable is explicitly declared. It affects variables declared with \`let\` and \`const\`. 

Accessing a variable in the TDZ throws a \`ReferenceError\`.

Example:
\`\`\`js
function test() {
  // TDZ starts here
  // console.log(val); // ReferenceError: Cannot access 'val' before initialization
  
  let val = 10; // TDZ ends here
  console.log(val); // 10
}
\`\`\`
`,

  // Callback function
  "whatisacallbackfunction": `
A callback function is a function passed into another function as an argument, which is then executed inside the outer function to complete some kind of routine or action.

Example:
\`\`\`js
function greet(name, callback) {
  console.log("Hello " + name);
  callback();
}

greet("John", () => console.log("Callback run!"));
\`\`\`
`,

  // Closure
  "whatisaclosure": `
A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). In other words, a closure gives an inner function access to the outer function's scope even after the outer function has returned.

Example:
\`\`\`js
function makeCounter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2 (count variable persists in memory)
\`\`\`
`,

  // Lexical Scope
  "whatislexicalscope": `
Lexical scope (static scope) means that the accessibility of variables is determined by their position in the source code nesting. An inner scope has access to variables declared in its outer scope, but not vice versa.

Example:
\`\`\`js
const globalVar = "global";

function outer() {
  const outerVar = "outer";
  
  function inner() {
    console.log(globalVar, outerVar); // Both accessible
  }
  inner();
}
\`\`\`
`,

  // Event Loop
  "whatistheeventloop": `
The Event Loop is JavaScript's engine coordinator. Because JavaScript is single-threaded, it can only execute one chunk of code at a time. The event loop continually monitors the **Call Stack** and the **Callback Queue**:

1. Synchronous code executes first on the call stack.
2. Async tasks (like fetch or timeouts) are handled by Web APIs and then added to task queues (Microtask Queue for Promises, Macrotask Queue for setTimeout).
3. When the Call Stack is empty, the Event Loop pushes tasks from the queues (prioritizing the Microtask queue) onto the stack to run.
`,

  // Call Stack
  "whatisthecallstack": `
The Call Stack is a LIFO (Last In, First Out) data structure used by the JavaScript engine to keep track of function execution. When a function is called, it is pushed onto the stack. When the function returns, it is popped off the stack.

Example:
\`\`\`js
function first() { second(); }
function second() { console.log("Two"); }
first(); // stack: first -> second -> console.log
\`\`\`
`,

  // Promise
  "whatisapromise": `
A Promise is an object representing the eventual completion (or failure) of an asynchronous operation and its resulting value. It can be in one of three states:
- **Pending**: Initial state, neither fulfilled nor rejected.
- **Fulfilled**: Operation completed successfully.
- **Rejected**: Operation failed.

Example:
\`\`\`js
const myPromise = new Promise((resolve, reject) => {
  const success = true;
  if (success) resolve("Success!");
  else reject("Error!");
});
\`\`\`
`,

  // Promise Chaining
  "whatispromisechaining": `
Promise chaining is a pattern where multiple asynchronous operations are executed sequentially by appending \`.then()\` blocks. Each \`.then()\` receives the result of the previous promise and returns a new promise/value.

Example:
\`\`\`js
fetchData()
  .then(res => res.json())
  .then(data => processData(data))
  .catch(err => console.error(err));
\`\`\`
`,

  // Event Delegation
  "whatiseventdelegationandwhyuseit": `
Event delegation is a design pattern where instead of attaching an event listener to multiple child elements individually, you attach a single event listener to a common parent element. The parent uses event bubbling (specifically checking \`event.target\`) to identify which child was clicked.

- **Why use it**: Saves memory (fewer listeners) and handles dynamically added children automatically.

Example:
\`\`\`js
document.getElementById("parent-list").addEventListener("click", (e) => {
  if (e.target && e.target.nodeName === "LI") {
    console.log("Item clicked: ", e.target.innerText);
  }
});
\`\`\`
`,

  // `this` keyword
  "whatisthisinjavascript": `
In JavaScript, \`this\` refers to the object that is currently executing the code. Its value depends on how the function containing it is invoked:

1. **Global scope**: Refers to \`window\` (or \`global\` in Node).
2. **Object method**: Refers to the object owning the method.
3. **Arrow functions**: Do not have their own \`this\`. They inherit it lexically from their enclosing context.
4. **Strict mode**: If function is called independently, \`this\` is \`undefined\`.

Example:
\`\`\`js
const user = {
  name: "John",
  greet() { console.log(this.name); }
};
user.greet(); // logs "John" (this = user)
\`\`\`
`,

  // Polyfill
  "whatisapolyfill": `
A polyfill is a browser-compatibility helper. It is a piece of JavaScript code used to provide modern features (like \`Array.prototype.flat\` or \`Promise.all\`) on older browsers that do not natively support them.

Example:
\`\`\`js
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement) {
    return this.indexOf(searchElement) !== -1;
  };
}
\`\`\`
`,

  // Event Bubbling & Capturing
  "whatiseventbubbling": `
Event bubbling is the second stage of DOM event propagation where an event triggered on a nested child element "bubbles up" through its parent elements (ancestors) until it reaches the root element (document/window).

Example:
\`\`\`js
child.addEventListener("click", () => console.log("Child"));
parent.addEventListener("click", () => console.log("Parent")); // Triggers second
\`\`\`
`,
  "whatiseventcapturing": `
Event capturing (or trickling) is the first stage of DOM event propagation. The event travels down from the top level (Document/Window) down to the target element that was clicked.

To register a listener in the capture phase, pass \`true\` as the third parameter to \`addEventListener\`.

Example:
\`\`\`js
parent.addEventListener("click", () => console.log("Captured Parent"), true);
\`\`\`
`,

  // GraphQL
  "whatisgraphql": `
GraphQL is a query language and runtime for APIs. Unlike REST APIs, which return rigid data structures from specific endpoints, GraphQL allows client applications to request **exactly the fields they need**, combining multiple resources in a single HTTP request.

Example query:
\`\`\`graphql
query {
  user(id: "1") {
    name
    email
  }
}
\`\`\`
`,

  // Garbage Collection
  "explaingarbagecollectioninjavascript": `
Garbage Collection in JavaScript is an automatic memory management process. The engine monitors memory allocation and periodically frees up memory occupied by values that are no longer accessible (unreachable) in the program.

It primarily uses the **Mark-and-Sweep** algorithm:
1. The engine defines a set of "roots" (like global variables, local execution stack).
2. It traces references and marks all reachable nodes.
3. Any unmarked memory is deemed garbage and is swept (released).
`,

  // Prototypes
  "explainprototypeandprototypalinheritance": `
In JavaScript, objects have a private link pointing to another object called its **prototype**. That prototype has its own prototype, forming a chain:

- **Prototypal Inheritance**: When you attempt to access a property/method on an object, JavaScript first looks at the object itself. If it doesn't find it, it searches up the prototype chain until it either finds the property or reaches \`null\`.

Example:
\`\`\`js
const animal = { eat: true };
const dog = Object.create(animal); // animal is prototype of dog
console.log(dog.eat); // true (inherited)
\`\`\`
`,

  // Destructuring, spread, rest
  "explaindestructuring": `
Destructuring is a clean syntax that lets you unpack values from arrays or properties from objects into distinct variables.

Example:
\`\`\`js
const person = { name: "John", age: 25 };
const { name, age } = person; // destructuring object
console.log(name); // "John"

const rgb = [255, 0, 0];
const [r, g, b] = rgb; // destructuring array
\`\`\`
`,
  "explainspreadoperator": `
The spread operator (\`...\`) allows an iterable (like an array or object expression) to be expanded in places where zero or more arguments or elements are expected.

Example:
\`\`\`js
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]

const user = { name: "John" };
const updatedUser = { ...user, age: 25 };
\`\`\`
`,
  "explainrestoperator": `
The rest operator (\`...\`) looks identical to the spread operator but does the opposite. It collects multiple elements and condenses them into a single array/object. Used in function parameters or destructuring.

Example:
\`\`\`js
function sum(...args) { // collects arguments into args array
  return args.reduce((acc, c) => acc + c, 0);
}
console.log(sum(1, 2, 3)); // 6
\`\`\`
`,

  // String methods
  "explainstringmethods": `
Common string methods:
- \`split(separator)\`: Divides a string into an array of substrings.
- \`includes(search)\`: Checks if a string contains a substring.
- \`startsWith(search)\` / \`endsWith(search)\`: Checks boundary conditions.
- \`trim()\` / \`trimEnd()\`: Trims whitespace from edges.

Example:
\`\`\`js
const str = "  hello world  ";
console.log(str.trim().split(" ")); // ["hello", "world"]
\`\`\`
`,

  // Virtual DOM
  "explainvirtualdom": `
The Virtual DOM (VDOM) is a lightweight, in-memory representation of the real DOM. Direct manipulation of the real DOM is slow and expensive. 

React optimizes rendering using the VDOM:
1. On state changes, React builds a new VDOM tree.
2. It compares it with the previous VDOM tree using a process called **reconciliation (diffing)**.
3. React calculates the minimum batch of changes needed and updates only those specific nodes in the real DOM.
`,

  // React hooks
  "explaincommonlyusedhooks": `
React hooks are functions that let functional components tap into React state and lifecycle features:
- \`useState\`: Declares a local state variable.
- \`useEffect\`: Performs side effects (data fetching, subscriptions).
- \`useContext\`: Subscribes to React context updates.
- \`useRef\`: Keeps a mutable reference that does not trigger re-renders.

Example:
\`\`\`jsx
const [count, setCount] = useState(0);
useEffect(() => {
  document.title = \`Clicked \${count} times\`;
}, [count]);
\`\`\`
`,

  // Lifecycle methods
  "explainlifecyclemethods": `
Lifecycle methods are hook points in class components called during phases of a component's lifecycle:
1. **Mounting**: \`constructor()\`, \`componentDidMount()\` (runs once after render, best for API calls).
2. **Updating**: \`componentDidUpdate()\` (called on prop/state changes).
3. **Unmounting**: \`componentWillUnmount()\` (called before removal, best for cleaning timers/listeners).
`,

  // JSX
  "whatisjsx": `
JSX stands for JavaScript XML. It is a syntax extension for JavaScript that allows you to write HTML-like markup directly inside React components. Browsers cannot execute JSX; it is compiled into standard React API calls (like \`React.createElement\`) by transpilers like Babel.

Example:
\`\`\`jsx
const element = <h1 className="title">Hello</h1>;
// Compiles to:
// const element = React.createElement('h1', { className: 'title' }, 'Hello');
\`\`\`
`,

  // Prop drilling
  "whatispropdrillingandhowtoavoidit": `
Prop drilling is the process of passing props through multiple levels of intermediate components that do not actually need the data, just to deliver it to a deeply nested child component.

**How to avoid it**:
1. **Context API**: Subscribes to global context without passing props.
2. **State Management Libraries**: Redux, Zustand, Recoil.
3. **Component Composition**: Passing elements directly.
`,

  // Context API
  "explaincontextapi": `
The Context API is a built-in React feature that allows you to share global state across the component tree without manually drilling props through every intermediate level.

Example:
\`\`\`jsx
const ThemeContext = React.createContext('dark');

function App() {
  return (
    <ThemeContext.Provider value="light">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Button() {
  const theme = useContext(ThemeContext); // theme = 'light'
  return <button className={theme}>Button</button>;
}
\`\`\`
`,

  // Redux & RTK
  "explainredux": `
Redux is a pattern and library for managing global application state using a centralized store. It follows three principles:
1. **Single Source of Truth**: State is stored in a single object tree.
2. **State is Read-Only**: State changes only by dispatching an action.
3. **Changes are Made with Pure Functions**: Reducers capture actions and return new state trees.
`,
  "whatisredux": `
Redux is a pattern and library for managing global application state using a centralized store. It follows three principles:
1. **Single Source of Truth**: State is stored in a single object tree.
2. **State is Read-Only**: State changes only by dispatching an action.
3. **Changes are Made with Pure Functions**: Reducers capture actions and return new state trees.
`,
  "explainreduxdataflow": `
Redux state operates in a strict unidirectional flow:
1. **Action**: An event containing a type (e.g. \`INCREMENT\`) is dispatched.
2. **Reducer**: A pure function intercepting the action and returning the next state.
3. **Store**: Houses the state. Emits state updates.
4. **View**: React components subscribe to the store and re-render.
`,
  "whatisreduxtoolkit": `
Redux Toolkit (RTK) is the official, recommended template for writing Redux logic. It resolves Redux configuration boilerplates, default dependencies, and mutable state pitfalls:
- Provides \`configureStore()\` to bundle DevTools, middleware.
- Provides \`createSlice()\` which uses **Immer** internally, letting you write mutating state update code that is converted to pure immutable updates.

Example:
\`\`\`js
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1; } // safe to write "mutations" here
  }
});
\`\`\`
`,

  // Redux thunk / saga
  "whatisreduxthunk": `
Redux Thunk is a middleware that allows you to write action creators that return a **function** instead of an action object. This function can execute asynchronous operations (like API calls) and dispatch normal synchronous actions once completed.

Example:
\`\`\`js
const fetchUser = (id) => async (dispatch) => {
  const user = await API.get(id);
  dispatch({ type: 'SET_USER', payload: user });
};
\`\`\`
`,
  "whatisreduxsaga": `
Redux Saga is a middleware designed to handle side effects in Redux. It uses ES6 **Generators** (\`function*\`) to write asynchronous code that reads like synchronous code. It listens to dispatched actions and triggers side effects using declarative "effects" (like \`call\`, \`put\`, \`takeEvery\`).
`,

  // Zustand / Recoil
  "whatiszustand": `
Zustand is a lightweight state management library for React. Unlike Redux, it has minimal boilerplate, doesn't wrap your app in Providers, uses hooks as primary consumers, and is built on simple closures.

Example:
\`\`\`js
import create from 'zustand';
const useStore = create(set => ({
  count: 0,
  inc: () => set(state => ({ count: state.count + 1 }))
}));
\`\`\`
`,
  "whatisrecoil": `
Recoil is a state management library developed by Facebook for React. It introduces the concept of **Atoms** (units of state) and **Selectors** (pure functions representing derived state). It offers granular re-rendering optimizations.
`,

  // local vs global state
  "differencebetweenlocalstateandglobalstate": `
- **Local State**: Managed inside a single component (e.g. \`useState\`). Only the component itself and its immediate children (via props) have access.
- **Global State**: Shared across multiple independent components throughout the application tree. Managed via Context API, Redux, Zustand, etc.
`,

  // Pure Component
  "whatisapurecomponent": `
A Pure Component is a React component that does not re-render if its input props and state are identical. In class components, this is achieved by inheriting from \`React.PureComponent\` (which implements a shallow comparison in \`shouldComponentUpdate\`). In functional components, you wrap the component in \`React.memo()\`.
`,

  // Custom hook
  "whatisacustomhook": `
A custom hook is a JavaScript function whose name starts with \`use\` and that can call other React hooks. It allows you to extract component stateful logic into reusable functions.

Example:
\`\`\`js
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}
\`\`\`
`,

  // Reconciliation & Fiber
  "whatisreconciliationinreact": `
Reconciliation is React's algorithm for diffing the virtual DOM tree against the actual DOM tree. React checks differences in node types, keys, and properties to determine the absolute minimum number of DOM updates required.
`,
  "whatisreconciliation": `
Reconciliation is React's algorithm for diffing the virtual DOM tree against the actual DOM tree. React checks differences in node types, keys, and properties to determine the absolute minimum number of DOM updates required.
`,
  "whatisreactfiber": `
React Fiber is React's core reconciliation engine introduced in React 16. Its primary goal is to enable **incremental rendering** — the ability to split rendering work into chunks and spread it out over multiple frames. This prevents heavy renders from blocking the main browser thread.
`,

  // Batching
  "whatisbatchinginreactupdates": `
Batching is a React performance optimization where React groups multiple state updates into a single re-render. In React 18, automatic batching applies to all updates inside promises, timeouts, and native event handlers.
`,

  // React.memo
  "whatisreactmemo": `
\`React.memo\` is a higher-order component. If your component renders the same result given the same props, wrapping it in \`React.memo\` prevents unnecessary re-renders. It performs a shallow comparison of props.
`,

  // useEffect
  "explaintheuseeffecthook": `
The \`useEffect\` hook lets you perform side effects in functional components. It takes a callback function and a dependency array:
- **No dependencies**: Runs after every single render.
- **Empty dependency array \`[]\`**: Runs once after mounting (like \`componentDidMount\`).
- **State/prop dependencies \`[val]\`**: Runs on mount and whenever the specified dependencies change.

Return cleanups from \`useEffect\` to clear intervals or listeners:
\`\`\`js
useEffect(() => {
  console.log("Mounted");
  return () => console.log("Cleanup");
}, []);
\`\`\`
`,

  // Lifting state up
  "explainliftingstateup": `
Lifting state up is a pattern where state shared by multiple sibling components is moved up to their closest common ancestor. The ancestor passes the state down as props, along with callback setters to allow children to trigger changes.
`,

  // Next.js
  "whatisnextjs": `
Next.js is a React framework for building production-ready applications. It provides built-in configurations like server-side rendering (SSR), static site generation (SSG), automatic code splitting, API routing, dynamic routing, and SEO optimization.
`,
  "whatisdynamicroutinginextjs": `
Dynamic routing in Next.js allows you to create pages mapped to dynamic parameters using brackets in the file path, e.g., \`app/posts/[id]/page.js\`, where the route parameter \`id\` is parsed automatically.
`,
  "whatiscode-splittinginextjs": `
Code splitting in Next.js automatically splits application code bundles into smaller chunks loaded on-demand. When navigating, the browser only loads code required for the current active page, reducing load times.
`,
  "whatiscode-splitting": `
Code splitting is a technique that splits your single bundle file into multiple chunks that can be loaded dynamically on-demand, reducing initial bundle load sizes.
`,
  "explaincodesplitting": `
Code splitting is a technique that splits your single bundle file into multiple chunks that can be loaded dynamically on-demand, reducing initial bundle load sizes.
`,
  "whatisisr": `
Incremental Static Regeneration (ISR) is a Next.js feature that allows you to create or update static pages **after the site is built**, without rebuilding the entire application. Pages are regenerated in the background at specified intervals.
`,

  // Memoization
  "whatismemoization": `
Memoization is an optimization technique used to speed up computer programs by storing the results of expensive function calls and returning the cached result when the same inputs occur again.
`,
  "explainmemoizationinreact": `
Memoization in React optimizes rendering using \`useMemo\` (caches calculated values), \`useCallback\` (caches function references), and \`React.memo\` (caches component output on identical props).
`,

  // Currying
  "whatiscurryinginjavascript": `
Currying is a transformation of functions that translates a function from callable as \`f(a, b, c)\` into callable as \`f(a)(b)(c)\`.

Example:
\`\`\`js
const curriedSum = a => b => c => a + b + c;
console.log(curriedSum(1)(2)(3)); // 6
\`\`\`
`,

  // Lazy loading & Suspense
  "whatislazyloading": `
Lazy loading is a design pattern that defers the loading of non-critical resources (like components, images, or assets) until they are needed (e.g., when they enter the viewport or on router changes).
`,
  "whatissuspense": `
\`Suspense\` is a React component that lets you declaratively specify a loading fallback UI while children are waiting for asynchronous data loading or code loading (like dynamic import modules).

Example:
\`\`\`jsx
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
\`\`\`
`,

  // Default Fallback
  "default": `
In an actual interview, you should structure your response around three core areas:
1. **Core Concept**: Explain the fundamental principles clearly and concisely.
2. **Code Example**: Write down a clean, representative code snippet showing the feature in practice.
3. **Trade-offs / Best Practices**: Discuss performance implications, clean code boundaries, and common pitfalls.
`
};
