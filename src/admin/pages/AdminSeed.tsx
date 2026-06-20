import { useEffect, useMemo, useState } from 'react';
import {
  Database, AlertCircle, CheckCircle2, RefreshCw, Sparkles, Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAdminQuestions } from '../../store/slices/adminQuestionsSlice';
import { supabase } from '../../lib/supabase';
import {
  jsTheoryQuestions,
  reactTheoryQuestions,
  nodeTheoryQuestions,
  tsTheoryQuestions,
  htmlTheoryQuestions,
  cssTheoryQuestions,
  reactNativeTheoryQuestions,
  type TheoryQuestion,
} from '../../data/parsedQuestions';
import '../admin.css';
import './AdminSeed.css';

// ── Source mapping ────────────────────────────────────────────────────────────
//
// Each source maps a hardcoded array to a platform `key` already present in
// the Supabase Platforms table.

interface SeedSource {
  platformKey: string;
  label: string;
  list: TheoryQuestion[];
}

const SOURCES: SeedSource[] = [
  { platformKey: 'js',           label: 'JavaScript',   list: jsTheoryQuestions },
  { platformKey: 'react',        label: 'React',        list: reactTheoryQuestions },
  { platformKey: 'node',         label: 'Node.js',      list: nodeTheoryQuestions },
  { platformKey: 'ts',           label: 'TypeScript',   list: tsTheoryQuestions },
  { platformKey: 'html',         label: 'HTML',         list: htmlTheoryQuestions },
  { platformKey: 'css',          label: 'CSS',          list: cssTheoryQuestions },
  { platformKey: 'react-native', label: 'React Native', list: reactNativeTheoryQuestions },
];

// ── Progress shape ────────────────────────────────────────────────────────────

interface SeedError {
  platformKey: string;
  questionId: string;
  message: string;
}

interface SeedProgress {
  done: number;
  total: number;
  inserted: number;
  skipped: number;
  errors: SeedError[];
  current: string;
  perPlatform: Record<string, { inserted: number; skipped: number }>;
}

const EMPTY_PROGRESS: SeedProgress = {
  done: 0,
  total: 0,
  inserted: 0,
  skipped: 0,
  errors: [],
  current: '',
  perPlatform: {},
};

// ── Page ─────────────────────────────────────────────────────────────────────

const AdminSeed = () => {
  const dispatch = useAppDispatch();
  const platforms = useAppSelector((s) => s.adminPlatforms.data);
  const questionTypes = useAppSelector((s) => s.adminQuestionTypes.data);

  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState<SeedProgress>(EMPTY_PROGRESS);
  const [completed, setCompleted] = useState(false);

  // Default the type to anything that contains "theory" (case-insensitive).
  useEffect(() => {
    if (!selectedTypeId && questionTypes.length) {
      const theory = questionTypes.find((qt) => /theory/i.test(qt.name));
      setSelectedTypeId(theory?.id ?? questionTypes[0].id);
    }
  }, [questionTypes, selectedTypeId]);

  // Pre-compute totals, and which sources are missing platforms.
  const summary = useMemo(() => {
    return SOURCES.map((src) => {
      const platform = platforms.find((p) => p.key === src.platformKey);
      return {
        ...src,
        platform,
        count: src.list.length,
      };
    });
  }, [platforms]);

  const totalCount = summary.reduce((s, x) => s + x.count, 0);
  const missingPlatforms = summary.filter((s) => !s.platform);

  const handleSeed = async () => {
    if (!selectedTypeId) return;

    setSeeding(true);
    setCompleted(false);
    setProgress({ ...EMPTY_PROGRESS, total: totalCount });

    // ── 1. Fetch existing titles for this question type (single query) ────
    let existingKeys = new Set<string>();
    try {
      const { data, error } = await supabase
        .from('Quesitons')
        .select('title, platform_id')
        .eq('question_type_id', Number(selectedTypeId));

      if (error) throw new Error(error.message);
      existingKeys = new Set(
        (data ?? []).map((r: { title: string | null; platform_id: number | string | null }) =>
          `${r.platform_id}|${(r.title ?? '').trim().toLowerCase()}`
        )
      );
    } catch (e) {
      // Pre-fetch failure shouldn't be fatal — we can still try inserts.
      console.warn('Pre-fetch existing titles failed:', e);
    }

    // ── 2. Loop platforms / questions sequentially ────────────────────────
    for (const src of summary) {
      if (!src.platform) {
        // Mark every question as skipped with a reason.
        for (const q of src.list) {
          setProgress((p) => ({
            ...p,
            done: p.done + 1,
            skipped: p.skipped + 1,
            current: `Skipped ${q.id} — platform "${src.platformKey}" not in DB`,
            perPlatform: bumpPlatform(p.perPlatform, src.platformKey, 'skipped'),
          }));
        }
        continue;
      }

      const platformId = Number(src.platform.id);

      for (const q of src.list) {
        const key = `${platformId}|${q.question.trim().toLowerCase()}`;
        setProgress((p) => ({ ...p, current: `${src.label}: ${q.question.slice(0, 80)}` }));

        // Skip duplicates
        if (existingKeys.has(key)) {
          setProgress((p) => ({
            ...p,
            done: p.done + 1,
            skipped: p.skipped + 1,
            perPlatform: bumpPlatform(p.perPlatform, src.platformKey, 'skipped'),
          }));
          continue;
        }

        try {
          const { error } = await supabase.from('Quesitons').insert({
            title: q.question,
            questions: q.question,
            answer: q.answer,
            platform_id: platformId,
            question_type_id: Number(selectedTypeId),
            tags: 'theory',
          });

          if (error) throw new Error(error.message);

          existingKeys.add(key); // local dedup for this run
          setProgress((p) => ({
            ...p,
            done: p.done + 1,
            inserted: p.inserted + 1,
            perPlatform: bumpPlatform(p.perPlatform, src.platformKey, 'inserted'),
          }));
        } catch (err) {
          setProgress((p) => ({
            ...p,
            done: p.done + 1,
            errors: [
              ...p.errors,
              { platformKey: src.platformKey, questionId: q.id, message: errMsg(err) },
            ],
          }));
        }
      }
    }

    setSeeding(false);
    setCompleted(true);
    // Refresh the Questions slice so the Questions page picks them up immediately.
    dispatch(fetchAdminQuestions());
  };

  const reset = () => {
    setProgress(EMPTY_PROGRESS);
    setCompleted(false);
  };

  const percent = progress.total === 0
    ? 0
    : Math.round((progress.done / progress.total) * 100);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Seed Theory Questions</h1>
          <p className="admin-page-subtitle">
            Import all hardcoded theory questions into Supabase, mapped by platform.
          </p>
        </div>
      </div>

      {/* Pre-flight info */}
      <div className="seed-grid">
        <div className="seed-card">
          <div className="seed-card-header">
            <Database size={16} />
            <span>Source counts</span>
          </div>
          <table className="admin-table seed-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>DB key</th>
                <th>Mapped to</th>
                <th>Questions</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.platformKey}>
                  <td>{s.label}</td>
                  <td><code>{s.platformKey}</code></td>
                  <td>
                    {s.platform ? (
                      <span className="admin-badge admin-badge-purple">{s.platform.name}</span>
                    ) : (
                      <span className="admin-badge admin-badge-danger">Missing</span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{s.count}</td>
                </tr>
              ))}
              <tr className="seed-total-row">
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Total</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {totalCount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="seed-card">
          <div className="seed-card-header">
            <Sparkles size={16} />
            <span>Target settings</span>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">
              Question Type <span className="required">*</span>
            </label>
            <select
              className="admin-select"
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              disabled={seeding || questionTypes.length === 0}
            >
              <option value="" disabled>Select type…</option>
              {questionTypes.map((qt) => (
                <option key={qt.id} value={qt.id}>{qt.name}</option>
              ))}
            </select>
            <span className="admin-form-hint">
              Pick the Supabase question type to attach these to (e.g. "Theory").
            </span>
          </div>

          {missingPlatforms.length > 0 && (
            <div className="platforms-error-banner" style={{ marginTop: '8px' }}>
              <AlertCircle size={14} />
              <span>
                Missing platform key{missingPlatforms.length > 1 ? 's' : ''}:{' '}
                {missingPlatforms.map((m) => m.platformKey).join(', ')}.
                Add them on the Platforms page first — those questions will be skipped.
              </span>
            </div>
          )}

          <div className="seed-actions">
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={handleSeed}
              disabled={seeding || !selectedTypeId || questionTypes.length === 0}
            >
              {seeding ? (
                <>
                  <Loader2 size={16} className="seed-spin" />
                  Seeding…
                </>
              ) : (
                <>
                  <Database size={16} />
                  Start Seeding
                </>
              )}
            </button>
            {completed && !seeding && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={reset}
              >
                <RefreshCw size={14} />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      {(seeding || completed) && (
        <div className="seed-card seed-progress-card">
          <div className="seed-card-header">
            {completed ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="seed-spin" />}
            <span>{completed ? 'Done' : 'Seeding in progress'}</span>
          </div>

          <div className="seed-progress-row">
            <span className="seed-progress-label">
              {progress.done} / {progress.total}
            </span>
            <div className="seed-progress-bar">
              <div className="seed-progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <span className="seed-progress-percent">{percent}%</span>
          </div>

          <div className="seed-stats">
            <div className="seed-stat seed-stat-inserted">
              <span className="seed-stat-num">{progress.inserted}</span>
              <span className="seed-stat-label">Inserted</span>
            </div>
            <div className="seed-stat seed-stat-skipped">
              <span className="seed-stat-num">{progress.skipped}</span>
              <span className="seed-stat-label">Skipped</span>
            </div>
            <div className="seed-stat seed-stat-errors">
              <span className="seed-stat-num">{progress.errors.length}</span>
              <span className="seed-stat-label">Errors</span>
            </div>
          </div>

          {seeding && progress.current && (
            <div className="seed-current">{progress.current}</div>
          )}

          {/* Per-platform breakdown */}
          {Object.keys(progress.perPlatform).length > 0 && (
            <table className="admin-table seed-table" style={{ marginTop: '12px' }}>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Inserted</th>
                  <th>Skipped</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((src) => {
                  const stats = progress.perPlatform[src.platformKey];
                  if (!stats) return null;
                  return (
                    <tr key={src.platformKey}>
                      <td>{src.label}</td>
                      <td style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                        {stats.inserted ?? 0}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {stats.skipped ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Errors */}
          {progress.errors.length > 0 && (
            <details className="seed-errors">
              <summary>
                {progress.errors.length} error{progress.errors.length > 1 ? 's' : ''} —
                click to expand
              </summary>
              <ul>
                {progress.errors.slice(0, 50).map((err, i) => (
                  <li key={i}>
                    <code>{err.questionId}</code> ({err.platformKey}) — {err.message}
                  </li>
                ))}
                {progress.errors.length > 50 && (
                  <li className="seed-error-more">
                    …and {progress.errors.length - 50} more
                  </li>
                )}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const bumpPlatform = (
  current: SeedProgress['perPlatform'],
  key: string,
  bucket: 'inserted' | 'skipped',
): SeedProgress['perPlatform'] => {
  const prev = current[key] ?? { inserted: 0, skipped: 0 };
  return {
    ...current,
    [key]: { ...prev, [bucket]: prev[bucket] + 1 },
  };
};

const errMsg = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return JSON.stringify(e);
};

export default AdminSeed;
