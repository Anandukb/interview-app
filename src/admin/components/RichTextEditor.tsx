import { useEffect, useRef } from 'react';
import {
  MDXEditor,
  type MDXEditorMethods,
  // Plugins
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  linkDialogPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  diffSourcePlugin,
  markdownShortcutPlugin,
  tablePlugin,
  // Toolbar primitives
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  ListsToggle,
  BlockTypeSelect,
  InsertCodeBlock,
  InsertThematicBreak,
  InsertTable,
  DiffSourceToggleWrapper,
  Separator,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

const CODE_BLOCK_LANGUAGES = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  markdown: 'Markdown',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  cpp: 'C++',
  go: 'Go',
  rust: 'Rust',
  sql: 'SQL',
  bash: 'Bash',
  txt: 'Plain text',
};

const RichTextEditor = ({ value, onChange, placeholder, label }: RichTextEditorProps) => {
  const editorRef = useRef<MDXEditorMethods>(null);

  // Keep editor in sync if the controlled `value` is replaced from outside
  // (e.g. when the parent opens for editing a different question).
  useEffect(() => {
    const current = editorRef.current?.getMarkdown();
    if (current !== value) {
      editorRef.current?.setMarkdown(value ?? '');
    }
  }, [value]);

  return (
    <div className="rte-container">
      {label && (
        <div className="rte-header">
          <span className="rte-label">{label}</span>
        </div>
      )}

      <MDXEditor
        ref={editorRef}
        markdown={value}
        onChange={onChange}
        placeholder={placeholder ?? 'Write here…'}
        className="dark-theme dark-editor rte-mdx"
        contentEditableClassName="rte-mdx-content"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          tablePlugin(),
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
                      // When focus is inside a code block, show the language picker.
                      when: (editor) => editor?.editorType === 'codeblock',
                      contents: () => <ChangeCodeMirrorLanguage />,
                    },
                    {
                      // Default rich-text toolbar.
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

      <div className="rte-footer">
        <span>WYSIWYG editor · Output stored as Markdown</span>
      </div>
    </div>
  );
};

export default RichTextEditor;
