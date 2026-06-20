import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { AdminQuestion, MCOption, Difficulty } from '../../admin/types';

// Re-export so pages can import option type from here.
export type { MCOption };

const TABLE = 'Quesitons'; // (DB table name has a typo — keeping as-is)

// ── Row shapes ────────────────────────────────────────────────────────────────

interface PersistedOption {
  id: string;
  label: string;
}

interface QuestionRow {
  id: number | string;
  title: string | null;
  questions: string | null;
  answer: string | null;
  code: string | null;
  options: PersistedOption[] | null;
  correct_answers: string[] | null;
  expected_output: string | null;
  hint: string | null;
  difficulty: string | null;
  platform_id: number | string | null;
  question_type_id: number | string | null;
  tags: string | null;
  created_at: string | null;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

const isDifficulty = (v: string | null): v is Difficulty =>
  v === 'easy' || v === 'medium' || v === 'hard' || v === '' || v === null;

const rowToQuestion = (row: QuestionRow): AdminQuestion => {
  const persistedOpts: PersistedOption[] = Array.isArray(row.options) ? row.options : [];
  const correct: string[] = Array.isArray(row.correct_answers) ? row.correct_answers : [];

  return {
    id: String(row.id),
    title: row.title ?? '',
    questions: row.questions ?? '',
    answer: row.answer ?? '',
    code: row.code ?? '',
    options: persistedOpts.map((o) => ({
      id: o.id,
      label: o.label,
      isCorrect: correct.includes(o.id),
    })),
    expectedOutput: row.expected_output ?? '',
    hint: row.hint ?? '',
    difficulty: isDifficulty(row.difficulty) ? (row.difficulty ?? '') : '',
    platformId: row.platform_id != null ? String(row.platform_id) : '',
    questionTypeId: row.question_type_id != null ? String(row.question_type_id) : '',
    tags: row.tags ?? '',
    createdAt: row.created_at ?? new Date().toISOString(),
  };
};

const questionToInsertRow = (q: Omit<AdminQuestion, 'id' | 'createdAt'>): Record<string, unknown> => {
  const cleanOpts: PersistedOption[] = q.options.map((o) => ({ id: o.id, label: o.label }));
  const correct: string[] = q.options.filter((o) => o.isCorrect).map((o) => o.id);

  return {
    title: q.title || null,
    questions: q.questions || null,
    answer: q.answer || null,
    code: q.code || null,
    options: cleanOpts.length ? cleanOpts : null,
    correct_answers: correct.length ? correct : null,
    expected_output: q.expectedOutput || null,
    hint: q.hint || null,
    difficulty: q.difficulty || null,
    platform_id: q.platformId ? Number(q.platformId) : null,
    question_type_id: q.questionTypeId ? Number(q.questionTypeId) : null,
    tags: q.tags || null,
  };
};

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
