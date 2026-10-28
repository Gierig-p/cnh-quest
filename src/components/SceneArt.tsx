import type { SceneId } from '../content/types';

/** Cenas de trânsito vistas de cima, desenhadas para fins didáticos. */
export function SceneArt({ scene, title }: { scene: SceneId; title: string }) {
  return (
    <svg viewBox="0 0 320 200" width="320" height="200" role="img" aria-label={title} style={{ borderRadius: 16, background: '#cfe8c9' }}>
      <title>{title}</title>
      {SCENES[scene]}
    </svg>
  );
}

const ROAD = '#5b6670';
const LINE = '#f4f4f4';

function Car({ x, y, rot = 0, color = '#2f80ed', label }: { x: number; y: number; rot?: number; color?: string; label?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-11" y="-18" width="22" height="36" rx="6" fill={color} stroke="#0003" strokeWidth="1.5" />
      <rect x="-8" y="-12" width="16" height="9" rx="2" fill="#dff1ff" />
      <rect x="-8" y="6" width="16" height="6" rx="2" fill="#dff1ff" opacity=".8" />
      {label && (
        <g transform={`rotate(${-rot})`}>
          <rect x="-20" y="-36" width="40" height="15" rx="7" fill="#fff" />
          <text x="0" y="-25" textAnchor="middle" fontSize="10" fontWeight="800" fill="#22313f">{label}</text>
        </g>
      )}
    </g>
  );
}

function Arrow({ d, color = '#22313f' }: { d: string; color?: string }) {
  return (
    <>
      <defs>
        <marker id={`ah-${color.slice(1)}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill={color} />
        </marker>
      </defs>
      <path d={d} fill="none" stroke={color} strokeWidth="3" strokeDasharray="6 5" markerEnd={`url(#ah-${color.slice(1)})`} />
    </>
  );
}

function Person({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="7" fill="#ffb27a" stroke="#22313f" strokeWidth="2" />
      <circle cy="-1" r="3" fill="#22313f" />
    </g>
  );
}

const SCENES: Record<SceneId, React.ReactNode> = {
  'cruzamento-direita': (
    <>
      <rect x="0" y="75" width="320" height="50" fill={ROAD} />
      <rect x="135" y="0" width="50" height="200" fill={ROAD} />
      <line x1="0" y1="100" x2="125" y2="100" stroke={LINE} strokeWidth="2" strokeDasharray="10 8" />
      <line x1="195" y1="100" x2="320" y2="100" stroke={LINE} strokeWidth="2" strokeDasharray="10 8" />
      <Car x={172} y={160} label="Você" />
      <Car x={250} y={88} rot={-90} color="#e5484d" />
      <Arrow d="M172 135 V95" />
      <Arrow d="M225 88 H180" color="#b8383c" />
    </>
  ),
  rotatoria: (
    <>
      <rect x="135" y="0" width="50" height="200" fill={ROAD} />
      <circle cx="160" cy="95" r="72" fill={ROAD} />
      <circle cx="160" cy="95" r="34" fill="#9cd08f" stroke="#f4f4f4" strokeWidth="3" />
      <Car x={172} y={182} label="Você" />
      <Car x={210} y={115} rot={-30} color="#e5484d" />
      <Arrow d="M232 90 Q230 60 205 40" color="#b8383c" />
    </>
  ),
  'rodovia-via-local': (
    <>
      <rect x="0" y="60" width="320" height="70" fill="#4b555e" />
      <line x1="0" y1="95" x2="320" y2="95" stroke="#f7c518" strokeWidth="3" />
      <rect x="140" y="130" width="40" height="70" fill={ROAD} />
      <text x="12" y="52" fontSize="13" fontWeight="800" fill="#22313f">RODOVIA</text>
      <text x="190" y="190" fontSize="13" fontWeight="800" fill="#22313f">VIA LOCAL</text>
      <Car x={160} y={168} label="Você" />
      <Car x={70} y={112} rot={90} color="#e5484d" />
      <Arrow d="M95 112 H140" color="#b8383c" />
    </>
  ),
  'agente-semaforo': (
    <>
      <rect x="0" y="120" width="320" height="80" fill={ROAD} />
      <rect x="40" y="20" width="34" height="86" rx="10" fill="#22313f" />
      <circle cx="57" cy="40" r="11" fill="#ff4d4f" />
      <circle cx="57" cy="63" r="11" fill="#4b4b2b" />
      <circle cx="57" cy="86" r="11" fill="#1f3b2b" />
      <rect x="54" y="106" width="6" height="20" fill="#22313f" />
      <g transform="translate(205 70)">
        <rect x="-14" y="0" width="28" height="44" rx="10" fill="#2f5d9c" />
        <rect x="-15" y="-6" width="30" height="8" rx="3" fill="#f7c518" />
        <circle cy="-16" r="13" fill="#c98a5e" />
        <path d="M-15 -22 Q0 -40 15 -22 Z" fill="#1e3a66" />
        <path d="M14 8 L46 -8" stroke="#c98a5e" strokeWidth="8" strokeLinecap="round" />
        <rect x="-10" y="44" width="8" height="22" fill="#1e3a66" />
        <rect x="2" y="44" width="8" height="22" fill="#1e3a66" />
      </g>
      <Car x={120} y={160} rot={90} label="Você" />
      <Arrow d="M150 160 H215" />
    </>
  ),
  'pedestre-faixa': (
    <>
      <rect x="0" y="60" width="320" height="80" fill={ROAD} />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={200} y={64 + i * 11} width="40" height="6" fill={LINE} />
      ))}
      <Person x={220} y={92} />
      <Car x={130} y={118} rot={90} label="Você" />
      <Arrow d="M155 118 Q190 118 196 90" />
    </>
  ),
  ambulancia: (
    <>
      <rect x="95" y="0" width="130" height="200" fill={ROAD} />
      <line x1="160" y1="0" x2="160" y2="200" stroke={LINE} strokeWidth="3" strokeDasharray="14 10" />
      <Car x={130} y={70} label="Você" />
      <g transform="translate(130 160)">
        <rect x="-13" y="-22" width="26" height="44" rx="5" fill="#fff" stroke="#c33" strokeWidth="2" />
        <rect x="-3" y="-4" width="6" height="16" fill="#e5484d" />
        <rect x="-8" y="1" width="16" height="6" fill="#e5484d" />
        <rect x="-11" y="-22" width="9" height="5" fill="#e5484d" />
        <rect x="2" y="-22" width="9" height="5" fill="#2f80ed" />
      </g>
      <Arrow d="M150 70 Q180 70 190 40" />
      <text x="232" y="168" fontSize="12" fontWeight="800" fill="#22313f">sirene</text>
    </>
  ),
};
