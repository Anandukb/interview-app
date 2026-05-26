/**
 * export_js_theory_csv.mjs
 * Exports all JS theory questions and answers from theoryAnswers.ts as a CSV file.
 * Run: node scripts/export_js_theory_csv.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Read & parse theoryAnswers.ts ──────────────────────────────────────────────

const filePath = resolve(__dirname, '../src/data/theoryAnswers.ts');
const raw = readFileSync(filePath, 'utf-8');

// Extract the object literal between the first { and the last }
const objMatch = raw.match(/export const theoryAnswers[^=]*=\s*\{([\s\S]*)\};?\s*$/);
if (!objMatch) {
  console.error('❌ Could not parse theoryAnswers object from the file.');
  process.exit(1);
}

// Extract key: `value` pairs using a regex
const entryRegex = /\"([^\"]+)\"\s*:\s*`([\s\S]*?)`\s*(?:,|\n\s*\/\/|\})/g;
const entries = [];
let match;

const content = objMatch[1];
const fullContent = raw;

// Re-run regex on the full raw to catch all entries correctly
const entryRegexFull = /\"([^\"]+)\"\s*:\s*`([\s\S]*?)`(?:\s*,)?(?=\s*(?:\/\/|\"|\}))/g;

while ((match = entryRegexFull.exec(fullContent)) !== null) {
  const key = match[1];
  const answer = match[2].trim();
  entries.push({ key, answer });
}

console.log(`✅ Found ${entries.length} total entries in theoryAnswers.ts`);

// ── Convert normalized key back to a readable question title ──────────────────

// Known multi-word tokens (lowercase) → display form
const KEYWORD_MAP = {
  letconstandvar: 'let, const and var',
  letandvar: 'let and var',
  constvar: 'const and var',
  promiseall: 'Promise.all()',
  promiserace: 'Promise.race()',
  promiseallandpromiserace: 'Promise.all() and Promise.race()',
  asyncawait: 'async/await',
  promisesandasyncawait: 'Promises and async/await',
  eventloop: 'Event Loop',
  callstack: 'Call Stack',
  eventdelegation: 'Event Delegation',
  eventbubbling: 'Event Bubbling',
  eventcapturing: 'Event Capturing',
  eventbubblingandeventcapturing: 'Event Bubbling and Event Capturing',
  forinandforof: 'for...in and for...of',
  forin: 'for...in',
  forof: 'for...of',
  slicespliceandsubstring: 'slice(), splice() and substring()',
  mapandforeach: 'map() and forEach()',
  mapfilterandreduce: 'map(), filter() and reduce()',
  settimeoutandsetinterval: 'setTimeout() and setInterval()',
  localstorageandsessionstorage: 'localStorage and sessionStorage',
  shallowcopyanddeepcopy: 'Shallow Copy and Deep Copy',
  deepcopyandshalowcopy: 'Deep Copy and Shallow Copy',
  synchronousandasynchronousexecution: 'Synchronous and Asynchronous Execution',
  functiondeclarationandfunctionexpression: 'Function Declaration and Function Expression',
  mutableandimmutableobjects: 'Mutable and Immutable Objects',
  fetchandaxios: 'fetch and axios',
  callapplyandbind: 'call(), apply() and bind()',
  bindcallandapply: 'bind(), call() and apply()',
  nullundefinedandnan: 'null, undefined and NaN',
  everyandsome: 'every() and some()',
  debounceandthrottle: 'Debounce and Throttle',
  prototypalinheritance: 'Prototype and Prototypal Inheritance',
  prototypeandprototypalinheritance: 'Prototype and Prototypal Inheritance',
  javascriptthis: 'this in JavaScript',
  thisinjavascript: 'this in JavaScript',
  temporaldeadzonetdz: 'Temporal Dead Zone (TDZ)',
  temporaldeadzone: 'Temporal Dead Zone (TDZ)',
  callbackfunction: 'Callback Function',
  lexicalscope: 'Lexical Scope',
  garbagecollection: 'Garbage Collection',
  garbagecollectioninjavascript: 'Garbage Collection in JavaScript',
  curryinginjavascript: 'Currying in JavaScript',
  lazyloading: 'Lazy Loading',
  codesplitting: 'Code Splitting',
  memoization: 'Memoization',
  deepcopyandshallocopy: 'Deep Copy and Shallow Copy',
  graphql: 'GraphQL',
  polyfill: 'Polyfill',
  hoisting: 'Hoisting',
  closure: 'Closure',
  promise: 'Promise',
  promisechaining: 'Promise Chaining',
  spreadoperator: 'Spread Operator',
  restoperator: 'Rest Operator',
  destructuring: 'Destructuring',
  stringmethods: 'String Methods',
};

function keyToQuestion(key) {
  // Check full-key map first
  if (KEYWORD_MAP[key]) return KEYWORD_MAP[key] + '?';

  const prefixes = [
    { prefix: 'differencebetween', label: 'What is the Difference Between' },
    { prefix: 'whatis', label: 'What Is' },
    { prefix: 'howdoes', label: 'How Does' },
    { prefix: 'explain', label: 'Explain' },
  ];

  for (const { prefix, label } of prefixes) {
    if (key.startsWith(prefix)) {
      const rest = key.slice(prefix.length);
      const readable = KEYWORD_MAP[rest] ?? formatToken(rest);
      return `${label} ${readable}?`;
    }
  }

  return formatToken(key) + '?';
}

function formatToken(str) {
  // Try to look up as a known keyword first
  if (KEYWORD_MAP[str]) return KEYWORD_MAP[str];
  // Otherwise capitalise first letter
  return str.charAt(0).toUpperCase() + str.slice(1);
}


// ── JS-specific filter ─────────────────────────────────────────────────────────
// Exclude React/Next.js/CSS/HTML-only entries; keep JS fundamentals + shared ones.

const EXCLUDE_KEYS = new Set([
  // React / Next.js specific
  'differencebetweenclasscomponentsandfunctionalcomponents',
  'differencebetweenusestateandusereducer',
  'differencebetweenreacthooksandlifecyclemethods',
  'differencebetweencontrolledanduncontrolledcomponents',
  'differencebetweenusememoandusecallback',
  'differencebetweenstateandprops',
  'differencebetweenlocalstateandglobalstate',
  'differencebetweenssgssrandcsrinextjs',
  'differencebetweenssgssrandcsr',
  'differencebetweenclientsiderenderingandserversiderendering',
  'differencebetweendeepcomparisonandshallowcomparison',
  'whatisreactmemo',
  'whatisapurecomponent',
  'whatisacustomhook',
  'whatisreconciliationinreact',
  'whatisreconciliation',
  'whatisreactfiber',
  'whatisbatchinginreactupdates',
  'whatisjsx',
  'whatispropdrillingandhowtoavoidit',
  'explaincontextapi',
  'explainredux',
  'whatisredux',
  'explainreduxdataflow',
  'whatisreduxtoolkit',
  'whatisreduxthunk',
  'whatisreduxsaga',
  'whatiszustand',
  'whatisrecoil',
  'whatisnextjs',
  'whatisdynamicroutinginextjs',
  'whatiscode-splittinginextjs',
  'explainlifecyclemethods',
  'explaincommonlyusedhooks',
  'explainvirtualdom',
  'explaintheuseeffecthook',
  'explainliftingstateup',
  'explainmemoizationinreact',
  'whatissuspense',
  // CSS
  'differencebetweenabsoluteandrelativepositioning',
  // Default fallback key
  'default',
  // HTML
  'whatisadataattributeinhtml',
]);

// Filter JS entries
const jsEntries = entries.filter(({ key }) => !EXCLUDE_KEYS.has(key));

console.log(`📦 Exporting ${jsEntries.length} JS theory Q&A entries as CSV...`);

// ── Build CSV ─────────────────────────────────────────────────────────────────

function escapeCSV(value) {
  // Escape double quotes and wrap in quotes if contains comma, quote, or newline
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

const headers = ['#', 'Key', 'Question', 'Answer'];
const rows = jsEntries.map(({ key, answer }, i) => [
  i + 1,
  key,
  keyToQuestion(key),
  answer,
]);

const csvLines = [
  headers.map(escapeCSV).join(','),
  ...rows.map(row => row.map(escapeCSV).join(',')),
];

const csvContent = csvLines.join('\n');
const outputPath = resolve(__dirname, '../js_theory_questions.csv');
writeFileSync(outputPath, csvContent, 'utf-8');

console.log(`✅ CSV exported to: ${outputPath}`);
console.log(`   Total rows: ${rows.length}`);
