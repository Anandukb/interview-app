import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, CheckSquare, Laptop, ArrowRight } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PageNav } from '../components/PageNav';
import { InteractiveCard } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { fadeUp, popIn, stagger, spring } from '../lib/motion';
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
  const trackInfo = PLATFORM_INFO[platformKey] ?? { name: 'JavaScript', color: '#60a5fa' };

  const types = [
    {
      id: 'theory',
      name: 'Theory',
      tag: 'Concepts',
      icon: HelpCircle,
      gradient: 'from-violet-500 to-purple-600',
      desc: getTheoryDesc(platform),
    },
    {
      id: 'output-prediction',
      name: 'Output Prediction',
      tag: 'Tricky',
      icon: CheckSquare,
      gradient: 'from-amber-400 to-orange-500',
      desc: getOutputDesc(platform),
    },
    {
      id: 'practical',
      name: 'Practical Coding',
      tag: 'Hands-on',
      icon: Laptop,
      gradient: 'from-cyan-400 to-blue-500',
      desc: getPracticalDesc(platform),
    },
  ].filter((type) => (platform === 'react-native' ? type.id === 'theory' : true));

  return (
    <PageShell>
      <PageNav backTo="/" backLabel="All tracks" />

      <motion.header
        variants={stagger(0.07)}
        initial="hidden"
        animate="show"
        className="relative max-w-2xl pt-4 pb-10 sm:pt-8 sm:pb-12"
      >
        <motion.div variants={fadeUp}>
          <span className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-full border border-border bg-surface/70 backdrop-blur-sm">
            <span
              className="h-2 w-2 rounded-full animate-pulse-ring"
              style={{ background: trackInfo.color }}
            />
            <span className="text-xs font-semibold text-fg-muted">{trackInfo.name}</span>
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.08]"
        >
          How do you want to <span className="gradient-text">practice?</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-4 text-base text-fg-muted">
          Three formats, same goal — walk into the interview having already seen the question.
        </motion.p>
      </motion.header>

      <motion.div
        variants={stagger(0.06)}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {types.map((type) => {
          const Icon = type.icon;
          return (
            <motion.div key={type.id} variants={popIn}>
              <InteractiveCard
                accent={type.gradient}
                onClick={() => navigate(`/${platform}/${type.id}`)}
                className="h-full flex flex-col p-6"
              >
                <div className="flex items-start justify-between gap-3 mb-5">
                  <motion.span
                    whileHover={{ rotate: -6, scale: 1.06 }}
                    transition={spring}
                    className={cn(
                      'grid h-12 w-12 place-items-center rounded-2xl text-white shadow-md bg-gradient-to-br',
                      type.gradient
                    )}
                  >
                    <Icon size={22} />
                  </motion.span>
                  <Badge tone="neutral" className="uppercase tracking-[0.1em]">
                    {type.tag}
                  </Badge>
                </div>

                <h2 className="text-lg font-bold tracking-tight mb-1.5">{type.name}</h2>
                <p className="text-[13px] leading-relaxed text-fg-muted flex-1">{type.desc}</p>

                <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand">
                  Start practising
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </InteractiveCard>
            </motion.div>
          );
        })}
      </motion.div>
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
