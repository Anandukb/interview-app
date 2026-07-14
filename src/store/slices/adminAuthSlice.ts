import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

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

/** Called once on app boot — restores session from Supabase (checks existing cookie/token). */
export const initAdminAuth = createAsyncThunk('adminAuth/init', async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
});

export const loginAdmin = createAsyncThunk(
  'adminAuth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return rejectWithValue(error.message);
    return true;
  }
);

export const logoutAdmin = createAsyncThunk('adminAuth/logout', async () => {
  await supabase.auth.signOut();
});

// ── Slice ──────────────────────────────────────────────────────────────────────

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
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

export const { clearAdminAuthError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
