# React Advanced Theory Questions (Curriculum Gaps)

## 1. Explain React Reconciliation and the Diffing Algorithm

Reconciliation is the process by which React updates the DOM. When state or props change, React creates a new Virtual DOM tree and compares it with the previous one to determine the minimum number of operations needed to update the real DOM.

### Diffing Algorithm Rules:
1. **Different element types**: React tears down the old tree and builds a new one from scratch.
2. **Same element type**: React keeps the same DOM node and only updates the changed attributes.
3. **Keys**: React uses keys to match children between the old and new tree, enabling efficient reordering.

### Heuristics (O(n) complexity):
- Two elements of different types produce different trees
- Developer provides `key` prop to hint which children are stable across renders

```jsx
// Without keys — React re-renders all items on reorder
<ul>
  {items.map(item => <li>{item.name}</li>)}
</ul>

// With keys — React efficiently reorders without re-creating DOM nodes
<ul>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>

// Bad key usage (index as key) — causes bugs with reorderable lists
{items.map((item, index) => <li key={index}>{item.name}</li>)}
```

---

## 2. What is React Fiber Architecture?

React Fiber is the reimplementation of React's core reconciliation algorithm (introduced in React 16). It enables incremental rendering — the ability to split rendering work into chunks and spread it out over multiple frames.

### Key Concepts:
- **Fiber**: A unit of work. Each React element has a corresponding fiber node that holds component state, props, and the work to be done.
- **Work Loop**: Fiber processes units of work one at a time, checking if it should yield to the browser between units.
- **Priority Levels**: Different updates have different priorities (user input > data fetch > offscreen rendering).

### Benefits:
1. **Interruptible rendering**: Can pause and resume work
2. **Priority-based updates**: Urgent updates (typing) don't wait for slow updates (loading data)
3. **Concurrent features**: Enables Suspense, Transitions, and automatic batching

```jsx
// Before Fiber: Synchronous, blocking reconciliation
// All updates processed in one go — large updates block the main thread

// After Fiber: Can prioritize urgent updates
import { useTransition } from 'react';

function SearchResults() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  function handleChange(e) {
    setQuery(e.target.value); // High priority — immediate update
    startTransition(() => {
      setResults(filterItems(e.target.value)); // Low priority — can be interrupted
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <List items={results} />}
    </>
  );
}
```

---

## 3. Explain Concurrent Rendering in React

Concurrent Rendering (React 18+) allows React to prepare multiple versions of the UI simultaneously. It can interrupt, pause, or abandon renders based on priority without blocking the browser.

### Key Features:
- **Automatic Batching**: Multiple state updates in any context are batched into one render
- **Transitions**: Mark updates as non-urgent so they don't block user input
- **Suspense improvements**: Better loading state handling
- **useDeferredValue**: Defer re-rendering of non-critical parts

```jsx
// Automatic Batching (React 18+)
// Before: only batched in event handlers
// Now: batched everywhere
setTimeout(() => {
  setCount(c => c + 1); // These are batched
  setFlag(f => !f);     // Only one re-render
}, 1000);

// useDeferredValue — keeps showing stale content while new content loads
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      <ExpensiveList query={deferredQuery} />
    </div>
  );
}
```

---

## 4. Explain Suspense and Lazy Loading in React

Suspense lets you declaratively specify a loading state for a part of the component tree while it's waiting for asynchronous data or lazy-loaded components.

### Lazy Loading Components:
```jsx
import { lazy, Suspense } from 'react';

// Dynamic import — component code is split into a separate bundle
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### Code Splitting Benefits:
1. Smaller initial bundle size
2. Faster initial page load
3. Load code only when needed
4. Better user experience with progressive loading

### Suspense for Data Fetching (React 18+):
```jsx
// With a Suspense-enabled library (like React Query, Relay, Next.js)
function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileDetails />
      <Suspense fallback={<PostsSkeleton />}>
        <ProfilePosts />
      </Suspense>
    </Suspense>
  );
}
```

---

## 5. What are Error Boundaries in React?

Error Boundaries are React components that catch JavaScript errors in their child component tree, log the error, and display a fallback UI instead of crashing the entire application.

### Key Rules:
- Must be class components (no hook equivalent yet)
- Catch errors during rendering, lifecycle methods, and constructors
- Do NOT catch errors in: event handlers, async code, SSR, or errors in the boundary itself

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    logErrorToService(error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Header />
      <ErrorBoundary fallback={<p>Failed to load content</p>}>
        <MainContent />
      </ErrorBoundary>
      <Footer />
    </ErrorBoundary>
  );
}
```

---

## 6. What are React Portals and when should you use them?

Portals provide a way to render children into a DOM node that exists outside the parent component's DOM hierarchy, while preserving the React event bubbling behavior.

```jsx
import { createPortal } from 'react-dom';

function Modal({ children, isOpen, onClose }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root') // renders outside #app root
  );
}

// Usage in deeply nested component
function DeepChild() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button onClick={() => setShowModal(true)}>Open</button>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2>I render at document body level!</h2>
      </Modal>
    </>
  );
}
```

### Use Cases:
1. Modals and dialogs
2. Tooltips and popovers
3. Floating menus
4. Notifications/toasts
5. Any UI that needs to break out of `overflow: hidden` containers

---

## 7. Explain Higher Order Components (HOC) pattern

A Higher Order Component is a function that takes a component and returns a new component with enhanced functionality. It's a pattern for reusing component logic.

```jsx
// HOC that adds authentication check
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    return <WrappedComponent {...props} />;
  };
}

// HOC that adds loading state
function withLoading(WrappedComponent) {
  return function LoadingComponent({ isLoading, ...props }) {
    if (isLoading) return <Spinner />;
    return <WrappedComponent {...props} />;
  };
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);
const UserListWithLoading = withLoading(UserList);

// Composition
const EnhancedDashboard = withAuth(withLoading(Dashboard));
```

### Modern Alternatives:
Custom hooks have largely replaced HOCs because they avoid wrapper hell, are easier to type with TypeScript, and don't obscure component hierarchy in DevTools.

---

## 8. Explain the Render Props pattern

Render Props is a pattern where a component receives a function as a prop (or children) that returns React elements, allowing the component to share its internal state/logic with the calling component.

```jsx
// Render prop component for mouse tracking
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return render(position);
}

// Usage
function App() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <div>Mouse is at ({x}, {y})</div>
      )}
    />
  );
}

// Children as render prop (more common)
function DataFetcher({ url, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url).then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [url]);

  return children({ data, loading });
}

// Usage
<DataFetcher url="/api/users">
  {({ data, loading }) => loading ? <Spinner /> : <UserList users={data} />}
</DataFetcher>
```

---

## 9. What is the Compound Components pattern?

Compound Components is a pattern where multiple components work together to form a complete UI, sharing implicit state through Context. The parent manages the state, and children render specific parts.

```jsx
// Compound component: Tabs
const TabsContext = createContext();

function Tabs({ children, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list" role="tablist">{children}</div>;
}

function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      role="tab"
      aria-selected={activeTab === value}
      className={activeTab === value ? 'active' : ''}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div role="tabpanel">{children}</div>;
}

// Attach sub-components
Tabs.TabList = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// Usage — clean, declarative API
<Tabs defaultTab="profile">
  <Tabs.TabList>
    <Tabs.Tab value="profile">Profile</Tabs.Tab>
    <Tabs.Tab value="settings">Settings</Tabs.Tab>
  </Tabs.TabList>
  <Tabs.Panel value="profile"><ProfileContent /></Tabs.Panel>
  <Tabs.Panel value="settings"><SettingsContent /></Tabs.Panel>
</Tabs>
```

---

## 10. What is Context Performance and how do you optimize it?

React Context re-renders ALL consumers when the context value changes, even if they only use a small portion of the context. This can cause performance issues.

### Problem:
```jsx
// Bad: Single large context causes unnecessary re-renders
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);

  // Every consumer re-renders when ANY value changes
  return (
    <AppContext.Provider value={{ user, theme, notifications, setUser, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}
```

### Solutions:

**1. Split contexts by update frequency:**
```jsx
const UserContext = createContext();
const ThemeContext = createContext();
const NotificationContext = createContext();
```

**2. Separate state from dispatch:**
```jsx
const StateContext = createContext();
const DispatchContext = createContext();

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>
        {children}
      </StateContext.Provider>
    </DispatchContext.Provider>
  );
}
```

**3. Memoize context value:**
```jsx
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

**4. Use `useMemo` in consumers:**
```jsx
function ExpensiveChild() {
  const { theme } = useContext(ThemeContext);
  return useMemo(() => <HeavyComponent theme={theme} />, [theme]);
}
```

---

## 11. Explain React Performance Optimization techniques

### 1. React.memo — Prevent unnecessary re-renders:
```jsx
const ExpensiveList = React.memo(function ExpensiveList({ items, onSelect }) {
  return items.map(item => <Item key={item.id} item={item} onSelect={onSelect} />);
}, (prevProps, nextProps) => {
  // Custom comparison (optional)
  return prevProps.items === nextProps.items;
});
```

### 2. useMemo — Cache expensive calculations:
```jsx
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

### 3. useCallback — Stable function references:
```jsx
const handleClick = useCallback((id) => {
  setSelected(id);
}, []); // stable reference for memoized children
```

### 4. Virtualization — Render only visible items:
```jsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div key={virtualRow.key} style={{
            position: 'absolute',
            top: virtualRow.start,
            height: virtualRow.size,
          }}>
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5. Avoid inline objects/arrays in JSX:
```jsx
// Bad — new object every render
<Component style={{ color: 'red' }} data={[1, 2, 3]} />

// Good — stable references
const style = useMemo(() => ({ color: 'red' }), []);
const data = useMemo(() => [1, 2, 3], []);
<Component style={style} data={data} />
```

---

## 12. Explain useReducer hook and when to use it over useState

`useReducer` is preferred when:
- State logic is complex (multiple sub-values)
- Next state depends on previous state
- State transitions follow predictable patterns
- You want to centralize state logic

```jsx
// Complex form state with useReducer
const initialState = {
  values: { email: '', password: '' },
  errors: {},
  isSubmitting: false,
  isValid: false,
};

function formReducer(state, action) {
  switch (action.type) {
    case 'FIELD_CHANGE':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: '' },
      };
    case 'VALIDATE':
      return { ...state, errors: action.errors, isValid: Object.keys(action.errors).length === 0 };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true };
    case 'SUBMIT_SUCCESS':
      return { ...initialState };
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, errors: { form: action.error } };
    default:
      return state;
  }
}

function LoginForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const handleChange = (e) => {
    dispatch({ type: 'FIELD_CHANGE', field: e.target.name, value: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT_START' });
    try {
      await loginAPI(state.values);
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (err) {
      dispatch({ type: 'SUBMIT_ERROR', error: err.message });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 13. Explain useImperativeHandle and forwardRef

`forwardRef` allows a parent component to access a child's DOM node or instance methods. `useImperativeHandle` customizes what the parent can access through that ref.

```jsx
import { forwardRef, useImperativeHandle, useRef } from 'react';

const CustomInput = forwardRef(function CustomInput({ label, ...props }, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    // Only expose these methods to parent
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ''; },
    getValue: () => inputRef.current.value,
    scrollIntoView: () => inputRef.current.scrollIntoView({ behavior: 'smooth' }),
  }), []);

  return (
    <label>
      {label}
      <input ref={inputRef} {...props} />
    </label>
  );
});

// Parent usage
function Form() {
  const inputRef = useRef(null);

  return (
    <>
      <CustomInput ref={inputRef} label="Email" />
      <button onClick={() => inputRef.current.focus()}>Focus Input</button>
      <button onClick={() => inputRef.current.clear()}>Clear</button>
    </>
  );
}
```

---

## 14. React Router — Core Concepts

React Router provides client-side routing for React applications, enabling navigation without full page reloads.

### Setup and Basic Routes:
```jsx
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="users" element={<Users />}>
            <Route path=":userId" element={<UserProfile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Layout with Outlet for nested routes
function Layout() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Outlet /> {/* Child routes render here */}
    </div>
  );
}
```

### Dynamic Routes and Params:
```jsx
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams(); // from :userId in path
  const [searchParams] = useSearchParams(); // ?tab=posts
  const navigate = useNavigate();
  const location = useLocation(); // { pathname, search, hash, state }

  return (
    <div>
      <h1>User {userId}</h1>
      <p>Tab: {searchParams.get('tab')}</p>
      <button onClick={() => navigate('/users', { replace: true })}>
        Back to Users
      </button>
    </div>
  );
}
```

### Protected Routes:
```jsx
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## 15. Explain Custom Hooks in React

Custom hooks are functions that start with "use" and can call other hooks. They extract reusable stateful logic from components.

```jsx
// useLocalStorage — persist state to localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue];
}

// useDebounce — debounce a value
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// useFetch — data fetching with loading and error states
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') setError(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

// Usage
function UserList() {
  const { data: users, loading, error } = useFetch('/api/users');
  const [search, setSearch] = useLocalStorage('userSearch', '');
  const debouncedSearch = useDebounce(search, 300);
  // ...
}
```

---

