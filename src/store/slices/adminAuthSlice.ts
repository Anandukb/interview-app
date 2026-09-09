import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

export type AdminRole = 'pending' | 'contributor' | 'superadmin' | 'rejected';

// ── State ──────────────────────────────────────────────────────────────────────

interface AdminAuthState {
  isAuthenticated: boolean;
  role: AdminRole | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminAuthState = {
  isAuthenticated: false,
  role: null,
  loading: false,
  error: null,
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const fetchMyRole = async (): Promise<AdminRole | null> => {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase.from('profiles').select('role').eq('id', uid).maybeSingle();
  if (error || !data) return null;
  return (data as { role: AdminRole }).role;
};

// ── Thunks ─────────────────────────────────────────────────────────────────────

/** Called once on app boot — restores session from Supabase (checks existing cookie/token). */
export const initAdminAuth = createAsyncThunk('adminAuth/init', async () => {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { isAuthenticated: false, role: null };
  const role = await fetchMyRole();
  return { isAuthenticated: true, role };
});

export const loginAdmin = createAsyncThunk(
  'adminAuth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return rejectWithValue(error.message);
    const role = await fetchMyRole();
    return { role };
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
        state.isAuthenticated = action.payload.isAuthenticated;
        state.role = action.payload.role;
      })
      // loginAdmin
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.role = action.payload.role;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Login failed.';
      })
      // logoutAdmin
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.role = null;
      });
  },
});

export const { clearAdminAuthError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
