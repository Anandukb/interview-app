import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { QuestionType } from '../../admin/types';

// ── Supabase row → QuestionType ────────────────────────────────────────────────

const TABLE = 'Questions Types';

interface QuestionTypeRow {
  id: number | string;
  name: string;
}

const rowToQuestionType = (row: QuestionTypeRow): QuestionType => ({
  id: String(row.id),
  name: row.name,
});

// ── State ──────────────────────────────────────────────────────────────────────

interface AdminQuestionTypesState {
  data: QuestionType[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminQuestionTypesState = {
  data: [],
  loading: false,
  error: null,
};

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchAdminQuestionTypes = createAsyncThunk(
  'adminQuestionTypes/fetchAll',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('id', { ascending: true });

    if (error) return rejectWithValue(error.message);
    return (data as QuestionTypeRow[]).map(rowToQuestionType);
  }
);

export const addAdminQuestionType = createAsyncThunk(
  'adminQuestionTypes/add',
  async (qt: Omit<QuestionType, 'id'>, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ name: qt.name })
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    if (!data) return rejectWithValue(
      'Insert returned no row — likely a Row Level Security policy. Check Supabase RLS for the Questions Types table.'
    );
    return rowToQuestionType(data as QuestionTypeRow);
  }
);

export const updateAdminQuestionType = createAsyncThunk(
  'adminQuestionTypes/update',
  async (
    { id, patch }: { id: string; patch: Partial<QuestionType> },
    { rejectWithValue }
  ) => {
    const update: Record<string, unknown> = {};
    if (patch.name !== undefined) update.name = patch.name;

    const { data, error } = await supabase
      .from(TABLE)
      .update(update)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    if (!data) return rejectWithValue(
      'Update affected 0 rows — likely a Row Level Security policy. Check Supabase RLS for the Questions Types table.'
    );
    return rowToQuestionType(data as QuestionTypeRow);
  }
);

export const deleteAdminQuestionType = createAsyncThunk(
  'adminQuestionTypes/delete',
  async (id: string, { rejectWithValue }) => {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) return rejectWithValue(error.message);
    return id;
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const adminQuestionTypesSlice = createSlice({
  name: 'adminQuestionTypes',
  initialState,
  reducers: {
    clearAdminQuestionTypes(state) {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAdminQuestionTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminQuestionTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAdminQuestionTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Failed to fetch question types.';
      })
      // add
      .addCase(addAdminQuestionType.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(addAdminQuestionType.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // update
      .addCase(updateAdminQuestionType.fulfilled, (state, action) => {
        const idx = state.data.findIndex((qt) => qt.id === action.payload.id);
        if (idx !== -1) state.data[idx] = action.payload;
      })
      .addCase(updateAdminQuestionType.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // delete
      .addCase(deleteAdminQuestionType.fulfilled, (state, action) => {
        state.data = state.data.filter((qt) => qt.id !== action.payload);
      })
      .addCase(deleteAdminQuestionType.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminQuestionTypes } = adminQuestionTypesSlice.actions;
export default adminQuestionTypesSlice.reducer;
