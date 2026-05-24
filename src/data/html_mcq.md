# HTML Output Prediction Questions

## 1. DOM Clone Node reference
What is printed in the console after executing this DOM manipulation?
```js
const parent = {
  id: "parent-container",
  className: "container"
};

const child = {
  id: "child-node",
  className: "btn",
  parent: parent
};

const clone = Object.assign({}, child);
clone.className = "btn active";
clone.parent.className = "wrapper";

console.log(child.className);
console.log(parent.className);
```

### Answer
```
btn
wrapper
```

---

## 2. Event Bubbling Propagation
What is the console output order when the button is clicked?
```js
const log = [];

function clickButton(e) {
  log.push("button clicked");
}

function clickParent(e) {
  log.push("parent clicked");
}

function clickWindow(e) {
  log.push("window clicked");
}

// Emulating click event path: Button -> Parent -> Window
clickButton();
clickParent();
clickWindow();

console.log(log.join(" > "));
```

### Answer
```
button clicked > parent clicked > window clicked
```

---

## 3. Dataset camelCase conversion
What does the following dataset modification print?
```js
const dataAttributes = {
  "user-id": "100",
  "user-role-name": "admin",
  "userStatus": "active"
};

// Emulating standard dataset camelCase conversion mapping
const dataset = {};
for (const key in dataAttributes) {
  const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  dataset[camelKey] = dataAttributes[key];
}

console.log(dataset.userId);
console.log(dataset.userRoleName);
console.log(dataset.userStatus);
```

### Answer
```
100
admin
active
```

---

## 4. Querying childNodes vs children
What is the difference in count between childNodes and children for this mock HTML fragment?
```js
// Mocking DOM elements: <div>Hello <span>World</span><!-- comment --></div>
const children = ["span"]; // only element nodes
const childNodes = ["text", "span", "comment"]; // elements, comments, and text nodes

console.log(children.length);
console.log(childNodes.length);
```

### Answer
```
1
3
```

---

## 5. Custom Element Lifecycle Sequence
What is the order of console logs when a custom element is created and then appended to the DOM?
```js
const log = [];

class MyElement {
  constructor() {
    log.push("constructor");
  }
  
  connectedCallback() {
    log.push("connected");
  }
}

const el = new MyElement();
el.connectedCallback();

console.log(log.join(" > "));
```

### Answer
```
constructor > connected
```

---

## 6. Document Fragment Appending
What does this fragment container mock render?
```js
const parent = [];
const fragment = [];

// Adding elements to document fragment
fragment.push("p1");
fragment.push("p2");

// Appending fragment empties it into the parent
parent.push(...fragment);
fragment.length = 0;

console.log(parent.length);
console.log(fragment.length);
```

### Answer
```
2
0
```

---

## 7. Attribute Namespace Querying
What is the output of checking attributes with and without namespaces?
```js
const element = {
  attributes: {
    "class": "btn",
    "data-id": "10"
  }
};

console.log(element.attributes["class"]);
console.log(element.attributes["data-id"]);
console.log(element.attributes["id"]);
```

### Answer
```
btn
10
undefined
```

---

## 8. Iframe contentDocument Access
What does this iframe window check print?
```js
const iframe = {
  contentWindow: {
    document: { title: "Iframe Title" }
  }
};

console.log(typeof iframe.contentWindow);
console.log(iframe.contentWindow.document.title);
```

### Answer
```
object
Iframe Title
```

---

## 9. Script execution order with defer vs async
What is the log order of the scripts?
```js
const executionQueue = [];

// Scripts loading: Inline, Deferred, Async
// Async finishes first, then Inline, then Deferred
executionQueue.push("Inline script");
executionQueue.push("Async script");
executionQueue.push("Deferred script");

console.log(executionQueue.join(" > "));
```

### Answer
```
Inline script > Async script > Deferred script
```

---

## 10. Document Write on loaded document
What is the result of calling write on an open vs loaded document?
```js
let documentState = "closed"; // Mocking document write behavior
let body = "original body";

function write(text) {
  if (documentState === "loaded") {
    body = text; // document.write after load replaces the entire document!
  } else {
    body += text;
  }
}

write(" append");
documentState = "loaded";
write("new document content");

console.log(body);
```

### Answer
```
new document content
```

---

## 11. Custom Event Bubbles Property
What is logged when a custom event with `bubbles: false` is dispatched?
```js
const logs = [];
const parent = { name: "parent-div" };
const child = { name: "child-btn", parent: parent };

// Emulating custom event dispatching and propagation logic
function dispatch(event, element) {
  logs.push("Dispatch " + event.type + " on " + element.name);
  let current = element;
  while (current) {
    logs.push("Handler at " + current.name);
    if (!event.bubbles) break; // If bubbles is false, event does not propagate to ancestors
    current = current.parent;
  }
}

const ev = { type: "custom-submit", bubbles: false };
dispatch(ev, child);
console.log(logs.join(" > "));
```

### Answer
```
Dispatch custom-submit on child-btn > Handler at child-btn
```

---

## 12. Once Event Listener Option
What is the length of `logs` after double-invoking the click dispatch?
```js
const logs = [];
const mockElement = {
  listeners: [],
  addEventListener(name, cb, options) {
    this.listeners.push({ cb, once: !!options?.once });
  },
  click() {
    this.listeners = this.listeners.filter(listener => {
      listener.cb();
      return !listener.once; // once listeners are auto-removed after one invocation
    });
  }
};

mockElement.addEventListener("click", () => logs.push("triggered"), { once: true });
mockElement.click();
mockElement.click();

console.log(logs.length);
```

### Answer
```
1
```

---

## 13. DOM Append vs AppendChild Return Values
What are the returned variables when using `appendChild` vs `append`?
```js
const parentNode = {
  children: [],
  appendChild(node) {
    this.children.push(node);
    return node; // appendChild returns the appended element
  },
  append(...nodes) {
    this.children.push(...nodes);
    // append return type is void (undefined)
  }
};

const childA = "div-element";
const childB = "p-element";

const resA = parentNode.appendChild(childA);
const resB = parentNode.append(childB);

console.log(resA);
console.log(resB);
console.log(parentNode.children.length);
```

### Answer
```
div-element
undefined
2
```

---

## 14. Document Template Fragment Cloning
What are the child counts of the template content vs the cloned fragment?
```js
const template = {
  content: {
    children: ["div", "span"],
    cloneNode() {
      // Returns a deep clone of the children array
      return { children: [...this.children] };
    }
  }
};

// Cloning the template fragment leaves the template itself unchanged
const fragment = template.content.cloneNode();
fragment.children.push("button");

console.log(template.content.children.length);
console.log(fragment.children.length);
```

### Answer
```
2
3
```

---

## 15. CSS Case-Insensitive Selectors
What is the matching count when filtering elements using case-insensitive attributes?
```js
const elements = [
  { class: "btn" },
  { class: "BTN" }
];

// Emulating: [class="btn"] vs [class="btn" i] (case insensitive modifier)
const matchExact = elements.filter(el => el.class === "btn");
const matchCaseInsensitive = elements.filter(el => el.class.toLowerCase() === "btn");

console.log(matchExact.length);
console.log(matchCaseInsensitive.length);
```

### Answer
```
1
2
```
