import { theoryQuestions } from './src/data/parsedQuestions.ts';

const categories = [
  {
    name: "JavaScript Basics & Scoping",
    keywords: ["let, const, and var", "let, const", "var", "hoisting", "temporal dead zone", "tdz", "lexical scope", "closure", "this keyword", "this in javascript", "prototype", "garbage collection", "== and ===", " loose equality "]
  },
  {
    name: "JavaScript Functions & Language Features",
    keywords: ["function declaration", "function expression", "callback", "arrow function", "destructuring", "spread", "rest", "currying", "higher-order", "iife", "generator", "template literal"]
  },
  {
    name: "Arrays, Objects & Data Mutability",
    keywords: ["every()", "some()", "map() and", "map and foreach", "slice", "splice", "substring", "filter", "reduce", "shallow copy", "deep copy", "mutable", "immutable", "string methods", "comparison"]
  },
  {
    name: "Asynchronous JavaScript & Event Loop",
    keywords: ["promise", "async", "await", "event loop", "call stack", "settimeout", "setinterval", "synchronous", "asynchronous"]
  },
  {
    name: "DOM & Web APIs",
    keywords: ["event bubbling", "event capturing", "event delegation", "localstorage", "sessionstorage", "fetch", "axios"]
  },
  {
    name: "React Core Concepts",
    keywords: ["what is react", "virtual dom", "jsx", "keys in react", "pure component", "react fragment", "lifting state up", "context api", "portals", "event handling", "state and props", "state vs props"]
  },
  {
    name: "React Hooks",
    keywords: ["react hooks", "usestate", "usereducer", "usememo", "usecallback", "useeffect", "custom hook"]
  },
  {
    name: "React Advanced & Performance",
    keywords: ["reconciliation", "react fiber", "batching", "react.memo", "controlled and uncontrolled", "controlled vs uncontrolled", "error boundaries", "lazy loading", "suspense", "forms in react", "side effects in react"]
  },
  {
    name: "Next.js & Server Rendering",
    keywords: ["next.js", "nextjs", "ssg", "ssr", "csr", "isr", "routing", "dynamic routing", "code splitting", "middleware"]
  },
  {
    name: "State Management",
    keywords: ["redux", "zustand", "recoil", "local state", "global state"]
  },
  {
    name: "Performance & Optimization",
    keywords: ["debounce", "throttle", "memoization"]
  },
  {
    name: "CSS & Web APIs",
    keywords: ["positioning", "relative position", "absolute position", "semantic tag", "graphql"]
  }
];

const getCategoryIndex = (question) => {
  const q = question.toLowerCase();
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].keywords.some(keyword => q.includes(keyword))) {
      return i;
    }
  }
  return categories.length; // Miscellaneous
};

theoryQuestions.forEach((q) => {
  const catIdx = getCategoryIndex(q.question);
  const catName = catIdx < categories.length ? categories[catIdx].name : "Miscellaneous";
  console.log(`${q.id} [${catName}]: "${q.question}"`);
});
