import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Atom, Server, Code2, FileCode, Palette, HelpCircle, ArrowRight, Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPlatforms } from '../store/slices/platformsSlice';
import type { Platform } from '../store/slices/platformsSlice';
import { PageShell } from '../components/PageShell';
import { PageNav } from '../components/PageNav';
import { InteractiveCard } from '../components/ui/Card';
import { fadeUp, popIn, stagger, spring, revealOnScroll } from '../lib/motion';
import { cn } from '../lib/cn';

const TypeScriptIcon = ({ size = 26 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width={size} height={size} aria-hidden="true">
    <rect width="256" height="256" rx="48" fill="currentColor" fillOpacity="0" />
    <path
      fill="currentColor"
      d="M150.518 200.475v27.62c4.492 2.302 9.805 4.028 15.938 5.179 6.133 1.151 12.597 1.726 19.393 1.726 6.622 0 12.914-.633 18.874-1.899 5.96-1.266 11.187-3.352 15.678-6.257 4.492-2.906 8.048-6.704 10.669-11.394 2.62-4.689 3.93-10.486 3.93-17.391 0-5.006-.749-9.394-2.246-13.163a30.748 30.748 0 0 0-6.479-10.055c-2.821-2.935-6.205-5.567-10.149-7.898-3.945-2.33-8.394-4.531-13.347-6.602-3.628-1.497-6.881-2.949-9.761-4.359-2.879-1.41-5.327-2.848-7.342-4.316-2.016-1.467-3.571-3.021-4.665-4.661-1.094-1.64-1.641-3.495-1.641-5.567 0-1.899.489-3.61 1.468-5.135.979-1.524 2.362-2.834 4.147-3.927 1.785-1.094 3.973-1.942 6.565-2.547 2.591-.604 5.471-.906 8.638-.906 2.304 0 4.737.173 7.299.518 2.563.345 5.14.877 7.732 1.597a53.669 53.669 0 0 1 7.558 2.719 41.7 41.7 0 0 1 6.781 3.797v-25.807c-4.204-1.611-8.797-2.805-13.778-3.582-4.981-.777-10.697-1.165-17.147-1.165-6.565 0-12.784.705-18.658 2.115-5.874 1.409-11.043 3.61-15.506 6.602-4.463 2.993-7.99 6.805-10.582 11.437-2.591 4.632-3.887 10.17-3.887 16.615 0 8.228 2.375 15.248 7.127 21.06 4.751 5.811 11.963 10.731 21.638 14.759a291.458 291.458 0 0 1 10.625 4.575c3.283 1.496 6.119 3.049 8.509 4.66 2.39 1.611 4.276 3.366 5.658 5.265 1.382 1.899 2.073 4.057 2.073 6.474a9.901 9.901 0 0 1-1.296 4.963c-.864 1.524-2.174 2.848-3.93 3.97-1.756 1.122-3.945 1.999-6.565 2.632-2.62.633-5.687.95-9.2.95-5.989 0-11.92-1.05-17.794-3.151-5.875-2.1-11.317-5.25-16.327-9.451ZM104.482 131.742H140V109H41v22.742h35.345V233h28.137V131.742Z"
    />
  </svg>
);

interface PlatformMeta {
  icon: ReactNode;
  /** Tailwind gradient stops for the icon tile + hover accent rule. */
  gradient: string;
  desc: string;
}

const PLATFORM_META: Record<string, PlatformMeta> = {
  js:             { icon: <Code2 size={22} />,          gradient: 'from-amber-400 to-yellow-500',   desc: 'Closures, promises, the event loop & the DOM.' },
  javascript:     { icon: <Code2 size={22} />,          gradient: 'from-amber-400 to-yellow-500',   desc: 'Closures, promises, the event loop & the DOM.' },
  reactjs:        { icon: <Atom size={22} />,           gradient: 'from-cyan-400 to-sky-500',       desc: 'Components, state, hooks & rendering.' },
  react:          { icon: <Atom size={22} />,           gradient: 'from-cyan-400 to-sky-500',       desc: 'Components, state, hooks & rendering.' },
  'react-native': { icon: <Atom size={22} />,           gradient: 'from-sky-400 to-blue-600',       desc: 'Core components, styling & mobile APIs.' },
  nodejs:         { icon: <Server size={22} />,         gradient: 'from-emerald-400 to-green-600',  desc: 'Event loop, streams, processes & APIs.' },
  node:           { icon: <Server size={22} />,         gradient: 'from-emerald-400 to-green-600',  desc: 'Event loop, streams, processes & APIs.' },
  ts:             { icon: <TypeScriptIcon size={22} />, gradient: 'from-blue-500 to-indigo-600',    desc: 'Types, generics & utility types.' },
  typescript:     { icon: <TypeScriptIcon size={22} />, gradient: 'from-blue-500 to-indigo-600',    desc: 'Types, generics & utility types.' },
  html:           { icon: <FileCode size={22} />,       gradient: 'from-orange-400 to-red-500',     desc: 'Semantic layout, CRP & accessibility.' },
  css:            { icon: <Palette size={22} />,        gradient: 'from-indigo-400 to-violet-600',  desc: 'Grid, flexbox, animations & queries.' },
};

const DEFAULT_META: PlatformMeta = {
  icon: <HelpCircle size={22} />,
  gradient: 'from-slate-400 to-slate-600',
  desc: 'Explore interview questions for this topic.',
};

const getMeta = (platform: Platform): PlatformMeta => {
  const key = platform.key?.toLowerCase().trim();
  if (key && PLATFORM_META[key]) return PLATFORM_META[key];
  const name = platform.Name?.toLowerCase().trim();
  if (name && PLATFORM_META[name]) return PLATFORM_META[name];
  return DEFAULT_META;
};

/**
 * Cycles the highlighted word in the headline through the available tracks.
 * Pauses while the tab is hidden (the interval simply won't be visible) and
 * is skipped entirely when there is nothing to rotate through.
 */
const useRotatingWord = (words: string[], intervalMs = 2400) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs]);

  return words[index % Math.max(words.length, 1)];
};

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: platforms, loading, error } = useAppSelector((state) => state.platforms);

  useEffect(() => {
    if (platforms.length === 0) dispatch(fetchPlatforms());
  }, [dispatch, platforms.length]);

  const trackNames = useMemo(
    () => platforms.map((p) => p.Name).filter(Boolean),
    [platforms]
  );
  const rotating = useRotatingWord(trackNames);

  /** Longest name decides the headline's reserved width. */
  const sizerWord = useMemo(
    () => trackNames.reduce((longest, n) => (n.length > longest.length ? n : longest), 'Frontend'),
    [trackNames]
  );

  return (
    <PageShell>
      <PageNav showAdminLink />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.section
        variants={stagger(0.08)}
        initial="hidden"
        animate="show"
        className="relative max-w-3xl pt-6 pb-12 sm:pt-10 sm:pb-16"
      >
        <motion.div variants={fadeUp}>
          <span
            className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-full
                       border border-brand/25 bg-brand/8 text-brand text-xs font-semibold
                       backdrop-blur-sm"
          >
            <Sparkles size={13} className="animate-float" />
            Interview prep, done properly
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-6 text-4xl sm:text-5xl md:text-[3.6rem] font-extrabold leading-[1.06] tracking-tight"
        >
          Master
          {/* The rotating track name is swapped in place; the inline-grid keeps
              both the outgoing and incoming words on the same cell so the
              headline never reflows mid-animation. */}
          <span className="ml-3 mr-1 inline-grid align-baseline text-left">
            {/* Invisible sizer holds the cell at the width of the longest track
                name, so swapping words never reflows the headline. */}
            <span aria-hidden className="col-start-1 row-start-1 invisible whitespace-nowrap">
              {sizerWord}
            </span>
            <AnimatePresence initial={false}>
              <motion.span
                key={rotating ?? 'frontend'}
                initial={{ opacity: 0, y: '0.45em', filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: '-0.45em', filter: 'blur(5px)' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="gradient-text col-start-1 row-start-1 whitespace-nowrap"
              >
                {rotating ?? 'Frontend'}
              </motion.span>
            </AnimatePresence>
          </span>
          <br />
          interviews.
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-5 text-base sm:text-lg text-fg-muted max-w-xl">
          Theory, output prediction and hands-on challenges — one focused place to
          drill the questions you'll actually be asked.
        </motion.p>

        <motion.p variants={fadeUp} className="mt-5 text-xs font-semibold tracking-[0.22em] uppercase text-fg-subtle">
          Upskill · Apply · Escape
        </motion.p>

        {error && (
          <motion.p variants={fadeUp} className="mt-5 text-sm text-danger">
            {error}
          </motion.p>
        )}
      </motion.section>

      {/* ── Track grid ───────────────────────────────────────────────────── */}
      <section aria-label="Choose a track">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex items-center gap-4 mb-5"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-fg-subtle whitespace-nowrap">
            Choose your track
          </h2>
          <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface p-5">
                <div className="skeleton h-11 w-11 rounded-xl mb-4" />
                <div className="skeleton h-4 w-1/2 rounded mb-2.5" />
                <div className="skeleton h-3 w-4/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={stagger(0.05, 0.05)}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {platforms.map((platform) => {
              const meta = getMeta(platform);
              return (
                <motion.div key={platform.id} variants={popIn}>
                  <InteractiveCard
                    accent={meta.gradient}
                    onClick={() => navigate(`/${platform.key}`)}
                    className="h-full p-5 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <motion.span
                        whileHover={{ rotate: -6, scale: 1.06 }}
                        transition={spring}
                        className={cn(
                          'grid h-11 w-11 place-items-center rounded-xl text-white shadow-md',
                          'bg-gradient-to-br',
                          meta.gradient
                        )}
                      >
                        {meta.icon}
                      </motion.span>

                      <span
                        className="grid h-8 w-8 place-items-center rounded-full border border-border text-fg-subtle
                                   transition-all duration-300
                                   group-hover:border-brand/40 group-hover:bg-brand/10 group-hover:text-brand
                                   group-hover:translate-x-0.5"
                      >
                        <ArrowRight size={15} />
                      </span>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight mb-1.5">{platform.Name}</h3>
                    <p className="text-[13px] leading-relaxed text-fg-muted">{meta.desc}</p>
                  </InteractiveCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      <motion.footer
        {...revealOnScroll}
        className="mt-16 pt-8 border-t border-border/70 text-center"
      >
        <p className="text-xs text-fg-subtle">
          Built for upskilling — practice smart, interview confident.
        </p>
      </motion.footer>
    </PageShell>
  );
};

export default LandingPage;
