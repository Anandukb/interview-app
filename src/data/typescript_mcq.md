# TypeScript Output Prediction Questions

## 1. Class Parameter Properties
What is the output of the compiled code when executed?
```js
class User {
  constructor(public username: string, private role: string) {
    // No explicit assignments needed
  }
  
  getDetails() {
    return `${this.username} (${this.role})`;
  }
}

const user = new User("alice", "admin");
console.log(user.username);
console.log(user.getDetails());
```

### Answer
```
alice
alice (admin)
```

---

## 2. Const Enum Compilation
What is the runtime output of the following TypeScript enum snippet after compilation?
```js
const enum Status {
  Active = 1,
  Inactive = 0
}

const current = Status.Active;
console.log(current);
console.log(typeof Status);
```

### Answer
```
1
undefined
```

---

## 3. Type Guard Typeof Evaluation
What does this JavaScript snippet print?
```js
function processValue(val) {
  if (typeof val === "object" && val !== null) {
    console.log("object");
  } else {
    console.log(typeof val);
  }
}

processValue(null);
processValue([1, 2]);
```

### Answer
```
null
object
```

---

## 4. In Operator Evaluation
What does this code log?
```js
const admin = {
  name: "Bob",
  privileges: ["delete"]
};

const user = {
  name: "Alice"
};

function check(person) {
  if ("privileges" in person) {
    console.log(person.privileges[0]);
  } else {
    console.log("no privileges");
  }
}

check(admin);
check(user);
```

### Answer
```
delete
no privileges
```

---

## 5. Private keyword vs Private Hash
What does this code print?
```js
class Secret {
  private key = "TS-Secret";
  #nativeKey = "JS-Secret";
}

const s = new Secret();
console.log(s["key"]);
console.log(s["#nativeKey"]);
```

### Answer
```
TS-Secret
undefined
```

---

## 6. Function Overloads Implementation
What is logged when calling this overloaded function?
```js
function combine(a, b) {
  return a + b;
}

console.log(combine(1, 2));
console.log(combine("hello ", "world"));
```

### Answer
```
3
hello world
```

---

## 7. Mapped Types Readonly Mutation
What happens if we compile and run this code?
```js
const config = {
  port: 8080
};

Object.freeze(config);

try {
  config.port = 9090;
} catch (e) {
  console.log("Error");
}
console.log(config.port);
```

### Answer
```
8080
```

---

## 8. Interface Merging Duplicate Keys
What does this interface merged object print?
```js
const obj = {
  id: "1",
  name: "Alice",
  age: 30
};

console.log(obj.id);
console.log(obj.name);
```

### Answer
```
1
Alice
```

---

## 9. Discriminated Union Switch Log
What does the area log print?
```js
const shape = {
  kind: "circle",
  radius: 10
};

switch (shape.kind) {
  case "circle":
    console.log(Math.round(Math.PI * shape.radius));
    break;
  case "square":
    console.log(shape.sideLength);
    break;
}
```

### Answer
```
31
```

---

## 10. Readonly Tuple Mutation
What is the runtime output of the following array push operation?
```js
const tuple = ["a", "b"];
tuple.push("c");

console.log(tuple.length);
console.log(tuple[2]);
```

### Answer
```
3
c
```

---

## 11. Readonly Property Mutation at Runtime
What is the console output when compiling and running this code?
```js
class ApiService {
  readonly url = "http://api.com";
}

const service = new ApiService();
// Type casting/assertion compiles away, enabling mutation in raw JS
const unsafeService = service;
unsafeService.url = "http://auth.com";
console.log(service.url);
```

### Answer
```
http://auth.com
```

---

## 12. Reverse Mapping in Numeric Enums
What is the output of checking numeric enum keys and values?
```js
var Direction;
(function (Direction) {
  Direction[Direction["Up"] = 1] = "Up";
  Direction[Direction["Down"] = 2] = "Down";
})(Direction || (Direction = {}));

console.log(Direction[1]);
console.log(Direction["Up"]);
console.log(Direction[Direction.Up]);
```

### Answer
```
Up
1
Up
```

---

## 13. Dynamic Nullish Coalescing Compilation
What is printed for the following nested object resolving?
```js
const data = {
  user: {
    profile: null
  }
};

// Emulating optional chaining and nullish coalescing
const bio = data.user?.profile?.bio ?? "No Bio";
const email = data.user?.email ?? "no-email@test.com";

console.log(bio);
console.log(email);
```

### Answer
```
No Bio
no-email@test.com
```

---

## 14. Array Type Widening vs Const Assertions
What does the runtime comparison print?
```js
const primaryColors = ["red", "blue"]; // widens to string[]
const accentColors = ["orange", "purple"];

primaryColors.push("green");
const containsGreen = primaryColors.includes("green");

console.log(containsGreen);
console.log(primaryColors.length);
```

### Answer
```
true
3
```

---

## 15. TypeScript Class Method Binding at Runtime
What is the console output when passing the method as a callback?
```js
class Tracker {
  count = 0;
  
  increment() {
    this.count++;
    console.log(this.count);
  }
}

const tracker = new Tracker();
const callback = tracker.increment;

try {
  callback(); // Lost context 'this'
} catch(e) {
  console.log("TypeError");
}
```

### Answer
```
TypeError
```
