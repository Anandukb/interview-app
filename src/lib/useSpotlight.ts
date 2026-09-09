import { useCallback, useRef } from 'react';

/**
 * Cursor-tracking spotlight. Writes the pointer position into the element's
 * `--mx` / `--my` custom properties, which the `.spotlight` class reads to
 * position a radial highlight.
 *
 * Positions are written straight to `style` inside a rAF rather than through
 * React state — this fires on every mousemove, so re-rendering would be wasteful.
 */
export const useSpotlight = <T extends HTMLElement = HTMLDivElement>() => {
  const ref = useRef<T | null>(null);
  const frame = useRef(0);

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${clientX - rect.left}px`);
      el.style.setProperty('--my', `${clientY - rect.top}px`);
    });
  }, []);

  return { ref, onMouseMove };
};
