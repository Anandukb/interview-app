import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// ── Local credentials (env-driven, with safe fallbacks) ────────────────────────

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? 'admin@example.com';
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'admin123';
const STORAGE_KEY = 'admin_auth';

const readPersisted = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const writePersisted = (authed: boolean) => {
  try {
    if (authed) localStorage.setItem(STORAGE_KEY, '1');
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore storage errors (private mode, quota, etc.) */
  }
};

// ── State ──────────────────────────────────────────────────────────────────────

interface AdminAuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AdminAuthState = {
  isAuthenticated: false,
  loading: false,
  error: null,
};

// ── Thunks ─────────────────────────────────────────────────────────────────────

/** Called once on app boot — restores admin session from localStorage. */
export const initAdminAuth = createAsyncThunk(
  'adminAuth/init',
  async () => readPersisted()
);

export const loginAdmin = createAsyncThunk(
  'adminAuth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    // Tiny artificial delay so the loading state is visible.
    await new Promise((r) => setTimeout(r, 250));

    const emailMatches = email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();
    const passwordMatches = password === ADMIN_PASSWORD;

    if (!emailMatches || !passwordMatches) {
      return rejectWithValue('Invalid email or password.');
    }

    writePersisted(true);
    return true;
  }
);

export const logoutAdmin = createAsyncThunk(
  'adminAuth/logout',
  async () => {
    writePersisted(false);
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setAdminAuthenticated(state, action: { payload: boolean }) {
      state.isAuthenticated = action.payload;
      writePersisted(action.payload);
      if (!action.payload) state.error = null;
    },
    clearAdminAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // initAdminAuth
      .addCase(initAdminAuth.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload;
      })
      // loginAdmin
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Login failed.';
      })
      // logoutAdmin
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isAuthenticated = false;
      });
  },
});

export const { setAdminAuthenticated, clearAdminAuthError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
