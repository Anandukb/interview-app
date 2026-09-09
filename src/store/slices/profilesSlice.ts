import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { AdminRole } from './adminAuthSlice';

export interface Profile {
  id: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
  role: AdminRole;
  created_at: string | null;
}

const rowToProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  email: row.email ?? '',
  role: row.role,
  createdAt: row.created_at ?? new Date().toISOString(),
});

// ── State ──────────────────────────────────────────────────────────────────────

interface ProfilesState {
  data: Profile[];
  loading: boolean;
  error: string | null;
}

const initialState: ProfilesState = {
  data: [],
  loading: false,
  error: null,
};

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchProfiles = createAsyncThunk(
  'profiles/fetchAll',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return rejectWithValue(error.message);
    return (data as ProfileRow[]).map(rowToProfile);
  }
);

export const updateProfileRole = createAsyncThunk(
  'profiles/updateRole',
  async ({ id, role }: { id: string; role: AdminRole }, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    if (!data) return rejectWithValue(
      'Update affected 0 rows — likely a Row Level Security policy.'
    );
    return rowToProfile(data as ProfileRow);
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    clearProfiles(state) {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Failed to fetch contributors.';
      })
      .addCase(updateProfileRole.fulfilled, (state, action) => {
        const idx = state.data.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.data[idx] = action.payload;
      })
      .addCase(updateProfileRole.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearProfiles } = profilesSlice.actions;
export default profilesSlice.reducer;
