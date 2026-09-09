import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Play, CheckCircle, SplitSquareHorizontal, SplitSquareVertical, Trash2, Terminal } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './ui/Button';
import { collapse } from '../lib/motion';
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
    <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm edge-light">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border bg-surface-2">
        <div className="flex items-center gap-1">
          <FileTab
            label="index.js"
            active={activeTab === 'index.js'}
            onClick={() => { setActiveTab('index.js'); setOutput(''); }}
          />
          {showSolutionTab && (
            <FileTab
              label="solution.js"
              tone="success"
              active={activeTab === 'solution.js'}
              onClick={() => setActiveTab('solution.js')}
            />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setConsolePosition((p) => (p === 'bottom' ? 'side' : 'bottom'))}
            title={`Move console to the ${consolePosition === 'bottom' ? 'side' : 'bottom'}`}
          >
            {consolePosition === 'bottom' ? <SplitSquareHorizontal size={14} /> : <SplitSquareVertical size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHint(!showHint)}
            leftIcon={<Lightbulb size={14} className={cn(showHint && 'text-warning')} />}
          >
            <span className="hidden sm:inline">{showHint ? 'Hide hint' : 'Hint'}</span>
          </Button>
          {!showSolutionTab && (
            <Button variant="subtle" size="sm" onClick={handleShowResult} leftIcon={<CheckCircle size={14} />}>
              <span className="hidden sm:inline">Solution</span>
            </Button>
          )}
          <Button size="sm" onClick={handleRunCode} leftIcon={<Play size={14} />}>
            Run
          </Button>
        </div>
      </div>

      {/* ── Hint ─────────────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {showHint && (
          <motion.div variants={collapse} initial="hidden" animate="show" exit="hidden" className="overflow-hidden">
            <div className="flex items-start gap-2.5 px-4 py-3 bg-warning/8 border-b border-warning/25 text-sm text-warning">
              <Lightbulb size={15} className="mt-0.5 shrink-0" />
              <span className="leading-relaxed">{hint}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Workspace ────────────────────────────────────────────────────── */}
      <div
        ref={workspaceRef}
        className={cn('flex flex-1 min-h-0', consolePosition === 'side' ? 'flex-row' : 'flex-col')}
      >
        <div
          className="min-w-0 min-h-0"
          style={consolePosition === 'side' ? { width: `${sideSplitPercent}%`, flexShrink: 0 } : { flex: 1 }}
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
              fontSize: 13.5,
              fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
              padding: { top: 14, bottom: 14 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              renderLineHighlight: 'line',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
            }}
          />
        </div>

        {/* Splitter — wide hit area, grip appears on hover. */}
        <div
          role="separator"
          aria-orientation={consolePosition === 'side' ? 'vertical' : 'horizontal'}
          onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
          className={cn(
            'group relative flex-shrink-0 grid place-items-center transition-colors',
            consolePosition === 'side' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
            isDragging ? 'bg-brand' : 'bg-border hover:bg-brand/60'
          )}
        >
          <span
            aria-hidden
            className={cn(
              'absolute rounded-full bg-fg-subtle opacity-0 transition-opacity group-hover:opacity-50',
              consolePosition === 'side' ? 'h-8 w-[3px]' : 'w-8 h-[3px]',
              isDragging && 'opacity-70'
            )}
          />
        </div>

        {/* ── Console ────────────────────────────────────────────────────── */}
        <div
          className="flex flex-col bg-surface-2 min-w-0 min-h-0"
          style={
            consolePosition === 'side'
              ? { width: `${100 - sideSplitPercent}%`, flexShrink: 0 }
              : { height: `${bottomSplitHeight}px`, flexShrink: 0 }
          }
        >
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-border">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fg-subtle">
              <Terminal size={11} />
              Console
            </span>
            {output && (
              <button
                onClick={() => setOutput('')}
                title="Clear console"
                className="grid h-6 w-6 place-items-center rounded-md text-fg-subtle hover:text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          <pre className="flex-1 overflow-auto px-4 py-3 text-xs font-mono leading-relaxed text-fg whitespace-pre-wrap">
            {output || <span className="text-fg-subtle italic">Run your code to see output here…</span>}
          </pre>
        </div>
      </div>
    </div>
  );
};

interface FileTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: 'default' | 'success';
}

/** Editor-style file tab. The active pill is a shared layout element, so it
 *  slides between tabs instead of popping. */
const FileTab = ({ label, active, onClick, tone = 'default' }: FileTabProps) => (
  <button
    onClick={onClick}
    className={cn(
      'relative px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors',
      active
        ? tone === 'success' ? 'text-success' : 'text-fg'
        : tone === 'success' ? 'text-success/60 hover:text-success' : 'text-fg-muted hover:text-fg'
    )}
  >
    {active && (
      <motion.span
        layoutId="compiler-tab"
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        className={cn(
          'absolute inset-0 rounded-lg shadow-sm',
          tone === 'success' ? 'bg-success/15' : 'bg-surface'
        )}
      />
    )}
    <span className="relative z-10">{label}</span>
  </button>
);

export default CodeCompiler;
