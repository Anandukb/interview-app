export interface Question {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  hint: string;
  startingCode: string;
  answerCode: string;
}

export const practicalQuestions: Question[] = [
  {
    id: 'q1',
    title: 'Capitalize First Letter of Every Word',
    difficulty: 'Easy',
    description: 'Write a function that takes a string as input and returns the string with the first letter of each word capitalized.',
    hint: 'Use split(" ") to break the sentence into words, map over them, and use charAt(0).toUpperCase() along with slice(1).',
    startingCode: `function capitalizeWords(str) {\n  // Your code here\n}\n\nconsole.log(capitalizeWords("hello world from react"));`,
    answerCode: `function capitalizeWords(str) {\n  return str\n    .split(" ")\n    .map(word => word.charAt(0).toUpperCase() + word.slice(1))\n    .join(" ");\n}\n\nconsole.log(capitalizeWords("hello world from react"));`
  },
  {
    id: 'q2',
    title: 'Convert Array into Grouped Object',
    difficulty: 'Medium',
    description: 'Group an array of objects by a specific property (e.g., role) using the reduce method.',
    hint: 'Initialize the reduce accumulator as an empty object {}. Check if the key exists, if not, create an array. Then push the current user name into it.',
    startingCode: `const users = [\n  { name: "John", role: "admin" },\n  { name: "Jane", role: "user" },\n  { name: "Mike", role: "admin" }\n];\n\nfunction groupUsers(users) {\n  // Your code here\n}\n\nconsole.log(groupUsers(users));`,
    answerCode: `const users = [\n  { name: "John", role: "admin" },\n  { name: "Jane", role: "user" },\n  { name: "Mike", role: "admin" }\n];\n\nfunction groupUsers(users) {\n  return users.reduce((acc, user) => {\n    if (!acc[user.role]) {\n      acc[user.role] = [];\n    }\n    acc[user.role].push(user.name);\n    return acc;\n  }, {});\n}\n\nconsole.log(groupUsers(users));`
  },
  {
    id: 'q3',
    title: 'Find Duplicate Words in a Sentence',
    difficulty: 'Easy',
    description: 'Find all duplicate words in a given string and return them in an array.',
    hint: 'Split the string into an array and use an object to keep track of word counts. If a count reaches exactly 2, push the word to your duplicates array.',
    startingCode: `function findDuplicateWords(str) {\n  // Your code here\n}\n\nconsole.log(findDuplicateWords("react is great and react is fast"));`,
    answerCode: `function findDuplicateWords(str) {\n  const words = str.split(" ");\n  const count = {};\n  const duplicates = [];\n\n  for (const word of words) {\n    count[word] = (count[word] || 0) + 1;\n    if (count[word] === 2) {\n      duplicates.push(word);\n    }\n  }\n  return duplicates;\n}\n\nconsole.log(findDuplicateWords("react is great and react is fast"));`
  },
  {
    id: 'q4',
    title: 'Flatten Nested Array Without .flat()',
    difficulty: 'Medium',
    description: 'Write a recursive function that flattens an array of arbitrarily nested arrays. Do not use the built-in Array.prototype.flat() method.',
    hint: 'Use the reduce method along with recursion. Check if the current item is an array using Array.isArray().',
    startingCode: `function flattenArray(arr) {\n  // Your code here\n}\n\nconsole.log(flattenArray([1, [2, 3], [4, [5]]]));`,
    answerCode: `function flattenArray(arr) {\n  return arr.reduce((acc, item) => {\n    if (Array.isArray(item)) {\n      return acc.concat(flattenArray(item));\n    }\n    return acc.concat(item);\n  }, []);\n}\n\nconsole.log(flattenArray([1, [2, 3], [4, [5]]]));`
  },
  {
    id: 'q5',
    title: 'Convert String to URL Slug',
    difficulty: 'Easy',
    description: 'Convert a given title string into a URL-friendly slug (lowercase, trimmed, and spaces replaced with hyphens).',
    hint: 'Chain the string methods trim(), toLowerCase(), split(" "), and join("-").',
    startingCode: `function createSlug(str) {\n  // Your code here\n}\n\nconsole.log(createSlug("Senior React Developer Interview"));`,
    answerCode: `function createSlug(str) {\n  return str\n    .trim()\n    .toLowerCase()\n    .split(" ")\n    .join("-");\n}\n\nconsole.log(createSlug("Senior React Developer Interview"));`
  },
  {
    id: 'q6',
    title: 'Find Longest Word in a Sentence',
    difficulty: 'Easy',
    description: 'Find and return the longest word in a given string.',
    hint: 'Use split() to get an array of words, then use reduce() to compare the lengths of the current and longest word found so far.',
    startingCode: `function longestWord(str) {\n  // Your code here\n}\n\nconsole.log(longestWord("React developers build scalable applications"));`,
    answerCode: `function longestWord(str) {\n  return str\n    .split(" ")\n    .reduce((longest, current) => {\n      return current.length > longest.length ? current : longest;\n    }, "");\n}\n\nconsole.log(longestWord("React developers build scalable applications"));`
  },
  {
    id: 'q7',
    title: 'Count Occurrence of Characters',
    difficulty: 'Easy',
    description: 'Given a string, return an object containing the count of each character.',
    hint: 'Split the string into an array of characters, and use reduce() to accumulate counts in an object.',
    startingCode: `function countCharacters(str) {\n  // Your code here\n}\n\nconsole.log(countCharacters("javascript"));`,
    answerCode: `function countCharacters(str) {\n  return str.split("").reduce((acc, char) => {\n    acc[char] = (acc[char] || 0) + 1;\n    return acc;\n  }, {});\n}\n\nconsole.log(countCharacters("javascript"));`
  },
  {
    id: 'q8',
    title: 'Remove Duplicate Objects from Array',
    difficulty: 'Medium',
    description: 'Given an array of objects, remove duplicate objects based on their id property.',
    hint: 'A Map is very efficient for tracking unique objects by a key like id. Iterate through the array and set the item in the Map, then return Map.values().',
    startingCode: `const data = [\n  { id: 1, name: "John" },\n  { id: 2, name: "Jane" },\n  { id: 1, name: "John" }\n];\n\nfunction removeDuplicates(arr) {\n  // Your code here\n}\n\nconsole.log(removeDuplicates(data));`,
    answerCode: `const data = [\n  { id: 1, name: "John" },\n  { id: 2, name: "Jane" },\n  { id: 1, name: "John" }\n];\n\nfunction removeDuplicates(arr) {\n  const unique = new Map();\n  arr.forEach(item => {\n    unique.set(item.id, item);\n  });\n  return [...unique.values()];\n}\n\nconsole.log(removeDuplicates(data));`
  },
  {
    id: 'q9',
    title: 'Implement Custom map() Function',
    difficulty: 'Hard',
    description: 'Implement your own version of Array.prototype.map called myMap.',
    hint: 'Add a new function to Array.prototype. Inside, iterate over "this" array, call the provided callback function with the current item, index, and array, and push the results into a new array.',
    startingCode: `Array.prototype.myMap = function(callback) {\n  // Your code here\n};\n\nconst numbers = [1, 2, 3];\nconst output = numbers.myMap(num => num * 2);\nconsole.log(output);`,
    answerCode: `Array.prototype.myMap = function(callback) {\n  const result = [];\n  for (let i = 0; i < this.length; i++) {\n    result.push(callback(this[i], i, this));\n  }\n  return result;\n};\n\nconst numbers = [1, 2, 3];\nconst output = numbers.myMap(num => num * 2);\nconsole.log(output);`
  },
  {
    id: 'q10',
    title: 'Sort Array of Objects by Multiple Fields',
    difficulty: 'Medium',
    description: 'Sort an array of user objects first by their name in alphabetical order, and then by their age in ascending order.',
    hint: 'Use the array sort method. Check the name properties first. If they are equal, return the difference between their ages.',
    startingCode: `const usersList = [\n  { name: "John", age: 30 },\n  { name: "Jane", age: 25 },\n  { name: "John", age: 20 }\n];\n\n// Your sorting logic here\n\nconsole.log(usersList);`,
    answerCode: `const usersList = [\n  { name: "John", age: 30 },\n  { name: "Jane", age: 25 },\n  { name: "John", age: 20 }\n];\n\nusersList.sort((a, b) => {\n  if (a.name < b.name) return -1;\n  if (a.name > b.name) return 1;\n  return a.age - b.age;\n});\n\nconsole.log(usersList);`
  },
  {
    id: 'q11',
    title: 'Search Filter with Debouncing (React)',
    difficulty: 'Hard',
    description: 'Implement a basic React component with an input that filters a list of users, utilizing a debounced value to prevent filtering on every keystroke.',
    hint: 'Use useEffect with a setTimeout to update a debounced state after a delay. Remember to clear the timeout in the cleanup function.',
    startingCode: `import { useEffect, useState } from "react";\n\nfunction App() {\n  const users = ["John", "Jane", "Mike", "React"];\n  const [search, setSearch] = useState("");\n  // Add debounced state and logic\n\n  return (\n    <div>\n      {/* Input and rendered list here */}\n    </div>\n  );\n}`,
    answerCode: `import { useEffect, useState } from "react";\n\nfunction App() {\n  const users = ["John", "Jane", "Mike", "React"];\n  const [search, setSearch] = useState("");\n  const [debouncedValue, setDebouncedValue] = useState("");\n\n  useEffect(() => {\n    const timer = setTimeout(() => {\n      setDebouncedValue(search);\n    }, 500);\n    return () => clearTimeout(timer);\n  }, [search]);\n\n  const filteredUsers = users.filter(user =>\n    user.toLowerCase().includes(debouncedValue.toLowerCase())\n  );\n\n  return (\n    <div>\n      <input\n        value={search}\n        onChange={e => setSearch(e.target.value)}\n      />\n      {filteredUsers.map(user => (\n        <p key={user}>{user}</p>\n      ))}\n    </div>\n  );\n}`
  },
  {
    id: 'q12',
    title: 'Build a Tag Input Component',
    difficulty: 'Medium',
    description: 'Build a React component that allows users to add tags by typing and pressing Enter. Backspace should delete the last tag if the input is empty.',
    hint: 'Listen to the onKeyDown event. Check e.key for "Enter" or "Backspace" and update your tags state accordingly.',
    startingCode: `import { useState } from "react";\n\nfunction TagInput() {\n  const [input, setInput] = useState("");\n  const [tags, setTags] = useState([]);\n\n  // handleKeyDown here\n\n  return (\n    <div>\n      {/* Render tags and input */}\n    </div>\n  );\n}`,
    answerCode: `import { useState } from "react";\n\nfunction TagInput() {\n  const [input, setInput] = useState("");\n  const [tags, setTags] = useState([]);\n\n  const handleKeyDown = e => {\n    if (e.key === "Enter" && input.trim()) {\n      if (!tags.includes(input)) {\n        setTags([...tags, input]);\n      }\n      setInput("");\n    }\n    if (e.key === "Backspace" && !input) {\n      setTags(tags.slice(0, -1));\n    }\n  };\n\n  return (\n    <div>\n      {tags.map(tag => (\n        <span key={tag}>{tag}</span>\n      ))}\n      <input\n        value={input}\n        onChange={e => setInput(e.target.value)}\n        onKeyDown={handleKeyDown}\n      />\n    </div>\n  );\n}`
  },
  {
    id: 'q13',
    title: 'Group API Response by Date',
    difficulty: 'Medium',
    description: 'Given an array of records with createdAt dates, group them into an object where the keys are the dates and the values are arrays containing the respective records.',
    hint: 'Use the reduce method, initializing the accumulator as an empty object.',
    startingCode: `const data = [\n  { id: 1, createdAt: "2026-05-19" },\n  { id: 2, createdAt: "2026-05-19" },\n  { id: 3, createdAt: "2026-05-20" }\n];\n\nfunction groupByDate(arr) {\n  // Your code here\n}\n\nconsole.log(groupByDate(data));`,
    answerCode: `const data = [\n  { id: 1, createdAt: "2026-05-19" },\n  { id: 2, createdAt: "2026-05-19" },\n  { id: 3, createdAt: "2026-05-20" }\n];\n\nfunction groupByDate(arr) {\n  return arr.reduce((acc, item) => {\n    if (!acc[item.createdAt]) {\n      acc[item.createdAt] = [];\n    }\n    acc[item.createdAt].push(item);\n    return acc;\n  }, {});\n}\n\nconsole.log(groupByDate(data));`
  },
  {
    id: 'q14',
    title: 'Build a Pagination Utility Function',
    difficulty: 'Easy',
    description: 'Write a utility function that accepts an array, a page number, and a limit, and returns the paginated slice of the array.',
    hint: 'Calculate the start index using (page - 1) * limit, then use the array slice() method.',
    startingCode: `function paginate(data, page, limit) {\n  // Your code here\n}\n\nconst numbers = [1,2,3,4,5,6,7,8,9,10];\nconsole.log(paginate(numbers, 2, 3));`,
    answerCode: `function paginate(data, page, limit) {\n  const start = (page - 1) * limit;\n  const end = start + limit;\n  return data.slice(start, end);\n}\n\nconst numbers = [1,2,3,4,5,6,7,8,9,10];\nconsole.log(paginate(numbers, 2, 3));`
  },
  {
    id: 'q15',
    title: 'Implement Case-Insensitive Search',
    difficulty: 'Easy',
    description: 'Write a function that filters an array of strings based on a search text, completely ignoring case differences.',
    hint: 'Use filter, convert both the target string and the search text to lowercase, and check with includes().',
    startingCode: `function searchUsers(users, searchText) {\n  // Your code here\n}\n\nconsole.log(searchUsers(["John", "JOHN", "Jane", "john"], "jo"));`,
    answerCode: `function searchUsers(users, searchText) {\n  return users.filter(user =>\n    user.toLowerCase().includes(searchText.toLowerCase())\n  );\n}\n\nconsole.log(searchUsers(["John", "JOHN", "Jane", "john"], "jo"));`
  },
  {
    id: 'q16',
    title: 'Write groupBy Utility',
    difficulty: 'Medium',
    description: 'Write a generic groupBy function that groups an array of objects by any given dynamic key.',
    hint: 'Use the reduce method, where you access the dynamic key on the current item (item[key]) to determine the group.',
    startingCode: `function groupBy(arr, key) {\n  // Your code here\n}\n\nconst users = [\n  { name: "John", role: "admin" },\n  { name: "Jane", role: "user" },\n  { name: "Mike", role: "admin" }\n];\n\nconsole.log(groupBy(users, "role"));`,
    answerCode: `function groupBy(arr, key) {\n  return arr.reduce((acc, item) => {\n    const group = item[key];\n    if (!acc[group]) {\n      acc[group] = [];\n    }\n    acc[group].push(item);\n    return acc;\n  }, {});\n}\n\nconst users = [\n  { name: "John", role: "admin" },\n  { name: "Jane", role: "user" },\n  { name: "Mike", role: "admin" }\n];\n\nconsole.log(groupBy(users, "role"));`
  },
  {
    id: 'q17',
    title: 'Implement Deep Clone Without JSON Methods',
    difficulty: 'Hard',
    description: 'Write a recursive function to deep clone an object. It should properly handle null, primitives, arrays, and objects, without using JSON.parse(JSON.stringify()).',
    hint: 'Check if the item is an object/array. If it is an array, map over it recursively. If it is an object, loop through keys and recursively clone the values.',
    startingCode: `function deepClone(obj) {\n  // Your code here\n}\n\nconst original = {\n  name: "React",\n  details: { version: 19 }\n};\nconst copied = deepClone(original);\nconsole.log(copied);`,
    answerCode: `function deepClone(obj) {\n  if (obj === null || typeof obj !== "object") {\n    return obj;\n  }\n  if (Array.isArray(obj)) {\n    return obj.map(item => deepClone(item));\n  }\n  const cloned = {};\n  for (const key in obj) {\n    cloned[key] = deepClone(obj[key]);\n  }\n  return cloned;\n}\n\nconst original = {\n  name: "React",\n  details: { version: 19 }\n};\nconst copied = deepClone(original);\nconsole.log(copied);`
  },
  {
    id: 'q18',
    title: 'Convert Flat Comments into Nested Tree',
    difficulty: 'Hard',
    description: 'Write a recursive function that converts a flat array of objects (with id and parentId) into a nested tree structure.',
    hint: 'Filter the array to find items that match the current parentId (starting with null). Map over them and recursively call the function to build their children property.',
    startingCode: `const comments = [\n  { id: 1, parentId: null },\n  { id: 2, parentId: 1 },\n  { id: 3, parentId: 2 }\n];\n\nfunction buildTree(comments, parentId = null) {\n  // Your code here\n}\n\nconsole.log(buildTree(comments));`,
    answerCode: `const comments = [\n  { id: 1, parentId: null },\n  { id: 2, parentId: 1 },\n  { id: 3, parentId: 2 }\n];\n\nfunction buildTree(comments, parentId = null) {\n  return comments\n    .filter(comment => comment.parentId === parentId)\n    .map(comment => ({\n      ...comment,\n      children: buildTree(comments, comment.id)\n    }));\n}\n\nconsole.log(buildTree(comments));`
  },
  {
    id: 'q19',
    title: 'Create Memoized Function',
    difficulty: 'Hard',
    description: 'Implement a memoize function that takes a function as an argument and returns a memoized version of it.',
    hint: 'Use a closure to store a cache object. JSON.stringify the arguments to use as a cache key. If the key exists, return the cached value. Otherwise, call the original function and cache the result.',
    startingCode: `function memoize(fn) {\n  // Your code here\n}\n\nconst add = (a, b) => a + b;\nconst memoizedAdd = memoize(add);\n\nconsole.log(memoizedAdd(1, 2));\nconsole.log(memoizedAdd(1, 2));`,
    answerCode: `function memoize(fn) {\n  const cache = {};\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (cache[key]) {\n      return cache[key];\n    }\n    const result = fn(...args);\n    cache[key] = result;\n    return result;\n  };\n}\n\nconst add = (a, b) => a + b;\nconst memoizedAdd = memoize(add);\n\nconsole.log(memoizedAdd(1, 2));\nconsole.log(memoizedAdd(1, 2));`
  },
  {
    id: 'q20',
    title: 'Parse Query Params from URL',
    difficulty: 'Easy',
    description: 'Given a URL query string (like "?name=john&role=admin"), parse it into a JavaScript object.',
    hint: 'Remove the "?" prefix, split the string by "&" to get key-value pairs, and use reduce to build the object.',
    startingCode: `function parseQueryParams(url) {\n  // Your code here\n}\n\nconsole.log(parseQueryParams("?name=john&role=admin"));`,
    answerCode: `function parseQueryParams(url) {\n  return url\n    .replace("?", "")\n    .split("&")\n    .reduce((acc, item) => {\n      const [key, value] = item.split("=");\n      acc[key] = value;\n      return acc;\n    }, {});\n}\n\nconsole.log(parseQueryParams("?name=john&role=admin"));`
  }
];
