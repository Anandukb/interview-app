# TypeScript Theory Questions

## 1. What is TypeScript and how does it differ from JavaScript?

TypeScript is a strongly typed, object-oriented, compiled programming language developed and maintained by Microsoft. It is a strict syntactical superset of JavaScript, meaning that any valid JavaScript code is also valid TypeScript code. 

### Key Differences:
- **Static Typing**: JavaScript is dynamically typed (types are resolved at runtime), whereas TypeScript is statically typed (types are checked at compile time).
- **Compilation**: JavaScript runs directly in browsers or Node.js. TypeScript must be compiled (transpiled) into standard JavaScript using the TypeScript Compiler (`tsc`) before it can run.
- **Error Detection**: TypeScript helps identify syntax and type-related bugs during development, whereas JavaScript errors are only discovered during execution.
- **Tooling Support**: TypeScript provides superior IDE support with autocompletion, type info, and robust refactoring capabilities.

---

## 2. Explain the difference between an `interface` and a `type` alias in TypeScript

Both `interface` and `type` alias are used to define the shape of an object, but they have distinct differences:

### 1. Extensibility (Declaration Merging)
Interfaces support declaration merging. If you define two interfaces with the same name, TypeScript automatically merges their properties. Type aliases do not support merging and will throw a duplicate identifier error.
```ts
interface User { name: string; }
interface User { age: number; } // Merged! User now has name and age.

type Person = { name: string; };
// type Person = { age: number; }; // Error: Duplicate identifier 'Person'.
```

### 2. Capabilities
Type aliases are more versatile. They can define primitive types, union types, intersection types, tuples, and mapped types. Interfaces are strictly limited to describing object shapes.
```ts
type ID = string | number; // Union type
type Point = [number, number]; // Tuple
```

### 3. Inheritance
Interfaces extend other interfaces using the `extends` keyword. Type aliases achieve inheritance using intersection types (`&`).
```ts
interface Admin extends User { privileges: string[]; }
type Manager = Person & { department: string; };
```

---

## 3. What is the `any` type, and why is `unknown` preferred for safer code?

- **`any`**: Opts out of all type checking. It allows a variable to hold any value and lets you access any property, call any method, or pass it to any function without compiler checks. It essentially makes TypeScript behave like plain JavaScript.
- **`unknown`**: Represents a value of any type, but is type-safe. It is the type-safe counterpart of `any`. You cannot perform operations on a variable of type `unknown` (like calling methods or accessing properties) without first narrowing its type using type guards or type assertions.

### Example:
```ts
let valueAny: any = "Hello";
valueAny.trim(); // Allowed

let valueUnknown: unknown = "Hello";
// valueUnknown.trim(); // Compile Error!

if (typeof valueUnknown === "string") {
  valueUnknown.trim(); // Allowed because the type is narrowed to string!
}
```

---

## 4. What is Type Narrowing in TypeScript and how do you perform it?

Type Narrowing is the process of moving a variable from a broader type (like a union type) to a more specific type. It allows you to safely execute type-specific code blocks.

### Common Ways to Perform Type Narrowing:
1. **`typeof` guards**: For checking primitives.
```ts
function printId(id: string | number) {
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}
```
2. **`instanceof` guards**: For checking class instances.
```ts
if (error instanceof Error) {
  console.log(error.message);
}
```
3. **`in` operator**: For checking if a property exists on an object.
```ts
if ("privileges" in user) {
  console.log(user.privileges);
}
```
4. **User-defined Type Guards**: Functions returning a type predicate `parameterName is Type`.
```ts
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
```

---

## 5. Explain Generics in TypeScript and provide a practical use-case

Generics allow you to create reusable code components (like functions, classes, or interfaces) that work with a variety of types rather than a single one. They allow a type to be passed as a parameter, preserving type information between arguments and return values.

### Practical Use-Case:
Suppose we need a function to wrap any data in an API response envelope.
```ts
interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  timestamp: number;
}

function createResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    status: "success",
    timestamp: Date.now()
  };
}

const userResponse = createResponse({ name: "John", age: 30 });
// Type of userResponse is resolved as ApiResponse<{ name: string; age: number; }>
```

---

## 6. What is the difference between `never` and `void` in TypeScript?

- **`void`**: Indicates the absence of a return value. A function that completes execution but doesn't return anything returns `void` (which translates to `undefined` at runtime).
- **`never`**: Represents a value that can *never* occur. It is used as the return type for functions that do not return at all—such as functions that throw errors or enter infinite loops. It is also used to represent impossible states in type narrowing.

### Example:
```ts
function logMessage(msg: string): void {
  console.log(msg); // Execution finishes, returns undefined
}

function throwError(msg: string): never {
  throw new Error(msg); // Execution never finishes (throws error)
}
```

---

## 7. Explain Utility Types: `Pick`, `Omit`, `Partial`, and `Required`

TypeScript provides several built-in global utility types to facilitate common type transformations:

1. **`Partial<T>`**: Constructs a type with all properties of `T` set to optional.
```ts
interface User { id: number; name: string; }
type UpdateUser = Partial<User>; // { id?: number; name?: string; }
```
2. **`Required<T>`**: Constructs a type with all properties of `T` set to required.
```ts
interface Config { host?: string; port?: number; }
type ActiveConfig = Required<Config>; // { host: string; port: number; }
```
3. **`Pick<T, K>`**: Constructs a type by picking a set of properties `K` from `T`.
```ts
type UserSummary = Pick<User, "name">; // { name: string; }
```
4. **`Omit<T, K>`**: Constructs a type by removing a set of properties `K` from `T`.
```ts
type UserNoId = Omit<User, "id">; // { name: string; }
```

---

## 8. What is the difference between `readonly` modifier and `const` declaration?

- **`const`**: Applies to variable declarations. It prevents re-assignment of the variable. However, if the variable holds an object or an array, the internal properties or elements can still be mutated.
- **`readonly`**: Applies to object properties inside class or interface definitions. It prevents reassignment of that specific property after initialization. It does not prevent re-assigning the outer object container.

### Example:
```ts
const user = { name: "Alice" };
user.name = "Bob"; // Allowed! (Internal mutation)

interface Person {
  readonly name: string;
}
let person: Person = { name: "Alice" };
// person.name = "Bob"; // Compile Error! (Property is readonly)
```

---

## 9. Explain how Mapped Types work in TypeScript

Mapped Types allow you to create new types based on the properties of an existing type. They map over the keys of an existing type to transform their values or flags (like making them optional or readonly).

### Syntax:
It uses the `in keyof` syntax to loop over keys.
```ts
type ReadonlyType<T> = {
  readonly [P in keyof T]: T[P];
};

interface User {
  id: number;
  name: string;
}

type ReadonlyUser = ReadonlyType<User>;
// Results in: { readonly id: number; readonly name: string; }
```

---

## 10. What are Type Assertions (`as`) and when should you avoid them?

Type Assertions tell the TypeScript compiler to treat a value as a specific type, overriding the compiler's inference. They are written using the `as` keyword or the `<Type>` angle-bracket syntax.

### When to Avoid:
You should avoid type assertions because they bypass compile-time type safety. If you assert a type incorrectly, the compiler will not warn you, but your code will crash or misbehave at runtime. Use type narrowing/guards instead.

### Example:
```ts
const jsonStr = '{"name": "Alice"}';
const data = JSON.parse(jsonStr) as { name: string; age: number; }; // Asserted
// Compiler thinks data.age is a number, but data.age is undefined at runtime!
console.log(data.age.toFixed()); // Crashes: Cannot read properties of undefined
```

---

## 11. What is the difference between `null` and `undefined` in TypeScript, and what is `strictNullChecks`?

In JavaScript, `null` represents the intentional absence of a value, while `undefined` represents an uninitialized or missing value.

- In TypeScript, when `strictNullChecks` is `false` (default in older versions), `null` and `undefined` can be assigned to variables of any type (e.g. you can assign `null` to a `string`).
- When `strictNullChecks` is `true` in `tsconfig.json`, `null` and `undefined` get their own distinct types. They cannot be assigned to variables of other types without using union types.

### Example under `strictNullChecks: true`:
```ts
let name: string;
// name = null; // Compile Error!

let nickname: string | null = null; // Allowed (Union type)
```

---

## 12. What are Discriminated Unions and how are they useful?

A Discriminated Union (also called Tagged Union) is a pattern where multiple types in a union share a common literal property (the "discriminant" or "tag"). TypeScript uses this tag to narrow down the union type in conditional blocks.

### Example:
```ts
interface Circle {
  kind: "circle"; // Discriminant
  radius: number;
}

interface Square {
  kind: "square"; // Discriminant
  sideLength: number;
}

type Shape = Circle | Square;

function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2; // shape is narrowed to Circle
    case "square":
      return shape.sideLength ** 2; // shape is narrowed to Square
  }
}
```

---

## 13. Explain index signatures and how to define dynamic keys in interfaces

Index signatures are used to describe the type of keys and values when the names of the properties are not known beforehand.

### Example:
```ts
interface UserCache {
  [userId: string]: { name: string; role: string };
}

const cache: UserCache = {
  "u1": { name: "Alice", role: "admin" },
  "u2": { name: "Bob", role: "user" }
};
```
Note: Keys in index signatures must be of type `string`, `number`, `symbol`, or template literal types.

---

## 14. What is the `keyof` operator and how is it used?

The `keyof` operator takes an object type and returns a union type of its keys (properties).

### Example:
```ts
interface User {
  id: number;
  name: string;
  email: string;
}

type UserKeys = keyof User; // "id" | "name" | "email"
```
It is frequently used with generics to constrain arguments to represent properties of an object.
```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

---

## 15. What are Conditional Types in TypeScript?

Conditional Types allow you to choose types dynamically based on a relationship check, similar to a ternary operator in JavaScript.

### Syntax:
`T extends U ? X : Y`

### Example:
```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
```
Conditional types are often combined with the `infer` keyword to extract types from arrays, functions, or promises.

---

## 16. What is the `infer` keyword and how is it used in conditional types?

The `infer` keyword is used within conditional type declarations to introduce a type variable that can be inferred dynamically inside the true branch.

### Example (Extracting Return Type of Function):
```ts
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

const add = (a: number) => a.toString();
type AddResult = GetReturnType<typeof add>; // string
```

---

## 17. What is declaration merging in TypeScript?

Declaration Merging is a process where the compiler merges two separate declarations defined with the same name into a single definition.
It primarily occurs with:
1. **Interfaces**: Merging properties together.
2. **Namespaces**: Merging functions, classes, or interfaces.
3. **Namespace with Class/Function**: Adding static properties/methods to a class or function.

### Example:
```ts
interface Document {
  customField: string;
}
// Merges with the built-in DOM Document interface, allowing document.customField without error!
```

---

## 18. Explain TypeScript Decorators and how they work

Decorators are a special kind of declaration that can be attached to a class declaration, method, accessor, property, or parameter. Decorators use the `@expression` syntax, where `expression` must evaluate to a function that will be called at runtime with information about the decorated declaration.

Note: They are an experimental feature requiring `experimentalDecorators: true` in `tsconfig.json`, though they are now standard in EcmaScript.

### Example:
```ts
function Log(target: any, key: string) {
  console.log(`Method ${key} was decorated.`);
}

class User {
  @Log
  greet() {
    return "Hello";
  }
}
```

---

## 19. What is `as const` (const assertions) in TypeScript and what does it do?

Const assertions (`as const`) tell the compiler to:
1. Prevent widening of literal types (e.g. keeping `"admin"` instead of widening to `string`).
2. Make all object properties readonly.
3. Treat array literals as readonly tuples.

### Example:
```ts
const colors = ["red", "blue"] as const;
// Type is inferred as readonly ["red", "blue"] (tuple), not string[]
// colors[0] = "green"; // Compile Error!
```

---

## 20. What is `tsconfig.json` and what do `target`, `module`, and `lib` options represent?

`tsconfig.json` is a configuration file located at the root of a TypeScript project. It specifies the compiler options and root files required to compile the project.

### Key Compiler Options:
- **`target`**: The JavaScript version TypeScript compiles down to (e.g., `ES5`, `ES6/ES2015`, `ESNext`).
- **`module`**: The module resolution strategy to use for compiled files (e.g., `CommonJS`, `ESNext`, `NodeNext`).
- **`lib`**: Array of library files to include in compilation. It tells the compiler about existing runtime environments (like the browser DOM `["DOM"]`, or standard ES classes `["ESNext"]`).

---

## 21. What is structural typing in TypeScript?

TypeScript uses a structural type system (sometimes called duck typing) to compare types. Under structural typing, type compatibility and equivalence are determined solely by the shape (members and properties) of the types, rather than their explicit declarations or inheritance hierarchies.

### Example:
```ts
interface Point {
  x: number;
  y: number;
}

class Vector2D {
  constructor(public x: number, public y: number) {}
}

function logPoint(p: Point) {
  console.log(`${p.x}, ${p.y}`);
}

const vec = new Vector2D(10, 20);
logPoint(vec); // Allowed! Vector2D matches the shape of Point.
```
If a type has all the required properties of another type (and they have compatible types), it is considered compatible, even if it has extra properties.

---

## 22. Explain the `unknown` vs `any` type compatibility rules

While both `any` and `unknown` can hold any value, their type compatibility rules differ significantly in assignments:

1. **`any` (Lax/Unsafe)**:
   - Assignable to any other type (except `never`).
   - Any type can be assigned to `any`.
   - Allows all properties and operations without checks.

2. **`unknown` (Strict/Safe)**:
   - Any type can be assigned to `unknown`.
   - But `unknown` is **NOT** assignable to any other type (except `any` and `unknown` itself) without a type assertion or type guard.
   - Operations on `unknown` values are blocked until the type is narrowed.

### Assignment Matrix:
```ts
let valAny: any = 10;
let valUnknown: unknown = 20;

let num: number;
num = valAny;      // Allowed (unsafe)
// num = valUnknown; // Compile Error! (Safe check)

if (typeof valUnknown === "number") {
  num = valUnknown; // Allowed because of narrowing
}
```

---

## 23. What are Template Literal Types and how are they useful?

Template Literal Types build on string literal types and allow you to construct new string union types by combining strings using template literal syntax.

### Practical Use-Cases:
1. **Generating Action/Event Unions**:
```ts
type Event = "click" | "hover";
type Element = "button" | "input";

type ElementEvent = `${Element}_${Event}`;
// Resolved as: "button_click" | "button_hover" | "input_click" | "input_hover"
```
2. **CSS/Style properties mapping**:
```ts
type MarginDirection = "top" | "bottom" | "left" | "right";
type MarginProperty = `margin-${MarginDirection}`;
// Resolved as: "margin-top" | "margin-bottom" | "margin-left" | "margin-right"
```
They are highly useful when writing type-safe APIs for styles, routing patterns, or design tokens.

---

## 24. Explain covariance, contravariance, and invariance in TypeScript

These terms describe how subtyping relationships between complex types (like arrays, functions, and objects) relate to the subtyping of their component types:

1. **Covariance (Same Direction)**:
   - If `Dog` extends `Animal`, then `Dog[]` can be assigned to `Animal[]`.
   - Read-only structures, properties, and function return values are **covariant**.
2. **Contravariance (Opposite Direction)**:
   - If `Dog` extends `Animal`, then a function expecting `Animal` as an argument `(a: Animal) => void` can be assigned to one expecting `Dog` `(d: Dog) => void`.
   - Function parameter types are **contravariant** under `--strictFunctionTypes`.
3. **Invariance (Strict Match)**:
   - A type is invariant if it must match exactly.
   - Mutable structures (like read-write arrays or object properties) are conceptually invariant, although TS allows some lax checks for ease of use.

---

## 25. How do you implement nominal typing or type branding?

Since TypeScript is structurally typed, two different types with identical structures are compatible. To enforce nominal typing (where types must have unique identities), developers use **type branding** (or tagging).

### Implementation Pattern:
A brand is a unique literal type tag attached to a property that only exists in the type space (often using `unique symbol` or a literal string property that doesn't actually exist at runtime).

```ts
type UserId = string & { readonly __brand: unique symbol };
type OrderId = string & { readonly __brand: unique symbol };

function createUserId(id: string): UserId {
  return id as UserId;
}

function processUser(id: UserId) {
  console.log(id);
}

const myUser = createUserId("user_123");
const myOrder = "order_999" as OrderId;

processUser(myUser); // OK!
// processUser(myOrder); // Compile Error! OrderId cannot be assigned to UserId.
```

---

## 26. What are declaration files (`.d.ts`) and when are they used?

Declaration files (ending in `.d.ts`) provide type definitions for JavaScript code. They contain only type information (declarations) and no executable code. When TypeScript code compiles, it can generate declaration files so that external users of the compiled JS know the types.

### When they are used:
1. **Consuming JS Libraries**: Providing type definitions for third-party libraries written in plain JavaScript (e.g. `@types/react`, `@types/lodash`).
2. **Library Development**: Publishing library modules so consumers get rich editor completions.
3. **Global Declarations**: Defining global interfaces or window attributes using ambient declarations (`declare global { ... }`).

---

## 27. What is the difference between `interface` and `type` when extending?

While both can extend other structures, they use different syntaxes and have slightly different compiler validation rules:

1. **`interface extends`**:
   - Uses the `extends` keyword.
   - The compiler verifies that properties are statically compatible. If a property is overwritten with an incompatible type, a compile error is thrown immediately.
   - Supports Declaration Merging.
```ts
interface A { x: string; }
// interface B extends A { x: number; } // Compile Error: Interface 'B' incorrectly extends interface 'A'.
```

2. **`type` Intersection (`&`)**:
   - Uses the `&` intersection operator.
   - Bypasses static inheritance check during union. If incompatible properties are combined, the property type resolves to `never` rather than throwing a compile error immediately.
```ts
type A = { x: string; };
type B = A & { x: number; }; // No compiler crash, but B["x"] becomes 'never' (impossible to satisfy).
```

---

## 28. What is the `satisfies` operator in TypeScript?

Introduced in TypeScript 4.9, the `satisfies` operator validates that an expression matches a specific type *without* changing the inferred type of that expression. This differs from type annotations, which coerce the variable type to the annotated type.

### Example:
```ts
type Colors = "red" | "green" | "blue";
type RGB = [number, number, number];

const palette = {
  primary: "red",
  danger: [255, 0, 0]
} satisfies Record<string, Colors | RGB>;

// Using satisfies:
palette.primary.toUpperCase(); // OK! The compiler knows palette.primary is string/literal.
// If we had annotated: const palette: Record<string, Colors | RGB>, 
// palette.primary.toUpperCase() would fail because 'primary' could be RGB (an array).
```

---

## 29. Explain how mapped type modifiers (e.g. `-readonly` or `?`) work

Mapped type modifiers allow you to add or remove type flags like `readonly` or `?` (optional) while iterating over keys of an existing type.
- **`+` or omitted**: Adds the modifier (e.g., `+readonly` or `+?`).
- **`-`**: Removes the modifier (e.g., `-readonly` or `-?`).

### Example (Stripping optionality and read-only flags):
```ts
interface User {
  readonly id: number;
  name?: string;
}

// Strip both modifiers:
type ConcreteMutable<T> = {
  -readonly [P in keyof T]-?: T[P];
};

type Result = ConcreteMutable<User>;
// Resolved as: { id: number; name: string; } (required and mutable)
```

---

## 30. How do ambient namespaces differ from modules?

- **Modules (ES Modules)**: Contain `import` and `export` statements. They represent file-scoped modules. Variables declared inside are local to the file unless explicitly exported. They conform to standard ES6 runtime modules.
- **Ambient Namespaces (`declare namespace`)**: Used primarily in declaration files to describe global libraries, global variables, or namespaces that are loaded via script tags. They do not generate runtime modules and are ambient (exist only in the type compilation layer).

### Example:
```ts
// global.d.ts
declare namespace GlobalSettings {
  let theme: "dark" | "light";
  function initialize(): void;
}
// Now GlobalSettings is available globally without needing to import it.
```
