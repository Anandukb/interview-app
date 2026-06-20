import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, CheckSquare, Laptop, ArrowRight } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PageNav } from '../components/PageNav';
import { cn } from '../lib/cn';

const PLATFORM_INFO: Record<string, { name: string; color: string }> = {
  js: { name: 'JavaScript', color: '#f7df1e' },
  javascript: { name: 'JavaScript', color: '#f7df1e' },
  node: { name: 'Node JS', color: '#4ade80' },
  nodejs: { name: 'Node JS', color: '#4ade80' },
  react: { name: 'React', color: '#61dafb' },
  reactjs: { name: 'React', color: '#61dafb' },
  'react-native': { name: 'React Native', color: '#61dafb' },
  ts: { name: 'TypeScript', color: '#3178c6' },
  typescript: { name: 'TypeScript', color: '#3178c6' },
  html: { name: 'HTML', color: '#e34f26' },
  css: { name: 'CSS', color: '#6293f6' },
};

const QuestionTypesPage = () => {
  const navigate = useNavigate();
  const { platform } = useParams<{ platform: string }>();
  const platformKey = platform?.toLowerCase() ?? '';
  const trackInfo = PLATFORM_INFO[platformKey] ?? { name: 'JavaScript', color: '#a78bfa' };

  const types = [
    {
      id: 'theory', name: 'Theory Questions', tag: 'Concepts',
      icon: HelpCircle, gradient: 'from-violet-500 to-fuchsia-500',
      desc: getTheoryDesc(platform),
    },
    {
      id: 'output-prediction', name: 'Output Prediction', tag: 'Tricky',
      icon: CheckSquare, gradient: 'from-amber-500 to-orange-500',
      desc: getOutputDesc(platform),
    },
    {
      id: 'practical', name: 'Practical Coding', tag: 'Hands-on',
      icon: Laptop, gradient: 'from-cyan-500 to-blue-500',
      desc: getPracticalDesc(platform),
    },
  ].filter((type) => {
    if (platform === 'react-native') return type.id === 'theory';
    return true;
  });

  return (
    <PageShell>
      <PageNav backTo="/" backLabel="Languages" />

      <div aria-hidden className="pointer-events-none absolute top-40 right-0 h-[320px] w-[320px] rounded-full bg-brand/10 blur-[100px]" />

      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-6 relative"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-3 border border-border mb-3">
          <span className="h-2 w-2 rounded-full" style={{ background: trackInfo.color }} />
          <span className="text-xs font-semibold text-fg-muted">{trackInfo.name}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          {trackInfo.name} <span className="gradient-text">Practice</span>
        </h1>
        <p className="mt-1.5 text-sm text-fg-muted">
          Pick a format to start practicing.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {types.map((type, i) => {
          const Icon = type.icon;
          return (
            <motion.button
              key={type.id}
              type="button"
              onClick={() => navigate(`/${platform}/${type.id}`)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.25 }}
              whileHover={{ y: -3 }}
              className="group relative text-left bg-surface border border-border rounded-2xl p-5 overflow-hidden shadow-sm hover:shadow-xl hover:border-border-strong transition-all"
            >
              <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', type.gradient)} />
              <div className="flex items-start justify-between mb-4">
                <div className={cn('h-11 w-11 grid place-items-center rounded-xl text-white shadow-md bg-gradient-to-br', type.gradient)}>
                  <Icon size={20} />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-3 text-fg-muted border border-border">
                  {type.tag}
                </span>
              </div>
              <h2 className="text-base font-bold mb-1">{type.name}</h2>
              <p className="text-xs text-fg-muted leading-relaxed line-clamp-3">{type.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand opacity-70 group-hover:opacity-100 transition-opacity">
                Start
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </PageShell>
  );
};

const getTheoryDesc = (platform?: string) =>
  platform === 'node' ? 'Theory and core concept interview questions on Node.js.'
  : platform === 'react' ? 'Theory and concept-based interview questions on React.'
  : platform === 'react-native' ? 'Theory and concept-based interview questions on React Native.'
  : platform === 'ts' ? 'Theory and type-system concept interview questions on TypeScript.'
  : platform === 'html' ? 'Theory and semantic accessibility interview questions on HTML.'
  : platform === 'css' ? 'Theory and styling architecture interview questions on CSS.'
  : 'Theory and concept-based interview questions on JavaScript.';

const getOutputDesc = (platform?: string) =>
  platform === 'node' ? 'Predict the exact output of tricky Node.js snippets.'
  : platform === 'react' ? 'Predict the exact output of tricky React JSX snippets.'
  : platform === 'react-native' ? 'Predict the exact output of tricky React Native snippets.'
  : platform === 'ts' ? 'Predict compile-time errors and outputs of tricky TypeScript snippets.'
  : platform === 'html' ? 'Predict DOM state and query outcomes of HTML operations.'
  : platform === 'css' ? 'Predict specificity, layout results, and computed styles.'
  : 'Predict the exact output of tricky JavaScript snippets.';

const getPracticalDesc = (platform?: string) =>
  platform === 'node' ? 'Hands-on backend coding challenges in Node.js.'
  : platform === 'react' ? 'Hands-on React coding challenges in an interactive environment.'
  : platform === 'react-native' ? 'Hands-on React Native coding challenges.'
  : platform === 'ts' ? 'Hands-on TypeScript coding and type-safety challenges.'
  : platform === 'html' ? 'Hands-on HTML structure and DOM-tree coding challenges.'
  : platform === 'css' ? 'Hands-on CSS algorithm and styling layout challenges.'
  : 'Hands-on JavaScript coding challenges in an interactive environment.';

export default QuestionTypesPage;
