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
