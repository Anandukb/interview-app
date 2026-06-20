import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import {
  jsTheoryQuestions, reactTheoryQuestions, nodeTheoryQuestions, tsTheoryQuestions,
  htmlTheoryQuestions, cssTheoryQuestions, reactNativeTheoryQuestions,
} from '../data/parsedQuestions';
import { PageShell } from '../components/PageShell';
import { PageNav } from '../components/PageNav';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/cn';

// ── Markdown rendering ────────────────────────────────────────────────────────

const renderInlineFormatting = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="text-fg font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-brand/15 text-brand border border-brand/25 text-[0.85em] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

const renderTextBlock = (blockText: string) => {
  const lines = blockText.split('\n');
  const out: React.ReactNode[] = [];
  let list: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const flushList = (key: string | number) => {
    if (!list) return;
    const Tag = list.type;
    out.push(
      <Tag key={key} className={cn('pl-6 my-2 space-y-1', list.type === 'ul' ? 'list-disc' : 'list-decimal')}>
        {list.items}
      </Tag>
    );
    list = null;
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) { flushList(`x-${i}`); return; }

    const ulMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (ulMatch) {
      if (!list || list.type !== 'ul') { flushList(`x-${i}`); list = { type: 'ul', items: [] }; }
      list.items.push(<li key={i}>{renderInlineFormatting(ulMatch[2])}</li>);
      return;
    }

    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!list || list.type !== 'ol') { flushList(`x-${i}`); list = { type: 'ol', items: [] }; }
      list.items.push(<li key={i}>{renderInlineFormatting(olMatch[2])}</li>);
      return;
    }

    flushList(`x-${i}`);

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      const sizeClass =
        level === 1 ? 'text-2xl' :
        level === 2 ? 'text-xl' :
        level === 3 ? 'text-lg' : 'text-base';
      out.push(
        <Tag key={i} className={cn('font-bold mt-4 mb-2', sizeClass)}>
          {renderInlineFormatting(headingMatch[2])}
        </Tag>
      );
      return;
    }

    out.push(
      <p key={i} className="my-2 text-fg-muted leading-relaxed">
        {renderInlineFormatting(line)}
      </p>
    );
  });

  flushList('x-final');
  return out;
};

const renderFormattedAnswer = (text: string) => {
  const blocks = text.split(/(```[a-z]*[\s\S]*?```)/gi);
  return blocks.map((block, i) => {
    if (block.startsWith('```')) {
      const lines = block.split('\n');
      const codeContent = lines.slice(1, -1).join('\n');
      return (
        <pre key={i} className="my-3 p-4 bg-surface-3 border border-border rounded-lg overflow-x-auto">
          <code className="text-sm font-mono text-fg leading-relaxed">{codeContent}</code>
        </pre>
      );
    }
    return <div key={i}>{renderTextBlock(block)}</div>;
  });
};

// ── Page ──────────────────────────────────────────────────────────────────────

const TRACK_LABELS: Record<string, string> = {
  js: 'JavaScript', node: 'Node JS', react: 'React', 'react-native': 'React Native',
  ts: 'TypeScript', html: 'HTML', css: 'CSS',
};

const QUESTION_LISTS = {
  js: jsTheoryQuestions, node: nodeTheoryQuestions, react: reactTheoryQuestions,
  'react-native': reactNativeTheoryQuestions, ts: tsTheoryQuestions,
  html: htmlTheoryQuestions, css: cssTheoryQuestions,
};

const TheoryQuestionsPage = () => {
  const { platform } = useParams<{ platform: string }>();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const trackTitle = TRACK_LABELS[platform ?? 'js'] ?? 'JavaScript';
  const questions = QUESTION_LISTS[(platform ?? 'js') as keyof typeof QUESTION_LISTS] ?? jsTheoryQuestions;

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return questions;
    return questions.filter((x) =>
      x.question.toLowerCase().includes(q) || x.answer.toLowerCase().includes(q)
    );
  }, [searchQuery, questions]);

  return (
    <PageShell>
      <PageNav backTo={`/${platform}`} backLabel="Formats" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {trackTitle} <span className="gradient-text">Questions</span>
        </h1>

        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions…"
            className="pl-9 h-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center text-fg-muted">
          No questions found matching your search.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((q, idx) => {
            const isOpen = openIds.has(q.id);
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: Math.min(idx * 0.01, 0.08) }}
                className={cn(
                  'rounded-xl border overflow-hidden transition-colors',
                  isOpen
                    ? 'bg-surface border-brand/50 shadow-md shadow-brand/5'
                    : 'bg-surface border-border hover:border-border-strong'
                )}
              >
                <button
                  onClick={() => toggle(q.id)}
                  className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-brand/15 text-brand text-[11px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-[15px]">
                      {renderInlineFormatting(q.question)}
                    </span>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.15 }}
                    className="shrink-0 text-fg-muted"
                  >
                    <ChevronDown size={18} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-1 border-t border-border bg-surface-2/40">
                        {renderFormattedAnswer(q.answer)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

export default TheoryQuestionsPage;
