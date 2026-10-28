import type { SignCode } from '../content/types';

/**
 * Placas desenhadas pelo app, seguindo forma e cores do MBST (Res. CONTRAN 973/2022, Vols. I e II).
 * São representações didáticas, não arquivos oficiais de produção de placas.
 */
export function SignArt({ code, speed = 60, size = 120, title }: { code: SignCode; speed?: number; size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={title ?? code}>
      {title && <title>{title}</title>}
      {render(code, speed)}
    </svg>
  );
}

const RED = '#d62f2f';
const BLACK = '#1b1b1b';
const YELLOW = '#f7c518';

function ring(children?: React.ReactNode) {
  return (
    <>
      <circle cx="50" cy="50" r="46" fill="#fff" stroke={RED} strokeWidth="9" />
      {children}
    </>
  );
}

function car(x: number, y: number, fill: string) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="5" width="16" height="30" rx="5" fill={fill} />
      <rect x="2.5" y="10" width="11" height="7" rx="2" fill="#fff" opacity=".85" />
      <rect x="2.5" y="25" width="11" height="5" rx="2" fill="#fff" opacity=".6" />
    </g>
  );
}

function diamond(children: React.ReactNode) {
  return (
    <>
      <rect x="15" y="15" width="70" height="70" rx="6" transform="rotate(45 50 50)" fill={YELLOW} stroke={BLACK} strokeWidth="4" />
      {children}
    </>
  );
}

function render(code: SignCode, speed: number) {
  switch (code) {
    case 'R-1': {
      const pts = Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI / 8) * (2 * i + 1);
        return `${50 + 47 * Math.cos(a)},${50 + 47 * Math.sin(a)}`;
      }).join(' ');
      const inner = Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI / 8) * (2 * i + 1);
        return `${50 + 41 * Math.cos(a)},${50 + 41 * Math.sin(a)}`;
      }).join(' ');
      return (
        <>
          <polygon points={pts} fill={RED} />
          <polygon points={inner} fill="none" stroke="#fff" strokeWidth="3" />
          <text x="50" y="59" textAnchor="middle" fontSize="25" fontWeight="900" fill="#fff" fontFamily="Arial, sans-serif">PARE</text>
        </>
      );
    }
    case 'R-2':
      return (
        <>
          <polygon points="6,14 94,14 50,92" fill={RED} strokeLinejoin="round" stroke={RED} strokeWidth="4" />
          <polygon points="22,23 78,23 50,72" fill="#fff" />
        </>
      );
    case 'R-3':
      return (
        <>
          <circle cx="50" cy="50" r="46" fill={RED} />
          <rect x="18" y="41" width="64" height="18" fill="#fff" />
        </>
      );
    case 'R-6a':
      return ring(
        <>
          <text x="50" y="66" textAnchor="middle" fontSize="46" fontWeight="900" fill={BLACK} fontFamily="Arial, sans-serif">E</text>
          <line x1="22" y1="22" x2="78" y2="78" stroke={RED} strokeWidth="9" />
        </>,
      );
    case 'R-6c':
      return ring(
        <>
          <text x="50" y="66" textAnchor="middle" fontSize="46" fontWeight="900" fill={BLACK} fontFamily="Arial, sans-serif">E</text>
          <line x1="22" y1="22" x2="78" y2="78" stroke={RED} strokeWidth="9" />
          <line x1="78" y1="22" x2="22" y2="78" stroke={RED} strokeWidth="9" />
        </>,
      );
    case 'R-7':
      return ring(
        <>
          {car(28, 28, RED)}
          {car(55, 28, BLACK)}
          <line x1="22" y1="22" x2="78" y2="78" stroke={RED} strokeWidth="9" />
        </>,
      );
    case 'R-19':
      return ring(
        <>
          <text x="50" y="60" textAnchor="middle" fontSize={speed >= 100 ? 30 : 36} fontWeight="900" fill={BLACK} fontFamily="Arial, sans-serif">
            {speed}
          </text>
          <text x="50" y="76" textAnchor="middle" fontSize="11" fontWeight="700" fill={BLACK} fontFamily="Arial, sans-serif">km/h</text>
        </>,
      );
    case 'A-18':
      return diamond(<path d="M24 62 H38 Q50 38 62 62 H76" fill="none" stroke={BLACK} strokeWidth="6" strokeLinecap="round" />);
    case 'A-32b':
      return diamond(
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={30 + i * 8.5} y="66" width="5" height="10" fill={BLACK} />
          ))}
          <circle cx="52" cy="28" r="5" fill={BLACK} />
          <path d="M52 34 L48 50 L42 62 M48 50 L56 62 M50 40 L42 46 M51 40 L60 45" stroke={BLACK} strokeWidth="5" strokeLinecap="round" fill="none" />
        </>,
      );
  }
}
