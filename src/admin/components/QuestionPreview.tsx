import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  tablePlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import Editor from '@monaco-editor/react';
import { CheckCircle2, Circle, Lightbulb } from 'lucide-react';
import type { AdminQuestion, AdminPlatform, QuestionType } from '../types';
import type { QuestionKind } from './questionKind';
import './QuestionPreview.css';

interface PreviewProps {
  form: Omit<AdminQuestion, 'id' | 'createdAt'>;
  kind: QuestionKind;
  platform?: AdminPlatform;
  questionType?: QuestionType;
}

const READ_ONLY_PLUGINS = [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  thematicBreakPlugin(),
  linkPlugin(),
  tablePlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
  codeMirrorPlugin({
    codeBlockLanguages: {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      jsx: 'JSX',
      tsx: 'TSX',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      python: 'Python',
      bash: 'Bash',
      txt: 'Plain text',
    },
  }),
];

const QuestionPreview = ({ form, kind, platform, questionType }: PreviewProps) => {
  const expectedLines = form.expectedOutput
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const tagList = form.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const showAnswer = form.answer && (kind === 'theory' || kind === 'practical' || kind === 'unknown');
  const showCode = form.code && (kind === 'output-prediction' || kind === 'practical' || kind === 'unknown');
  const showExpected = expectedLines.length > 0 && (kind === 'output-prediction' || kind === 'unknown');
  const showOptions = form.options.length > 0 && (kind === 'mcq' || kind === 'output-prediction' || kind === 'unknown');
  const showHint = !!form.hint;

  return (
    <div className="qp-root">
      {/* Header */}
      <div className="qp-header">
        <div className="qp-header-meta">
          {platform && (
            <span className="admin-badge admin-badge-purple">{platform.name}</span>
          )}
          {questionType && (
            <span className="admin-badge admin-badge-green">{questionType.name}</span>
          )}
          {form.difficulty && (
            <span className={`difficulty-pill difficulty-${form.difficulty}`}>
              {form.difficulty}
            </span>
          )}
        </div>
        <h2 className="qp-title">{form.title || 'Untitled'}</h2>
        {form.questions && form.questions !== form.title && (
          <p className="qp-prompt">{form.questions}</p>
        )}
        {tagList.length > 0 && (
          <div className="qp-tags">
            {tagList.map((t) => (
              <span key={t} className="qp-tag">#{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Code (output-prediction / practical) */}
      {showCode && (
        <div className="qp-section">
          <div className="qp-section-title">
            {kind === 'practical' ? 'Starter Code' : 'Code'}
          </div>
          <div className="qp-code-wrap">
            <Editor
              height="240px"
              language="javascript"
              value={form.code}
              theme="vs-dark"
              options={{
                readOnly: true,
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
      )}

      {/* Expected output (output-prediction) */}
      {showExpected && (
        <div className="qp-section">
          <div className="qp-section-title">
            Expected Output {expectedLines.length > 1 ? '(in order)' : ''}
          </div>
          <div className="qp-expected">
            {expectedLines.map((line, i) => (
              <div key={i} className="qp-expected-line">
                {expectedLines.length > 1 && (
                  <span className="qp-expected-num">{i + 1}</span>
                )}
                <code>{line}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Options (mcq / output-prediction) */}
      {showOptions && (
        <div className="qp-section">
          <div className="qp-section-title">
            {kind === 'output-prediction' ? 'Output Options' : 'Options'}
          </div>
          <div className="qp-options">
            {form.options.map((opt, i) => (
              <div
                key={opt.id}
                className={`qp-option ${opt.isCorrect ? 'correct' : ''}`}
              >
                <span className="qp-option-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="qp-option-label">
                  {opt.label || <em style={{ color: 'var(--text-muted)' }}>(empty)</em>}
                </span>
                {opt.isCorrect ? (
                  <CheckCircle2 size={16} className="qp-option-icon correct" />
                ) : (
                  <Circle size={16} className="qp-option-icon" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer (theory / practical) — markdown */}
      {showAnswer && (
        <div className="qp-section">
          <div className="qp-section-title">
            {kind === 'practical' ? 'Solution / Explanation' : 'Answer'}
          </div>
          <div className="qp-answer">
            <MDXEditor
              key={form.answer /* force remount on content change */}
              markdown={form.answer}
              readOnly
              className="dark-theme dark-editor rte-mdx qp-mdx"
              contentEditableClassName="rte-mdx-content"
              plugins={READ_ONLY_PLUGINS}
            />
          </div>
        </div>
      )}

      {/* Hint */}
      {showHint && (
        <div className="qp-section qp-hint-section">
          <div className="qp-section-title">
            <Lightbulb size={14} /> Hint
          </div>
          <div className="qp-hint-body">{form.hint}</div>
        </div>
      )}

      {/* Empty state */}
      {!form.title && !form.questions && !showAnswer && !showCode && !showExpected && !showOptions && !showHint && (
        <div className="qp-empty">
          Nothing to preview yet. Fill in the form to see how the question will look.
        </div>
      )}
    </div>
  );
};

export default QuestionPreview;
