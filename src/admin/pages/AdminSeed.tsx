import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database, AlertCircle, CheckCircle2, Sparkles, Loader2, RefreshCw,
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
  jsAdvancedTheoryQuestions,
  reactAdvancedTheoryQuestions,
  stateManagementTheoryQuestions,
  type TheoryQuestion,
} from '../../data/parsedQuestions';
import { Button } from '../../components/ui/Button';
import { Select, Field } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { PageHeader, ErrorBanner } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { TableWrap, Table, Th, Td, TableRow } from '../../components/ui/Table';

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
  { platformKey: 'js',           label: 'JS Advanced (Memory, Generators, Polyfills)', list: jsAdvancedTheoryQuestions },
  { platformKey: 'react',        label: 'React Advanced (Fiber, Concurrent, Patterns)', list: reactAdvancedTheoryQuestions },
  { platformKey: 'react',        label: 'State Mgmt, Auth & API', list: stateManagementTheoryQuestions },
];

interface SeedError { platformKey: string; questionId: string; message: string; }
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
  done: 0, total: 0, inserted: 0, skipped: 0, errors: [], current: '', perPlatform: {},
};

const AdminSeed = () => {
  const dispatch = useAppDispatch();
  const platforms = useAppSelector((s) => s.adminPlatforms.data);
  const questionTypes = useAppSelector((s) => s.adminQuestionTypes.data);

  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState<SeedProgress>(EMPTY_PROGRESS);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!selectedTypeId && questionTypes.length) {
      const theory = questionTypes.find((qt) => /theory/i.test(qt.name));
      setSelectedTypeId(theory?.id ?? questionTypes[0].id);
    }
  }, [questionTypes, selectedTypeId]);

  const summary = useMemo(() =>
    SOURCES.map((src) => ({
      ...src,
      platform: platforms.find((p) => p.key === src.platformKey),
      count: src.list.length,
    })),
    [platforms]
  );

  const totalCount = summary.reduce((s, x) => s + x.count, 0);
  const missingPlatforms = summary.filter((s) => !s.platform);

  const handleSeed = async () => {
    if (!selectedTypeId) return;

    setSeeding(true);
    setCompleted(false);
    setProgress({ ...EMPTY_PROGRESS, total: totalCount });

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
      console.warn('Pre-fetch existing titles failed:', e);
    }

    for (const src of summary) {
      if (!src.platform) {
        for (const q of src.list) {
          setProgress((p) => ({
            ...p,
            done: p.done + 1, skipped: p.skipped + 1,
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

        if (existingKeys.has(key)) {
          setProgress((p) => ({
            ...p, done: p.done + 1, skipped: p.skipped + 1,
            perPlatform: bumpPlatform(p.perPlatform, src.platformKey, 'skipped'),
          }));
          continue;
        }

        try {
          const { error } = await supabase.from('Quesitons').insert({
            title: q.question, questions: q.question, answer: q.answer,
            platform_id: platformId, question_type_id: Number(selectedTypeId),
            tags: 'theory',
          });
          if (error) throw new Error(error.message);

          existingKeys.add(key);
          setProgress((p) => ({
            ...p, done: p.done + 1, inserted: p.inserted + 1,
            perPlatform: bumpPlatform(p.perPlatform, src.platformKey, 'inserted'),
          }));
        } catch (err) {
          setProgress((p) => ({
            ...p, done: p.done + 1,
            errors: [...p.errors, { platformKey: src.platformKey, questionId: q.id, message: errMsg(err) }],
          }));
        }
      }
    }

    setSeeding(false);
    setCompleted(true);
    dispatch(fetchAdminQuestions());
  };

  const reset = () => { setProgress(EMPTY_PROGRESS); setCompleted(false); };

  const percent = progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100);

  return (
    <div>
      <PageHeader
        title="Seed Theory Questions"
        description="Import all hardcoded theory questions into Supabase, mapped by platform."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        {/* Source counts */}
        <Card className="lg:col-span-3" bleed>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Database size={16} className="text-brand" />
            <span className="text-sm font-bold uppercase tracking-wider text-fg-muted">Source counts</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Platform</Th>
                  <Th>DB key</Th>
                  <Th>Mapped to</Th>
                  <Th className="text-right">Questions</Th>
                </tr>
              </thead>
              <tbody>
                {summary.map((s) => (
                  <TableRow key={s.platformKey}>
                    <Td className="font-medium">{s.label}</Td>
                    <Td><code className="px-1.5 py-0.5 rounded bg-brand/10 text-brand text-xs font-mono">{s.platformKey}</code></Td>
                    <Td>
                      {s.platform
                        ? <Badge tone="brand">{s.platform.name}</Badge>
                        : <Badge tone="danger">Missing</Badge>}
                    </Td>
                    <Td className="text-right font-mono">{s.count}</Td>
                  </TableRow>
                ))}
                <TableRow className="bg-surface-2">
                  <Td colSpan={3} className="text-right font-semibold">Total</Td>
                  <Td className="text-right font-mono font-bold text-brand">{totalCount}</Td>
                </TableRow>
              </tbody>
            </Table>
          </div>
        </Card>

        {/* Target settings */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <CardHeader>
            <Sparkles size={16} className="text-brand" />
            <CardTitle>Target settings</CardTitle>
          </CardHeader>

          <Field
            label="Question Type"
            required
            hint='Pick the Supabase question type to attach these to (e.g. "Theory").'
          >
            <Select
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              disabled={seeding || questionTypes.length === 0}
            >
              <option value="" disabled>Select type…</option>
              {questionTypes.map((qt) => (
                <option key={qt.id} value={qt.id}>{qt.name}</option>
              ))}
            </Select>
          </Field>

          {missingPlatforms.length > 0 && (
            <ErrorBanner>
              <AlertCircle size={14} />
              <span>
                Missing platform key{missingPlatforms.length > 1 ? 's' : ''}:{' '}
                {missingPlatforms.map((m) => m.platformKey).join(', ')}.
                Add them on Platforms first — those questions will be skipped.
              </span>
            </ErrorBanner>
          )}

          <div className="flex items-center gap-2 mt-auto">
            <Button
              onClick={handleSeed}
              disabled={!selectedTypeId || questionTypes.length === 0}
              loading={seeding}
              leftIcon={!seeding && <Database size={16} />}
              className="flex-1"
            >
              {seeding ? 'Seeding…' : 'Start Seeding'}
            </Button>
            {completed && !seeding && (
              <Button variant="secondary" onClick={reset} leftIcon={<RefreshCw size={14} />}>Reset</Button>
            )}
          </div>
        </Card>
      </div>

      {(seeding || completed) && (
        <Card>
          <CardHeader>
            {completed
              ? <CheckCircle2 size={16} className="text-success" />
              : <Loader2 size={16} className="text-brand animate-[spin-slow_1s_linear_infinite]" />
            }
            <CardTitle>{completed ? 'Done' : 'Seeding in progress'}</CardTitle>
          </CardHeader>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-5">
            <span className="min-w-[80px] font-mono text-sm text-fg-muted">
              {progress.done} / {progress.total}
            </span>
            <div className="flex-1 h-2 bg-surface-3 border border-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand to-brand-2"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ type: 'tween', duration: 0.18 }}
              />
            </div>
            <span className="min-w-[40px] text-right font-mono text-sm text-brand">{percent}%</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <StatTile label="Inserted" value={progress.inserted} tone="success" />
            <StatTile label="Skipped"  value={progress.skipped}  tone="muted" />
            <StatTile label="Errors"   value={progress.errors.length} tone="danger" />
          </div>

          {seeding && progress.current && (
            <div className="font-mono text-xs text-fg-muted bg-surface-3 border border-border rounded-md px-3 py-2 truncate">
              {progress.current}
            </div>
          )}

          {/* Per-platform */}
          {Object.keys(progress.perPlatform).length > 0 && (
            <div className="mt-4">
              <TableWrap>
                <Table>
                  <thead>
                    <tr><Th>Platform</Th><Th>Inserted</Th><Th>Skipped</Th></tr>
                  </thead>
                  <tbody>
                    {summary.map((src) => {
                      const stats = progress.perPlatform[src.platformKey];
                      if (!stats) return null;
                      return (
                        <TableRow key={src.platformKey}>
                          <Td className="font-medium">{src.label}</Td>
                          <Td className="font-mono text-success">{stats.inserted ?? 0}</Td>
                          <Td className="font-mono text-fg-muted">{stats.skipped ?? 0}</Td>
                        </TableRow>
                      );
                    })}
                  </tbody>
                </Table>
              </TableWrap>
            </div>
          )}

          {progress.errors.length > 0 && (
            <details className="mt-4 px-4 py-3 rounded-lg bg-danger/5 border border-danger/30">
              <summary className="cursor-pointer text-sm font-semibold text-danger">
                {progress.errors.length} error{progress.errors.length > 1 ? 's' : ''} — click to expand
              </summary>
              <ul className="mt-2 pl-5 text-sm text-fg-muted space-y-1">
                {progress.errors.slice(0, 50).map((err, i) => (
                  <li key={i}>
                    <code className="px-1.5 py-0.5 rounded bg-surface-3 text-xs font-mono">{err.questionId}</code>
                    {' '}({err.platformKey}) — {err.message}
                  </li>
                ))}
                {progress.errors.length > 50 && (
                  <li className="italic text-fg-subtle">…and {progress.errors.length - 50} more</li>
                )}
              </ul>
            </details>
          )}
        </Card>
      )}
    </div>
  );
};

const StatTile = ({
  label, value, tone,
}: { label: string; value: number; tone: 'success' | 'muted' | 'danger' }) => {
  const colorMap = { success: 'text-success', muted: 'text-fg-muted', danger: 'text-danger' };
  return (
    <div className="bg-surface-3 border border-border rounded-lg p-3 text-center">
      <div className={`text-2xl font-bold font-mono ${colorMap[tone]}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-fg-subtle mt-0.5">{label}</div>
    </div>
  );
};

const bumpPlatform = (
  current: SeedProgress['perPlatform'], key: string, bucket: 'inserted' | 'skipped',
): SeedProgress['perPlatform'] => {
  const prev = current[key] ?? { inserted: 0, skipped: 0 };
  return { ...current, [key]: { ...prev, [bucket]: prev[bucket] + 1 } };
};

const errMsg = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return JSON.stringify(e);
};

export default AdminSeed;
