import React from 'react';
import { cn } from './cn';

export const renderInlineFormatting = (text: string) => {
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

export const renderTextBlock = (blockText: string) => {
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

export const renderFormattedAnswer = (text: string) => {
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
