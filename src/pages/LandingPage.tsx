import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Atom, Server, Code2, FileCode, Palette, HelpCircle, ArrowRight, Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPlatforms } from '../store/slices/platformsSlice';
import type { Platform } from '../store/slices/platformsSlice';
import { PageShell } from '../components/PageShell';
import { PageNav } from '../components/PageNav';
import { cn } from '../lib/cn';

const TypeScriptIcon = ({ size = 28 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width={size} height={size} aria-hidden="true">
    <rect width="256" height="256" rx="24" fill="#3178C6" />
    <path
      fill="#FFFFFF"
      d="M150.518 200.475v27.62c4.492 2.302 9.805 4.028 15.938 5.179 6.133 1.151 12.597 1.726 19.393 1.726 6.622 0 12.914-.633 18.874-1.899 5.96-1.266 11.187-3.352 15.678-6.257 4.492-2.906 8.048-6.704 10.669-11.394 2.62-4.689 3.93-10.486 3.93-17.391 0-5.006-.749-9.394-2.246-13.163a30.748 30.748 0 0 0-6.479-10.055c-2.821-2.935-6.205-5.567-10.149-7.898-3.945-2.33-8.394-4.531-13.347-6.602-3.628-1.497-6.881-2.949-9.761-4.359-2.879-1.41-5.327-2.848-7.342-4.316-2.016-1.467-3.571-3.021-4.665-4.661-1.094-1.64-1.641-3.495-1.641-5.567 0-1.899.489-3.61 1.468-5.135.979-1.524 2.362-2.834 4.147-3.927 1.785-1.094 3.973-1.942 6.565-2.547 2.591-.604 5.471-.906 8.638-.906 2.304 0 4.737.173 7.299.518 2.563.345 5.14.877 7.732 1.597a53.669 53.669 0 0 1 7.558 2.719 41.7 41.7 0 0 1 6.781 3.797v-25.807c-4.204-1.611-8.797-2.805-13.778-3.582-4.981-.777-10.697-1.165-17.147-1.165-6.565 0-12.784.705-18.658 2.115-5.874 1.409-11.043 3.61-15.506 6.602-4.463 2.993-7.99 6.805-10.582 11.437-2.591 4.632-3.887 10.17-3.887 16.615 0 8.228 2.375 15.248 7.127 21.06 4.751 5.811 11.963 10.731 21.638 14.759a291.458 291.458 0 0 1 10.625 4.575c3.283 1.496 6.119 3.049 8.509 4.66 2.39 1.611 4.276 3.366 5.658 5.265 1.382 1.899 2.073 4.057 2.073 6.474a9.901 9.901 0 0 1-1.296 4.963c-.864 1.524-2.174 2.848-3.93 3.97-1.756 1.122-3.945 1.999-6.565 2.632-2.62.633-5.687.95-9.2.95-5.989 0-11.92-1.05-17.794-3.151-5.875-2.1-11.317-5.25-16.327-9.451Zm-46.036-68.733H140V109H41v22.742h35.345V233h28.137V131.742Z"
    />
  </svg>
);

const PLATFORM_META: Record<string, { icon: ReactNode; gradient: string; desc: string }> = {
  js:           { icon: <Code2 size={26} />,            gradient: 'from-yellow-400 to-amber-500',  desc: 'Closures, promises, event loop & DOM.' },
  javascript:   { icon: <Code2 size={26} />,            gradient: 'from-yellow-400 to-amber-500',  desc: 'Closures, promises, event loop & DOM.' },
  reactjs:      { icon: <Atom size={26} />,             gradient: 'from-cyan-400 to-sky-500',      desc: 'Components, state, hooks & rendering.' },
  react:        { icon: <Atom size={26} />,             gradient: 'from-cyan-400 to-sky-500',      desc: 'Components, state, hooks & rendering.' },
  'react-native': { icon: <Atom size={26} />,           gradient: 'from-cyan-400 to-blue-600',     desc: 'Core components, styling & mobile APIs.' },
  nodejs:       { icon: <Server size={26} />,           gradient: 'from-emerald-500 to-green-600', desc: 'Event Loop, streams, processes & APIs.' },
  node:         { icon: <Server size={26} />,           gradient: 'from-emerald-500 to-green-600', desc: 'Event Loop, streams, processes & APIs.' },
  ts:           { icon: <TypeScriptIcon size={26} />,   gradient: 'from-blue-500 to-indigo-600',   desc: 'Types, generics & utility types.' },
  typescript:   { icon: <TypeScriptIcon size={26} />,   gradient: 'from-blue-500 to-indigo-600',   desc: 'Types, generics & utility types.' },
  html:         { icon: <FileCode size={26} />,         gradient: 'from-orange-500 to-red-500',    desc: 'Semantic layout, CRP & accessibility.' },
  css:          { icon: <Palette size={26} />,          gradient: 'from-blue-600 to-indigo-700',   desc: 'Grid, flexbox, animations & queries.' },
};

const DEFAULT_META = {
  icon: <HelpCircle size={26} />,
  gradient: 'from-violet-500 to-fuchsia-500',
  desc: 'Explore interview questions for this topic.',
};

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: platforms, loading, error } = useAppSelector((state) => state.platforms);

  useEffect(() => {
    if (platforms.length === 0) dispatch(fetchPlatforms());
  }, [dispatch, platforms.length]);

  const getMeta = (platform: Platform) => {
    const key = platform.key?.toLowerCase().trim();
    if (key && PLATFORM_META[key]) return PLATFORM_META[key];
    const name = platform.Name?.toLowerCase().trim();
    if (name && PLATFORM_META[name]) return PLATFORM_META[name];
    return DEFAULT_META;
  };

  return (
    <PageShell>
      <PageNav showAdminLink />

      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-brand/15 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute top-40 -left-40 h-[360px] w-[360px] rounded-full bg-brand-2/15 blur-[100px]" />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 relative"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-semibold mb-4">
          <Sparkles size={13} />
          <span>Interview Prep</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Master Frontend{' '}
          <span className="gradient-text">Interviews</span>
        </h1>
        <p className="mt-2 text-base text-fg-muted">Upskill. Apply. Escape.</p>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </motion.section>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface p-5 animate-pulse">
              <div className="h-10 w-10 rounded-xl bg-surface-3 mb-3" />
              <div className="h-4 w-1/2 rounded bg-surface-3 mb-2" />
              <div className="h-3 w-3/4 rounded bg-surface-3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {platforms.map((platform, i) => {
            const meta = getMeta(platform);
            return (
              <motion.button
                type="button"
                key={platform.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i, duration: 0.25 }}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/${platform.key}`)}
                className="group relative text-left bg-surface border border-border rounded-2xl p-4 sm:p-5 overflow-hidden shadow-sm hover:shadow-xl hover:border-border-strong transition-all"
              >
                <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', meta.gradient)} />
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('h-11 w-11 grid place-items-center rounded-xl text-white shadow-md bg-gradient-to-br', meta.gradient)}>
                    {meta.icon}
                  </div>
                  <ArrowRight size={16} className="text-fg-subtle group-hover:text-brand group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-base font-bold mb-1">{platform.Name}</h2>
                <p className="text-xs text-fg-muted leading-relaxed line-clamp-2">{meta.desc}</p>
              </motion.button>
            );
          })}
        </div>
      )}

      <p className="mt-12 text-center text-xs text-fg-subtle">
        Built for upskilling — practice smart, interview confident.
      </p>
    </PageShell>
  );
};

export default LandingPage;
