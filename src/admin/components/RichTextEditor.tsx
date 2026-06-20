import { useEffect, useRef } from 'react';
import {
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin,
  linkPlugin, linkDialogPlugin, codeBlockPlugin, codeMirrorPlugin,
  toolbarPlugin, diffSourcePlugin, markdownShortcutPlugin, tablePlugin,
  UndoRedo, BoldItalicUnderlineToggles, CodeToggle, CreateLink,
  ListsToggle, BlockTypeSelect, InsertCodeBlock, InsertThematicBreak,
  InsertTable, DiffSourceToggleWrapper, Separator,
  ConditionalContents, ChangeCodeMirrorLanguage,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { useTheme } from '../../theme/ThemeProvider';
import { cn } from '../../lib/cn';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

const CODE_BLOCK_LANGUAGES = {
  javascript: 'JavaScript', typescript: 'TypeScript', jsx: 'JSX', tsx: 'TSX',
  html: 'HTML', css: 'CSS', json: 'JSON', markdown: 'Markdown',
  python: 'Python', java: 'Java', csharp: 'C#', cpp: 'C++',
  go: 'Go', rust: 'Rust', sql: 'SQL', bash: 'Bash', txt: 'Plain text',
};

const RichTextEditor = ({ value, onChange, placeholder, label }: RichTextEditorProps) => {
  const editorRef = useRef<MDXEditorMethods>(null);
  const { resolvedMode } = useTheme();

  useEffect(() => {
    const current = editorRef.current?.getMarkdown();
    if (current !== value) editorRef.current?.setMarkdown(value ?? '');
  }, [value]);

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition-colors">
      {label && (
        <div className="px-4 py-2 bg-surface-2 border-b border-border">
          <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider">{label}</span>
        </div>
      )}

      <MDXEditor
        ref={editorRef}
        markdown={value}
        onChange={onChange}
        placeholder={placeholder ?? 'Write here…'}
        className={cn(
          'rte-mdx',
          resolvedMode === 'dark' ? 'dark-theme dark-editor' : 'light-editor'
        )}
        contentEditableClassName="rte-mdx-content"
        plugins={[
          headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(),
          linkPlugin(), linkDialogPlugin(), tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
          codeMirrorPlugin({ codeBlockLanguages: CODE_BLOCK_LANGUAGES }),
          markdownShortcutPlugin(),
          diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: '' }),
          toolbarPlugin({
            toolbarClassName: 'rte-mdx-toolbar',
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <ConditionalContents
                  options={[
                    {
                      when: (editor) => editor?.editorType === 'codeblock',
                      contents: () => <ChangeCodeMirrorLanguage />,
                    },
                    {
                      fallback: () => (
                        <>
                          <UndoRedo />
                          <Separator />
                          <BoldItalicUnderlineToggles />
                          <CodeToggle />
                          <Separator />
                          <BlockTypeSelect />
                          <Separator />
                          <ListsToggle />
                          <Separator />
                          <CreateLink />
                          <InsertCodeBlock />
                          <InsertTable />
                          <InsertThematicBreak />
                        </>
                      ),
                    },
                  ]}
                />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />

      <div className="px-4 py-1.5 bg-surface-2 border-t border-border text-[11px] text-fg-subtle">
        WYSIWYG editor · Output stored as Markdown
      </div>
    </div>
  );
};

export default RichTextEditor;
