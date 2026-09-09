// ── Prism global init ────────────────────────────────────────────────────────
// `@lexical/code` (a transitive dep of @mdxeditor/editor) references the bare
// `Prism` identifier at module evaluation time. In Vite/Rolldown production
// builds the prismjs IIFE side effect can be optimised away, leading to
// "Prism is not defined" at runtime. Importing prismjs here first and pinning
// it onto `window`/`globalThis` keeps the bare reference resolvable. The
// language plugins are imported eagerly so their grammars register on the
// same Prism instance.
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-objectivec';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-swift';

// `@types/prismjs` already declares `Prism` as a global namespace via
// `export as namespace Prism`, so no extra global typing is needed here.
(globalThis as { Prism?: typeof Prism }).Prism = Prism;
if (typeof window !== 'undefined') {
  (window as unknown as { Prism: typeof Prism }).Prism = Prism;
}

// ── App bootstrap ────────────────────────────────────────────────────────────
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { MotionConfig } from 'framer-motion';
import { store } from './store/store';
import { ThemeProvider } from './theme/ThemeProvider';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        {/* reducedMotion="user" makes Framer honour the OS setting the same way
            the stylesheet's prefers-reduced-motion block does — transforms are
            dropped, opacity fades are kept. */}
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MotionConfig>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
