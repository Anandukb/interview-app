import { useRef, useState, type ReactNode } from 'react';
import {
  Eye, EyeOff,
  Bold, Italic, Strikethrough,
  Heading1, Heading2, Heading3,
  Code, Code2,
  Link as LinkIcon,
  List, ListOrdered,
  Quote, Minus,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import AdminModal from './AdminModal';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

const CODE_LANGUAGES = [
  'javascript', 'typescript', 'jsx', 'tsx',
  'html', 'css', 'json', 'markdown',
  'python', 'java', 'csharp', 'cpp', 'go', 'rust',
  'sql', 'bash', 'plaintext',
] as const;

// ── Markdown renderer (handcrafted, code-block-safe) ──────────────────────────

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const renderMarkdown = (md: string): string => {
  if (!md.trim()) return '';

  // 1. Pull code blocks out first so other regex can't touch them.
  const codeBlocks: string[] = [];
  let html = md.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang: string, code: string) => {
    const cls = lang ? ` class="language-${lang}"` : '';
    codeBlocks.push(`<pre><code${cls}>${escapeHtml(code.replace(/\n$/, ''))}</code></pre>`);
    return `\u0000CB${codeBlocks.length - 1}\u0000`;
  });

  // 2. Pull inline code out next.
  const inlineCodes: string[] = [];
  html = html.replace(/`([^`\n]+)`/g, (_, code: string) => {
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `\u0000IC${inlineCodes.length - 1}\u0000`;
  });

  // 3. Block-level transforms.
  html = html
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr />')
    .replace(/^[-*] (.*)$/gm, '<li data-list="ul">$1</li>')
    .replace(/^\d+\. (.*)$/gm, '<li data-list="ol">$1</li>');

  // Group consecutive <li> into <ul> / <ol>.
  html = html.replace(/(?:<li data-list="ul">.*?<\/li>\n?)+/g, (m) =>
    `<ul>${m.replace(/ data-list="ul"/g, '').trim()}</ul>`
  );
  html = html.replace(/(?:<li data-list="ol">.*?<\/li>\n?)+/g, (m) =>
    `<ol>${m.replace(/ data-list="ol"/g, '').trim()}</ol>`
  );

  // 4. Inline transforms.
  html = html
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // 5. Paragraph wrap remaining loose lines.
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      const t = block.trim();
      if (!t) return '';
      if (/^<(h\d|ul|ol|pre|blockquote|hr|p)/.test(t)) return t;
      if (/^\u0000CB\d+\u0000$/.test(t)) return t;
      return `<p>${t.replace(/\n/g, '<br/>')}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  // 6. Restore code blocks and inline code.
  html = html.replace(/\u0000CB(\d+)\u0000/g, (_, i) => codeBlocks[Number(i)] ?? '');
  html = html.replace(/\u0000IC(\d+)\u0000/g, (_, i) => inlineCodes[Number(i)] ?? '');

  return html;
};

// ── Component ─────────────────────────────────────────────────────────────────

const RichTextEditor = ({ value, onChange, placeholder, label }: RichTextEditorProps) => {
  const [preview, setPreview] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [codeLang, setCodeLang] = useState<string>('javascript');
  const [codeBody, setCodeBody] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert helper: replace current selection with `before + selectedText + after`.
  const wrapSelection = (before: string, after: string = before, fallback = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const inner = selected || fallback;
    const next = value.slice(0, start) + before + inner + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      const cursorStart = start + before.length;
      const cursorEnd = cursorStart + inner.length;
      ta.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  // Prefix every selected line (or current line) with `prefix`.
  const prefixLines = (prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = (() => {
      const i = value.indexOf('\n', end);
      return i === -1 ? value.length : i;
    })();
    const block = value.slice(lineStart, lineEnd);
    const transformed = block
      .split('\n')
      .map((ln) => (ln.length ? `${prefix}${ln}` : prefix.trimEnd()))
      .join('\n');
    const next = value.slice(0, lineStart) + transformed + value.slice(lineEnd);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(lineStart, lineStart + transformed.length);
    });
  };

  const insertAtCursor = (snippet: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = value.slice(0, start) + snippet + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + snippet.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const insertLink = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const selected = value.slice(ta.selectionStart, ta.selectionEnd);
    const text = selected || 'link text';
    wrapSelection(`[${text}](`, ')', 'https://');
    // After wrap, place cursor inside url
    requestAnimationFrame(() => {
      const pos = ta.selectionStart + `[${text}](`.length - text.length;
      ta.setSelectionRange(pos, pos + 'https://'.length);
    });
  };

  const openCodeModal = () => {
    const ta = textareaRef.current;
    const selected = ta ? value.slice(ta.selectionStart, ta.selectionEnd) : '';
    setCodeBody(selected);
    setCodeLang('javascript');
    setCodeModalOpen(true);
  };

  const insertCodeBlock = () => {
    const block = `\n\`\`\`${codeLang}\n${codeBody.replace(/\s+$/, '')}\n\`\`\`\n`;
    insertAtCursor(block);
    setCodeModalOpen(false);
    setCodeBody('');
  };

  return (
    <div className="rte-container">
      {/* ── Header (label + preview toggle) ───────────────────────────────── */}
      <div className="rte-header">
        {label && <span className="rte-label">{label}</span>}
        <button
          type="button"
          className={`rte-toggle ${preview ? 'active' : ''}`}
          onClick={() => setPreview(!preview)}
          title={preview ? 'Edit mode' : 'Preview mode'}
        >
          {preview ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{preview ? 'Edit' : 'Preview'}</span>
        </button>
      </div>

      {/* ── Toolbar (hidden in preview mode) ──────────────────────────────── */}
      {!preview && (
        <div className="rte-toolbar" role="toolbar" aria-label="Formatting toolbar">
          <ToolbarButton title="Bold (Ctrl+B)" onClick={() => wrapSelection('**', '**', 'bold text')}>
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton title="Italic (Ctrl+I)" onClick={() => wrapSelection('*', '*', 'italic text')}>
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton title="Strikethrough" onClick={() => wrapSelection('~~', '~~', 'strikethrough')}>
            <Strikethrough size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton title="Heading 1" onClick={() => prefixLines('# ')}>
            <Heading1 size={14} />
          </ToolbarButton>
          <ToolbarButton title="Heading 2" onClick={() => prefixLines('## ')}>
            <Heading2 size={14} />
          </ToolbarButton>
          <ToolbarButton title="Heading 3" onClick={() => prefixLines('### ')}>
            <Heading3 size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton title="Inline code" onClick={() => wrapSelection('`', '`', 'code')}>
            <Code size={14} />
          </ToolbarButton>
          <ToolbarButton title="Insert code block" onClick={openCodeModal}>
            <Code2 size={14} />
          </ToolbarButton>
          <ToolbarButton title="Link" onClick={insertLink}>
            <LinkIcon size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton title="Bulleted list" onClick={() => prefixLines('- ')}>
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton title="Numbered list" onClick={() => prefixLines('1. ')}>
            <ListOrdered size={14} />
          </ToolbarButton>
          <ToolbarButton title="Blockquote" onClick={() => prefixLines('> ')}>
            <Quote size={14} />
          </ToolbarButton>
          <ToolbarButton title="Horizontal rule" onClick={() => insertAtCursor('\n\n---\n\n')}>
            <Minus size={14} />
          </ToolbarButton>
        </div>
      )}

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      {preview ? (
        <div
          className="rte-preview"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(value) || '<p class="rte-empty-preview">Nothing to preview yet…</p>',
          }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          className="admin-textarea rte-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
              if (e.key === 'b') { e.preventDefault(); wrapSelection('**', '**', 'bold text'); }
              else if (e.key === 'i') { e.preventDefault(); wrapSelection('*', '*', 'italic text'); }
              else if (e.key === 'k') { e.preventDefault(); insertLink(); }
            }
          }}
          placeholder={placeholder ?? 'Write in Markdown…\n\n# Heading\n**Bold**, *italic*, `code`\n\n- list item'}
          rows={10}
          spellCheck
        />
      )}

      <div className="rte-footer">
        <span>Supports Markdown · Output stored as .md</span>
      </div>

      {/* ── Code-block insertion modal ─────────────────────────────────────── */}
      <AdminModal
        open={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        title="Insert Code Block"
        width="720px"
      >
        <div className="admin-form-group">
          <label className="admin-label">Language</label>
          <select
            className="admin-select"
            value={codeLang}
            onChange={(e) => setCodeLang(e.target.value)}
          >
            {CODE_LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Code</label>
          <div className="rte-code-modal-editor">
            <Editor
              height="320px"
              language={codeLang === 'plaintext' ? 'plaintext' : codeLang}
              value={codeBody}
              onChange={(v) => setCodeBody(v ?? '')}
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

        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => setCodeModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={insertCodeBlock}
            disabled={!codeBody.trim()}
          >
            Insert Code Block
          </button>
        </div>
      </AdminModal>
    </div>
  );
};

// ── Toolbar primitives ────────────────────────────────────────────────────────

const ToolbarButton = ({
  onClick, title, children,
}: { onClick: () => void; title: string; children: ReactNode }) => (
  <button
    type="button"
    className="rte-tb-btn"
    onClick={onClick}
    title={title}
    aria-label={title}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <span className="rte-tb-divider" aria-hidden="true" />;

export default RichTextEditor;
