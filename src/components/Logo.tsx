import { cn } from '../lib/cn';

interface LogoProps {
  /** Rendered height in pixels. Width scales to preserve aspect ratio. */
  height?: number;
  className?: string;
  alt?: string;
}

/**
 * Int Hack brand lockup (icon mark + wordmark + tagline) sourced from
 * /public/inthackLogo.png. Width follows the image's natural aspect ratio.
 */
export const Logo = ({ height = 32, className, alt = 'Int Hack' }: LogoProps) => (
  <img
    src="/inthackLogo.png"
    alt={alt}
    style={{ height, width: 'auto' }}
    className={cn('object-contain select-none', className)}
    draggable={false}
  />
);

interface LogoMarkProps {
  size?: number;
  className?: string;
  /** When true, fall back to currentColor instead of the gradient. */
  monochrome?: boolean;
}

/**
 * Icon-only SVG variant for compact UI (favicons, small avatars). Independent
 * from the PNG lockup so it can be tinted with currentColor when needed.
 */
export const LogoMark = ({ size = 32, className, monochrome }: LogoMarkProps) => {
  const stroke = monochrome ? 'currentColor' : 'url(#ihGrad)';
  const fill = monochrome ? 'currentColor' : 'url(#ihGrad)';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Int Hack"
      className={className}
    >
      {!monochrome && (
        <defs>
          <linearGradient id="ihGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M16 7 H48 A8 8 0 0 1 56 15 V41 A8 8 0 0 1 48 49 H24 L13 58 V15 A8 8 0 0 1 21 7 Z"
        stroke={stroke}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <rect x={22} y={16} width={22} height={26} rx={2.5} stroke={stroke} strokeWidth={2.4} />
      <rect x={28} y={13} width={10} height={5} rx={1.2} stroke={stroke} strokeWidth={2.2} />
      {[23, 30, 37].map((y) => (
        <g key={y}>
          <path
            d={`M25.5 ${y} l1.8 1.8 l3.4 -3.4`}
            stroke={stroke}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1={33} y1={y} x2={41} y2={y} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
        </g>
      ))}
      <circle cx={46} cy={44} r={9} fill={fill} />
      <text
        x={46}
        y={48.5}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={12}
        fontWeight={700}
        fill="#ffffff"
      >
        ?
      </text>
    </svg>
  );
};

export default Logo;
