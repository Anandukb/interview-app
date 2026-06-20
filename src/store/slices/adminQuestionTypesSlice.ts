import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { QuestionType } from '../../admin/types';

// ── Helpers ────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'admin_question_types';
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const DEFAULT_TYPES: QuestionType[] = [
  {
    id: 'type-theory',
    name: 'Theory Question',
    description: 'Conceptual question with a markdown answer',
    fields: [
      { id: 'field-question', label: 'Question', fieldType: 'text',     required: true,  placeholder: 'Enter the interview question…' },
      { id: 'field-answer',   label: 'Answer',   fieldType: 'richtext', required: true,  placeholder: 'Write the answer in markdown…' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'type-output',
    name: 'Output Prediction',
    description: 'What will be the output of this code?',
    fields: [
      { id: 'field-question', label: 'Question',     fieldType: 'text',        required: true,  placeholder: 'Enter the question…' },
      { id: 'field-code',     label: 'Code Snippet', fieldType: 'code-editor', required: true,  language: 'javascript' },
      { id: 'field-options',  label: 'Options',      fieldType: 'options',     required: true },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'type-practical',
    name: 'Practical Question',
    description: 'Hands-on coding challenge',
    fields: [
      { id: 'field-question', label: 'Question',              fieldType: 'text',        required: true,  placeholder: 'Describe the challenge…' },
      { id: 'field-answer',   label: 'Answer / Solution',     fieldType: 'code-editor', required: true,  language: 'javascript' },
      { id: 'field-hint',     label: 'Result Hint',           fieldType: 'hint',        required: false, placeholder: 'Optional hint…' },
      { id: 'field-sample',   label: 'Sample Input / Output', fieldType: 'sample',      required: false, placeholder: 'e.g. Input: [1,2,3] → Output: [3,2,1]' },
    ],
    createdAt: new Date().toISOString(),
  },
];

function loadFromStorage(): QuestionType[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QuestionType[]) : DEFAULT_TYPES;
  } catch {
    return DEFAULT_TYPES;
  }
}

function saveToStorage(data: QuestionType[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── State ──────────────────────────────────────────────────────────────────────

interface AdminQuestionTypesState {
  data: QuestionType[];
}

const initialState: AdminQuestionTypesState = {
  data: loadFromStorage(),
};

// ── Slice ──────────────────────────────────────────────────────────────────────

const adminQuestionTypesSlice = createSlice({
  name: 'adminQuestionTypes',
  initialState,
  reducers: {
    addQuestionType(state, action: PayloadAction<Omit<QuestionType, 'id' | 'createdAt'>>) {
      const newType: QuestionType = {
        ...action.payload,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      state.data.push(newType);
      saveToStorage(state.data);
    },
    updateQuestionType(state, action: PayloadAction<{ id: string; patch: Partial<QuestionType> }>) {
      const idx = state.data.findIndex((qt) => qt.id === action.payload.id);
      if (idx !== -1) {
        state.data[idx] = { ...state.data[idx], ...action.payload.patch };
        saveToStorage(state.data);
      }
    },
    deleteQuestionType(state, action: PayloadAction<string>) {
      state.data = state.data.filter((qt) => qt.id !== action.payload);
      saveToStorage(state.data);
    },
  },
});

export const { addQuestionType, updateQuestionType, deleteQuestionType } =
  adminQuestionTypesSlice.actions;
export default adminQuestionTypesSlice.reducer;
