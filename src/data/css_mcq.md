# CSS Output Prediction Questions

## 1. Selector Specificity calculation
Which style will be applied to the text element?
```js
// Selectors targeting <div id="container" class="panel"><p class="text">Text</p></div>
const selectorA = { name: "#container .text", specificity: [1, 1, 0] };
const selectorB = { name: ".panel p.text", specificity: [0, 2, 1] };
const selectorC = { name: "div p.text", specificity: [0, 1, 2] };

const selectors = [selectorA, selectorB, selectorC];
selectors.sort((a, b) => {
  if (a.specificity[0] !== b.specificity[0]) return b.specificity[0] - a.specificity[0];
  if (a.specificity[1] !== b.specificity[1]) return b.specificity[1] - a.specificity[1];
  return b.specificity[2] - a.specificity[2];
});

console.log(selectors[0].name);
```

### Answer
```
#container .text
```

---

## 2. CSS Custom Property fallback resolution
What is the color value resolved for the element?
```js
const cssVars = {
  // "--primary": undefined
  "--secondary": "blue"
};

function getVar(name, fallback) {
  return cssVars[name] || fallback;
}

// Equivalent to: var(--primary, var(--secondary, red))
const resolved = getVar("--primary", getVar("--secondary", "red"));
console.log(resolved);
```

### Answer
```
blue
```

---

## 3. Flexbox Grow calculation
What are the final widths of flexItemA and flexItemB inside a container of width 800px?
```js
const containerWidth = 800;
const itemBaseWidth = 200; // flex-basis: 200px

const remainingSpace = containerWidth - (itemBaseWidth * 2); // 400px

// flexItemA has flex-grow: 3
// flexItemB has flex-grow: 1
const totalGrow = 3 + 1;
const share = remainingSpace / totalGrow;

const widthA = itemBaseWidth + (share * 3);
const widthB = itemBaseWidth + (share * 1);

console.log(widthA);
console.log(widthB);
```

### Answer
```
500
300
```

---

## 4. CSS Grid Implicit Track sizing
What is the height of the second row in this CSS grid?
```js
// grid-template-rows: 100px;
// grid-auto-rows: 50px;
const rows = [100]; // Explicit row heights
const autoRowHeight = 50; // Implicit row heights

function getRowHeight(index) {
  return rows[index] || autoRowHeight;
}

console.log(getRowHeight(0));
console.log(getRowHeight(1)); // Second row (implicit)
```

### Answer
```
100
50
```

---

## 5. Relative font size computation
What is the computed pixel size of `child` if font-size inheritance is applied?
```js
const rootSize = 16; // 16px (1rem)
const parentRem = 1.5; // parent has font-size: 1.5rem
const childEm = 2; // child has font-size: 2em

const parentPx = rootSize * parentRem;
const childPx = parentPx * childEm; // em multiplies by parent element size!

console.log(parentPx);
console.log(childPx);
```

### Answer
```
24
48
```

---

## 6. Stacking Context resolution
Which child element will render on top?
```js
// Parent A has z-index: 10
// Parent B has z-index: 5 (both create separate stacking contexts)
const parentA = { zIndex: 10 };
const parentB = { zIndex: 5 };

// Child A is inside Parent A and has z-index: 1
// Child B is inside Parent B and has z-index: 100
const childA = { parent: parentA, localZ: 1 };
const childB = { parent: parentB, localZ: 100 };

// Stacking comparison: parents are compared first
const winningParent = parentA.zIndex > parentB.zIndex ? "Child A" : "Child B";
console.log(winningParent);
```

### Answer
```
Child A
```

---

## 7. Transitionend listener execution
What is the console output order when elements transition styles?
```js
const log = [];

function transitionStart() {
  log.push("started");
}

function transitionEnd() {
  log.push("ended");
}

transitionStart();
// transitionend is asynchronous
setTimeout(() => {
  transitionEnd();
  console.log(log.join(" > "));
}, 0);

log.push("running");
```

### Answer
```
started > running > ended
```

---

## 8. Box-Sizing width computation
What are the total computed widths of the elements?
```js
// Content box: width + padding + border
const itemContentBox = {
  width: 200,
  padding: 20,
  border: 5,
  boxSizing: "content-box"
};

// Border box: width is final total width
const itemBorderBox = {
  width: 200,
  padding: 20,
  border: 5,
  boxSizing: "border-box"
};

function getComputedWidth(item) {
  if (item.boxSizing === "border-box") {
    return item.width;
  }
  return item.width + (item.padding * 2) + (item.border * 2);
}

console.log(getComputedWidth(itemContentBox));
console.log(getComputedWidth(itemBorderBox));
```

### Answer
```
250
200
```

---

## 9. Dynamic CSS variables styling
What is the background color of the button?
```js
const variables = {
  "--bg-color": "green"
};

const inlineStyles = {
  "--bg-color": "blue"
};

// Inline overrides stylesheet custom property variables
const resolvedColor = inlineStyles["--bg-color"] || variables["--bg-color"] || "red";
console.log(resolvedColor);
```

### Answer
```
blue
```

---

## 10. CSS has selector condition
Does the card container get high-contrast border applied?
```js
const cardA = {
  classes: ["card"],
  children: ["h2", "p"]
};

const cardB = {
  classes: ["card"],
  children: ["h2", "p", "button"]
};

// CSS Rule: .card:has(button) { border-color: highlight }
function hasButton(card) {
  return card.children.includes("button");
}

console.log(hasButton(cardA));
console.log(hasButton(cardB));
```

### Answer
```
false
true
```

---

## 11. CSS Specificity Tie-Breakers
What is the resolved color of the element if warning is defined after primary in CSS?
```js
// Selectors with equal specificity [0, 1, 0]
// .primary { color: blue }
// .warning { color: orange }
const stylesheet = [
  { selector: ".primary", color: "blue", order: 1 },
  { selector: ".warning", color: "orange", order: 2 }
];

const elementClasses = ["warning", "primary"]; // order in HTML tag

// Styles apply in stylesheet declaration order, NOT element class list order
const matchingRules = stylesheet.filter(rule => 
  elementClasses.includes(rule.selector.slice(1))
);

// Last declared rule in stylesheet wins the cascade tie-breaker
const finalColor = matchingRules[matchingRules.length - 1].color;
console.log(finalColor);
```

### Answer
```
orange
```

---

## 12. Flex-Basis vs Width Precedence
What is the rendered width of the item inside a flex row container?
```js
const item = {
  width: 300,
  flexBasis: 150,
  flexDirection: "row"
};

function getRenderedWidth(element) {
  // flex-basis takes precedence over width when direction is inline (row)
  if (element.flexDirection === "row" && element.flexBasis !== undefined) {
    return element.flexBasis;
  }
  return element.width;
}

console.log(getRenderedWidth(item));
```

### Answer
```
150
```

---

## 13. CSS Grid Row Count Auto Sizing
What are the total rows and heights of this grid?
```js
const grid = {
  columns: [100, 100], // template columns (2 columns)
  itemsCount: 3,       // 3 child items
  autoRowsHeight: 50   // Implicit row track size
};

const rowsCount = Math.ceil(grid.itemsCount / grid.columns.length);
const totalHeight = rowsCount * grid.autoRowsHeight;

console.log(rowsCount);
console.log(totalHeight);
```

### Answer
```
2
100
```

---

## 14. Aspect-Ratio Auto Dimension Calculations
What is the resolved height of the element?
```js
const element = {
  width: 400,
  aspectRatio: 2 / 1, // width to height ratio of 2:1
  height: "auto"
};

function resolveHeight(el) {
  if (el.height === "auto" && el.aspectRatio) {
    return el.width / el.aspectRatio; // height = width / ratio
  }
  return el.height;
}

console.log(resolveHeight(element));
```

### Answer
```
200
```

---

## 15. CSS Inherit vs Initial Value Processing
What are the resolved styles of the child node?
```js
const parent = {
  color: "purple",
  display: "flex"
};

const child = {
  color: "inherit",  // Copies parent value
  display: "initial" // Resets to initial CSS spec default (inline)
};

const resolvedColor = child.color === "inherit" ? parent.color : "black";
const resolvedDisplay = child.display === "initial" ? "inline" : parent.display;

console.log(resolvedColor);
console.log(resolvedDisplay);
```

### Answer
```
purple
inline
```
