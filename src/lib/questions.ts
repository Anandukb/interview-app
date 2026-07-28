// Shared Supabase row ↔ AdminQuestion mapping. Used by both the admin CRUD
// slice and the public read-only question fetchers, so the DB shape only
// has one source of truth.
import type { AdminQuestion, Difficulty } from '../admin/types';

export const QUESTIONS_TABLE = 'Quesitons'; // (DB table name has a typo — keeping as-is)

export interface PersistedOption {
  id: string;
  label: string;
}

export interface QuestionRow {
  id: number | string;
  title: string | null;
  questions: string | null;
  answer: string | null;
  code: string | null;
  solution_code: string | null;
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

const isDifficulty = (v: string | null): v is Difficulty =>
  v === 'easy' || v === 'medium' || v === 'hard' || v === '' || v === null;

export const rowToQuestion = (row: QuestionRow): AdminQuestion => {
  const persistedOpts: PersistedOption[] = Array.isArray(row.options) ? row.options : [];
  const correct: string[] = Array.isArray(row.correct_answers) ? row.correct_answers : [];

  return {
    id: String(row.id),
    title: row.title ?? '',
    questions: row.questions ?? '',
    answer: row.answer ?? '',
    code: row.code ?? '',
    solutionCode: row.solution_code ?? '',
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

export const questionToInsertRow = (
  q: Omit<AdminQuestion, 'id' | 'createdAt'>
): Record<string, unknown> => {
  const cleanOpts: PersistedOption[] = q.options.map((o) => ({ id: o.id, label: o.label }));
  const correct: string[] = q.options.filter((o) => o.isCorrect).map((o) => o.id);

  return {
    title: q.title || null,
    questions: q.questions || null,
    answer: q.answer || null,
    code: q.code || null,
    solution_code: q.solutionCode || null,
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
