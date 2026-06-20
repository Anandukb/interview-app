// Tiny class-name combiner. Filters falsy values and joins with spaces.
type ClassValue = string | number | false | null | undefined;
export const cn = (...values: ClassValue[]): string =>
  values.filter(Boolean).join(' ');
