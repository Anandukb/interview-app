// Public, read-only question fetching for the platform pages (theory /
// output-prediction / practical). Resolves platform key + question kind to
// the matching Supabase rows, reusing the same mapper the admin CRUD uses.
import { supabase } from './supabase';
import { detectQuestionKind, type QuestionKind } from './questionKind';
import { QUESTIONS_TABLE, rowToQuestion, type QuestionRow } from './questions';
import type { AdminQuestion } from '../admin/types';

interface QuestionTypeRow {
  id: number | string;
  name: string;
}

// "Questions Types" barely ever changes — fetch once per session and reuse.
let questionTypesPromise: Promise<QuestionTypeRow[]> | null = null;

const getQuestionTypes = (): Promise<QuestionTypeRow[]> => {
  if (!questionTypesPromise) {
    questionTypesPromise = (async () => {
      const { data, error } = await supabase.from('Questions Types').select('*');
      if (error) {
        questionTypesPromise = null;
        throw new Error(error.message);
      }
      return (data ?? []) as QuestionTypeRow[];
    })();
  }
  return questionTypesPromise;
};

const platformIdByKey = new Map<string, Promise<string | null>>();

const getPlatformId = (platformKey: string): Promise<string | null> => {
  const key = platformKey.toLowerCase().trim();
  if (!platformIdByKey.has(key)) {
    platformIdByKey.set(
      key,
      (async () => {
        const { data, error } = await supabase
          .from('Platforms')
          .select('id')
          .ilike('key', key)
          .maybeSingle();
        if (error) {
          platformIdByKey.delete(key);
          throw new Error(error.message);
        }
        return data ? String((data as { id: number | string }).id) : null;
      })()
    );
  }
  return platformIdByKey.get(key)!;
};

/** Fetch every question of a given kind for a given platform, mapped to AdminQuestion. */
export const fetchQuestionsFor = async (
  platformKey: string,
  kind: QuestionKind
): Promise<AdminQuestion[]> => {
  const [types, platformId] = await Promise.all([getQuestionTypes(), getPlatformId(platformKey)]);
  const type = types.find((t) => detectQuestionKind(t.name) === kind);
  if (!platformId || !type) return [];

  const { data, error } = await supabase
    .from(QUESTIONS_TABLE)
    .select('*')
    .eq('platform_id', platformId)
    .eq('question_type_id', type.id)
    .order('id', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as QuestionRow[]).map(rowToQuestion);
};
