// Row shape for "Questions Types" — same rationale as platforms.ts.

export interface QuestionTypeFields {
  name: string;
}

export const questionTypeToInsertRow = (qt: QuestionTypeFields): Record<string, unknown> => ({
  name: qt.name,
});
