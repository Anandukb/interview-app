import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Platform {
  id: number | string;
  Name: string;
  key: string;
}

interface PlatformsState {
  data: Platform[];
  loading: boolean;
  error: string | null;
}

// ── Initial state ──────────────────────────────────────────────────────────────

const initialState: PlatformsState = {
  data: [],
  loading: false,
  error: null,
};

// ── Async thunk ────────────────────────────────────────────────────────────────

export const fetchPlatforms = createAsyncThunk(
  'platforms/fetchAll',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('Platforms')
      .select('*');

    if (error) {
      return rejectWithValue(error.message);
    }

    return data as Platform[];
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    clearPlatforms: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatforms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlatforms.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPlatforms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string ?? 'Failed to fetch platforms.';
      });
  },
});

export const { clearPlatforms } = platformsSlice.actions;
export default platformsSlice.reducer;
