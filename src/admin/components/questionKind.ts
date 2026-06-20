// Shared question-kind detection used by both the form and the preview.

export type QuestionKind = 'theory' | 'output-prediction' | 'practical' | 'mcq' | 'unknown';

export const detectQuestionKind = (typeName: string | undefined | null): QuestionKind => {
  const n = (typeName ?? '').toLowerCase().trim();
  if (!n) return 'unknown';
  if (/theory/.test(n)) return 'theory';
  if (/output|prediction/.test(n)) return 'output-prediction';
  if (/practical/.test(n)) return 'practical';
  if (/mcq|multiple/.test(n)) return 'mcq';
  return 'unknown';
};

/** Whether a given form section should be visible for this question kind. */
export const isSectionVisible = (
  section: 'basics' | 'answer' | 'code' | 'expected-output' | 'options' | 'hint',
  kind: QuestionKind,
): boolean => {
  switch (section) {
    case 'basics':
      return true;
    case 'hint':
      // Hint is optional but always offered.
      return true;
    case 'answer':
      return true;
    case 'code':
      return kind === 'output-prediction' || kind === 'mcq' || kind === 'practical' || kind === 'unknown';
    case 'expected-output':
      return kind === 'output-prediction' || kind === 'unknown';
    case 'options':
      return kind === 'mcq' || kind === 'output-prediction' || kind === 'unknown';
  }
};
