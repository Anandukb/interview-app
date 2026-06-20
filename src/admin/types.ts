// ── Field Types ────────────────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'richtext'
  | 'code-editor'
  | 'options'
  | 'hint'
  | 'sample';

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Text Input',
  richtext: 'Rich Text (Markdown)',
  'code-editor': 'Code Editor',
  options: 'Options (MC)',
  hint: 'Hint / Notes',
  sample: 'Sample I/O',
};

// ── Question Field Config ──────────────────────────────────────────────────────

export interface QuestionField {
  id: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  placeholder?: string;
  language?: string; // for code-editor, e.g. 'javascript'
}

// ── Question Type ──────────────────────────────────────────────────────────────

export interface QuestionType {
  id: string;
  name: string;
  description?: string;
  fields: QuestionField[];
  createdAt: string;
}

// ── Platform ───────────────────────────────────────────────────────────────────

export interface AdminPlatform {
  id: string;
  name: string;
  key: string;
  description?: string;
  color?: string;
  createdAt: string;
}

// ── Option (for options field type) ───────────────────────────────────────────

export interface MCOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

// ── Question ───────────────────────────────────────────────────────────────────

export interface AdminQuestion {
  id: string;
  platformId: string;
  questionTypeId: string;
  // Dynamic field values keyed by field.id
  fieldValues: Record<string, string | MCOption[]>;
  createdAt: string;
}

// ── Admin Auth ─────────────────────────────────────────────────────────────────

export interface AdminAuth {
  isAuthenticated: boolean;
}
