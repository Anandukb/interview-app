import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Lightbulb, Play, CheckCircle, SplitSquareHorizontal, SplitSquareVertical } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './ui/Button';
import { cn } from '../lib/cn';

interface CodeCompilerProps {
  initialCode: string;
  answerCode: string;
  hint: string;
  language?: string;
}

const CodeCompiler: React.FC<CodeCompilerProps> = ({ initialCode, answerCode, hint, language }) => {
  const { resolvedMode } = useTheme();
  const [userCode, setUserCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<'index.js' | 'solution.js'>('index.js');
  const [showSolutionTab, setShowSolutionTab] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [consolePosition, setConsolePosition] = useState<'bottom' | 'side'>('bottom');
  const [sideSplitPercent, setSideSplitPercent] = useState<number>(50);
  const [bottomSplitHeight, setBottomSplitHeight] = useState<number>(200);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      if (!workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      if (consolePosition === 'side') {
        const dx = e.clientX - rect.left;
        setSideSplitPercent(Math.max(15, Math.min(85, (dx / rect.width) * 100)));
      } else {
        const my = e.clientY - rect.top;
        setBottomSplitHeight(Math.max(80, Math.min(rect.height - 80, rect.height - my)));
      }
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, consolePosition]);

  // Lazy-load Babel for transpilation
  useEffect(() => {
    if (!(window as any).Babel) {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/@babel/standalone/babel.min.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  // Reset on new question
  useEffect(() => {
    setUserCode(initialCode);
    setActiveTab('index.js');
    setShowSolutionTab(false);
    setShowHint(false);
    setOutput('');
  }, [initialCode]);

  const handleShowResult = () => {
    setShowSolutionTab(true);
    setActiveTab('solution.js');
    setOutput('Answer loaded in solution.js. You can run it now.');
  };

  const handleRunCode = () => {
    try {
      const orig = activeTab === 'index.js' ? userCode : answerCode;
      let codeToRun = orig;

      if ((window as any).Babel) {
        try {
          const presets = ['env', 'react'];
          if (language === 'typescript' || orig.includes('<T') || orig.includes(': ') || orig.includes('interface ')) {
            presets.push('typescript');
          }
          codeToRun = (window as any).Babel.transform(orig, {
            presets,
            filename: language === 'typescript' ? 'file.ts' : 'file.jsx',
          }).code || orig;
        } catch (e: any) {
          setOutput(`Transpilation Error: ${e.message}`);
          return;
        }
      } else if (language === 'typescript' || orig.includes('<T') || orig.includes('interface ')) {
        setOutput("Compiler engine is initializing. Please wait a moment and try again.");
        return;
      }

      let captured = '';
      const origLog = console.log;
      try {
        console.log = (...args) => {
          captured += args.map((a) => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
        };
        const customRequire = (mod: string) => {
          if (mod === 'react') return React;
          throw new Error(`Module "${mod}" is not available in the interactive compiler.`);
        };
        const exports_ = {};
        const fn = new Function('React', 'require', 'exports', codeToRun);
        fn(React, customRequire, exports_);
      } finally {
        console.log = origLog;
      }
      setOutput(captured || 'Code executed successfully with no output.');
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface overflow-hidden h-full shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border bg-surface-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setActiveTab('index.js'); setOutput(''); }}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-colors',
              activeTab === 'index.js'
                ? 'bg-surface text-fg shadow-sm'
                : 'text-fg-muted hover:bg-surface'
            )}
          >
            index.js
          </button>
          {showSolutionTab && (
            <button
              onClick={() => setActiveTab('solution.js')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-colors',
                activeTab === 'solution.js'
                  ? 'bg-success/15 text-success shadow-sm'
                  : 'text-success/70 hover:bg-success/10'
              )}
            >
              solution.js
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost" size="icon-sm"
            onClick={() => setConsolePosition(p => p === 'bottom' ? 'side' : 'bottom')}
            title="Toggle console position"
          >
            {consolePosition === 'bottom' ? <SplitSquareHorizontal size={14} /> : <SplitSquareVertical size={14} />}
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={() => setShowHint(!showHint)}
            leftIcon={<Lightbulb size={14} />}
          >
            {showHint ? 'Hide Hint' : 'Hint'}
          </Button>
          {!showSolutionTab && (
            <Button
              variant="subtle" size="sm"
              onClick={handleShowResult}
              leftIcon={<CheckCircle size={14} />}
            >
              Show Result
            </Button>
          )}
          <Button size="sm" onClick={handleRunCode} leftIcon={<Play size={14} />}>
            Run
          </Button>
        </div>
      </div>

      {/* Hint */}
      {showHint && (
        <div className="px-4 py-3 bg-warning/8 border-b border-warning/30 text-sm text-warning">
          <strong className="font-bold">Hint:</strong> {hint}
        </div>
      )}

      {/* Workspace */}
      <div
        ref={workspaceRef}
        className={cn(
          'flex flex-1 min-h-0',
          consolePosition === 'side' ? 'flex-row' : 'flex-col'
        )}
      >
        <div
          className="min-w-0 min-h-0"
          style={
            consolePosition === 'side'
              ? { width: `${sideSplitPercent}%`, flexShrink: 0 }
              : { flex: 1 }
          }
        >
          <Editor
            key={activeTab}
            height="100%"
            defaultLanguage={language || 'javascript'}
            theme={resolvedMode === 'dark' ? 'vs-dark' : 'vs-light'}
            value={activeTab === 'index.js' ? userCode : answerCode}
            onChange={(v) => activeTab === 'index.js' && setUserCode(v || '')}
            options={{
              readOnly: activeTab === 'solution.js',
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
              padding: { top: 12, bottom: 12 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Splitter */}
        <div
          onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
          className={cn(
            'bg-border hover:bg-brand transition-colors flex-shrink-0',
            consolePosition === 'side' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
            isDragging && 'bg-brand'
          )}
        />

        <div
          className="flex flex-col bg-surface-2 min-w-0 min-h-0"
          style={
            consolePosition === 'side'
              ? { width: `${100 - sideSplitPercent}%`, flexShrink: 0 }
              : { height: `${bottomSplitHeight}px`, flexShrink: 0 }
          }
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-fg-subtle border-b border-border">
            Console Output
          </div>
          <pre className="flex-1 overflow-auto px-4 py-3 text-xs font-mono text-fg whitespace-pre-wrap">
            {output || <span className="text-fg-subtle">Run your code to see output here…</span>}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeCompiler;
