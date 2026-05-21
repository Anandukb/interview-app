import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Lightbulb, Play, CheckCircle, SplitSquareHorizontal, SplitSquareVertical } from 'lucide-react';
import './CodeCompiler.css';

interface CodeCompilerProps {
  initialCode: string;
  answerCode: string;
  hint: string;
}

const CodeCompiler: React.FC<CodeCompilerProps> = ({ initialCode, answerCode, hint }) => {
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

  // Setup dragging handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      
      if (consolePosition === 'side') {
        const deltaX = moveEvent.clientX - rect.left;
        const newPercent = Math.max(15, Math.min(85, (deltaX / rect.width) * 100));
        setSideSplitPercent(newPercent);
      } else {
        const mouseY = moveEvent.clientY - rect.top;
        const newHeight = Math.max(80, Math.min(rect.height - 80, rect.height - mouseY));
        setBottomSplitHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, consolePosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Reset state when a new question is selected
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
      const codeToRun = activeTab === 'index.js' ? userCode : answerCode;
      
      // Override console.log to capture output
      let consoleOutput = '';
      const originalLog = console.log;
      console.log = (...args) => {
        consoleOutput += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\\n';
      };

      // Wrap code to execute
      const execute = new Function(codeToRun);
      execute();
      
      // Restore console.log
      console.log = originalLog;
      
      setOutput(consoleOutput || 'Code executed successfully with no output.');
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (activeTab === 'index.js') {
      setUserCode(value || '');
    }
  };

  return (
    <div className="compiler-container glass">
      <div className="compiler-header">
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'index.js' ? 'active' : ''}`}
            onClick={() => setActiveTab('index.js')}
          >
            index.js
          </div>
          {showSolutionTab && (
            <div 
              className={`tab solution-tab ${activeTab === 'solution.js' ? 'active' : ''}`}
              onClick={() => setActiveTab('solution.js')}
            >
              solution.js
            </div>
          )}
        </div>
        <div className="actions">
          <button 
            className="action-btn layout-btn" 
            onClick={() => setConsolePosition(p => p === 'bottom' ? 'side' : 'bottom')}
            title="Toggle Console Position"
          >
            {consolePosition === 'bottom' ? <SplitSquareHorizontal size={16} /> : <SplitSquareVertical size={16} />}
          </button>
          <button className="action-btn hint-btn" onClick={() => setShowHint(!showHint)}>
            <Lightbulb size={16} /> {showHint ? 'Hide Hint' : 'Hint'}
          </button>
          {!showSolutionTab && (
            <button className="action-btn answer-btn" onClick={handleShowResult}>
              <CheckCircle size={16} /> Show Result
            </button>
          )}
          <button className="action-btn run-btn" onClick={handleRunCode}>
            <Play size={16} /> Run Code
          </button>
        </div>
      </div>
      
      {showHint && (
        <div className="hint-box">
          <strong>Hint:</strong> {hint}
        </div>
      )}

      <div 
        ref={workspaceRef}
        className={`workspace ${consolePosition === 'side' ? 'layout-side' : 'layout-bottom'} ${isDragging ? 'dragging' : ''}`}
      >
        <div 
          className="editor-wrapper"
          style={
            consolePosition === 'side' 
              ? { width: `${sideSplitPercent}%`, flexGrow: 0, flexShrink: 0 } 
              : undefined
          }
        >
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={activeTab === 'index.js' ? userCode : answerCode}
            onChange={handleCodeChange}
            options={{
              readOnly: activeTab === 'solution.js',
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'ui-monospace, SFMono-Regular, Consolas, "Courier New", monospace',
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        <div 
          className={`divider ${consolePosition === 'side' ? 'divider-vertical' : 'divider-horizontal'}`}
          onMouseDown={handleMouseDown}
        />

        <div 
          className="output-panel"
          style={
            consolePosition === 'side'
              ? { width: `${100 - sideSplitPercent}%`, flexGrow: 0, flexShrink: 0 }
              : { height: `${bottomSplitHeight}px` }
          }
        >
          <div className="output-header">Console Output</div>
          <pre className="output-content">{output || 'Run your code to see output here...'}</pre>
        </div>
      </div>
    </div>
  );
};

export default CodeCompiler;
