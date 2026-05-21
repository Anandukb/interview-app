import fs from 'fs';
import path from 'path';
import { theoryAnswers } from './theoryAnswersData.mjs';

const markdownPath = path.resolve('src/data/senior_react_javascript_interview_questions_readme.md');
const mcqPath = path.resolve('src/data/mcq.md');
const outputPath = path.resolve('src/data/parsedQuestions.ts');

const readmeContent = fs.readFileSync(markdownPath, 'utf-8');
const mcqContent = fs.readFileSync(mcqPath, 'utf-8');
const markdownContent = readmeContent; // For backward compatibility with the theory parsing logic below

// Helper to look up comprehensive answers for theory questions
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
  theory: [],
  outputPrediction: []
};

const codeMap = new Map(); // normalizedCode -> true
let opId = 1;

// Helper to add and shuffle output prediction question
const addPredictionQuestion = (title, code, expectedOutput) => {
  const normCode = cleanCode(code);
  if (codeMap.has(normCode)) {
    return; // skip duplicate
  }
  codeMap.set(normCode, true);

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

  parsedData.outputPrediction.push({
    id: `op_${opId++}`,
    title,
    code,
    expectedOutput,
    options: scrambledOutput
  });
};

// 1. Extract Output Prediction Questions from README
const outputPredictionSectionIndex = readmeContent.indexOf('# Output Prediction Questions');
if (outputPredictionSectionIndex !== -1) {
  const outputContent = readmeContent.slice(outputPredictionSectionIndex);
  const regex = /## \d+\.\s+(.*?)\n+```js\n([\s\S]*?)```\n+Expected Output:\n+```js\n([\s\S]*?)```/g;
  
  let match;
  while ((match = regex.exec(outputContent)) !== null) {
    const title = match[1].trim();
    const code = match[2].trim();
    const expectedOutput = match[3].trim().split('\n').map(line => line.trim());
    addPredictionQuestion(title, code, expectedOutput);
  }
}

// 2. Extract Output Prediction Questions from mcq.md
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
  addPredictionQuestion(title, code, expectedOutput);
}

// 2. Extract Theory Questions (we'll grab JS and React ones)
const theoryRegex = /\d+\.\s+(What is.*?\?|Explain.*|Difference between.*)/gi;
let match;
let theoryId = 1;
const extractedTheory = new Set();

while ((match = theoryRegex.exec(markdownContent)) !== null) {
  const q = match[1].trim();
  if (!extractedTheory.has(q)) {
    extractedTheory.add(q);
    parsedData.theory.push({
      id: `th_${theoryId++}`,
      question: q,
      answer: getAnswerForQuestion(q)
    });
  }
}

// Sort theory questions from basic to advanced
const basicKeywords = ['what is', 'difference between let', '== and ===', 'jsx', 'props', 'state', 'hoisting', 'callback', 'arrow function', 'template literal'];
const advancedKeywords = ['usememo', 'usecallback', 'generator', 'reconciliation', 'fiber', 'suspense', 'ssr', 'ssg', 'saga', 'thunk', 'currying', 'memoization', 'throttle', 'debounce', 'deep clone', 'custom hook', 'portals', 'error boundaries', 'lazy loading', 'code splitting', 'graphql', 'zustand', 'recoil', 'isr', 'middleware'];

const getScore = (q) => {
  const lowerQ = q.toLowerCase();
  let score = 50; // default medium
  if (basicKeywords.some(k => lowerQ.includes(k))) score -= 20;
  if (advancedKeywords.some(k => lowerQ.includes(k))) score += 40;
  return score;
};

parsedData.theory.sort((a, b) => getScore(a.question) - getScore(b.question));

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

export const outputPredictionQuestions: OutputPredictionQuestion[] = ${JSON.stringify(parsedData.outputPrediction, null, 2)};

export const theoryQuestions: TheoryQuestion[] = ${JSON.stringify(parsedData.theory, null, 2)};
`;

fs.writeFileSync(outputPath, tsContent, 'utf-8');
console.log('Successfully parsed questions to src/data/parsedQuestions.ts');
console.log(`Extracted \${parsedData.outputPrediction.length} Output Prediction questions.`);
console.log(`Extracted \${parsedData.theory.length} Theory questions.`);
