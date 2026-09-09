import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

export type TargetTable = 'Quesitons' | 'Platforms' | 'Questions Types';
export type ChangeAction = 'create' | 'update' | 'delete';
export type ChangeStatus = 'pending' | 'approved' | 'rejected';

export interface PendingChange {
  id: string;
  targetTable: TargetTable;
  targetId: string | null;
  action: ChangeAction;
  payload: Record<string, unknown> | null;
  previous: Record<string, unknown> | null;
  status: ChangeStatus;
  submittedBy: string | null;
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

interface PendingChangeRow {
  id: number | string;
  target_table: TargetTable;
  target_id: number | string | null;
  action: ChangeAction;
  payload: Record<string, unknown> | null;
  previous: Record<string, unknown> | null;
  status: ChangeStatus;
  submitted_by: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
}

const rowToPendingChange = (row: PendingChangeRow): PendingChange => ({
  id: String(row.id),
  targetTable: row.target_table,
  targetId: row.target_id != null ? String(row.target_id) : null,
  action: row.action,
  payload: row.payload,
  previous: row.previous,
  status: row.status,
  submittedBy: row.submitted_by,
  submittedAt: row.submitted_at ?? new Date().toISOString(),
  reviewedBy: row.reviewed_by,
  reviewedAt: row.reviewed_at,
  reviewNote: row.review_note,
});

// ── State ──────────────────────────────────────────────────────────────────────

interface PendingChangesState {
  data: PendingChange[];
  loading: boolean;
  error: string | null;
}

const initialState: PendingChangesState = {
  data: [],
  loading: false,
  error: null,
};

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchPendingChanges = createAsyncThunk(
  'pendingChanges/fetchAll',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('pending_changes')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) return rejectWithValue(error.message);
    return (data as PendingChangeRow[]).map(rowToPendingChange);
  }
);

export const submitChange = createAsyncThunk(
  'pendingChanges/submit',
  async (
    input: {
      targetTable: TargetTable;
      targetId: string | null;
      action: ChangeAction;
      payload: Record<string, unknown> | null;
      previous: Record<string, unknown> | null;
    },
    { rejectWithValue }
  ) => {
    const { data, error } = await supabase
      .from('pending_changes')
      .insert({
        target_table: input.targetTable,
        target_id: input.targetId ? Number(input.targetId) : null,
        action: input.action,
        payload: input.payload,
        previous: input.previous,
      })
      .select()
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    if (!data) return rejectWithValue('Submission returned no row.');
    return rowToPendingChange(data as PendingChangeRow);
  }
);

export const approveChange = createAsyncThunk(
  'pendingChanges/approve',
  async ({ id, note }: { id: string; note?: string }, { rejectWithValue }) => {
    const { error } = await supabase.rpc('approve_pending_change', {
      p_id: Number(id),
      p_note: note ?? null,
    });
    if (error) return rejectWithValue(error.message);
    return { id, note: note ?? null };
  }
);

export const rejectChange = createAsyncThunk(
  'pendingChanges/reject',
  async ({ id, note }: { id: string; note?: string }, { rejectWithValue }) => {
    const { error } = await supabase.rpc('reject_pending_change', {
      p_id: Number(id),
      p_note: note ?? null,
    });
    if (error) return rejectWithValue(error.message);
    return { id, note: note ?? null };
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const pendingChangesSlice = createSlice({
  name: 'pendingChanges',
  initialState,
  reducers: {
    clearPendingChanges(state) {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingChanges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingChanges.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPendingChanges.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Failed to fetch pending changes.';
      })
      .addCase(submitChange.fulfilled, (state, action) => {
        state.data.unshift(action.payload);
      })
      .addCase(submitChange.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Status change happened server-side via the RPC — reflect it locally
      // instead of removing the row, so submitters still see the outcome.
      .addCase(approveChange.fulfilled, (state, action) => {
        const item = state.data.find((c) => c.id === action.payload.id);
        if (item) {
          item.status = 'approved';
          item.reviewedAt = new Date().toISOString();
          item.reviewNote = action.payload.note;
        }
      })
      .addCase(approveChange.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(rejectChange.fulfilled, (state, action) => {
        const item = state.data.find((c) => c.id === action.payload.id);
        if (item) {
          item.status = 'rejected';
          item.reviewedAt = new Date().toISOString();
          item.reviewNote = action.payload.note;
        }
      })
      .addCase(rejectChange.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearPendingChanges } = pendingChangesSlice.actions;
export default pendingChangesSlice.reducer;
