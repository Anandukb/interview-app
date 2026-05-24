# HTML Theory Questions

## 1. What is Semantic HTML and why is it important for SEO and Accessibility (a11y)?

Semantic HTML refers to the practice of using HTML tags that describe the meaning and purpose of the content they enclose, rather than just their visual appearance. For example, using `<header>`, `<main>`, `<article>`, and `<footer>` instead of generic `<div>` tags.

### Why it is important:
1. **Accessibility (a11y)**: Assistive technologies (like screen readers) rely on semantic structure to understand the document outline and allow users to navigate the page efficiently (e.g. jumping straight to the `<nav>` or `<main>` section).
2. **SEO (Search Engine Optimization)**: Search engine crawlers use semantic tags to identify the most important sections of a page (like headings, articles, and navigation links) and index the page content more accurately.
3. **Code Readability**: Semantic HTML makes the source code significantly easier to read, maintain, and debug for development teams.

---

## 2. Explain the difference between `defer` and `async` attributes in script tags

Both `defer` and `async` are boolean attributes used on `<script>` elements to control how external JavaScript files are fetched and executed, preventing them from blocking the HTML parser.

### 1. Default (No Attributes)
The HTML parser stops when it encounters a script tag, downloads the script, executes it, and only then continues parsing the remaining HTML. This blocks DOM rendering.

### 2. `async` (Asynchronous)
The script is downloaded in parallel with HTML parsing. The moment the download finishes, the HTML parser is **paused**, and the script is executed.
- **Execution Order**: Scripts execute as soon as they download, meaning they do not guarantee execution order.
- **Best Use**: Self-contained scripts like analytics (Google Analytics) or advertisements.

### 3. `defer` (Deferred)
The script is downloaded in parallel with HTML parsing, but its execution is **deferred** until the HTML parsing is fully completed.
- **Execution Order**: Scripts execute in the exact order they are defined in the HTML document.
- **Best Use**: Scripts that depend on the complete DOM or depend on other scripts.

---

## 3. What is the Critical Rendering Path (CRP) and how does HTML structure affect it?

The Critical Rendering Path (CRP) is the sequence of steps the browser takes to convert HTML, CSS, and JavaScript into actual pixels on the screen.

### The 5 Steps of CRP:
1. **Build DOM**: Parse HTML markup and construct the Document Object Model (DOM) tree.
2. **Build CSSOM**: Parse CSS styles and construct the CSS Object Model (CSSOM) tree.
3. **Create Render Tree**: Combine the DOM and CSSOM trees to create the Render Tree (containing only visible nodes).
4. **Layout (Reflow)**: Calculate the exact geometry and position of each node on the screen.
5. **Paint**: Render the actual pixels on the viewport.

### HTML Impact on CRP:
- **Parser Blocking Scripts**: Script tags placed in the `<head>` without `async` or `defer` block DOM construction.
- **Style Position**: Stylesheets block rendering (CSSOM must be ready before creating the Render Tree). Placing stylesheets in the `<head>` ensures they load early, preventing Flash of Unstyled Content (FOUC).
- **DOM Depth**: Excessively nested HTML tags increase the complexity and time required to build the DOM tree and run layout algorithms.

---

## 4. What is the DOM (Document Object Model) and how does it differ from the BOM (Browser Object Model)?

- **DOM (Document Object Model)**: A programming interface for HTML and XML documents. It represents the document structure as a tree of nodes (objects), allowing JavaScript to read, modify, and delete HTML elements, attributes, and styles dynamically. The root object of the DOM is `window.document`.
- **BOM (Browser Object Model)**: A collection of objects exposed by the browser representing the browser window environment outside the document content. It has no official standard, but is supported by all modern browsers. The root object of the BOM is `window`.

### Common BOM Objects:
- `window.navigator`: Information about the browser/device.
- `window.location`: URL details and redirect controls.
- `window.history`: Navigation history stack.
- `window.screen`: Viewport dimensions and screen capabilities.

---

## 5. Explain HTML5 Web Storage: LocalStorage, SessionStorage, and Cookies

HTML5 introduced Web Storage to allow applications to store key-value data directly in the user's browser:

| Feature | LocalStorage | SessionStorage | Cookies |
|---|---|---|---|
| **Capacity** | ~5MB - 10MB | ~5MB | ~4KB |
| **Expiration** | Never (must be deleted) | When tab/window is closed | Manually set (via Max-Age) |
| **Network Send** | No (Client-side only) | No (Client-side only) | Sent with every HTTP request |
| **Security** | Same-Origin Policy | Same-Origin Policy | Secure & HttpOnly flag controls |
| **API** | Simple `getItem`/`setItem` | Simple `getItem`/`setItem` | Complex text strings parse |

---

## 6. What is the purpose of the `shadow DOM` and how does it work?

The Shadow DOM is a web standard that allows web developers to attach a hidden, isolated DOM tree to an element. It is a key pillar of Web Components.

### Key Benefits:
1. **Scoped CSS**: CSS styles defined inside a Shadow DOM do not leak out to the main document, and styles from the main document do not affect the internal elements of the Shadow DOM.
2. **Encapsulation**: Keeps the internal implementation details of custom elements hidden, avoiding global class name collisions.

### How it Works:
You attach a shadow root to an element using `element.attachShadow({ mode: 'open' })`. The element then becomes a "Shadow Host," and the root becomes the parent of the isolated tree.

---

## 7. Explain custom data attributes (`data-*`) and how to access them in JS and CSS

Custom data attributes allow you to store custom metadata directly on standard HTML elements using the `data-` prefix.

### Accessing in JavaScript:
Using the `dataset` property on a DOM element. CamelCase conversion is applied to keys.
```html
<button id="btn" data-user-id="45" data-user-role="admin">Click</button>
```
```js
const btn = document.getElementById("btn");
console.log(btn.dataset.userId); // "45"
console.log(btn.dataset.userRole); // "admin"
```

### Accessing in CSS:
Using attribute selectors:
```css
button[data-user-role="admin"] {
  border: 2px solid red;
}
```

---

## 8. What is the difference between standard iframe and sandboxed iframe?

An `<iframe>` (Inline Frame) embeds another HTML page within the current document. Because it can load third-party scripts, it represents a security risk (XSS, clickjacking).

- **Standard `<iframe>`**: Loads and executes code with high access, potentially reading cookies, accessing parent document, submitting forms, or popping up modals.
- **Sandboxed `<iframe>`**: Applying the `sandbox` attribute restricts the content's capabilities. By default, an empty `sandbox` attribute enforces the strictest rules:
  - Blocks script execution.
  - Blocks form submissions.
  - Treats the page as a unique origin (blocking cookie access).
  - Blocks popups and target redirects.

To loosen specific restrictions, you define token values like `sandbox="allow-scripts allow-forms"`.

---

## 9. Explain the `template` and `slot` tags in HTML5 Web Components

- **`<template>`**: A mechanism for holding HTML content that is not rendered on page load but can be cloned and instantiated dynamically at runtime using JavaScript.
- **`<slot>`**: A placeholder inside a web component's shadow DOM template that you can fill with your own custom markup from the light DOM.

### Example:
```html
<!-- Component Template -->
<template id="user-card-template">
  <div class="card">
    <h3>User Profile</h3>
    <slot name="username">Anonymous</slot>
  </div>
</template>
```
Using the custom component:
```html
<user-card>
  <span slot="username">Alice Smith</span>
</user-card>
```

---

## 10. What is the difference between `src` and `href` attributes?

- **`src` (Source)**: Used to embed external resources directly into the document (e.g. `<img>`, `<script>`, `<iframe>`). When the browser encounters a `src` attribute, it pauses parsing to download the resource because it is required to render/run the current page.
- **`href` (Hypertext Reference)**: Used to define a link or relationship to an external resource (e.g. `<a>`, `<link>`). When the browser downloads resources linked by `href` (like stylesheets), it does not pause the parsing of the DOM, because it represents an external relationship rather than embedded content.

---

## 11. What is the purpose of the `meta` viewport tag and how does it work?

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
The viewport meta tag was introduced to control how mobile browsers render websites.

### How it works:
- **`width=device-width`**: Sets the width of the page's layout viewport to equal the physical screen width of the device in CSS pixels, preventing mobile browsers from rendering at standard desktop widths (e.g., 980px) and scaling down.
- **`initial-scale=1.0`**: Sets the initial zoom level when the page is first loaded.

---

## 12. Explain the Web Workers API and how to load them in HTML

Web Workers run JavaScript files in background threads separate from the browser's main execution thread. This prevents CPU-intensive computations from locking up the UI thread.

### How to use:
1. Create a worker file `worker.js`:
```js
self.onmessage = (e) => {
  const result = e.data * 2; // Heavy calculation
  self.postMessage(result);
};
```
2. Instantiating the worker in the main script:
```js
const myWorker = new Worker('worker.js');
myWorker.postMessage(10);
myWorker.onmessage = (e) => {
  console.log('Result:', e.data); // 20
};
```

---

## 13. What are Server-Sent Events (SSE) and how do they differ from WebSockets?

Server-Sent Events (SSE) is a web standard allowing servers to push real-time updates to client browsers over standard HTTP connections.

### Key Differences:
- **Direction**: SSE is **unidirectional** (server-to-client only). WebSockets is **bidirectional** (full-duplex client-server communications).
- **Protocol**: SSE uses standard HTTP. WebSockets uses its own handshake and protocol (`ws://` / `wss://`).
- **Reconnection**: SSE automatically handles dropped connections and retries. WebSockets requires custom reconnect logic.
- **Content Type**: SSE is text-only. WebSockets supports binary data transfer.

---

## 14. Explain responsive image tags: `<picture>`, `<img>`, and `srcset`

Modern HTML offers responsive image support to optimize image downloads based on screen resolution and size:

1. **`srcset` and `sizes` (on `<img>` tag)**: Tells the browser the same image exists in different widths (`w`) and resolutions (`x`), letting the browser select the most efficient image.
```html
<img src="small.jpg" srcset="medium.jpg 800w, large.jpg 1200w" sizes="(max-width: 600px) 100vw, 50vw" alt="Example">
```
2. **`<picture>` tag**: Used for art direction or format switching. It contains one or more `<source>` elements and one final fallback `<img>`.
```html
<picture>
  <!-- Serve modern AVIF format if supported -->
  <source srcset="image.avif" type="image/avif">
  <!-- Serve different crop size on mobile -->
  <source srcset="mobile-crop.jpg" media="(max-width: 600px)">
  <img src="fallback-desktop.jpg" alt="Example">
</picture>
```

---

## 15. What is the `contenteditable` attribute and how does it work?

The `contenteditable` attribute is a global attribute that makes any HTML element directly editable by the user in the browser window, turning the element into a rich-text input area.

### Example:
```html
<div contenteditable="true" id="editor">Type text here...</div>
```
In JavaScript, you can capture changes by listening to the `input` event:
```js
const editor = document.getElementById("editor");
editor.addEventListener("input", () => {
  console.log(editor.innerHTML);
});
```
It is widely used to build custom WYSIWYG text editors in modern web applications.

---

## 16. What is Content Security Policy (CSP) and how is it defined in HTML?

Content Security Policy (CSP) is an added layer of security that helps detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks. It instructs the browser on which dynamic resources are allowed to load and execute.

### Defining CSP in HTML:
You can specify a CSP inside a `<meta>` tag in the `<head>` section:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://apis.google.com;">
```

### Key Directives:
- **`default-src`**: Fallback for other directives if they aren't specified.
- **`script-src`**: Restricts the sources of scripts that can be executed.
- **`img-src`**: Restricts image sources.
- **`style-src`**: Restricts stylesheet sources.

---

## 17. Explain the difference between `<canvas>` and SVG rendering

HTML5 supports two mechanisms for rendering interactive graphics in browsers:

| Feature | `<canvas>` | SVG (Scalable Vector Graphics) |
|---|---|---|
| **Type** | Raster-based (pixels). | Vector-based (shapes/XML elements). |
| **DOM Access** | No DOM nodes for child shapes. | Each element is a part of the DOM tree. |
| **Performance** | Fast rendering for thousands of objects (good for games). | Slower for high object count (DOM overhead). |
| **Scalability** | Pixels pixelate when zoomed in. | Scalable to any resolution without quality loss. |
| **Styling/Interaction** | Controlled entirely in JS via pixel coordinates. | Can be styled with CSS and bound with DOM event listeners. |

---

## 18. What is the Page Lifecycle API?

The Page Lifecycle API provides lifecycle hooks indicating the state of the web document.

### Main Lifecycle Events:
1. **`DOMContentLoaded`**: Fired on the `document` when the HTML has been completely parsed, and all script tags without `defer` have executed. It doesn't wait for stylesheets, images, or subframes to load.
2. **`load`**: Fired on the `window` once the HTML, external stylesheets, scripts, images, and frames have fully finished downloading.
3. **`beforeunload`**: Fires on the `window` right before the user navigates away or closes the tab. Can be used to prompt the user to save changes:
```js
window.addEventListener("beforeunload", (e) => {
  e.preventDefault();
  e.returnValue = ""; // Triggers browser exit confirmation dialog
});
```
4. **`unload`**: Fired when the document is being unloaded. It is legacy and generally avoided today because it breaks back/forward caching (bfcache).

---

## 19. How does `window.postMessage` work and how do you secure it?

The `window.postMessage` method safely enables cross-origin communication between `Window` objects (e.g. between a page and an iframe).

### Example:
Sending message:
```js
const iframe = document.getElementById("my-iframe");
iframe.contentWindow.postMessage("Hello Child", "https://trusted-origin.com");
```
Receiving message:
```js
window.addEventListener("message", (event) => {
  // CRITICAL: Always check the sender's origin!
  if (event.origin !== "https://trusted-origin.com") return;
  console.log("Received:", event.data);
});
```

### Security Best Practices:
- **Always specify target origin**: Never use `*` as the target origin in `postMessage` if sending sensitive data.
- **Verify sender origin**: Always validate `event.origin` in the message listener before consuming the payload.

---

## 20. What are HTML5 microdata and rich snippets?

Microdata is an HTML5 specification used to nest semantic metadata within existing content on web pages. Search engines (like Google, Bing) extract this data to display search results with rich enhancements (known as **Rich Snippets**).

### Example using Schema.org:
```html
<div itemscope itemtype="https://schema.org/Product">
  <span itemprop="name">Wireless Headphones</span>
  <span itemprop="brand">AudioTech</span>
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <span itemprop="price">$99.99</span>
  </div>
</div>
```
Common schemas include products, reviews, recipes, articles, and local businesses. It significantly boosts SEO presentation.

---

## 21. What is the difference between client-side and server-side redirects in HTML context?

- **Server-Side Redirect**:
  - The server responds with an HTTP status code (typically `301 Moved Permanently` or `302 Found`) and a `Location` header.
  - The browser redirects before parsing the page.
  - Recommended for SEO as link authority is passed to the new page.
- **Client-Side Redirect**:
  - The browser downloads and parses the HTML first, then redirects via meta refresh tags or JS.
  - **Meta Refresh Tag**: `<meta http-equiv="refresh" content="3; url=https://newsite.com">`.
  - **JavaScript**: `window.location.href = "https://newsite.com"`.
  - Bad for SEO because crawlers must execute JS to discover the redirect.

---

## 22. Explain form validation via native HTML5 constraints

HTML5 provides built-in client-side validation constraints without requiring custom JavaScript validation logic.

### Key Attributes:
- **`required`**: Specifies that the input field must be filled out before submitting.
- **`pattern`**: A regular expression that the input value must match.
- **`type`**: Type constraints (e.g. `type="email"`, `type="url"` automatically validate format).
- **`min` / `max` / `step`**: Bounds checking for numeric and date inputs.

### CSS Selectors:
CSS provides pseudo-classes to style elements dynamically based on validation state:
```css
input:invalid {
  border-color: red;
}
input:valid {
  border-color: green;
}
```

---

## 23. What is the purpose of `rel="noopener noreferrer"` on anchor tags?

When an anchor tag (`<a>`) uses `target="_blank"`, the opened page runs in the same process and gains reference to the originating window via `window.opener`. This represents a security vulnerability (reverse tabnabbing) and performance bottleneck.

- **`noopener`**: Prevents the newly opened page from accessing `window.opener`, opening it in a separate thread.
- **`noreferrer`**: Prevents the browser from sending the originating page's URL in the `Referer` request header when clicking the link (also implies `noopener`).

```html
<a href="https://external-site.com" target="_blank" rel="noopener noreferrer">Visit Site</a>
```

---

## 24. Explain prefetching resources: `dns-prefetch`, `preconnect`, `prefetch`, and `preload`

Resource hints tell the browser to optimize loading speeds by fetching resources or performing lookups in advance:

1. **`dns-prefetch`**: Resolves the domain name (DNS lookup) of an external origin before it's requested.
   ```html
   <link rel="dns-prefetch" href="https://fonts.googleapis.com">
   ```
2. **`preconnect`**: Performs DNS resolution, TCP handshake, and TLS negotiation in advance.
   ```html
   <link rel="preconnect" href="https://assets.cdn.com" crossorigin>
   ```
3. **`prefetch`**: Fetches and caches a low-priority resource that the user is likely to visit next (e.g., the next page in a multi-step form).
   ```html
   <link rel="prefetch" href="/next-page.html">
   ```
4. **`preload`**: Forces the browser to download a high-priority resource required for the current page as early as possible (e.g. hero image, custom web font).
   ```html
   <link rel="preload" href="/hero.jpg" as="image">
   ```

---

## 25. What is the difference between task queues and microtask queues in browser event loops?

The browser's JavaScript engine handles asynchronous operations by placing callbacks into two queues under the Event Loop:

1. **Macro-tasks (Task Queue)**:
   - Exists for operations handled by browser APIs.
   - Examples: `setTimeout`, `setInterval`, network requests (Fetch), UI rendering/paint triggers, postMessage.
   - Only one macro-task is processed per event loop iteration.
2. **Micro-tasks (Microtask Queue)**:
   - Exists for short-lived operations that should execute immediately after the current script finishes and before UI paint.
   - Examples: `Promise` callbacks (`.then`/`.catch`), `MutationObserver`, `queueMicrotask`.
   - The entire microtask queue is flushed (emptied) before moving to the next macro-task or rendering paint cycle.

---

## 26. Explain browser cache control tags inside HTML headers

Caching instructs the browser on how to store static pages to avoid redundant downloads. While primarily set via HTTP response headers, some options can be configured directly inside HTML tags:

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```
- **`no-store`**: Browsers cannot cache any version of the page.
- **`no-cache`**: Browser must validate with the origin server before serving the cached copy (conditional requests).
- **`must-revalidate`**: Forces cache validation once the asset has expired.

---

## 27. What is Web Cryptography API and how does it secure web apps?

The Web Cryptography API provides cryptographic primitives (hashing, signature verification, encryption/decryption) natively in the browser via `window.crypto.subtle`.

### Example (Generating a SHA-256 Hash):
```js
async function hashMessage(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}
```
Unlike custom JS packages, it runs on optimized native browser binaries and secures passwords or checks file integrity.

---

## 28. What are progressive web apps (PWAs) and their manifest.json requirement?

A Progressive Web App (PWA) is a website that uses modern APIs to provide an app-like user experience (offline access, push notifications, homescreen installation).

### The Web App Manifest (`manifest.json`):
An HTML link tag referencing a JSON file that provides information about the application structure to enable installation:
```html
<link rel="manifest" href="/manifest.json">
```
Inside `manifest.json`:
```json
{
  "name": "Interview App",
  "short_name": "PrepApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3178c6",
  "icons": [
    { "src": "/icon.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 29. How do `<audio>` and `<video>` tags support adaptive streaming (HLS/DASH)?

Standard `<video>` tags download static media files (like `.mp4`). However, high-quality media streaming uses adaptive protocols that slice video into small chunks, serving different resolutions based on network bandwidth.

### Protocols:
1. **HLS (HTTP Live Streaming)**: Developed by Apple, uses `.m3u8` playlist files index.
2. **DASH (Dynamic Adaptive Streaming over HTTP)**: Open standard, uses `.mpd` files.

### Media Source Extensions (MSE):
Standard HTML5 video tags do not play HLS/DASH out-of-the-box in all browsers (Safari does, Chrome/Firefox do not). To support it, developers use Media Source Extensions (MSE) to feed sliced binary chunks of video directly into the `<video>` element using libraries like `hls.js` or `shaka-player`.

---

## 30. Explain CORS (Cross-Origin Resource Sharing) in the context of browser fetch requests

CORS is a security mechanism enforced by web browsers to restrict resource sharing across different domains, protocols, or ports.

### How it works:
1. **Pre-flight request (`OPTIONS`)**: For unsafe requests (e.g. POST, PUT with custom headers), the browser sends an automatic request first to verify permissions.
2. **Response Headers**: The server must reply with specific headers:
   - `Access-Control-Allow-Origin`: The domain permitted to read the response (or `*`).
   - `Access-Control-Allow-Methods`: List of allowed methods (GET, POST, etc.).
   - `Access-Control-Allow-Headers`: List of allowed custom HTTP headers.
3. If headers match, the browser performs the actual API request. If not, the request fails with a console error. Only the browser enforces this; server-to-server calls bypass CORS.
