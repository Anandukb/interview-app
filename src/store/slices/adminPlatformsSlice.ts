import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { AdminPlatform } from '../../admin/types';

// ── Supabase row → AdminPlatform ───────────────────────────────────────────────

interface SupabasePlatformRow {
  id: number | string;
  Name: string;
  key: string;
  description?: string | null;
  color?: string | null;
  created_at?: string | null;
}

function rowToAdminPlatform(row: SupabasePlatformRow): AdminPlatform {
  return {
    id: String(row.id),
    name: row.Name,
    key: row.key,
    description: row.description ?? '',
    color: row.color ?? '#8b5cf6',
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

// ── State ──────────────────────────────────────────────────────────────────────

interface AdminPlatformsState {
  data: AdminPlatform[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminPlatformsState = {
  data: [],
  loading: false,
  error: null,
};

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchAdminPlatforms = createAsyncThunk(
  'adminPlatforms/fetchAll',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('Platforms')
      .select('*')
      .order('id', { ascending: true });

    if (error) return rejectWithValue(error.message);
    return (data as SupabasePlatformRow[]).map(rowToAdminPlatform);
  }
);

export const addAdminPlatform = createAsyncThunk(
  'adminPlatforms/add',
  async (p: Omit<AdminPlatform, 'id' | 'createdAt'>, { rejectWithValue }) => {
    const insert: Record<string, unknown> = { Name: p.name, key: p.key };
    if (p.description) insert.description = p.description;
    if (p.color)       insert.color       = p.color;

    const { data, error } = await supabase
      .from('Platforms')
      .insert(insert)
      .select()
      .single();

    if (error) return rejectWithValue(error.message);
    return rowToAdminPlatform(data as SupabasePlatformRow);
  }
);

export const updateAdminPlatform = createAsyncThunk(
  'adminPlatforms/update',
  async (
    { id, patch }: { id: string; patch: Partial<AdminPlatform> },
    { rejectWithValue }
  ) => {
    const update: Record<string, unknown> = {};
    if (patch.name        !== undefined) update.Name        = patch.name;
    if (patch.key         !== undefined) update.key         = patch.key;
    if (patch.description !== undefined) update.description = patch.description;
    if (patch.color       !== undefined) update.color       = patch.color;

    const { data, error } = await supabase
      .from('Platforms')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) return rejectWithValue(error.message);
    return rowToAdminPlatform(data as SupabasePlatformRow);
  }
);

export const deleteAdminPlatform = createAsyncThunk(
  'adminPlatforms/delete',
  async (id: string, { rejectWithValue }) => {
    const { error } = await supabase.from('Platforms').delete().eq('id', id);
    if (error) return rejectWithValue(error.message);
    return id;
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const adminPlatformsSlice = createSlice({
  name: 'adminPlatforms',
  initialState,
  reducers: {
    clearAdminPlatforms(state) {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAdminPlatforms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminPlatforms.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAdminPlatforms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string ?? 'Failed to fetch platforms.';
      })
      // add
      .addCase(addAdminPlatform.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(addAdminPlatform.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // update
      .addCase(updateAdminPlatform.fulfilled, (state, action) => {
        const idx = state.data.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.data[idx] = action.payload;
      })
      .addCase(updateAdminPlatform.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // delete
      .addCase(deleteAdminPlatform.fulfilled, (state, action) => {
        state.data = state.data.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteAdminPlatform.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminPlatforms } = adminPlatformsSlice.actions;
export default adminPlatformsSlice.reducer;
