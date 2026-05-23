import fs from 'fs';
import path from 'path';
import { theoryAnswers } from './theoryAnswersData.mjs';

const markdownPath = path.resolve('src/data/senior_react_javascript_interview_questions_readme.md');
const mcqPath = path.resolve('src/data/mcq.md');
const nodeTheoryPath = path.resolve('src/data/node_theory.md');
const nodeMcqPath = path.resolve('src/data/node_mcq.md');
const tsTheoryPath = path.resolve('src/data/typescript_theory.md');
const tsMcqPath = path.resolve('src/data/typescript_mcq.md');
const outputPath = path.resolve('src/data/parsedQuestions.ts');

const readmeContent = fs.readFileSync(markdownPath, 'utf-8');
const mcqContent = fs.readFileSync(mcqPath, 'utf-8');
const nodeTheoryContent = fs.readFileSync(nodeTheoryPath, 'utf-8');
const nodeMcqContent = fs.readFileSync(nodeMcqPath, 'utf-8');
const tsTheoryContent = fs.readFileSync(tsTheoryPath, 'utf-8');
const tsMcqContent = fs.readFileSync(tsMcqPath, 'utf-8');
const markdownContent = readmeContent;

// Helper to look up comprehensive answers for theory questions (JS/React)
const getAnswerForQuestion = (q) => {
  const norm = q.toLowerCase().replace(/[^a-z0-9-]/g, ''); // keep hyphen
  const normNoHyphen = norm.replace(/-/g, '');
  
  if (theoryAnswers[norm]) return theoryAnswers[norm].trim();
  if (theoryAnswers[normNoHyphen]) return theoryAnswers[normNoHyphen].trim();
  
  // Fallback if not found
  return `This is a comprehensive answer to "${q}".\n\n${theoryAnswers["default"].trim()}`;
};

const cleanCode = (code) => {
  return code
    .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '') // remove comments
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
};

const parsedData = {
  jsTheory: [],
  reactTheory: [],
  jsOutputPrediction: [],
  reactOutputPrediction: [],
  nodeTheory: [],
  nodeOutputPrediction: [],
  tsTheory: [],
  tsOutputPrediction: []
};

const isReactOutputPrediction = (title, code) => {
  const lowerTitle = title.toLowerCase();
  const lowerCode = code.toLowerCase();
  
  const reactKeywords = [
    'react', 'usestate', 'useeffect', 'usecallback', 'usememo', 
    'useref', 'usecontext', 'usereducer', 'setstate', 'setcount',
    'component', 'jsx', 'props', 'render', 'mounting', 'unmount'
  ];
  
  const hasReactKeyword = reactKeywords.some(kw => lowerTitle.includes(kw) || lowerCode.includes(kw));
  
  // Also check for JSX tags in code: e.g. <div, <button, />
  const hasJsx = /<[a-zA-Z]+|\/>/.test(code);
  
  return hasReactKeyword || hasJsx;
};

// Helper to add and shuffle output prediction question
const addPredictionQuestion = (title, code, expectedOutput, targetList, targetCodeMap, prefix) => {
  const normCode = cleanCode(code);
  if (targetCodeMap.has(normCode)) {
    return; // skip duplicate
  }
  targetCodeMap.set(normCode, true);

  const uniqueExpected = [...new Set(expectedOutput)];
  let scrambledOutput = [...uniqueExpected];
  if (uniqueExpected.length > 1) {
    for (let i = scrambledOutput.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambledOutput[i], scrambledOutput[j]] = [scrambledOutput[j], scrambledOutput[i]];
    }
  } else {
    const answer = uniqueExpected[0];
    const defaultDistractors = ['undefined', 'TypeError', 'ReferenceError', 'null', 'NaN', 'false', 'true', '0'];
    const filtered = defaultDistractors.filter(d => d !== answer);
    scrambledOutput.push(filtered[0], filtered[1], filtered[2]);
  }
  scrambledOutput = [...new Set(scrambledOutput)];

  targetList.push({
    id: `${prefix}_${targetList.length + 1}`,
    title,
    code,
    expectedOutput,
    options: scrambledOutput
  });
};

// 1. Extract Output Prediction Questions from README (React JS)
const jsCodeMap = new Map();
const outputPredictionSectionIndex = readmeContent.indexOf('# Output Prediction Questions');
if (outputPredictionSectionIndex !== -1) {
  const outputContent = readmeContent.slice(outputPredictionSectionIndex);
  const regex = /## \d+\.\s+(.*?)\n+```js\n([\s\S]*?)```\n+Expected Output:\n+```js\n([\s\S]*?)```/g;
  
  let match;
  while ((match = regex.exec(outputContent)) !== null) {
    const title = match[1].trim();
    const code = match[2].trim();
    const expectedOutput = match[3].trim().split('\n').map(line => line.trim());
    const isReact = isReactOutputPrediction(title, code);
    const targetList = isReact ? parsedData.reactOutputPrediction : parsedData.jsOutputPrediction;
    const prefix = isReact ? 'react_op' : 'js_op';
    addPredictionQuestion(title, code, expectedOutput, targetList, jsCodeMap, prefix);
  }
}

// 2. Extract Output Prediction Questions from mcq.md (React JS)
const blocks = mcqContent.split(/\n## /);
for (let i = 1; i < blocks.length; i++) {
  const block = blocks[i].trim();
  const firstLineEnd = block.indexOf('\n');
  if (firstLineEnd === -1) continue;
  
  const titleLine = block.slice(0, firstLineEnd).trim();
  const titleMatch = titleLine.match(/^\d+\.\s+(.*)/);
  if (!titleMatch) continue;
  
  const title = titleMatch[1].trim();
  const content = block.slice(firstLineEnd).trim();
  
  const codeBlockMatch = content.match(/```(js|jsx|javascript)\n([\s\S]*?)```/);
  if (!codeBlockMatch) continue;
  
  const code = codeBlockMatch[2].trim();
  const answerIdx = content.indexOf('### Answer');
  if (answerIdx === -1) continue;
  
  const answerContent = content.slice(answerIdx + '### Answer'.length).trim();
  const answerCodeBlockMatch = answerContent.match(/```(?:js|jsx|javascript|)\n([\s\S]*?)```/);
  
  let expectedOutput = [];
  if (answerCodeBlockMatch) {
    expectedOutput = answerCodeBlockMatch[1].trim().split('\n').map(line => line.trim());
  } else {
    const plainText = answerContent.split('\n')[0].trim();
    if (plainText) {
      expectedOutput = [plainText];
    }
  }
  
  if (expectedOutput.length === 0) continue;
  const isReact = isReactOutputPrediction(title, code);
  const targetList = isReact ? parsedData.reactOutputPrediction : parsedData.jsOutputPrediction;
  const prefix = isReact ? 'react_op' : 'js_op';
  addPredictionQuestion(title, code, expectedOutput, targetList, jsCodeMap, prefix);
}

// 3. Extract Theory Questions (React JS)
const theoryRegex = /\d+\.\s+(What is.*?\?|Explain.*|Difference between.*)/gi;
let match;
const extractedTheoryNormalized = new Set();
const seenAnswers = new Set();

// Map to filter out conceptual duplicate questions
const duplicateMappings = {
  "differencebetweenssgssrandcsr": "differencebetweenssgssrandcsrinnextjs",
  "whatisreconciliation": "whatisreconciliationinreact",
  "whatissynchronousandasynchronousexecution": "differencebetweensynchronousandasynchronousexecution",
  "explaindeepcopyandshallowcopy": "differencebetweenshallowcopyanddeepcopy",
};

const reactQuestionsIndex = markdownContent.indexOf('# React Questions');

while ((match = theoryRegex.exec(markdownContent)) !== null) {
  const q = match[1].trim();
  let normQ = q.toLowerCase().replace(/[`'\s\-\?\!\.\,\(\)]/g, '');
  
  if (duplicateMappings[normQ]) {
    normQ = duplicateMappings[normQ];
  }
  
  if (!extractedTheoryNormalized.has(normQ)) {
    const ans = getAnswerForQuestion(q);
    const isFallback = ans.includes('This is a comprehensive answer to');
    if (isFallback || !seenAnswers.has(ans)) {
      extractedTheoryNormalized.add(normQ);
      if (!isFallback) {
        seenAnswers.add(ans);
      }
      
      const isReactQuestion = (questionText, index, reactIndex) => {
        if (index >= reactIndex) return true;
        const lowerQ = questionText.toLowerCase();
        const reactKeywords = [
          'react', 'usestate', 'useeffect', 'usecallback', 'usememo', 
          'useref', 'usecontext', 'usereducer', 'component', 'jsx', 
          'props', 'next.js', 'nextjs', 'reconciliation', 'reconcile',
          'suspense', 'redux', 'zustand', 'recoil', 'client-side rendering',
          'server-side rendering', 'ssg', 'ssr', 'csr', 'isr'
        ];
        return reactKeywords.some(kw => lowerQ.includes(kw));
      };

      const isReact = isReactQuestion(q, match.index, reactQuestionsIndex);
      const targetList = isReact ? parsedData.reactTheory : parsedData.jsTheory;
      
      targetList.push({
        id: '', // Will assign IDs after sorting
        question: q,
        answer: ans
      });
    }
  }
}

// Grouping categories, keywords, and sub-topics to bring related questions together
const categories = [
  {
    name: "JavaScript Basics & Scoping",
    keywords: ["let", "const", "var", "hoisting", "temporal dead zone", "tdz", "lexical scope", "closure", "this", "prototype", "garbage collection", "==", "===", "null", "undefined", "nan", "bind", "apply", "for...in", "for...of", "loops"],
    subTopics: [
      { name: "variables", keywords: ["let", "const", "var"] },
      { name: "hoisting_tdz", keywords: ["hoisting", "temporal dead zone", "tdz"] },
      { name: "scope_closure", keywords: ["lexical scope", "closure"] },
      { name: "this_context", keywords: ["this", "bind", "apply"] },
      { name: "prototype", keywords: ["prototype"] },
      { name: "garbage_collection", keywords: ["garbage collection"] },
      { name: "equality_types", keywords: ["==", "===", "null", "undefined", "nan"] },
      { name: "loops", keywords: ["for...in", "for...of", "loops"] }
    ]
  },
  {
    name: "JavaScript Functions & Language Features",
    keywords: ["function declaration", "function expression", "callback", "arrow function", "destructuring", "spread", "rest", "currying", "higher-order", "iife", "generator", "template literal", "modules", "polyfill"],
    subTopics: [
      { name: "functions", keywords: ["function declaration", "function expression", "callback", "arrow function", "currying", "higher-order", "iife"] },
      { name: "syntax_features", keywords: ["destructuring", "spread", "rest", "template literal", "modules", "polyfill"] }
    ]
  },
  {
    name: "Arrays, Objects & Data Mutability",
    keywords: ["every", "some", "map", "foreach", "slice", "splice", "substring", "filter", "reduce", "shallow copy", "deep copy", "mutable", "immutable", "string methods", "comparison"],
    subTopics: [
      { name: "array_methods", keywords: ["every", "some", "map", "foreach", "slice", "splice", "filter", "reduce"] },
      { name: "mutability_copying", keywords: ["shallow copy", "deep copy", "mutable", "immutable", "comparison"] },
      { name: "string_methods", keywords: ["string methods"] }
    ]
  },
  {
    name: "Asynchronous JavaScript & Event Loop",
    keywords: ["promise", "async", "await", "event loop", "call stack", "settimeout", "setinterval", "synchronous", "asynchronous"],
    subTopics: [
      { name: "basics", keywords: ["synchronous", "asynchronous"] },
      { name: "event_loop", keywords: ["event loop", "call stack"] },
      { name: "timers", keywords: ["settimeout", "setinterval"] },
      { name: "promises", keywords: ["promise"] },
      { name: "async_await", keywords: ["async", "await"] }
    ]
  },
  {
    name: "DOM & Web APIs",
    keywords: ["event bubbling", "event capturing", "event delegation", "localstorage", "sessionstorage", "fetch", "axios"],
    subTopics: [
      { name: "event_propagation", keywords: ["event bubbling", "event capturing", "event delegation"] },
      { name: "web_storage", keywords: ["localstorage", "sessionstorage"] },
      { name: "http_requests", keywords: ["fetch", "axios"] }
    ]
  },
  {
    name: "React Core Concepts",
    keywords: ["what is react", "react and why", "jsx", "keys in react", "pure component", "react fragment", "lifting state up", "context api", "portals", "event handling", "state and props", "state vs props", "state", "props", "prop drilling", "lifecycle", "class component", "functional component"],
    subTopics: [
      { name: "basics", keywords: ["what is react", "react and why", "jsx", "react fragment", "keys in react"] },
      { name: "vdom", keywords: ["virtual dom"] },
      { name: "components", keywords: ["pure component", "class component", "functional component"] },
      { name: "state_props", keywords: ["state and props", "state vs props", "state", "props", "lifting state up", "prop drilling"] },
      { name: "context", keywords: ["context api"] },
      { name: "advanced", keywords: ["portals", "event handling", "lifecycle"] }
    ]
  },
  {
    name: "React Hooks",
    keywords: ["react hooks", "commonly used hooks", "hooks", "usestate", "usereducer", "usememo", "usecallback", "useeffect", "custom hook"],
    subTopics: [
      { name: "basic_hooks", keywords: ["react hooks", "commonly used hooks", "hooks"] },
      { name: "state_reducer", keywords: ["usestate", "usereducer"] },
      { name: "effect", keywords: ["useeffect"] },
      { name: "memo_callback", keywords: ["usememo", "usecallback"] },
      { name: "custom_hooks", keywords: ["custom hook"] }
    ]
  },
  {
    name: "React Advanced & Performance",
    keywords: ["reconciliation", "react fiber", "batching", "react.memo", "controlled and uncontrolled", "controlled vs uncontrolled", "error boundaries", "lazy loading", "suspense", "forms in react", "side effects in react"],
    subTopics: [
      { name: "reconciliation", keywords: ["reconciliation", "react fiber"] },
      { name: "memoization", keywords: ["react.memo"] },
      { name: "rendering_behavior", keywords: ["batching", "controlled and uncontrolled", "controlled vs uncontrolled", "forms in react", "side effects in react"] },
      { name: "errors_loading", keywords: ["error boundaries", "lazy loading", "suspense"] }
    ]
  },
  {
    name: "Next.js & Server Rendering",
    keywords: ["next.js", "nextjs", "ssg", "ssr", "csr", "isr", "routing", "dynamic routing", "code splitting", "middleware", "client-side rendering", "server-side rendering"],
    subTopics: [
      { name: "basics", keywords: ["next.js", "nextjs"] },
      { name: "rendering_modes", keywords: ["ssg", "ssr", "csr", "isr", "client-side rendering", "server-side rendering"] },
      { name: "routing_features", keywords: ["routing", "dynamic routing", "middleware"] },
      { name: "code_splitting", keywords: ["code splitting"] }
    ]
  },
  {
    name: "State Management",
    keywords: ["redux", "redux toolkit", "redux data flow", "redux thunk", "redux saga", "zustand", "recoil", "local state", "global state"],
    subTopics: [
      { name: "redux", keywords: ["redux", "redux toolkit", "redux data flow", "redux thunk", "redux saga"] },
      { name: "zustand_recoil", keywords: ["zustand", "recoil"] },
      { name: "concepts", keywords: ["local state", "global state"] }
    ]
  },
  {
    name: "Performance & Optimization",
    keywords: ["debounce", "throttle", "memoization"],
    subTopics: [
      { name: "rate_limiting", keywords: ["debounce", "throttle"] },
      { name: "memoization", keywords: ["memoization"] }
    ]
  },
  {
    name: "CSS & Web APIs",
    keywords: ["positioning", "relative position", "absolute position", "semantic tag", "graphql", "data attribute", "data attributes"],
    subTopics: [
      { name: "layout", keywords: ["positioning", "relative position", "absolute position", "semantic tag"] },
      { name: "html", keywords: ["data attribute", "data attributes"] },
      { name: "apis", keywords: ["graphql"] }
    ]
  }
];

const getCategoryAndSubTopicIndex = (question) => {
  const q = question.toLowerCase();

  const matchesKeyword = (keyword) => {
    if (/^[^a-z0-9]+$/i.test(keyword)) {
      return q.includes(keyword);
    }
    const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const cleanQ = q.replace(/[`'\-\?\!\.\,\(\)]/g, ' ');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
    return regex.test(cleanQ);
  };

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    for (let j = 0; j < category.subTopics.length; j++) {
      if (category.subTopics[j].keywords.some(matchesKeyword)) {
        return { categoryIndex: i, subTopicIndex: j };
      }
    }
    if (category.keywords.some(matchesKeyword)) {
      return { categoryIndex: i, subTopicIndex: category.subTopics.length };
    }
  }

  return { categoryIndex: categories.length, subTopicIndex: 0 }; // Miscellaneous
};

const sortAndAssignIds = (list, idPrefix) => {
  // Assign category and sub-topic indices for sorting
  list.forEach((item, index) => {
    const { categoryIndex, subTopicIndex } = getCategoryAndSubTopicIndex(item.question);
    item.categoryIndex = categoryIndex;
    item.subTopicIndex = subTopicIndex;
    item.originalIndex = index;
  });

  // Sort by categoryIndex, then subTopicIndex, then originalIndex (stable sort)
  list.sort((a, b) => {
    if (a.categoryIndex !== b.categoryIndex) {
      return a.categoryIndex - b.categoryIndex;
    }
    if (a.subTopicIndex !== b.subTopicIndex) {
      return a.subTopicIndex - b.subTopicIndex;
    }
    return a.originalIndex - b.originalIndex;
  });

  // Assign sequential IDs
  list.forEach((q, idx) => {
    q.id = `${idPrefix}_${idx + 1}`;
    delete q.categoryIndex;
    delete q.subTopicIndex;
    delete q.originalIndex;
  });
};

sortAndAssignIds(parsedData.jsTheory, 'js_th');
sortAndAssignIds(parsedData.reactTheory, 'react_th');

// 4. Extract Node JS Theory Questions from node_theory.md
const nodeTheoryBlocks = nodeTheoryContent.split(/\n## /);
for (let i = 1; i < nodeTheoryBlocks.length; i++) {
  const block = nodeTheoryBlocks[i].trim();
  const firstLineEnd = block.indexOf('\n');
  if (firstLineEnd === -1) continue;
  
  const heading = block.slice(0, firstLineEnd).trim();
  const answer = block.slice(firstLineEnd).trim();
  
  const titleMatch = heading.match(/^\d+\.\s+(.*)/);
  if (!titleMatch) continue;
  
  const question = titleMatch[1].trim();
  parsedData.nodeTheory.push({
    id: `node_th_${i}`,
    question,
    answer
  });
}

// 5. Extract Node JS Output Prediction Questions from node_mcq.md
const nodeCodeMap = new Map();
const nodeMcqBlocks = nodeMcqContent.split(/\n## /);
for (let i = 1; i < nodeMcqBlocks.length; i++) {
  const block = nodeMcqBlocks[i].trim();
  const firstLineEnd = block.indexOf('\n');
  if (firstLineEnd === -1) continue;
  
  const titleLine = block.slice(0, firstLineEnd).trim();
  const titleMatch = titleLine.match(/^\d+\.\s+(.*)/);
  if (!titleMatch) continue;
  
  const title = titleMatch[1].trim();
  const content = block.slice(firstLineEnd).trim();
  
  const codeBlockMatch = content.match(/```(js|javascript)\n([\s\S]*?)```/);
  if (!codeBlockMatch) continue;
  
  const code = codeBlockMatch[2].trim();
  const answerIdx = content.indexOf('### Answer');
  if (answerIdx === -1) continue;
  
  const answerContent = content.slice(answerIdx + '### Answer'.length).trim();
  const answerCodeBlockMatch = answerContent.match(/```(?:js|javascript|)\n([\s\S]*?)```/);
  
  let expectedOutput = [];
  if (answerCodeBlockMatch) {
    expectedOutput = answerCodeBlockMatch[1].trim().split('\n').map(line => line.trim());
  } else {
    const plainText = answerContent.split('\n')[0].trim();
    if (plainText) {
      expectedOutput = [plainText];
    }
  }
  
  if (expectedOutput.length === 0) continue;
  addPredictionQuestion(title, code, expectedOutput, parsedData.nodeOutputPrediction, nodeCodeMap, 'node_op');
}

// 6. Extract TypeScript Theory Questions from typescript_theory.md
const tsTheoryBlocks = tsTheoryContent.split(/\n## /);
for (let i = 1; i < tsTheoryBlocks.length; i++) {
  const block = tsTheoryBlocks[i].trim();
  const firstLineEnd = block.indexOf('\n');
  if (firstLineEnd === -1) continue;
  
  const heading = block.slice(0, firstLineEnd).trim();
  const answer = block.slice(firstLineEnd).trim();
  
  const titleMatch = heading.match(/^\d+\.\s+(.*)/);
  if (!titleMatch) continue;
  
  const question = titleMatch[1].trim();
  parsedData.tsTheory.push({
    id: `ts_th_${i}`,
    question,
    answer
  });
}

// 7. Extract TypeScript Output Prediction Questions from typescript_mcq.md
const tsCodeMap = new Map();
const tsMcqBlocks = tsMcqContent.split(/\n## /);
for (let i = 1; i < tsMcqBlocks.length; i++) {
  const block = tsMcqBlocks[i].trim();
  const firstLineEnd = block.indexOf('\n');
  if (firstLineEnd === -1) continue;
  
  const titleLine = block.slice(0, firstLineEnd).trim();
  const titleMatch = titleLine.match(/^\d+\.\s+(.*)/);
  if (!titleMatch) continue;
  
  const title = titleMatch[1].trim();
  const content = block.slice(firstLineEnd).trim();
  
  const codeBlockMatch = content.match(/```(js|javascript)\n([\s\S]*?)```/);
  if (!codeBlockMatch) continue;
  
  const code = codeBlockMatch[2].trim();
  const answerIdx = content.indexOf('### Answer');
  if (answerIdx === -1) continue;
  
  const answerContent = content.slice(answerIdx + '### Answer'.length).trim();
  const answerCodeBlockMatch = answerContent.match(/```(?:js|javascript|)\n([\s\S]*?)```/);
  
  let expectedOutput = [];
  if (answerCodeBlockMatch) {
    expectedOutput = answerCodeBlockMatch[1].trim().split('\n').map(line => line.trim());
  } else {
    const plainText = answerContent.split('\n')[0].trim();
    if (plainText) {
      expectedOutput = [plainText];
    }
  }
  
  if (expectedOutput.length === 0) continue;
  addPredictionQuestion(title, code, expectedOutput, parsedData.tsOutputPrediction, tsCodeMap, 'ts_op');
}

// Write to file
const tsContent = `
// AUTOGENERATED FILE - DO NOT EDIT MANUALLY
// Generated by scripts/parseMarkdown.mjs

export interface OutputPredictionQuestion {
  id: string;
  title: string;
  code: string;
  expectedOutput: string[];
  options: string[];
}

export interface TheoryQuestion {
  id: string;
  question: string;
  answer: string;
}

export const jsOutputPredictionQuestions: OutputPredictionQuestion[] = ${JSON.stringify(parsedData.jsOutputPrediction, null, 2)};

export const reactOutputPredictionQuestions: OutputPredictionQuestion[] = ${JSON.stringify(parsedData.reactOutputPrediction, null, 2)};

export const nodeOutputPredictionQuestions: OutputPredictionQuestion[] = ${JSON.stringify(parsedData.nodeOutputPrediction, null, 2)};

export const tsOutputPredictionQuestions: OutputPredictionQuestion[] = ${JSON.stringify(parsedData.tsOutputPrediction, null, 2)};

export const jsTheoryQuestions: TheoryQuestion[] = ${JSON.stringify(parsedData.jsTheory, null, 2)};

export const reactTheoryQuestions: TheoryQuestion[] = ${JSON.stringify(parsedData.reactTheory, null, 2)};

export const nodeTheoryQuestions: TheoryQuestion[] = ${JSON.stringify(parsedData.nodeTheory, null, 2)};

export const tsTheoryQuestions: TheoryQuestion[] = ${JSON.stringify(parsedData.tsTheory, null, 2)};
`;

fs.writeFileSync(outputPath, tsContent, 'utf-8');
console.log('Successfully parsed questions to src/data/parsedQuestions.ts');
console.log(`Extracted ${parsedData.jsOutputPrediction.length} JS Output Prediction questions.`);
console.log(`Extracted ${parsedData.reactOutputPrediction.length} React Output Prediction questions.`);
console.log(`Extracted ${parsedData.nodeOutputPrediction.length} Node JS Output Prediction questions.`);
console.log(`Extracted ${parsedData.tsOutputPrediction.length} TypeScript Output Prediction questions.`);
console.log(`Extracted ${parsedData.jsTheory.length} JS Theory questions.`);
console.log(`Extracted ${parsedData.reactTheory.length} React Theory questions.`);
console.log(`Extracted ${parsedData.nodeTheory.length} Node JS Theory questions.`);
console.log(`Extracted ${parsedData.tsTheory.length} TypeScript Theory questions.`);
