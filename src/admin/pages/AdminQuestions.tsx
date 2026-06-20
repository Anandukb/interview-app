import { useMemo, useState, type FormEvent } from 'react';
import {
  Plus, Pencil, Trash2, HelpCircle, RefreshCw, AlertCircle,
  FileText, Code2, ListChecks, Lightbulb, Eye, ArrowLeft,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAdminQuestions,
  addAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
} from '../../store/slices/adminQuestionsSlice';
import type { AdminQuestion, MCOption, Difficulty } from '../types';
import AdminModal from '../components/AdminModal';
import RichTextEditor from '../components/RichTextEditor';
import QuestionPreview from '../components/QuestionPreview';
import { detectQuestionKind, isSectionVisible } from '../components/questionKind';
import '../admin.css';
import './AdminQuestions.css';

// ── Form state ────────────────────────────────────────────────────────────────

type FormState = Omit<AdminQuestion, 'id' | 'createdAt'>;

const EMPTY_FORM: FormState = {
  title: '',
  questions: '',
  answer: '',
  code: '',
  options: [],
  expectedOutput: '',
  hint: '',
  difficulty: '',
  platformId: '',
  questionTypeId: '',
  tags: '',
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

  // Derived values from current selection
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
      platformId: platforms[0]?.id ?? '',
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
      // Strip data that doesn't apply to this kind so we don't persist
      // stale fields when the admin switched type mid-edit.
      const cleaned = applyKindMask(form, kind);

      if (editTarget) {
        await dispatch(updateAdminQuestion({ id: editTarget.id, patch: cleaned })).unwrap();
      } else {
        await dispatch(addAdminQuestion(cleaned)).unwrap();
      }
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

  // Lookups for table rows
  const getPlatformName = (id: string) => platforms.find((p) => p.id === id)?.name ?? '—';
  const getTypeName = (id: string) => questionTypes.find((qt) => qt.id === id)?.name ?? '—';

  // Option helpers
  const addOption = () =>
    setForm((f) => ({
      ...f,
      options: [...f.options, { id: newOptionId(), label: '', isCorrect: false }],
    }));

  const updateOption = (optId: string, patch: Partial<MCOption>) =>
    setForm((f) => ({
      ...f,
      options: f.options.map((o) => (o.id === optId ? { ...o, ...patch } : o)),
    }));

  const removeOption = (optId: string) =>
    setForm((f) => ({ ...f, options: f.options.filter((o) => o.id !== optId) }));

  const prereqMissing = platforms.length === 0 || questionTypes.length === 0;

  // ── Section visibility helpers (kind-driven) ────────────────────────────
  const showAnswer   = isSectionVisible('answer',          kind);
  const showCode     = isSectionVisible('code',            kind);
  const showExpected = isSectionVisible('expected-output', kind);
  const showOptions  = isSectionVisible('options',         kind);
  const showHint     = isSectionVisible('hint',            kind);

  const codeSectionTitle = kind === 'practical' ? 'Starter Code' : 'Code';
  const answerSectionTitle = kind === 'practical' ? 'Solution / Explanation' : 'Answer';

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Questions</h1>
          <p className="admin-page-subtitle">Manage interview questions — synced with Supabase</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="admin-btn admin-btn-secondary"
            onClick={() => dispatch(fetchAdminQuestions())}
            disabled={loading}
            title="Refresh from Supabase"
          >
            <RefreshCw
              size={15}
              style={loading ? { animation: 'spin-slow 1s linear infinite' } : {}}
            />
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={openAdd}
            id="add-question-btn"
            disabled={prereqMissing}
            title={
              platforms.length === 0
                ? 'Add a platform first'
                : questionTypes.length === 0
                ? 'Add a question type first'
                : ''
            }
          >
            <Plus size={16} />
            Add Question
          </button>
        </div>
      </div>

      {error && (
        <div className="platforms-error-banner">
          <AlertCircle size={15} />
          <span>Supabase error: {error}</span>
        </div>
      )}

      {prereqMissing && (
        <div className="questions-prereq-warning">
          <HelpCircle size={16} />
          <span>
            {platforms.length === 0
              ? 'Please add at least one platform before adding questions.'
              : 'Please add at least one question type before adding questions.'}
          </span>
        </div>
      )}

      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-empty">
            <span className="platforms-spinner" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading questions…</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><HelpCircle size={40} /></div>
            <p>No questions yet. Click "Add Question" to start building your question bank.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title / Question</th>
                <th>Platform</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={q.id}>
                  <td style={{ color: 'var(--text-muted)', width: '40px' }}>{idx + 1}</td>
                  <td style={{ maxWidth: '320px' }}>
                    <div className="question-title-cell" title={q.title || q.questions}>
                      {q.title || q.questions || <span style={{ color: 'var(--text-muted)' }}>Untitled</span>}
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-purple">
                      {getPlatformName(q.platformId)}
                    </span>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-green">
                      {getTypeName(q.questionTypeId)}
                    </span>
                  </td>
                  <td>
                    {q.difficulty ? (
                      <span className={`difficulty-pill difficulty-${q.difficulty}`}>
                        {q.difficulty}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="admin-btn admin-btn-icon admin-btn-secondary"
                        onClick={() => openEdit(q)}
                        title="Edit"
                        id={`edit-question-${q.id}`}
                      >
                        <Pencil size={14} />
                      </button>
                      {deleteConfirm === q.id ? (
                        <>
                          <button
                            className="admin-btn admin-btn-sm admin-btn-danger"
                            onClick={() => handleDelete(q.id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="admin-btn admin-btn-sm admin-btn-secondary"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="admin-btn admin-btn-icon admin-btn-danger"
                          onClick={() => setDeleteConfirm(q.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add / Edit Modal ────────────────────────────────────────────────── */}
      <AdminModal
        open={modalOpen}
        onClose={handleClose}
        title={
          previewing
            ? `Preview${editTarget ? ' · ' + (editTarget.title || 'Untitled') : ''}`
            : editTarget ? 'Edit Question' : 'Add Question'
        }
        width="820px"
      >
        {previewing ? (
          <div>
            <div className="questions-preview-toolbar">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setPreviewing(false)}
              >
                <ArrowLeft size={14} />
                Back to Edit
              </button>
              <span className="questions-preview-kind">
                {labelForKind(kind)}
              </span>
            </div>
            <QuestionPreview
              form={form}
              kind={kind}
              platform={selectedPlatform}
              questionType={selectedType}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Section: Basics */}
            <FormSection icon={<FileText size={14} />} title="Basics">
              <div className="admin-form-group">
                <label className="admin-label">Title</label>
                <input
                  className="admin-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Short title or identifier"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">
                  Question <span className="required">*</span>
                </label>
                <textarea
                  className="admin-textarea"
                  value={form.questions}
                  onChange={(e) => setForm({ ...form, questions: e.target.value })}
                  placeholder="The actual question / prompt"
                  rows={3}
                  required
                />
              </div>

              <div className="questions-selectors">
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label className="admin-label">
                    Platform <span className="required">*</span>
                  </label>
                  <select
                    className="admin-select"
                    value={form.platformId}
                    onChange={(e) => setForm({ ...form, platformId: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select platform…</option>
                    {platforms.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label className="admin-label">
                    Question Type <span className="required">*</span>
                  </label>
                  <select
                    className="admin-select"
                    value={form.questionTypeId}
                    onChange={(e) => setForm({ ...form, questionTypeId: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select type…</option>
                    {questionTypes.map((qt) => (
                      <option key={qt.id} value={qt.id}>{qt.name}</option>
                    ))}
                  </select>
                  {selectedType && (
                    <span className="admin-form-hint">
                      Detected: <code>{labelForKind(kind)}</code>
                    </span>
                  )}
                </div>

                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label className="admin-label">Difficulty</label>
                  <select
                    className="admin-select"
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Tags</label>
                <input
                  className="admin-input"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="closures, hoisting, async"
                />
                <span className="admin-form-hint">Comma-separated</span>
              </div>
            </FormSection>

            {/* Section: Code (output-prediction / practical) */}
            {showCode && (
              <FormSection icon={<Code2 size={14} />} title={codeSectionTitle}>
                <div className="admin-form-group">
                  <div className="dqf-code-editor">
                    <div className="dqf-code-header">
                      <span className="dqf-code-lang">javascript</span>
                    </div>
                    <Editor
                      height="240px"
                      language="javascript"
                      value={form.code}
                      onChange={(v) => setForm({ ...form, code: v ?? '' })}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        padding: { top: 12, bottom: 12 },
                        fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
                      }}
                    />
                  </div>
                </div>
              </FormSection>
            )}

            {/* Section: Expected output (output-prediction only) */}
            {showExpected && (
              <FormSection icon={<Code2 size={14} />} title="Expected Output">
                <div className="admin-form-group">
                  <textarea
                    className="admin-textarea"
                    value={form.expectedOutput}
                    onChange={(e) => setForm({ ...form, expectedOutput: e.target.value })}
                    placeholder={'One line per expected output, in order:\nStart\nEnd\nPromise\nTimeout'}
                    rows={5}
                  />
                  <span className="admin-form-hint">
                    Single line for single-answer questions; one line per output (in order) for ordered prediction.
                  </span>
                </div>
              </FormSection>
            )}

            {/* Section: MCQ Options (mcq / output-prediction) */}
            {showOptions && (
              <FormSection
                icon={<ListChecks size={14} />}
                title={kind === 'output-prediction' ? 'Output Options' : 'Options'}
              >
                <div className="dqf-options">
                  {form.options.map((opt, idx) => (
                    <div key={opt.id} className="dqf-option-row">
                      <span className="dqf-option-idx">{String.fromCharCode(65 + idx)}</span>
                      <input
                        className="admin-input"
                        value={opt.label}
                        onChange={(e) => updateOption(opt.id, { label: e.target.value })}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}…`}
                      />
                      <label className="dqf-correct-toggle" title="Mark as correct">
                        <input
                          type="checkbox"
                          checked={opt.isCorrect}
                          onChange={(e) => updateOption(opt.id, { isCorrect: e.target.checked })}
                        />
                        <span className={`dqf-correct-pill ${opt.isCorrect ? 'correct' : ''}`}>
                          {opt.isCorrect ? '✓ Correct' : 'Correct?'}
                        </span>
                      </label>
                      <button
                        type="button"
                        className="admin-btn admin-btn-icon admin-btn-danger"
                        onClick={() => removeOption(opt.id)}
                        title="Remove option"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-secondary dqf-add-option"
                    onClick={addOption}
                  >
                    <Plus size={13} />
                    Add Option
                  </button>
                </div>
              </FormSection>
            )}

            {/* Section: Answer (theory / practical) */}
            {showAnswer && (
              <FormSection icon={<FileText size={14} />} title={answerSectionTitle}>
                <div className="admin-form-group">
                  <RichTextEditor
                    value={form.answer}
                    onChange={(val) => setForm({ ...form, answer: val })}
                    placeholder="Write the answer in markdown…"
                  />
                </div>
              </FormSection>
            )}

            {/* Section: Hint */}
            {showHint && (
              <FormSection icon={<Lightbulb size={14} />} title="Hint (optional)">
                <div className="admin-form-group">
                  <textarea
                    className="admin-textarea"
                    value={form.hint}
                    onChange={(e) => setForm({ ...form, hint: e.target.value })}
                    placeholder="Optional hint for the candidate"
                    rows={3}
                  />
                </div>
              </FormSection>
            )}

            {saveError && (
              <div className="platforms-error-banner" style={{ marginTop: '8px' }}>
                <AlertCircle size={14} />
                <span>{saveError}</span>
              </div>
            )}

            <div className="admin-form-actions">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setPreviewing(true)}
                disabled={!form.questionTypeId || !form.platformId}
                title={
                  !form.questionTypeId || !form.platformId
                    ? 'Pick platform and type first'
                    : 'Preview how this question will render'
                }
              >
                <Eye size={14} />
                Preview
              </button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? (
                  <span className="admin-login-spinner" style={{ width: '16px', height: '16px' }} />
                ) : editTarget ? (
                  'Save Changes'
                ) : (
                  'Add Question'
                )}
              </button>
            </div>
          </form>
        )}
      </AdminModal>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const labelForKind = (kind: ReturnType<typeof detectQuestionKind>) => {
  switch (kind) {
    case 'theory': return 'Theory';
    case 'output-prediction': return 'Output Prediction';
    case 'practical': return 'Practical';
    case 'mcq': return 'Multiple Choice';
    default: return 'Generic';
  }
};

/**
 * Strip fields that don't apply to the detected kind so the DB doesn't
 * keep stale data when the admin switches type after entering values.
 */
const applyKindMask = (
  form: FormState,
  kind: ReturnType<typeof detectQuestionKind>,
): FormState => {
  const masked: FormState = { ...form };
  if (!isSectionVisible('answer',          kind)) masked.answer = '';
  if (!isSectionVisible('code',            kind)) masked.code = '';
  if (!isSectionVisible('expected-output', kind)) masked.expectedOutput = '';
  if (!isSectionVisible('options',         kind)) masked.options = [];
  // hint is always optional → keep as-is
  return masked;
};

// ── Section wrapper ───────────────────────────────────────────────────────────

const FormSection = ({
  icon, title, children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="questions-section">
    <div className="questions-section-header">
      <span className="questions-section-icon">{icon}</span>
      <span className="questions-section-title">{title}</span>
    </div>
    <div className="questions-section-body">{children}</div>
  </div>
);

export default AdminQuestions;
