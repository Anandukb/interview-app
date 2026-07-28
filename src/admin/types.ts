// ── Platform ───────────────────────────────────────────────────────────────────

export interface AdminPlatform {
  id: string;
  name: string;
  key: string;
  description?: string;
  color?: string;
  createdAt: string;
}

// ── Question Type ──────────────────────────────────────────────────────────────
// DB shape: { id: bigint, name: text }

export interface QuestionType {
  id: string;
  name: string;
}

// ── Question ───────────────────────────────────────────────────────────────────
// Mirrors the Supabase `Quesitons` table.

export type Difficulty = 'easy' | 'medium' | 'hard' | '';

/**
 * UI-side option shape. `isCorrect` is split out from the persisted
 * `options` jsonb on the way in (using `correct_answers`) and merged
 * back on the way out.
 */
export interface MCOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface AdminQuestion {
  id: string;
  title: string;
  questions: string;          // the actual prompt text
  answer: string;             // markdown answer
  code: string;               // code snippet (starter code for practical)
  solutionCode: string;       // reference solution code (practical only)
  options: MCOption[];        // multi-choice options (UI shape — flattened)
  expectedOutput: string;
  hint: string;
  difficulty: Difficulty;
  platformId: string;         // FK → Platforms.id
  questionTypeId: string;     // FK → "Questions Types".id
  tags: string;               // comma-separated
  createdAt: string;
}

// ── Admin Auth ─────────────────────────────────────────────────────────────────

export interface AdminAuth {
  isAuthenticated: boolean;
}
