import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Atom, Server, Code2, ShieldCheck,
  FileCode, Palette, Loader2, HelpCircle
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPlatforms } from '../store/slices/platformsSlice';
import type { Platform } from '../store/slices/platformsSlice';
import './LandingPage.css';

// ── Icon / colour map keyed by platform.key ────────────────────────────────────

const PLATFORM_META: Record<string, { icon: ReactNode; color: string; desc: string }> = {
  js: {
    icon: <Code2 size={48} className="lang-icon js" />,
    color: '#f7df1e',
    desc: 'Master scoping, closures, promises, event loop, and DOM.',
  },
  javascript: {
    icon: <Code2 size={48} className="lang-icon js" />,
    color: '#f7df1e',
    desc: 'Master scoping, closures, promises, event loop, and DOM.',
  },
  reactjs: {
    icon: <Atom size={48} className="lang-icon react" />,
    color: '#61dafb',
    desc: 'Master components, state, hooks, reconciliation, and rendering.',
  },
  react: {
    icon: <Atom size={48} className="lang-icon react" />,
    color: '#61dafb',
    desc: 'Master components, state, hooks, reconciliation, and rendering.',
  },
  nodejs: {
    icon: <Server size={48} className="lang-icon node" />,
    color: '#339933',
    desc: 'Master Event Loop, streams, processes, and APIs.',
  },
  node: {
    icon: <Server size={48} className="lang-icon node" />,
    color: '#339933',
    desc: 'Master Event Loop, streams, processes, and APIs.',
  },
  tsx: {
    icon: <ShieldCheck size={48} className="lang-icon ts" />,
    color: '#3178c6',
    desc: 'Master types, interfaces, generics, type narrowing, and utility types.',
  },
  typescript: {
    icon: <ShieldCheck size={48} className="lang-icon ts" />,
    color: '#3178c6',
    desc: 'Master types, interfaces, generics, type narrowing, and utility types.',
  },
  html: {
    icon: <FileCode size={48} className="lang-icon html" />,
    color: '#e34f26',
    desc: 'Master semantic layout, script loading, Critical Rendering Path, and accessibility.',
  },
  css: {
    icon: <Palette size={48} className="lang-icon css" />,
    color: '#264de4',
    desc: 'Master grid, flexbox, box model, specificity, animations, and container queries.',
  },
};

const DEFAULT_META = {
  icon: <HelpCircle size={48} className="lang-icon" />,
  color: '#888888',
  desc: 'Explore interview questions for this topic.',
};

// ── Component ──────────────────────────────────────────────────────────────────

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: platforms, loading, error } = useAppSelector(
    (state) => state.platforms
  );

  useEffect(() => {
    // Skip fetch if data is already loaded in the Redux store
    if (platforms.length === 0) {
      dispatch(fetchPlatforms());
    }
  }, [dispatch, platforms.length]);

  const getMeta = (platform: Platform) =>
    PLATFORM_META[platform.key?.toLowerCase()] ?? DEFAULT_META;

  return (
    <div className="landing-container container">
      <div className="hero-section">
        <div className="badge glass">Interview Prep</div>
        <h1 className="hero-title">
          Master Frontend <span className="gradient-text">Interviews</span>
        </h1>
        <p className="hero-subtitle">
          Select a track below to start practicing real-world interview questions
          with our interactive compiler.
        </p>
        {error && <p className="stats-error">{error}</p>}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="language-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="lang-card glass-card skeleton-card">
              <div className="skeleton skeleton-icon" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-btn" />
            </div>
          ))}
        </div>
      )}

      {/* ── Platform cards from API ── */}
      {!loading && (
        <div className="language-grid">
          {platforms.map(platform => {
            const meta = getMeta(platform);
            return (
              <div
                key={platform.id}
                className="lang-card glass-card"
                onClick={() => navigate(`/${platform.key}`)}
                style={{ '--hover-color': meta.color } as React.CSSProperties}
              >
                <div className="icon-wrapper glass">
                  {meta.icon}
                </div>
                <h2>{platform.Name}</h2>
                <p>{meta.desc}</p>
                <div className="card-footer">
                  <span className="btn-secondary small">Start Practice</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
