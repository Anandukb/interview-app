import {
  MDXEditor,
  headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin,
  linkPlugin, codeBlockPlugin, codeMirrorPlugin, tablePlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import Editor from '@monaco-editor/react';
import { CheckCircle2, Circle, Lightbulb } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { Badge, DifficultyBadge } from '../../components/ui/Badge';
import { cn } from '../../lib/cn';
import type { AdminQuestion, AdminPlatform, QuestionType } from '../types';
import type { QuestionKind } from './questionKind';

interface PreviewProps {
  form: Omit<AdminQuestion, 'id' | 'createdAt'>;
  kind: QuestionKind;
  platform?: AdminPlatform;
  questionType?: QuestionType;
}

const READ_ONLY_PLUGINS = [
  headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(),
  linkPlugin(), tablePlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
  codeMirrorPlugin({
    codeBlockLanguages: {
      javascript: 'JavaScript', typescript: 'TypeScript', jsx: 'JSX', tsx: 'TSX',
      html: 'HTML', css: 'CSS', json: 'JSON', python: 'Python', bash: 'Bash', txt: 'Plain text',
    },
  }),
];

const QuestionPreview = ({ form, kind, platform, questionType }: PreviewProps) => {
  const { resolvedMode } = useTheme();

  const expectedLines = form.expectedOutput
    .split('\n').map((l) => l.trim()).filter(Boolean);

  const tagList = form.tags.split(',').map((t) => t.trim()).filter(Boolean);

  const showAnswer = !!form.answer && (kind === 'theory' || kind === 'practical' || kind === 'unknown');
  const showCode = !!form.code && (kind === 'output-prediction' || kind === 'practical' || kind === 'unknown');
  const showExpected = expectedLines.length > 0 && (kind === 'output-prediction' || kind === 'unknown');
  const showOptions = form.options.length > 0 && (kind === 'mcq' || kind === 'output-prediction' || kind === 'unknown');
  const showHint = !!form.hint;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-brand/10 via-brand/5 to-brand-2/10 border border-brand/25 p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {platform && <Badge tone="brand">{platform.name}</Badge>}
          {questionType && <Badge tone="success">{questionType.name}</Badge>}
          {form.difficulty && <DifficultyBadge value={form.difficulty} />}
        </div>
        <h2 className="text-xl font-bold tracking-tight leading-snug">
          {form.title || 'Untitled'}
        </h2>
        {form.questions && form.questions !== form.title && (
          <p className="mt-2 text-sm text-fg-muted leading-relaxed">{form.questions}</p>
        )}
        {tagList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tagList.map((t) => (
              <span key={t} className="text-xs font-mono text-brand bg-brand/10 border border-brand/25 rounded px-2 py-0.5">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {showCode && (
        <PreviewSection title={kind === 'practical' ? 'Starter Code' : 'Code'}>
          <div className="bg-[#1e1e1e]">
            <Editor
              height="240px"
              language="javascript"
              value={form.code}
              theme="vs-dark"
              options={{
                readOnly: true, minimap: { enabled: false }, fontSize: 13,
                lineNumbers: 'on', scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
              }}
            />
          </div>
        </PreviewSection>
      )}

      {showExpected && (
        <PreviewSection title={`Expected Output${expectedLines.length > 1 ? ' (in order)' : ''}`}>
          <div className="px-4 py-3 space-y-2">
            {expectedLines.map((line, i) => (
              <div key={i} className="flex items-center gap-3">
                {expectedLines.length > 1 && (
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-brand/15 border border-brand/30 text-brand text-xs font-bold">
                    {i + 1}
                  </span>
                )}
                <code className="px-2.5 py-1 rounded-md bg-surface-3 border border-border font-mono text-sm">
                  {line}
                </code>
              </div>
            ))}
          </div>
        </PreviewSection>
      )}

      {showOptions && (
        <PreviewSection title={kind === 'output-prediction' ? 'Output Options' : 'Options'}>
          <div className="px-4 py-3 space-y-2">
            {form.options.map((opt, i) => (
              <div
                key={opt.id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors',
                  opt.isCorrect
                    ? 'bg-success/10 border-success/30'
                    : 'bg-surface-3 border-border'
                )}
              >
                <span className={cn(
                  'inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold border',
                  opt.isCorrect
                    ? 'bg-success/20 border-success/40 text-success'
                    : 'bg-surface-2 border-border text-fg-subtle'
                )}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-sm">
                  {opt.label || <em className="text-fg-subtle">(empty)</em>}
                </span>
                {opt.isCorrect
                  ? <CheckCircle2 size={16} className="text-success" />
                  : <Circle size={16} className="text-fg-subtle" />
                }
              </div>
            ))}
          </div>
        </PreviewSection>
      )}

      {showAnswer && (
        <PreviewSection title={kind === 'practical' ? 'Solution / Explanation' : 'Answer'}>
          <div className="qp-answer">
            <MDXEditor
              key={form.answer}
              markdown={form.answer}
              readOnly
              className={cn(
                'rte-mdx',
                resolvedMode === 'dark' ? 'dark-theme dark-editor' : 'light-editor'
              )}
              contentEditableClassName="rte-mdx-content"
              plugins={READ_ONLY_PLUGINS}
            />
          </div>
        </PreviewSection>
      )}

      {showHint && (
        <PreviewSection title="Hint" tone="warning" icon={<Lightbulb size={14} />}>
          <div className="px-4 py-3 text-sm italic text-fg-muted whitespace-pre-wrap">{form.hint}</div>
        </PreviewSection>
      )}

      {!form.title && !form.questions && !showAnswer && !showCode && !showExpected && !showOptions && !showHint && (
        <div className="py-12 px-6 text-center text-fg-subtle italic border border-dashed border-border rounded-lg">
          Nothing to preview yet. Fill in the form to see how the question will look.
        </div>
      )}
    </div>
  );
};

const PreviewSection = ({
  title, children, tone = 'brand', icon,
}: {
  title: string;
  children: React.ReactNode;
  tone?: 'brand' | 'warning';
  icon?: React.ReactNode;
}) => (
  <div className={cn(
    'rounded-xl border overflow-hidden',
    tone === 'warning' ? 'bg-warning/5 border-warning/30' : 'bg-surface border-border'
  )}>
    <div className={cn(
      'px-4 py-2.5 border-b text-xs font-bold uppercase tracking-wider flex items-center gap-2',
      tone === 'warning'
        ? 'bg-warning/10 border-warning/30 text-warning'
        : 'bg-brand/8 border-border text-brand'
    )}>
      {icon}
      {title}
    </div>
    {children}
  </div>
);

export default QuestionPreview;
