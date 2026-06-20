import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, HelpCircle, RefreshCw, AlertCircle,
  FileText, Code2, ListChecks, Lightbulb, Eye, ArrowLeft, X, Search,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAdminQuestions, addAdminQuestion, updateAdminQuestion, deleteAdminQuestion,
} from '../../store/slices/adminQuestionsSlice';
import type { AdminQuestion, MCOption, Difficulty } from '../types';
import { Modal } from '../../components/ui/Modal';
import RichTextEditor from '../components/RichTextEditor';
import QuestionPreview from '../components/QuestionPreview';
import { detectQuestionKind, isSectionVisible, type QuestionKind } from '../components/questionKind';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select, Field } from '../../components/ui/Input';
import { Badge, DifficultyBadge } from '../../components/ui/Badge';
import { PageHeader, ErrorBanner, WarningBanner, EmptyState } from '../../components/ui/PageHeader';
import { TableWrap, Table, Th, Td, TableRow } from '../../components/ui/Table';
import { useTheme } from '../../theme/ThemeProvider';
import { cn } from '../../lib/cn';

// ── Form state ────────────────────────────────────────────────────────────────

type FormState = Omit<AdminQuestion, 'id' | 'createdAt'>;

const EMPTY_FORM: FormState = {
  title: '', questions: '', answer: '', code: '',
  options: [], expectedOutput: '', hint: '',
  difficulty: '', platformId: '', questionTypeId: '', tags: '',
};

const newOptionId = () => `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: '',       label: '— Not set —' },
  { value: 'easy',   label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard',   label: 'Hard' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminQuestions = () => {
  const dispatch = useAppDispatch();
  const { resolvedMode } = useTheme();
  const questions = useAppSelector((s) => s.adminQuestions.data);
  const loading = useAppSelector((s) => s.adminQuestions.loading);
  const error = useAppSelector((s) => s.adminQuestions.error);
  const platforms = useAppSelector((s) => s.adminPlatforms.data);
  const questionTypes = useAppSelector((s) => s.adminQuestionTypes.data);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminQuestion | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [previewing, setPreviewing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Filters: platform & type live in the URL (so the sidebar stays in sync),
  //    search is local UI state.
  const [searchParams, setSearchParams] = useSearchParams();
  const platformKeyFilter = searchParams.get('platform');
  const typeIdFilter = searchParams.get('type');
  const [search, setSearch] = useState('');

  const filterPlatform = useMemo(() => {
    if (!platformKeyFilter) return null;
    return (
      platforms.find((p) => p.key.toLowerCase() === platformKeyFilter.toLowerCase()) ?? null
    );
  }, [platforms, platformKeyFilter]);

  const filterType = useMemo(() => {
    if (!typeIdFilter) return null;
    return questionTypes.find((qt) => qt.id === typeIdFilter) ?? null;
  }, [questionTypes, typeIdFilter]);

  const filterUnknown = !!platformKeyFilter && !filterPlatform && platforms.length > 0;

  const visibleQuestions = useMemo(() => {
    let list = questions;
    if (filterPlatform) list = list.filter((q) => q.platformId === filterPlatform.id);
    if (filterType)     list = list.filter((q) => q.questionTypeId === filterType.id);
    const needle = search.trim().toLowerCase();
    if (needle) {
      list = list.filter(
        (q) =>
          q.title.toLowerCase().includes(needle) ||
          q.questions.toLowerCase().includes(needle) ||
          q.tags.toLowerCase().includes(needle)
      );
    }
    return list;
  }, [questions, filterPlatform, filterType, search]);

  const setUrlParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const clearAllFilters = () => {
    setSearch('');
    const next = new URLSearchParams(searchParams);
    next.delete('platform');
    next.delete('type');
    setSearchParams(next, { replace: true });
  };

  const hasActiveFilter = !!filterPlatform || !!filterType || search.trim().length > 0;

  const selectedType = useMemo(
    () => questionTypes.find((qt) => qt.id === form.questionTypeId),
    [questionTypes, form.questionTypeId]
  );
  const selectedPlatform = useMemo(
    () => platforms.find((p) => p.id === form.platformId),
    [platforms, form.platformId]
  );
  const kind = detectQuestionKind(selectedType?.name);

  const openAdd = () => {
    setEditTarget(null);
    setForm({
      ...EMPTY_FORM,
      platformId: filterPlatform?.id ?? platforms[0]?.id ?? '',
      questionTypeId: questionTypes[0]?.id ?? '',
    });
    setSaveError(null);
    setPreviewing(false);
    setModalOpen(true);
  };

  const openEdit = (q: AdminQuestion) => {
    setEditTarget(q);
    const { id: _id, createdAt: _ca, ...rest } = q;
    void _id; void _ca;
    setForm(rest);
    setSaveError(null);
    setPreviewing(false);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditTarget(null);
    setSaveError(null);
    setPreviewing(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const cleaned = applyKindMask(form, kind);
      if (editTarget) await dispatch(updateAdminQuestion({ id: editTarget.id, patch: cleaned })).unwrap();
      else            await dispatch(addAdminQuestion(cleaned)).unwrap();
      handleClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteAdminQuestion(id));
    setDeleteConfirm(null);
  };

  const getPlatformName = (id: string) => platforms.find((p) => p.id === id)?.name ?? '—';
  const getTypeName = (id: string) => questionTypes.find((qt) => qt.id === id)?.name ?? '—';

  const addOption = () =>
    setForm((f) => ({ ...f, options: [...f.options, { id: newOptionId(), label: '', isCorrect: false }] }));
  const updateOption = (optId: string, patch: Partial<MCOption>) =>
    setForm((f) => ({ ...f, options: f.options.map((o) => (o.id === optId ? { ...o, ...patch } : o)) }));
  const removeOption = (optId: string) =>
    setForm((f) => ({ ...f, options: f.options.filter((o) => o.id !== optId) }));

  const prereqMissing = platforms.length === 0 || questionTypes.length === 0;

  const showAnswer   = isSectionVisible('answer',          kind);
  const showCode     = isSectionVisible('code',            kind);
  const showExpected = isSectionVisible('expected-output', kind);
  const showOptions  = isSectionVisible('options',         kind);
  const showHint     = isSectionVisible('hint',            kind);

  const codeSectionTitle   = kind === 'practical' ? 'Starter Code' : 'Code';
  const answerSectionTitle = kind === 'practical' ? 'Solution / Explanation' : 'Answer';

  // Use side-by-side layout when the rich-editor (Answer) and at least one
  // structured section are visible together.
  const useSplit = showAnswer && (showCode || showExpected || showOptions);

  return (
    <div>
      <PageHeader
        title="Questions"
        description="Manage interview questions — synced with Supabase"
        actions={
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => dispatch(fetchAdminQuestions())}
              disabled={loading}
              title="Refresh from Supabase"
            >
              <RefreshCw size={15} className={loading ? 'animate-[spin-slow_1s_linear_infinite]' : ''} />
            </Button>
            <Button
              onClick={openAdd}
              leftIcon={<Plus size={16} />}
              disabled={prereqMissing}
              title={
                platforms.length === 0
                  ? 'Add a platform first'
                  : questionTypes.length === 0
                  ? 'Add a question type first'
                  : ''
              }
            >
              Add Question
            </Button>
          </>
        }
      />

      {error && (
        <ErrorBanner>
          <AlertCircle size={15} />
          <span>Supabase error: {error}</span>
        </ErrorBanner>
      )}

      {filterUnknown && (
        <WarningBanner>
          <AlertCircle size={15} />
          <span>
            No platform with key <code className="px-1 rounded bg-brand/10 text-brand font-mono">{platformKeyFilter}</code> exists. Showing all questions.
          </span>
        </WarningBanner>
      )}

      {prereqMissing && (
        <WarningBanner>
          <HelpCircle size={16} />
          <span>
            {platforms.length === 0
              ? 'Please add at least one platform before adding questions.'
              : 'Please add at least one question type before adding questions.'}
          </span>
        </WarningBanner>
      )}

      {/* ── Filter toolbar ──────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, question, or tags…"
            className="pl-9"
            aria-label="Search questions"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-fg-subtle hover:bg-surface-3 hover:text-fg transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Select
            value={filterPlatform?.key ?? ''}
            onChange={(e) => setUrlParam('platform', e.target.value)}
            aria-label="Filter by platform"
            className="sm:w-48"
          >
            <option value="">All Platforms</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.key}>{p.name}</option>
            ))}
          </Select>

          <Select
            value={filterType?.id ?? ''}
            onChange={(e) => setUrlParam('type', e.target.value)}
            aria-label="Filter by question type"
            className="sm:w-48"
          >
            <option value="">All Types</option>
            {questionTypes.map((qt) => (
              <option key={qt.id} value={qt.id}>{qt.name}</option>
            ))}
          </Select>

          {hasActiveFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              leftIcon={<X size={14} />}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilter && !loading && (
        <div className="mb-3 text-xs text-fg-muted">
          Showing <span className="font-semibold text-fg">{visibleQuestions.length}</span>{' '}
          of <span className="font-semibold text-fg">{questions.length}</span> questions
        </div>
      )}

      <TableWrap>
        {loading ? (
          <div className="py-16 text-center text-fg-muted">
            <span className="inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-[spin-slow_0.8s_linear_infinite]" />
            <p className="mt-3 text-sm">Loading questions…</p>
          </div>
        ) : visibleQuestions.length === 0 ? (
          <EmptyState
            icon={<HelpCircle size={28} />}
            title={
              hasActiveFilter
                ? 'No questions match your filters'
                : 'No questions yet'
            }
            description={
              hasActiveFilter
                ? 'Try clearing a filter or adjusting your search.'
                : 'Click "Add Question" to start building your question bank.'
            }
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th className="w-12">#</Th>
                <Th>Title / Question</Th>
                <Th>Platform</Th>
                <Th>Type</Th>
                <Th>Difficulty</Th>
                <Th className="hidden md:table-cell">Created</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {visibleQuestions.map((q, idx) => (
                <TableRow key={q.id}>
                  <Td className="text-fg-subtle">{idx + 1}</Td>
                  <Td className="max-w-[320px]">
                    <div className="line-clamp-2 text-sm font-medium" title={q.title || q.questions}>
                      {q.title || q.questions || <span className="text-fg-subtle">Untitled</span>}
                    </div>
                  </Td>
                  <Td><Badge tone="brand">{getPlatformName(q.platformId)}</Badge></Td>
                  <Td><Badge tone="success">{getTypeName(q.questionTypeId)}</Badge></Td>
                  <Td><DifficultyBadge value={q.difficulty} /></Td>
                  <Td className="hidden md:table-cell text-fg-subtle text-xs">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(q)} title="Edit">
                        <Pencil size={14} />
                      </Button>
                      {deleteConfirm === q.id ? (
                        <>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(q.id)}>Confirm</Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleteConfirm(q.id)} title="Delete" className="text-danger hover:bg-danger/10">
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </Td>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </TableWrap>

      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={
          previewing
            ? `Preview${editTarget ? ' · ' + (editTarget.title || 'Untitled') : ''}`
            : editTarget ? 'Edit Question' : 'Add Question'
        }
        maxWidth="max-w-7xl"
        maxHeight="max-h-[92vh]"
        contained={false}
      >
        <AnimatePresence mode="wait">
          {previewing ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-border bg-surface-2 shrink-0">
                <Button variant="secondary" size="sm" onClick={() => setPreviewing(false)} leftIcon={<ArrowLeft size={14} />}>
                  Back to Edit
                </Button>
                <Badge tone="brand" className="uppercase">
                  {labelForKind(kind)}
                </Badge>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
                <QuestionPreview
                  form={form}
                  kind={kind}
                  platform={selectedPlatform}
                  questionType={selectedType}
                />
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Scrollable area on mobile, flex container on desktop */}
              <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden flex flex-col">
                {/* Top compact basics row (always visible) */}
                <div className="px-6 pt-4 pb-3 border-b border-border bg-surface-2/40 shrink-0">
                  <BasicsRow
                    form={form}
                    setForm={setForm}
                    platforms={platforms}
                    questionTypes={questionTypes}
                    kindLabel={selectedType ? labelForKind(kind) : undefined}
                  />
                </div>

                {/* Body — split or single depending on which sections are visible */}
                <div className={cn(
                  'flex-1 lg:min-h-0',
                  useSplit
                    ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,_1.05fr)_minmax(0,_1fr)]'
                    : 'flex flex-col'
                )}>
                  {useSplit ? (
                    <>
                      {/* Left: structured fields */}
                      <div className="lg:border-r border-border lg:min-h-0 lg:overflow-y-auto px-6 py-4 flex flex-col gap-4">
                        {showCode && (
                          <FormSection icon={<Code2 size={14} />} title={codeSectionTitle}>
                            <CodeEditor
                              value={form.code}
                              onChange={(v) => setForm({ ...form, code: v })}
                              resolvedMode={resolvedMode}
                            />
                          </FormSection>
                        )}
                        {showExpected && (
                          <FormSection icon={<Code2 size={14} />} title="Expected Output">
                            <Field hint="Single line for single-answer; one line per output (in order) for ordered prediction.">
                              <Textarea
                                value={form.expectedOutput}
                                onChange={(e) => setForm({ ...form, expectedOutput: e.target.value })}
                                placeholder={'One line per expected output, in order:\nStart\nEnd\nPromise\nTimeout'}
                                rows={4}
                                className="font-mono text-sm"
                              />
                            </Field>
                          </FormSection>
                        )}
                        {showOptions && (
                          <FormSection icon={<ListChecks size={14} />} title={kind === 'output-prediction' ? 'Output Options' : 'Options'}>
                            <OptionsList
                              options={form.options}
                              onAdd={addOption}
                              onUpdate={updateOption}
                              onRemove={removeOption}
                            />
                          </FormSection>
                        )}
                        {showHint && (
                          <FormSection icon={<Lightbulb size={14} />} title="Hint (optional)">
                            <Textarea
                              value={form.hint}
                              onChange={(e) => setForm({ ...form, hint: e.target.value })}
                              placeholder="Optional hint for the candidate"
                              rows={3}
                            />
                          </FormSection>
                        )}
                      </div>

                      {/* Right: rich answer (full height) */}
                      {showAnswer && (
                        <div className="lg:min-h-0 flex flex-col px-6 py-4 lg:py-4">
                          <div className="flex items-center gap-2 mb-2 shrink-0">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-brand/15 text-brand">
                              <FileText size={14} />
                            </span>
                            <span className="text-xs font-bold text-fg-muted uppercase tracking-wider">
                              {answerSectionTitle}
                            </span>
                          </div>
                          <div className="lg:flex-1 lg:min-h-0 lg:overflow-hidden flex flex-col">
                            <RichTextEditor
                              value={form.answer}
                              onChange={(val) => setForm({ ...form, answer: val })}
                              placeholder="Write the answer in markdown…"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Single-column path (theory: just answer; mcq: just options; etc)
                    <div className="flex-1 lg:min-h-0 lg:overflow-y-auto px-6 py-4 flex flex-col gap-4">
                      {showAnswer && (
                        <FormSection icon={<FileText size={14} />} title={answerSectionTitle}>
                          <RichTextEditor
                            value={form.answer}
                            onChange={(val) => setForm({ ...form, answer: val })}
                            placeholder="Write the answer in markdown…"
                          />
                        </FormSection>
                      )}
                      {showCode && (
                        <FormSection icon={<Code2 size={14} />} title={codeSectionTitle}>
                          <CodeEditor
                            value={form.code}
                            onChange={(v) => setForm({ ...form, code: v })}
                            resolvedMode={resolvedMode}
                          />
                        </FormSection>
                      )}
                      {showExpected && (
                        <FormSection icon={<Code2 size={14} />} title="Expected Output">
                          <Textarea
                            value={form.expectedOutput}
                            onChange={(e) => setForm({ ...form, expectedOutput: e.target.value })}
                            placeholder={'One line per expected output, in order:\nStart\nEnd\nPromise\nTimeout'}
                            rows={5}
                            className="font-mono text-sm"
                          />
                        </FormSection>
                      )}
                      {showOptions && (
                        <FormSection icon={<ListChecks size={14} />} title={kind === 'output-prediction' ? 'Output Options' : 'Options'}>
                          <OptionsList
                            options={form.options}
                            onAdd={addOption}
                            onUpdate={updateOption}
                            onRemove={removeOption}
                          />
                        </FormSection>
                      )}
                      {showHint && (
                        <FormSection icon={<Lightbulb size={14} />} title="Hint (optional)">
                          <Textarea
                            value={form.hint}
                            onChange={(e) => setForm({ ...form, hint: e.target.value })}
                            placeholder="Optional hint for the candidate"
                            rows={3}
                          />
                        </FormSection>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky footer */}
              <div className="px-6 py-3 border-t border-border bg-surface-2/40 shrink-0">
                {saveError && (
                  <div className="flex items-start gap-2 mb-3 px-3 py-2 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
                    <AlertCircle size={14} />
                    <span>{saveError}</span>
                  </div>
                )}
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreviewing(true)}
                    disabled={!form.questionTypeId || !form.platformId}
                    leftIcon={<Eye size={14} />}
                    title={
                      !form.questionTypeId || !form.platformId
                        ? 'Pick platform and type first'
                        : 'Preview how this question will render'
                    }
                  >
                    Preview
                  </Button>
                  <Button type="submit" loading={saving}>
                    {editTarget ? 'Save Changes' : 'Add Question'}
                  </Button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </Modal>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const BasicsRow = ({
  form, setForm, platforms, questionTypes, kindLabel,
}: {
  form: FormState;
  setForm: (next: FormState) => void;
  platforms: { id: string; name: string }[];
  questionTypes: { id: string; name: string }[];
  kindLabel?: string;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
    <Field label="Title" className="lg:col-span-4">
      <Input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Short title or identifier"
      />
    </Field>
    <Field label="Question" required className="lg:col-span-8">
      <Input
        value={form.questions}
        onChange={(e) => setForm({ ...form, questions: e.target.value })}
        placeholder="The actual question / prompt"
        required
      />
    </Field>

    <Field label="Platform" required className="lg:col-span-3">
      <Select
        value={form.platformId}
        onChange={(e) => setForm({ ...form, platformId: e.target.value })}
        required
      >
        <option value="" disabled>Select platform…</option>
        {platforms.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
      </Select>
    </Field>

    <Field
      label="Question Type"
      required
      className="lg:col-span-3"
      hint={kindLabel ? <>Detected: <code className="px-1 rounded bg-brand/10 text-brand font-mono">{kindLabel}</code></> : undefined}
    >
      <Select
        value={form.questionTypeId}
        onChange={(e) => setForm({ ...form, questionTypeId: e.target.value })}
        required
      >
        <option value="" disabled>Select type…</option>
        {questionTypes.map((qt) => (<option key={qt.id} value={qt.id}>{qt.name}</option>))}
      </Select>
    </Field>

    <Field label="Difficulty" className="lg:col-span-2">
      <Select
        value={form.difficulty}
        onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
      >
        {DIFFICULTIES.map((d) => (<option key={d.value} value={d.value}>{d.label}</option>))}
      </Select>
    </Field>

    <Field label="Tags" className="lg:col-span-4" hint="Comma-separated">
      <Input
        value={form.tags}
        onChange={(e) => setForm({ ...form, tags: e.target.value })}
        placeholder="closures, hoisting, async"
      />
    </Field>
  </div>
);

const OptionsList = ({
  options, onAdd, onUpdate, onRemove,
}: {
  options: MCOption[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<MCOption>) => void;
  onRemove: (id: string) => void;
}) => (
  <div className="space-y-2">
    {options.map((opt, idx) => (
      <div key={opt.id} className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-surface-3 border border-border text-xs font-bold text-fg-muted shrink-0">
          {String.fromCharCode(65 + idx)}
        </span>
        <Input
          value={opt.label}
          onChange={(e) => onUpdate(opt.id, { label: e.target.value })}
          placeholder={`Option ${String.fromCharCode(65 + idx)}…`}
        />
        <label className="cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={opt.isCorrect}
            onChange={(e) => onUpdate(opt.id, { isCorrect: e.target.checked })}
            className="hidden"
          />
          <span className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold transition-all',
            opt.isCorrect
              ? 'bg-success/15 border-success/40 text-success'
              : 'bg-surface-3 border-border text-fg-muted hover:bg-surface-2'
          )}>
            {opt.isCorrect ? '✓ Correct' : 'Correct?'}
          </span>
        </label>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(opt.id)}
          title="Remove option"
          className="text-danger hover:bg-danger/10 shrink-0"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    ))}
    <Button type="button" variant="secondary" size="sm" onClick={onAdd} leftIcon={<Plus size={13} />}>
      Add Option
    </Button>
  </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const labelForKind = (kind: QuestionKind) => {
  switch (kind) {
    case 'theory': return 'Theory';
    case 'output-prediction': return 'Output Prediction';
    case 'practical': return 'Practical';
    case 'mcq': return 'Multiple Choice';
    default: return 'Generic';
  }
};

const applyKindMask = (form: FormState, kind: QuestionKind): FormState => {
  const masked: FormState = { ...form };
  if (!isSectionVisible('answer',          kind)) masked.answer = '';
  if (!isSectionVisible('code',            kind)) masked.code = '';
  if (!isSectionVisible('expected-output', kind)) masked.expectedOutput = '';
  if (!isSectionVisible('options',         kind)) masked.options = [];
  return masked;
};

const FormSection = ({
  icon, title, children,
}: { icon: ReactNode; title: string; children: ReactNode }) => (
  <div className="rounded-xl border border-border bg-surface overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-brand/5">
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-brand/15 text-brand">
        {icon}
      </span>
      <span className="text-xs font-bold text-fg-muted uppercase tracking-wider">{title}</span>
    </div>
    <div className="p-3">{children}</div>
  </div>
);

const CodeEditor = ({
  value, onChange, resolvedMode,
}: { value: string; onChange: (v: string) => void; resolvedMode: 'light' | 'dark' }) => (
  <div className="rounded-lg overflow-hidden border border-border bg-[#1e1e1e]">
    <div className="flex items-center px-3 py-1.5 bg-surface-2 border-b border-border">
      <Badge tone="brand" className="uppercase text-[10px]">javascript</Badge>
    </div>
    <Editor
      height="220px"
      language="javascript"
      value={value}
      onChange={(v) => onChange(v ?? '')}
      theme={resolvedMode === 'dark' ? 'vs-dark' : 'vs-light'}
      options={{
        minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on',
        scrollBeyondLastLine: false, padding: { top: 12, bottom: 12 },
        fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
      }}
    />
  </div>
);

export default AdminQuestions;
