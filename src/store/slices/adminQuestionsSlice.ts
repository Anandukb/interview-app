import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AdminQuestion, MCOption } from '../../admin/types';

// ── Helpers ────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'admin_questions';
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function loadFromStorage(): AdminQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminQuestion[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(data: AdminQuestion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── State ──────────────────────────────────────────────────────────────────────

interface AdminQuestionsState {
  data: AdminQuestion[];
}

const initialState: AdminQuestionsState = {
  data: loadFromStorage(),
};

// ── Slice ──────────────────────────────────────────────────────────────────────

const adminQuestionsSlice = createSlice({
  name: 'adminQuestions',
  initialState,
  reducers: {
    addAdminQuestion(
      state,
      action: PayloadAction<Omit<AdminQuestion, 'id' | 'createdAt'>>
    ) {
      const newQ: AdminQuestion = {
        ...action.payload,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      state.data.push(newQ);
      saveToStorage(state.data);
      console.log('✅ New Question Submitted:', newQ);
    },
    updateAdminQuestion(
      state,
      action: PayloadAction<{ id: string; patch: Partial<AdminQuestion> }>
    ) {
      const idx = state.data.findIndex((q) => q.id === action.payload.id);
      if (idx !== -1) {
        state.data[idx] = { ...state.data[idx], ...action.payload.patch };
        saveToStorage(state.data);
      }
    },
    deleteAdminQuestion(state, action: PayloadAction<string>) {
      state.data = state.data.filter((q) => q.id !== action.payload);
      saveToStorage(state.data);
    },
  },
});

// Re-export MCOption so pages don't need to import from types directly
export type { MCOption };

export const { addAdminQuestion, updateAdminQuestion, deleteAdminQuestion } =
  adminQuestionsSlice.actions;
export default adminQuestionsSlice.reducer;
