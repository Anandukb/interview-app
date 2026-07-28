import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { AdminQuestion, MCOption } from '../../admin/types';
import {
  QUESTIONS_TABLE as TABLE,
  rowToQuestion,
  questionToInsertRow,
  type QuestionRow,
} from '../../lib/questions';

// Re-export so pages can import option type from here.
export type { MCOption };

// ── State ─────────────────────────────────────────────────────────────────────

interface AdminQuestionsState {
  data: AdminQuestion[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminQuestionsState = {
  data: [],
  loading: false,
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchAdminQuestions = createAsyncThunk(
  'adminQuestions/fetchAll',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('id', { ascending: false });

    if (error) return rejectWithValue(error.message);
    return (data as QuestionRow[]).map(rowToQuestion);
  }
);

export const addAdminQuestion = createAsyncThunk(
  'adminQuestions/add',
  async (q: Omit<AdminQuestion, 'id' | 'createdAt'>, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(questionToInsertRow(q))
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    if (!data) return rejectWithValue(
      'Insert returned no row — likely a Row Level Security policy. Check Supabase RLS for the Quesitons table.'
    );
    return rowToQuestion(data as QuestionRow);
  }
);

export const updateAdminQuestion = createAsyncThunk(
  'adminQuestions/update',
  async (
    { id, patch }: { id: string; patch: Omit<AdminQuestion, 'id' | 'createdAt'> },
    { rejectWithValue }
  ) => {
    const { data, error } = await supabase
      .from(TABLE)
      .update(questionToInsertRow(patch))
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    if (!data) return rejectWithValue(
      'Update affected 0 rows — likely a Row Level Security policy. Check Supabase RLS for the Quesitons table.'
    );
    return rowToQuestion(data as QuestionRow);
  }
);

export const deleteAdminQuestion = createAsyncThunk(
  'adminQuestions/delete',
  async (id: string, { rejectWithValue }) => {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) return rejectWithValue(error.message);
    return id;
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const adminQuestionsSlice = createSlice({
  name: 'adminQuestions',
  initialState,
  reducers: {
    clearAdminQuestions(state) {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAdminQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAdminQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Failed to fetch questions.';
      })
      // add
      .addCase(addAdminQuestion.fulfilled, (state, action) => {
        state.data.unshift(action.payload);
      })
      .addCase(addAdminQuestion.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // update
      .addCase(updateAdminQuestion.fulfilled, (state, action) => {
        const idx = state.data.findIndex((q) => q.id === action.payload.id);
        if (idx !== -1) state.data[idx] = action.payload;
      })
      .addCase(updateAdminQuestion.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // delete
      .addCase(deleteAdminQuestion.fulfilled, (state, action) => {
        state.data = state.data.filter((q) => q.id !== action.payload);
      })
      .addCase(deleteAdminQuestion.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminQuestions } = adminQuestionsSlice.actions;
export default adminQuestionsSlice.reducer;
