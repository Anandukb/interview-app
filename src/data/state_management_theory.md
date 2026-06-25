# State Management & Authentication Theory Questions

## 1. Explain Redux Toolkit and how it simplifies Redux

Redux Toolkit (RTK) is the official, recommended way to write Redux logic. It provides utilities that simplify store setup, reducer creation, and immutable update logic.

### Key APIs:
```js
// store.js — configureStore replaces createStore
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
  },
  // Middleware (thunk included by default), devtools auto-enabled
});

// counterSlice.js — createSlice replaces action types + action creators + reducer
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0, history: [] },
  reducers: {
    increment(state) {
      state.value += 1; // Immer allows "mutating" syntax
    },
    decrement(state) {
      state.value -= 1;
    },
    incrementByAmount(state, action) {
      state.value += action.payload;
      state.history.push(action.payload);
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
```

### Async Logic with createAsyncThunk:
```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed');
      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
```

---

## 2. What is Redux Middleware and how does it work?

Middleware in Redux provides a third-party extension point between dispatching an action and the moment it reaches the reducer. It's used for logging, async operations, crash reporting, etc.

### How Middleware Works:
```
dispatch(action) → Middleware 1 → Middleware 2 → ... → Reducer → New State
```

### Custom Middleware:
```js
// Logger middleware
const loggerMiddleware = (store) => (next) => (action) => {
  console.log('Dispatching:', action.type);
  console.log('Prev state:', store.getState());
  const result = next(action); // Pass to next middleware/reducer
  console.log('Next state:', store.getState());
  return result;
};

// API middleware
const apiMiddleware = (store) => (next) => (action) => {
  if (action.type !== 'api/call') return next(action);

  const { url, method, onSuccess, onError } = action.payload;
  fetch(url, { method })
    .then(res => res.json())
    .then(data => store.dispatch({ type: onSuccess, payload: data }))
    .catch(err => store.dispatch({ type: onError, payload: err.message }));
};

// Adding middleware in RTK
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggerMiddleware, apiMiddleware),
});
```

---

## 3. What is Zustand and how does it compare to Redux?

Zustand is a minimalist state management library for React. It's simpler than Redux, requires less boilerplate, and doesn't need providers or context.

```js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Create a store (no provider needed!)
const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        count: 0,
        users: [],
        loading: false,

        // Actions (directly mutate with set)
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),

        // Async actions
        fetchUsers: async () => {
          set({ loading: true });
          const res = await fetch('/api/users');
          const users = await res.json();
          set({ users, loading: false });
        },

        // Computed values using get()
        getDoubleCount: () => get().count * 2,
      }),
      { name: 'app-storage' } // persist to localStorage
    )
  )
);

// Usage in components — subscribe to specific slices
function Counter() {
  const count = useStore((state) => state.count); // only re-renders when count changes
  const increment = useStore((state) => state.increment);
  return <button onClick={increment}>{count}</button>;
}
```

### Zustand vs Redux:
| Feature | Redux Toolkit | Zustand |
|---------|--------------|---------|
| Boilerplate | Medium | Minimal |
| Provider required | Yes | No |
| DevTools | Yes | Yes (middleware) |
| Middleware | Built-in | Middleware pattern |
| Bundle size | ~11KB | ~1KB |
| Best for | Large apps, teams | Small-medium apps |

---

## 4. Explain TanStack Query (React Query) — Core Concepts

TanStack Query manages server state (data fetched from APIs) separately from client state. It handles caching, background refetching, stale data, pagination, and more.

### Basic Query:
```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function UserList() {
  const { data, isLoading, error, isStale } = useQuery({
    queryKey: ['users'], // unique cache key
    queryFn: () => fetch('/api/users').then(r => r.json()),
    staleTime: 5 * 60 * 1000, // data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // cached for 30 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <List items={data} />;
}
```

### Mutations with Optimistic Updates:
```jsx
function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedUser) =>
      fetch(`/api/users/${updatedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedUser),
      }).then(r => r.json()),

    // Optimistic update
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previousUsers = queryClient.getQueryData(['users']);
      queryClient.setQueryData(['users'], (old) =>
        old.map(u => u.id === newUser.id ? newUser : u)
      );
      return { previousUsers }; // context for rollback
    },
    onError: (err, newUser, context) => {
      queryClient.setQueryData(['users'], context.previousUsers); // rollback
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] }); // refetch
    },
  });
}
```

### Infinite Query (Pagination):
```jsx
function InfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) =>
      fetch(`/api/posts?page=${pageParam}`).then(r => r.json()),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

  return (
    <div>
      {data?.pages.map(page =>
        page.items.map(post => <PostCard key={post.id} post={post} />)
      )}
      <button onClick={fetchNextPage} disabled={!hasNextPage || isFetchingNextPage}>
        {isFetchingNextPage ? 'Loading...' : hasNextPage ? 'Load More' : 'No more'}
      </button>
    </div>
  );
}
```

---

## 5. Explain JWT Authentication Flow

JSON Web Token (JWT) is a standard for securely transmitting information between parties as a JSON object. It's commonly used for stateless authentication.

### JWT Structure:
```
Header.Payload.Signature
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsImV4cCI6MTY5MH0.signature_here
```

- **Header**: Algorithm and token type
- **Payload**: Claims (userId, role, exp, iat)
- **Signature**: HMAC(header + payload, secret)

### Authentication Flow:
```
1. User → POST /login (email, password) → Server
2. Server validates credentials → Generates Access Token + Refresh Token
3. Server → Returns tokens to client
4. Client stores tokens (httpOnly cookie or memory)
5. Client → API Request + Authorization: Bearer <access_token>
6. Server validates token → Returns protected data
7. When access token expires → Client uses refresh token to get new access token
```

### Implementation:
```jsx
// Auth context with token management
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // for httpOnly refresh token cookie
    });
    const data = await res.json();
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const refreshAccessToken = async () => {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // sends refresh token cookie
    });
    if (res.ok) {
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    }
    logout(); // refresh failed — force re-login
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 6. Explain Access Token vs Refresh Token

### Access Token:
- Short-lived (15 min — 1 hour)
- Sent with every API request
- Contains user claims (id, role, permissions)
- Stored in memory (most secure) or localStorage
- If compromised, limited damage window

### Refresh Token:
- Long-lived (7 days — 30 days)
- Only sent to the refresh endpoint
- Stored in httpOnly, secure cookie (not accessible via JS)
- Used to obtain new access tokens without re-login
- Can be revoked server-side (stored in DB)

### Token Refresh with Axios Interceptor:
```js
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = getAccessToken(); // from memory/store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle token expiry
let isRefreshing = false;
let failedQueue = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        failedQueue.forEach(({ resolve }) => resolve(newToken));
        failedQueue = [];
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        failedQueue.forEach(({ reject }) => reject(err));
        failedQueue = [];
        logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 7. Explain OAuth 2.0 Authentication

OAuth 2.0 is an authorization framework that allows third-party applications to access user resources without exposing their credentials.

### Authorization Code Flow (most secure for web apps):
```
1. User clicks "Login with Google"
2. App redirects to Google's authorization server:
   GET https://accounts.google.com/o/oauth2/auth?
     client_id=YOUR_ID&
     redirect_uri=http://localhost:3000/callback&
     response_type=code&
     scope=email profile&
     state=random_csrf_token

3. User grants permission on Google's consent screen
4. Google redirects back with authorization code:
   GET http://localhost:3000/callback?code=AUTH_CODE&state=random_csrf_token

5. Your server exchanges code for tokens:
   POST https://oauth2.googleapis.com/token
   { code, client_id, client_secret, redirect_uri, grant_type: 'authorization_code' }

6. Google returns access_token + refresh_token + id_token
7. Your server creates a session/JWT for the user
```

### Role-Based Access Control (RBAC):
```jsx
// Route-level protection
function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/unauthorized" />;
  
  return children;
}

// Usage
<Route path="/admin" element={
  <RoleRoute roles={['admin', 'superadmin']}>
    <AdminDashboard />
  </RoleRoute>
} />

// Component-level protection
function usePermission(permission) {
  const { user } = useAuth();
  return user?.permissions?.includes(permission) ?? false;
}

function DeleteButton({ onDelete }) {
  const canDelete = usePermission('posts:delete');
  if (!canDelete) return null;
  return <button onClick={onDelete}>Delete</button>;
}
```

---

## 8. Explain Cookie, localStorage, and sessionStorage for token storage

### Comparison:
| Feature | Cookie | localStorage | sessionStorage |
|---------|--------|--------------|----------------|
| Capacity | ~4KB | ~5-10MB | ~5-10MB |
| Expiration | Custom (Expires/Max-Age) | Never (manual) | Tab close |
| Sent with requests | Yes (automatic) | No (manual) | No (manual) |
| JS accessible | If not httpOnly | Yes | Yes |
| XSS vulnerable | No (httpOnly) | Yes | Yes |
| CSRF vulnerable | Yes | No | No |

### Best Practice for Token Storage:
```js
// BEST: Access token in memory, refresh token in httpOnly cookie
// This prevents both XSS and CSRF attacks on the refresh token

// In-memory token storage (not accessible to XSS)
let accessToken = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;

// On page refresh, silently refresh using the httpOnly cookie
async function silentRefresh() {
  const res = await fetch('/api/auth/refresh', { credentials: 'include' });
  if (res.ok) {
    const { accessToken } = await res.json();
    setAccessToken(accessToken);
  }
}

// Call on app mount
useEffect(() => { silentRefresh(); }, []);
```

---

## 9. Explain API Integration patterns with Axios

### Axios Instance with Configuration:
```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => response.data, // unwrap data
  async (error) => {
    const config = error.config;
    
    // Retry on network errors (max 3 times)
    if (!error.response && config._retryCount < 3) {
      config._retryCount = (config._retryCount || 0) + 1;
      await new Promise(r => setTimeout(r, 1000 * config._retryCount));
      return api(config);
    }
    
    // Format error for UI
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);
```

### File Upload with Progress:
```jsx
function useFileUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const upload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      });
      return response;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return { upload, progress, uploading };
}
```

### Debounced Search with AbortController:
```jsx
function useSearchAPI() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(null);

  const search = useMemo(
    () => debounce(async (query) => {
      if (!query.trim()) { setResults([]); return; }

      // Cancel previous request
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();

      setLoading(true);
      try {
        const data = await api.get('/search', {
          params: { q: query },
          signal: controllerRef.current.signal,
        });
        setResults(data.items);
      } catch (err) {
        if (err.name !== 'CanceledError') console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  return { search, results, loading };
}
```

---

## 10. Explain React Project Architecture and Folder Structure

### Feature-Based Architecture:
```
src/
├── app/                    # App-wide setup
│   ├── App.tsx
│   ├── store.ts           # Redux/Zustand store
│   ├── router.tsx         # Route definitions
│   └── providers.tsx      # Context providers wrapper
├── features/              # Feature modules (domain-driven)
│   ├── auth/
│   │   ├── components/    # Feature-specific components
│   │   ├── hooks/         # Feature-specific hooks
│   │   ├── services/      # API calls for this feature
│   │   ├── store/         # Feature slice/store
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Public API (barrel export)
│   ├── users/
│   └── products/
├── shared/                # Shared across features
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Primitives (Button, Input, Modal)
│   │   └── layout/       # Layout components
│   ├── hooks/            # Shared custom hooks
│   ├── services/         # API client, utilities
│   ├── types/            # Global types
│   └── utils/            # Helper functions
├── config/               # Environment configs
└── assets/               # Static files
```

### API Layer Pattern:
```js
// services/api.ts — base axios instance
// services/auth.service.ts
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};

// services/users.service.ts
export const usersService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
```

---

## 11. Explain Testing in React — Unit, Integration, and Component Testing

### Testing Pyramid:
- **Unit Tests**: Individual functions, hooks, utilities (fast, many)
- **Integration Tests**: Component interactions, API calls (medium)
- **E2E Tests**: Full user flows in browser (slow, few)

### Component Testing with React Testing Library:
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits with email and password', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
  });

  it('shows validation error for empty fields', async () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### Mocking API calls:
```jsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays users from API', async () => {
  render(<UserList />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });
});
```

### Testing Custom Hooks:
```jsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

test('useCounter increments and decrements', () => {
  const { result } = renderHook(() => useCounter(0));

  act(() => result.current.increment());
  expect(result.current.count).toBe(1);

  act(() => result.current.decrement());
  expect(result.current.count).toBe(0);
});
```

---

## 12. Explain Production-Level React — Performance Profiling and Bundle Analysis

### React DevTools Profiler:
- Records renders and identifies which components re-render and why
- Shows "flame chart" of component render times
- Highlights components that rendered unnecessarily

### Bundle Analysis:
```bash
# Vite
npx vite-bundle-visualizer

# Webpack
npx webpack-bundle-analyzer stats.json
```

### Performance Checklist:
1. **Code splitting** — `React.lazy()` for route-level splitting
2. **Tree shaking** — Import only what you need: `import { debounce } from 'lodash-es'`
3. **Image optimization** — WebP format, lazy loading, responsive sizes
4. **Memoization** — `React.memo`, `useMemo`, `useCallback` where measured necessary
5. **Virtualization** — For long lists (react-virtual, react-window)
6. **Avoid large dependencies** — Use lighter alternatives (date-fns vs moment)
7. **Preload critical resources** — `<link rel="preload">`
8. **Service Worker** — Cache assets for repeat visits

### Lighthouse Metrics:
- **LCP (Largest Contentful Paint)**: < 2.5s — when main content is visible
- **FID (First Input Delay)**: < 100ms — time to respond to first interaction
- **CLS (Cumulative Layout Shift)**: < 0.1 — visual stability
- **INP (Interaction to Next Paint)**: < 200ms — responsiveness

### CI/CD for React:
```yaml
# GitHub Actions example
name: CI
on: [push, pull_request]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test -- --run
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

---

