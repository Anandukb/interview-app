import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database, AlertCircle, CheckCircle2, Sparkles, Loader2, RefreshCw,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAdminQuestions } from '../../store/slices/adminQuestionsSlice';
import { supabase } from '../../lib/supabase';
import { detectQuestionKind, type QuestionKind } from '../../lib/questionKind';
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
  jsOutputPredictionQuestions,
  reactOutputPredictionQuestions,
  nodeOutputPredictionQuestions,
  tsOutputPredictionQuestions,
  htmlOutputPredictionQuestions,
  cssOutputPredictionQuestions,
  type TheoryQuestion,
  type OutputPredictionQuestion,
} from '../../data/parsedQuestions';
import {
  jsPracticalQuestions,
  reactPracticalQuestions,
  tsPracticalQuestions,
  htmlPracticalQuestions,
  cssPracticalQuestions,
  type Question,
} from '../../data/mockQuestions';
import { nodePracticalQuestions } from '../../data/nodeMockQuestions';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader, ErrorBanner } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { TableWrap, Table, Th, Td, TableRow } from '../../components/ui/Table';

// ── Per-kind row builders ───────────────────────────────────────────────────
// Each dummy-data item is turned into a `{ title, row }` pair up front: `title`
// is only used for the dedupe check, `row` is the exact insert payload (minus
// platform_id / question_type_id, which get stamped on per-source below).

interface PreparedItem {
  title: string;
  row: Record<string, unknown>;
}

const theoryItem = (q: TheoryQuestion): PreparedItem => ({
  title: q.question,
  row: { title: q.question, questions: q.question, answer: q.answer, tags: 'theory' },
});

const outputItem = (q: OutputPredictionQuestion): PreparedItem => ({
  title: q.title,
  row: {
    title: q.title,
    questions: q.title,
    code: q.code,
    options: q.options.map((label, i) => ({ id: `opt-${i}`, label })),
    expected_output: q.expectedOutput.join('\n'),
    answer: q.answer ?? '',
    tags: 'output-prediction',
  },
});

const practicalItem = (q: Question): PreparedItem => ({
  title: q.title,
  row: {
    title: q.title,
    questions: q.description,
    code: q.startingCode,
    solution_code: q.answerCode,
    hint: q.hint,
    difficulty: q.difficulty.toLowerCase(),
    tags: 'practical',
  },
});

interface SeedSource {
  platformKey: string;
  kind: QuestionKind;
  label: string;
  items: PreparedItem[];
}

const SOURCES: SeedSource[] = [
  // ── Theory ──
  { platformKey: 'js',           kind: 'theory', label: 'JavaScript — Theory',              items: jsTheoryQuestions.map(theoryItem) },
  { platformKey: 'react',        kind: 'theory', label: 'React — Theory',                   items: reactTheoryQuestions.map(theoryItem) },
  { platformKey: 'node',         kind: 'theory', label: 'Node.js — Theory',                  items: nodeTheoryQuestions.map(theoryItem) },
  { platformKey: 'ts',           kind: 'theory', label: 'TypeScript — Theory',               items: tsTheoryQuestions.map(theoryItem) },
  { platformKey: 'html',         kind: 'theory', label: 'HTML — Theory',                     items: htmlTheoryQuestions.map(theoryItem) },
  { platformKey: 'css',          kind: 'theory', label: 'CSS — Theory',                      items: cssTheoryQuestions.map(theoryItem) },
  { platformKey: 'react-native', kind: 'theory', label: 'React Native — Theory',             items: reactNativeTheoryQuestions.map(theoryItem) },
  { platformKey: 'js',           kind: 'theory', label: 'JS Advanced — Theory',               items: jsAdvancedTheoryQuestions.map(theoryItem) },
  { platformKey: 'react',        kind: 'theory', label: 'React Advanced — Theory',            items: reactAdvancedTheoryQuestions.map(theoryItem) },
  { platformKey: 'react',        kind: 'theory', label: 'State Mgmt, Auth & API — Theory',    items: stateManagementTheoryQuestions.map(theoryItem) },
  // ── Output prediction ──
  { platformKey: 'js',    kind: 'output-prediction', label: 'JavaScript — Output Prediction', items: jsOutputPredictionQuestions.map(outputItem) },
  { platformKey: 'react', kind: 'output-prediction', label: 'React — Output Prediction',      items: reactOutputPredictionQuestions.map(outputItem) },
  { platformKey: 'node',  kind: 'output-prediction', label: 'Node.js — Output Prediction',    items: nodeOutputPredictionQuestions.map(outputItem) },
  { platformKey: 'ts',    kind: 'output-prediction', label: 'TypeScript — Output Prediction', items: tsOutputPredictionQuestions.map(outputItem) },
  { platformKey: 'html',  kind: 'output-prediction', label: 'HTML — Output Prediction',       items: htmlOutputPredictionQuestions.map(outputItem) },
  { platformKey: 'css',   kind: 'output-prediction', label: 'CSS — Output Prediction',        items: cssOutputPredictionQuestions.map(outputItem) },
  // ── Practical ──
  { platformKey: 'js',    kind: 'practical', label: 'JavaScript — Practical', items: jsPracticalQuestions.map(practicalItem) },
  { platformKey: 'react', kind: 'practical', label: 'React — Practical',     items: reactPracticalQuestions.map(practicalItem) },
  { platformKey: 'node',  kind: 'practical', label: 'Node.js — Practical',   items: nodePracticalQuestions.map(practicalItem) },
  { platformKey: 'ts',    kind: 'practical', label: 'TypeScript — Practical', items: tsPracticalQuestions.map(practicalItem) },
  { platformKey: 'html',  kind: 'practical', label: 'HTML — Practical',      items: htmlPracticalQuestions.map(practicalItem) },
  { platformKey: 'css',   kind: 'practical', label: 'CSS — Practical',       items: cssPracticalQuestions.map(practicalItem) },
];

interface SeedError { source: string; title: string; message: string; }
interface SeedProgress {
  done: number;
  total: number;
  inserted: number;
  skipped: number;
  errors: SeedError[];
  current: string;
  perSource: Record<string, { inserted: number; skipped: number }>;
}
const EMPTY_PROGRESS: SeedProgress = {
  done: 0, total: 0, inserted: 0, skipped: 0, errors: [], current: '', perSource: {},
};

const kindLabel = (kind: QuestionKind) => {
  switch (kind) {
    case 'theory': return 'Theory';
    case 'output-prediction': return 'Output Prediction';
    case 'practical': return 'Practical';
    case 'mcq': return 'Multiple Choice';
    default: return 'Unknown';
  }
};

const AdminSeed = () => {
  const dispatch = useAppDispatch();
  const platforms = useAppSelector((s) => s.adminPlatforms.data);
  const questionTypes = useAppSelector((s) => s.adminQuestionTypes.data);

  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState<SeedProgress>(EMPTY_PROGRESS);
  const [completed, setCompleted] = useState(false);

  const summary = useMemo(() =>
    SOURCES.map((src) => ({
      ...src,
      platform: platforms.find((p) => p.key === src.platformKey),
      typeId: questionTypes.find((qt) => detectQuestionKind(qt.name) === src.kind)?.id,
      count: src.items.length,
    })),
    [platforms, questionTypes]
  );

  const sourceKey = (s: { platformKey: string; kind: QuestionKind }) => `${s.platformKey}|${s.kind}`;

  const totalCount = summary.reduce((s, x) => s + x.count, 0);
  const missingPlatforms = [...new Set(summary.filter((s) => !s.platform).map((s) => s.platformKey))];
  const missingKinds = [...new Set(summary.filter((s) => !s.typeId).map((s) => s.kind))];
  const readySources = summary.filter((s) => s.platform && s.typeId);
  const readyCount = readySources.reduce((s, x) => s + x.count, 0);

  const handleSeed = async () => {
    setSeeding(true);
    setCompleted(false);
    setProgress({ ...EMPTY_PROGRESS, total: totalCount });

    let existingKeys = new Set<string>();
    try {
      const { data, error } = await supabase
        .from('Quesitons')
        .select('title, platform_id, question_type_id');
      if (error) throw new Error(error.message);
      existingKeys = new Set(
        (data ?? []).map((r: { title: string | null; platform_id: number | string | null; question_type_id: number | string | null }) =>
          `${r.platform_id}|${r.question_type_id}|${(r.title ?? '').trim().toLowerCase()}`
        )
      );
    } catch (e) {
      console.warn('Pre-fetch existing titles failed:', e);
    }

    for (const src of summary) {
      const key = sourceKey(src);

      if (!src.platform || !src.typeId) {
        for (const item of src.items) {
          setProgress((p) => ({
            ...p,
            done: p.done + 1, skipped: p.skipped + 1,
            current: !src.platform
              ? `Skipped ${item.title.slice(0, 60)} — platform "${src.platformKey}" not in DB`
              : `Skipped ${item.title.slice(0, 60)} — no question type maps to "${src.kind}"`,
            perSource: bumpSource(p.perSource, key, 'skipped'),
          }));
        }
        continue;
      }

      const platformId = Number(src.platform.id);
      const typeId = Number(src.typeId);

      for (const item of src.items) {
        const dedupeKey = `${platformId}|${typeId}|${item.title.trim().toLowerCase()}`;
        setProgress((p) => ({ ...p, current: `${src.label}: ${item.title.slice(0, 80)}` }));

        if (existingKeys.has(dedupeKey)) {
          setProgress((p) => ({
            ...p, done: p.done + 1, skipped: p.skipped + 1,
            perSource: bumpSource(p.perSource, key, 'skipped'),
          }));
          continue;
        }

        try {
          const { error } = await supabase.from('Quesitons').insert({
            ...item.row,
            platform_id: platformId,
            question_type_id: typeId,
          });
          if (error) throw new Error(error.message);

          existingKeys.add(dedupeKey);
          setProgress((p) => ({
            ...p, done: p.done + 1, inserted: p.inserted + 1,
            perSource: bumpSource(p.perSource, key, 'inserted'),
          }));
        } catch (err) {
          setProgress((p) => ({
            ...p, done: p.done + 1,
            errors: [...p.errors, { source: src.label, title: item.title, message: errMsg(err) }],
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
        title="Seed Questions"
        description="Import every hardcoded question (theory, output-prediction, practical) into Supabase, mapped by platform and type."
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
                  <Th>Source</Th>
                  <Th>Platform</Th>
                  <Th>Type</Th>
                  <Th className="text-right">Questions</Th>
                </tr>
              </thead>
              <tbody>
                {summary.map((s) => (
                  <TableRow key={sourceKey(s) + s.label}>
                    <Td className="font-medium">{s.label}</Td>
                    <Td>
                      {s.platform
                        ? <Badge tone="brand">{s.platform.name}</Badge>
                        : <Badge tone="danger">Missing "{s.platformKey}"</Badge>}
                    </Td>
                    <Td>
                      {s.typeId
                        ? <Badge tone="success">{kindLabel(s.kind)}</Badge>
                        : <Badge tone="danger">No "{kindLabel(s.kind)}" type</Badge>}
                    </Td>
                    <Td className="text-right font-mono">{s.count}</Td>
                  </TableRow>
                ))}
                <TableRow className="bg-surface-2">
                  <Td colSpan={3} className="text-right font-semibold">Total ({readyCount} ready)</Td>
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
            <CardTitle>Seed everything</CardTitle>
          </CardHeader>

          <p className="text-sm text-fg-muted">
            One click inserts every question above that isn't already in Supabase (matched by
            platform + type + title), across all three question kinds.
          </p>

          {(missingPlatforms.length > 0 || missingKinds.length > 0) && (
            <ErrorBanner>
              <AlertCircle size={14} />
              <span>
                {missingPlatforms.length > 0 && (
                  <>Missing platform key{missingPlatforms.length > 1 ? 's' : ''}: {missingPlatforms.join(', ')}. </>
                )}
                {missingKinds.length > 0 && (
                  <>No question type maps to: {missingKinds.map(kindLabel).join(', ')}. </>
                )}
                Those rows will be skipped.
              </span>
            </ErrorBanner>
          )}

          <div className="flex items-center gap-2 mt-auto">
            <Button
              onClick={handleSeed}
              disabled={readyCount === 0}
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

          {/* Per-source */}
          {Object.keys(progress.perSource).length > 0 && (
            <div className="mt-4">
              <TableWrap>
                <Table>
                  <thead>
                    <tr><Th>Source</Th><Th>Inserted</Th><Th>Skipped</Th></tr>
                  </thead>
                  <tbody>
                    {summary.map((src) => {
                      const stats = progress.perSource[sourceKey(src)];
                      if (!stats) return null;
                      return (
                        <TableRow key={sourceKey(src) + src.label}>
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
                    <code className="px-1.5 py-0.5 rounded bg-surface-3 text-xs font-mono">{err.title.slice(0, 40)}</code>
                    {' '}({err.source}) — {err.message}
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

const bumpSource = (
  current: SeedProgress['perSource'], key: string, bucket: 'inserted' | 'skipped',
): SeedProgress['perSource'] => {
  const prev = current[key] ?? { inserted: 0, skipped: 0 };
  return { ...current, [key]: { ...prev, [bucket]: prev[bucket] + 1 } };
};

const errMsg = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return JSON.stringify(e);
};

export default AdminSeed;
