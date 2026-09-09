import type { Transition, Variants } from 'framer-motion';

/**
 * One motion vocabulary for the whole app.
 *
 * Rules of thumb used here:
 *  - Entrances travel a short distance (8–16px) and ease out hard, so they
 *    feel like they *settle* rather than slide.
 *  - Anything the user directly manipulates (hover, tap, drag) uses a spring;
 *    anything the app decides (page loads, reveals) uses a duration + ease.
 *  - Stagger is small (~40ms). Long stagger on a big grid reads as sluggish.
 */

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/** Springy, for hover / tap / layout — feels physical without wobbling. */
export const spring: Transition = { type: 'spring', stiffness: 400, damping: 30, mass: 0.6 };
export const springSoft: Transition = { type: 'spring', stiffness: 220, damping: 26 };

/** Fade + rise. The workhorse entrance. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35, ease: EASE_OUT } },
};

/** Scale-in for cards / tiles that should feel like they "pop" into place. */
export const popIn: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

/**
 * Parent wrapper that cascades its children. `delayChildren` gives the page
 * header a beat to land before the grid starts filling in.
 */
export const stagger = (staggerChildren = 0.04, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

/** Accordion / disclosure height animation. */
export const collapse: Variants = {
  hidden: { height: 0, opacity: 0, transition: { duration: 0.24, ease: EASE_IN_OUT } },
  show: {
    height: 'auto',
    opacity: 1,
    transition: { height: { duration: 0.3, ease: EASE_OUT }, opacity: { duration: 0.22, delay: 0.06 } },
  },
};

/** Route-level view swap (list ⇄ detail). */
export const viewSwap: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: EASE_IN_OUT } },
};

/** Scroll-triggered reveal props — spread onto any motion element. */
export const revealOnScroll = {
  initial: 'hidden' as const,
  whileInView: 'show' as const,
  viewport: { once: true, margin: '-80px' },
  variants: fadeUp,
};
