import type { SceneId } from '../content/types';

/**
 * Cenas de trânsito desenhadas para fins didáticos (vistas de cima ou de lado).
 * Mostram a situação da pergunta sem entregar a resposta.
 * Texturas (asfalto, calçada, grama) e vidros vêm dos padrões em <Defs/>.
 */
export function SceneArt({ scene, title }: { scene: SceneId; title: string }) {
  return (
    <svg viewBox="0 0 320 200" width="320" height="200" role="img" aria-label={title} style={{ borderRadius: 16, background: GRASS }}>
      <title>{title}</title>
      <Defs />
      {SCENES[scene]}
    </svg>
  );
}

const GRASS = '#bfe0b5';
const GRASS_DARK = '#a6d19a';
const WALK = '#e8e2d4';
const CURB = '#c9c1b0';
const CURB_SHADE = '#9c937f';
const ROAD = '#56616b';
const LINE = '#f4f4f4';
const YELLOW = '#f7c518';
const INK = '#22313f';
const RED = '#e5484d';
const BLUE = '#2f80ed';
const GREY = '#8796a3';
const SKIN = '#c98a5e';
const SKIN_LIGHT = '#f0b98d';

/* ---------------- texturas ---------------- */

function Defs() {
  return (
    <defs>
      <pattern id="sc-asf" width="14" height="14" patternUnits="userSpaceOnUse">
        <rect width="14" height="14" fill={ROAD} />
        <circle cx="3" cy="4" r=".7" fill="#6a757f" />
        <circle cx="10" cy="2" r=".5" fill="#4b545d" />
        <circle cx="8" cy="9" r=".7" fill="#6a757f" />
        <circle cx="2" cy="11" r=".5" fill="#4b545d" />
        <circle cx="12" cy="12" r=".4" fill="#727d87" />
      </pattern>
      <pattern id="sc-calc" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill={WALK} />
        <path d="M0 .5 H12 M.5 0 V12" stroke="#d5cdbb" strokeWidth="1" />
      </pattern>
      <pattern id="sc-grama" width="18" height="18" patternUnits="userSpaceOnUse">
        <rect width="18" height="18" fill={GRASS} />
        <path d="M3 6 l1 -3 l1 3 M11 14 l1 -3 l1 3 M13 4 l1 -2.5 l1 2.5" stroke={GRASS_DARK} strokeWidth="1" fill="none" strokeLinecap="round" />
      </pattern>
      <linearGradient id="sc-ceu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8fcbee" />
        <stop offset="1" stopColor="#e6f4fb" />
      </linearGradient>
      <linearGradient id="sc-vidro" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#9cc3dc" />
        <stop offset=".55" stopColor="#4d6f8a" />
        <stop offset="1" stopColor="#2f4a60" />
      </linearGradient>
      <radialGradient id="sc-brilho" cx=".35" cy=".35" r=".7">
        <stop offset="0" stopColor="#fff" stopOpacity=".9" />
        <stop offset=".4" stopColor="#fff" stopOpacity=".15" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/* ---------------- peças vistas de cima ---------------- */

/** fundo de grama com textura e algumas flores fixas */
function Grass() {
  const flores = [
    [24, 22, '#fff'], [70, 46, '#ffd84a'], [262, 18, '#fff'], [300, 52, '#f5a3c7'], [36, 176, '#ffd84a'], [290, 182, '#fff'], [250, 150, '#f5a3c7'], [18, 120, '#fff'],
  ] as const;
  return (
    <>
      <rect width="320" height="200" fill="url(#sc-grama)" />
      {flores.map(([x, y, c]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="1.8" fill={c} />
          <circle cx={x} cy={y} r=".7" fill="#e0a800" />
        </g>
      ))}
    </>
  );
}

/**
 * Ruas vistas de cima: primeiro as calçadas (blocos), depois o meio-fio e o asfalto,
 * para que os cruzamentos fiquem limpos.
 */
function Roads({ h = [], v = [], walk = 10 }: { h?: [number, number][]; v?: [number, number][]; walk?: number }) {
  return (
    <>
      {h.map(([y, hh]) => <rect key={`hw${y}`} x="0" y={y - walk} width="320" height={hh + walk * 2} fill="url(#sc-calc)" />)}
      {v.map(([x, w]) => <rect key={`vw${x}`} x={x - walk} y="0" width={w + walk * 2} height="200" fill="url(#sc-calc)" />)}
      {h.map(([y, hh]) => (
        <g key={`hc${y}`}>
          <rect x="0" y={y - 3} width="320" height={hh + 6} fill={CURB} />
          <rect x="0" y={y - 1} width="320" height={hh + 2} fill={CURB_SHADE} />
        </g>
      ))}
      {v.map(([x, w]) => (
        <g key={`vc${x}`}>
          <rect x={x - 3} y="0" width={w + 6} height="200" fill={CURB} />
          <rect x={x - 1} y="0" width={w + 2} height="200" fill={CURB_SHADE} />
        </g>
      ))}
      {h.map(([y, hh]) => <rect key={`ha${y}`} x="0" y={y} width="320" height={hh} fill="url(#sc-asf)" />)}
      {v.map(([x, w]) => <rect key={`va${x}`} x={x} y="0" width={w} height="200" fill="url(#sc-asf)" />)}
    </>
  );
}

/** tampa de bueiro (detalhe do asfalto) */
function Bueiro({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="5" fill="#4a535c" stroke="#3b434b" strokeWidth="1" />
      <path d={`M${x - 3} ${y} H${x + 3} M${x} ${y - 3} V${y + 3}`} stroke="#3b434b" strokeWidth=".8" />
    </g>
  );
}

/** árvore vista de cima: sombra, copa em camadas e brilho */
function Tree({ x, y, r = 14 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <ellipse cx={x + r * 0.35} cy={y + r * 0.35} rx={r} ry={r * 0.9} fill="#0002" />
      <circle cx={x} cy={y} r={r} fill="#3f8a3a" />
      <circle cx={x - r * 0.25} cy={y - r * 0.2} r={r * 0.72} fill="#55a14c" />
      <circle cx={x + r * 0.35} cy={y + r * 0.25} r={r * 0.45} fill="#4a9643" />
      <circle cx={x - r * 0.4} cy={y - r * 0.4} r={r * 0.32} fill="#79c06c" />
      <circle cx={x + r * 0.2} cy={y - r * 0.5} r={r * 0.14} fill="#79c06c" />
    </g>
  );
}

/** casa vista de cima: telhado de duas águas com cumeeira, telhas e chaminé */
function House({ x, y, w = 50, h = 40, roof = '#c4543d' }: { x: number; y: number; w?: number; h?: number; roof?: string }) {
  const rows = Math.floor(h / 2 / 5);
  return (
    <g>
      <rect x={x + 3} y={y + 3} width={w} height={h} rx="2" fill="#0002" />
      <rect x={x} y={y} width={w} height={h} rx="2" fill={roof} />
      <rect x={x} y={y + h / 2} width={w} height={h / 2} fill="#0000001f" />
      {Array.from({ length: rows }, (_, i) => (
        <g key={i} stroke="#0000002a" strokeWidth=".8">
          <line x1={x} y1={y + 5 + i * 5} x2={x + w} y2={y + 5 + i * 5} />
          <line x1={x} y1={y + h / 2 + 5 + i * 5} x2={x + w} y2={y + h / 2 + 5 + i * 5} />
        </g>
      ))}
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#ffffff66" strokeWidth="1.6" />
      <rect x={x + w * 0.72} y={y + h * 0.18} width="6" height="6" fill="#8d8d8d" stroke="#0003" />
      <rect x={x} y={y} width={w} height={h} rx="2" fill="none" stroke="#0003" />
    </g>
  );
}

/** carro visto de cima; a frente aponta para cima com rot = 0 */
function Car({ x, y, rot = 0, color = BLUE, label, side = false }: { x: number; y: number; rot?: number; color?: string; label?: string; side?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-9" y="-15" width="23" height="37" rx="7" fill="#0003" />
      {[[-12.5, -13], [8.5, -13], [-12.5, 6], [8.5, 6]].map(([wx, wy]) => (
        <rect key={`${wx}${wy}`} x={wx} y={wy} width="4" height="8" rx="1.5" fill="#151515" />
      ))}
      <rect x="-11" y="-18" width="22" height="36" rx="6.5" fill={color} stroke="#00000055" strokeWidth="1.2" />
      {/* capô com brilho */}
      <path d="M-8.5 -16.5 Q0 -18.5 8.5 -16.5 L7.5 -11 H-7.5 Z" fill="#ffffff2e" />
      <line x1="0" y1="-16.5" x2="0" y2="-11.5" stroke="#00000022" strokeWidth=".8" />
      {/* para-brisa, teto e vidro traseiro */}
      <path d="M-8 -10 H8 L6.6 -4 H-6.6 Z" fill="url(#sc-vidro)" />
      <rect x="-6.6" y="-4" width="13.2" height="10.5" rx="2" fill="#ffffff26" stroke="#00000022" strokeWidth=".6" />
      <path d="M-6.6 6.5 H6.6 L7.6 11 H-7.6 Z" fill="url(#sc-vidro)" />
      {/* vidros laterais */}
      <rect x="-9.6" y="-8" width="1.6" height="13" rx=".8" fill="#3b5a73" />
      <rect x="8" y="-8" width="1.6" height="13" rx=".8" fill="#3b5a73" />
      {/* retrovisores */}
      <ellipse cx="-12" cy="-8.5" rx="2" ry="1.3" fill={color} stroke="#00000055" strokeWidth=".6" />
      <ellipse cx="12" cy="-8.5" rx="2" ry="1.3" fill={color} stroke="#00000055" strokeWidth=".6" />
      {/* faróis e lanternas */}
      <rect x="-9" y="-18.3" width="5" height="2.4" rx="1" fill="#fff6c2" />
      <rect x="4" y="-18.3" width="5" height="2.4" rx="1" fill="#fff6c2" />
      <rect x="-9" y="16.2" width="4.5" height="2" rx="1" fill="#d63b3b" />
      <rect x="4.5" y="16.2" width="4.5" height="2" rx="1" fill="#d63b3b" />
      {label && (side ? <Tag rot={rot} text={label} dx={-38} dy={-8} /> : <Tag rot={rot} text={label} />)}
    </g>
  );
}

/** etiqueta que fica sempre de pé, acima do veículo */
function Tag({ rot, text, dx = 0, dy = -36 }: { rot: number; text: string; dx?: number; dy?: number }) {
  const w = text.length * 6.4 + 14;
  return (
    <g transform={`rotate(${-rot}) translate(${dx} 0)`}>
      <rect x={-w / 2} y={dy} width={w} height="15" rx="7" fill="#fff" stroke="#0003" />
      <text x="0" y={dy + 11} textAnchor="middle" fontSize="10" fontWeight="800" fill={INK}>{text}</text>
    </g>
  );
}

/** caminhão visto de cima (cabine na frente, baú atrás) */
function Truck({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-10" y="-28" width="27" height="64" rx="4" fill="#0003" />
      {[-25, -6, 14, 24].map((wy) => (
        <g key={wy}>
          <rect x="-15.5" y={wy} width="4" height="8" rx="1.5" fill="#151515" />
          <rect x="11.5" y={wy} width="4" height="8" rx="1.5" fill="#151515" />
        </g>
      ))}
      {/* cabine */}
      <rect x="-12" y="-31" width="24" height="17" rx="5" fill="#f28c1b" stroke="#00000055" strokeWidth="1.2" />
      <path d="M-9.5 -27 H9.5 L8.5 -21.5 H-8.5 Z" fill="url(#sc-vidro)" />
      <rect x="-8" y="-20" width="16" height="4" rx="1.5" fill="#ffffff33" />
      <rect x="-16" y="-25" width="3" height="5" rx="1" fill="#2b2b2b" />
      <rect x="13" y="-25" width="3" height="5" rx="1" fill="#2b2b2b" />
      <rect x="-9" y="-31.3" width="5" height="2" rx="1" fill="#fff6c2" />
      <rect x="4" y="-31.3" width="5" height="2" rx="1" fill="#fff6c2" />
      {/* baú com nervuras */}
      <rect x="-13" y="-12" width="26" height="47" rx="2.5" fill="#dde2e7" stroke="#00000055" strokeWidth="1.2" />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1="-13" y1={-6 + i * 6} x2="13" y2={-6 + i * 6} stroke="#0000001c" strokeWidth="1" />
      ))}
      <rect x="-13" y="-12" width="5" height="47" fill="#ffffff55" />
      <rect x="-12" y="33" width="5" height="2" fill="#d63b3b" />
      <rect x="7" y="33" width="5" height="2" fill="#d63b3b" />
    </g>
  );
}

/** raios curtos em volta de um ponto: luz piscando ou sirene ligada */
function Rays({ x, y, r = 10, len = 6, color = INK, n = 8 }: { x: number; y: number; r?: number; len?: number; color?: string; n?: number }) {
  return (
    <g stroke={color} strokeWidth="2.4" strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const a = (Math.PI * 2 * i) / n;
        return <line key={i} x1={x + r * Math.cos(a)} y1={y + r * Math.sin(a)} x2={x + (r + len) * Math.cos(a)} y2={y + (r + len) * Math.sin(a)} />;
      })}
    </g>
  );
}

/** ondas de som (sirene, apito), abrindo para a direita */
function Sound({ x, y, color = INK, s = 1 }: { x: number; y: number; color?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round">
      <path d="M0 -6 Q6 0 0 6" />
      <path d="M7 -11 Q16 0 7 11" />
      <path d="M14 -16 Q26 0 14 16" />
    </g>
  );
}

/** veículo de emergência visto de cima, com luzes ligadas ou apagadas */
function Emergency({ x, y, kind = 'ambulancia', on = true }: { x: number; y: number; kind?: 'ambulancia' | 'bombeiros'; on?: boolean }) {
  const fire = kind === 'bombeiros';
  const len = fire ? 60 : 48;
  const top = -len / 2;
  const body = fire ? '#d32f2f' : '#fbfbfb';
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-11" y={top + 3} width="27" height={len} rx="5" fill="#0003" />
      {[top + 6, len / 2 - 14].map((wy) => (
        <g key={wy}>
          <rect x="-16.5" y={wy} width="4" height="9" rx="1.5" fill="#151515" />
          <rect x="12.5" y={wy} width="4" height="9" rx="1.5" fill="#151515" />
        </g>
      ))}
      <rect x="-13" y={top} width="26" height={len} rx="5" fill={body} stroke={fire ? '#8e1d1d' : '#9aa3ab'} strokeWidth="1.4" />
      <rect x="-15.5" y={top + 9} width="3" height="5" rx="1" fill="#2b2b2b" />
      <rect x="12.5" y={top + 9} width="3" height="5" rx="1" fill="#2b2b2b" />
      <path d={`M-9.5 ${top + 4} H9.5 L8.5 ${top + 10} H-8.5 Z`} fill="url(#sc-vidro)" />
      <rect x="-10" y={top - 0.3} width="5" height="2.2" rx="1" fill="#fff6c2" />
      <rect x="5" y={top - 0.3} width="5" height="2.2" rx="1" fill="#fff6c2" />
      {fire ? (
        <>
          {/* faixas brancas laterais e escada sobre o teto */}
          <rect x="-13" y={top + 16} width="2.5" height={len - 20} fill="#fff" opacity=".85" />
          <rect x="10.5" y={top + 16} width="2.5" height={len - 20} fill="#fff" opacity=".85" />
          <g stroke="#e3e3e3" strokeWidth="1.8">
            <line x1="-5" y1={top + 18} x2="-5" y2={len / 2 - 3} />
            <line x1="5" y1={top + 18} x2="5" y2={len / 2 - 3} />
            {Array.from({ length: 7 }, (_, i) => (
              <line key={i} x1="-5" y1={top + 21 + i * 5.5} x2="5" y2={top + 21 + i * 5.5} />
            ))}
          </g>
          <circle cx="-9" cy={top + 22} r="2.5" fill="#f2c94c" stroke="#8e1d1d" strokeWidth=".6" />
        </>
      ) : (
        <>
          {/* faixas vermelhas laterais, cruz no teto e porta traseira */}
          <rect x="-13" y={top + 14} width="2.5" height={len - 16} fill={RED} />
          <rect x="10.5" y={top + 14} width="2.5" height={len - 16} fill={RED} />
          <rect x="-2.6" y={top + 22} width="5.2" height="15" fill={RED} />
          <rect x="-7.5" y={top + 27} width="15" height="5.2" fill={RED} />
          <line x1="0" y1={len / 2 - 6} x2="0" y2={len / 2} stroke="#9aa3ab" strokeWidth=".8" />
          <rect x="-9" y={len / 2 - 1.8} width="4.5" height="2" rx="1" fill="#d63b3b" />
          <rect x="4.5" y={len / 2 - 1.8} width="4.5" height="2" rx="1" fill="#d63b3b" />
        </>
      )}
      {/* barra de luzes (giroflex) */}
      <rect x="-11.5" y={top + 12} width="23" height="5" rx="2" fill="#2b2b2b" />
      <rect x="-10.5" y={top + 12.8} width="10" height="3.4" rx="1.2" fill={on ? '#ff3b3b' : '#8c9298'} />
      <rect x="0.5" y={top + 12.8} width="10" height="3.4" rx="1.2" fill={on ? '#3b8bff' : '#8c9298'} />
      {on && (
        <>
          <circle cx="-5.5" cy={top + 14.5} r="5" fill="#ff3b3b" opacity=".35" />
          <circle cx="5.5" cy={top + 14.5} r="5" fill="#3b8bff" opacity=".35" />
          <Rays x={0} y={top + 14.5} r={16} len={5} color={RED} n={6} />
        </>
      )}
    </g>
  );
}

function Arrow({ d, color = INK }: { d: string; color?: string }) {
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

/** pessoa de pé (legível também nas cenas vistas de cima) */
function Person({ x, y, shirt = '#8e5bd6', s = 1 }: { x: number; y: number; shirt?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="16" rx="10" ry="3" fill="#0003" />
      <rect x="-5.5" y="14" width="5" height="2.6" rx="1.2" fill="#1b1b1b" />
      <rect x=".5" y="14" width="5" height="2.6" rx="1.2" fill="#1b1b1b" />
      <rect x="-5" y="3" width="4.4" height="12" rx="1.5" fill="#34495e" />
      <rect x=".6" y="3" width="4.4" height="12" rx="1.5" fill="#34495e" />
      <rect x="-9.5" y="-7" width="3.6" height="12" rx="1.8" fill={shirt} stroke="#0003" strokeWidth=".6" />
      <rect x="5.9" y="-7" width="3.6" height="12" rx="1.8" fill={shirt} stroke="#0003" strokeWidth=".6" />
      <circle cx="-7.7" cy="5.5" r="1.8" fill={SKIN_LIGHT} />
      <circle cx="7.7" cy="5.5" r="1.8" fill={SKIN_LIGHT} />
      <path d="M-6.5 -8 Q0 -10 6.5 -8 L6 5 H-6 Z" fill={shirt} stroke="#0003" strokeWidth=".7" />
      <path d="M-2.5 -8.6 L0 -5.8 L2.5 -8.6" fill="none" stroke="#0003" strokeWidth=".7" />
      <rect x="-1.6" y="-11" width="3.2" height="2.6" fill={SKIN_LIGHT} />
      <circle cy="-15.5" r="5.8" fill={SKIN_LIGHT} stroke="#0003" strokeWidth=".6" />
      <path d="M-6 -16 Q-6 -23 0 -22.5 Q6 -23 6 -16 Q3 -19.5 -6 -16 Z" fill="#3a2a20" />
      <circle cx="-2" cy="-15" r=".8" fill={INK} />
      <circle cx="2" cy="-15" r=".8" fill={INK} />
      <path d="M-1.6 -12.6 Q0 -11.6 1.6 -12.6" fill="none" stroke="#a0522d" strokeWidth=".7" strokeLinecap="round" />
    </g>
  );
}

/** faixa de pedestres atravessando uma rua horizontal */
function Zebra({ x, y0, y1, w = 38 }: { x: number; y0: number; y1: number; w?: number }) {
  const n = Math.floor((y1 - y0) / 11);
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x} y={y0 + 4 + i * 11} width={w} height="6" fill={LINE} opacity=".95" />
      ))}
    </>
  );
}

/** semáforo de veículos visto de frente, pequeno (nas cenas vistas de cima) */
function MiniLight({ x, y, lit, two = false }: { x: number; y: number; lit: 'red' | 'yellow' | 'green'; two?: boolean }) {
  const on = { red: '#ff4d4f', yellow: '#ffc83d', green: '#22c55e' };
  const off = { red: '#5a2b2b', yellow: '#4f4527', green: '#1f3b2b' };
  const lamps = two ? (['red', 'green'] as const) : (['red', 'yellow', 'green'] as const);
  const h = lamps.length * 13 + 6;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="9" y={h} width="4" height="12" fill="#4a5560" />
      <rect x="-2" y="-2" width="26" height={h + 4} rx="6" fill="#11171d" stroke="#f2f2f2" strokeWidth="1.2" />
      <rect x="0" y="0" width="22" height={h} rx="5" fill={INK} />
      {lamps.map((c, i) => (
        <g key={c}>
          <circle cx="11" cy={9.5 + i * 13} r="5.5" fill={c === lit ? on[c] : off[c]} />
          {c === lit && <circle cx="11" cy={9.5 + i * 13} r="5.5" fill="url(#sc-brilho)" />}
          <path d={`M4.5 ${5 + i * 13} Q11 ${1.5 + i * 13} 17.5 ${5 + i * 13}`} fill="none" stroke="#0b0f13" strokeWidth="1.6" />
        </g>
      ))}
    </g>
  );
}

/* ---------- cenas vistas de lado ---------- */

/** céu, cidade ao fundo, grama, calçada com meio-fio e a rua embaixo (vista de lado) */
function Side({ dashed = true }: { dashed?: boolean }) {
  const predios = [
    [6, 78, 26], [34, 92, 20], [56, 70, 30], [118, 88, 24], [146, 64, 22], [214, 84, 28], [244, 72, 22], [268, 94, 18], [288, 76, 28],
  ] as const;
  return (
    <>
      <rect width="320" height="130" fill="url(#sc-ceu)" />
      {/* nuvens */}
      <g fill="#fff" opacity=".9">
        <circle cx="52" cy="34" r="9" /><circle cx="64" cy="28" r="12" /><circle cx="78" cy="34" r="9" /><rect x="50" y="34" width="30" height="8" rx="4" />
      </g>
      <g fill="#fff" opacity=".75">
        <circle cx="252" cy="22" r="7" /><circle cx="262" cy="17" r="9" /><circle cx="273" cy="22" r="7" /><rect x="250" y="22" width="25" height="6" rx="3" />
      </g>
      {/* cidade ao fundo */}
      {predios.map(([x, y, w]) => (
        <g key={x}>
          <rect x={x} y={y} width={w} height={124 - y} fill="#bcd2e3" />
          {Array.from({ length: Math.floor((118 - y) / 9) }, (_, r) => (
            <g key={r} fill="#d8e6f0">
              <rect x={x + 4} y={y + 5 + r * 9} width="4" height="4" />
              {w > 20 && <rect x={x + w - 8} y={y + 5 + r * 9} width="4" height="4" />}
            </g>
          ))}
        </g>
      ))}
      {/* grama com arbustos */}
      <rect y="118" width="320" height="16" fill="url(#sc-grama)" />
      {[[100, 120], [196, 121], [306, 120]].map(([bx, by]) => (
        <g key={bx}>
          <circle cx={bx} cy={by} r="6" fill="#5aa64f" />
          <circle cx={bx + 7} cy={by + 1} r="5" fill="#4a9643" />
          <circle cx={bx - 2} cy={by - 2} r="2.5" fill="#79c06c" />
        </g>
      ))}
      {/* calçada (topo), meio-fio (face) e sarjeta */}
      <rect y="132" width="320" height="9" fill="url(#sc-calc)" />
      <rect y="141" width="320" height="3" fill={CURB} />
      <rect y="144" width="320" height="2" fill={CURB_SHADE} />
      <rect y="146" width="320" height="54" fill="url(#sc-asf)" />
      <rect y="146" width="320" height="4" fill="#00000018" />
      {dashed && <line x1="0" y1="176" x2="320" y2="176" stroke={LINE} strokeWidth="3" strokeDasharray="18 14" />}
    </>
  );
}

/** carro visto de lado, virado para a direita */
function CarSide({ x, y, color = BLUE, label }: { x: number; y: number; color?: string; label?: string }) {
  const wheel = (cx: number) => (
    <g>
      <circle cx={cx} cy="7" r="9" fill="#1d2228" />
      <circle cx={cx} cy="7" r="7" fill="#151515" />
      <circle cx={cx} cy="7" r="4.2" fill="#c7ced4" />
      {[0, 72, 144, 216, 288].map((a) => (
        <line key={a} x1={cx} y1="7" x2={cx + 3.6 * Math.cos((a * Math.PI) / 180)} y2={7 + 3.6 * Math.sin((a * Math.PI) / 180)} stroke="#7d868e" strokeWidth="1.2" />
      ))}
      <circle cx={cx} cy="7" r="1.4" fill="#5b636b" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="15" rx="38" ry="4" fill="#0004" />
      <path d="M-35 8 Q-36 -2 -29 -5 L-16 -8 L-7 -19 Q-4 -22 1 -22 H14 Q19 -22 22 -18 L29 -8 Q36 -7 36 1 V8 Q36 10 34 10 H-33 Q-35 10 -35 8 Z" fill={color} stroke="#00000055" strokeWidth="1.2" />
      <path d="M-27 -4.5 H31" stroke="#ffffff66" strokeWidth="1.3" />
      <rect x="-34" y="4" width="69" height="6" fill="#00000026" />
      {/* vidros */}
      <path d="M-5 -19 H4 V-9 H-13.5 Z" fill="url(#sc-vidro)" />
      <path d="M7 -19 H13 Q16 -19 18 -16 L22.5 -9 H7 Z" fill="url(#sc-vidro)" />
      {/* portas, maçanetas, retrovisor */}
      <line x1="5.5" y1="-9" x2="5.5" y2="8" stroke="#00000040" strokeWidth="1" />
      <line x1="-14" y1="-8" x2="-14" y2="8" stroke="#00000040" strokeWidth="1" />
      <rect x="-10" y="-5" width="4.5" height="1.6" rx=".8" fill="#00000055" />
      <rect x="9" y="-5" width="4.5" height="1.6" rx=".8" fill="#00000055" />
      <path d="M20 -11 h4 v3 h-4 z" fill={color} stroke="#00000055" strokeWidth=".8" />
      {/* farol, lanterna e para-choques */}
      <path d="M31 -5 L35.5 -4 L35.5 -0.5 L30 -0.5 Z" fill="#fff3b0" stroke="#00000033" strokeWidth=".6" />
      <rect x="-35" y="-3.5" width="3" height="4.5" rx="1" fill="#d63b3b" />
      <rect x="33" y="3" width="4.5" height="5.5" rx="1.5" fill="#3a3f45" />
      <rect x="-37" y="3" width="4.5" height="5.5" rx="1.5" fill="#3a3f45" />
      {wheel(-18)}
      {wheel(18)}
      {label && <Tag rot={0} text={label} dy={-42} />}
    </g>
  );
}

/** semáforo de veículos (vista de lado); `lit` diz qual luz está acesa */
function TrafficLight({ x, y, lit, blink = false }: { x: number; y: number; lit: 'red' | 'yellow' | 'green'; blink?: boolean }) {
  const on = { red: '#ff4d4f', yellow: '#ffc83d', green: '#22c55e' };
  const off = { red: '#4e2626', yellow: '#4a4123', green: '#1c3527' };
  const cy = { red: 22, yellow: 48, green: 74 };
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* coluna com base */}
      <rect x="-3.5" y="96" width="7" height={142 - y - 96} fill="#4a5560" />
      <rect x="-3.5" y="96" width="2.5" height={142 - y - 96} fill="#6c7883" />
      <rect x="-7" y={136 - y} width="14" height="6" rx="1.5" fill="#3b444d" />
      {/* anteparo com borda e caixa */}
      <rect x="-23" y="-4" width="46" height="104" rx="8" fill="#11171d" stroke="#f2f2f2" strokeWidth="2" />
      <rect x="-17" y="0" width="34" height="96" rx="9" fill={INK} />
      {(['red', 'yellow', 'green'] as const).map((c) => (
        <g key={c}>
          {c === lit && <circle cx="0" cy={cy[c]} r="16" fill={on[c]} opacity=".3" />}
          <circle cx="0" cy={cy[c]} r="11" fill={c === lit ? on[c] : off[c]} />
          {c === lit && <circle cx="0" cy={cy[c]} r="11" fill="url(#sc-brilho)" />}
          {/* pala (aba que faz sombra na lente) */}
          <path d={`M-14 ${cy[c] - 8} Q0 ${cy[c] - 19} 14 ${cy[c] - 8}`} fill="none" stroke="#0b0f13" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      ))}
      {blink && <Rays x={0} y={cy[lit]} r={24} len={8} color="#e0a800" n={8} />}
    </g>
  );
}

/**
 * Agente de trânsito de pé, de frente, com os pés em (x, y).
 * Uniforme: quepe com distintivo, camisa azul, colete refletivo, cinto, calça com faixa refletiva,
 * botas e luvas brancas. `gesture`: 'pare' (braço estendido para o lado do carro, palma aberta)
 * ou 'alto' (braço levantado). `whistle`: apito na boca, com cordão e ondas de som.
 */
function Agent({ x, y, gesture = 'pare', whistle = false }: { x: number; y: number; gesture?: 'pare' | 'alto'; whistle?: boolean }) {
  const SHIRT = '#2b4a7e';
  const PANTS = '#1f2f4d';
  const VEST = '#d4ec2c';
  const REFL = '#e6eaef';
  const GLOVE = '#fdfdfd';
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0" rx="22" ry="3.5" fill="#0004" />
      {/* botas */}
      <path d="M-13 -7 H-2 V0 H-15 Q-15 -4 -13 -7 Z" fill="#141414" />
      <path d="M2 -7 H13 Q15 -4 15 0 H2 Z" fill="#141414" />
      {/* calça com faixa refletiva */}
      <rect x="-12" y="-47" width="24" height="9" fill={PANTS} />
      <rect x="-12" y="-44" width="10.5" height="38" rx="2" fill={PANTS} />
      <rect x="1.5" y="-44" width="10.5" height="38" rx="2" fill={PANTS} />
      <rect x="-12" y="-22" width="10.5" height="3" fill={REFL} />
      <rect x="1.5" y="-22" width="10.5" height="3" fill={REFL} />
      <line x1="0" y1="-40" x2="0" y2="-6" stroke="#00000040" strokeWidth="1" />
      {/* braço que fica para baixo (lado direito da imagem) */}
      {gesture === 'pare' || gesture === 'alto' ? (
        <>
          <rect x="13.5" y="-80" width="7.5" height="31" rx="3.7" fill={SHIRT} />
          <rect x="13.5" y="-70" width="7.5" height="2.6" fill={REFL} />
          <circle cx="17.2" cy="-47" r="4.3" fill={GLOVE} stroke="#9aa3ab" strokeWidth=".8" />
        </>
      ) : null}
      {/* tronco: camisa e colete refletivo */}
      <path d="M-16 -48 L-17 -76 Q-17 -83 -10 -84 L10 -84 Q17 -83 17 -76 L16 -48 Z" fill={SHIRT} />
      <path d="M-15 -48 L-16 -74 Q-15.5 -81 -9 -82 L-4.5 -82 L0 -70 L4.5 -82 L9 -82 Q15.5 -81 16 -74 L15 -48 Z" fill={VEST} stroke="#a9bf1c" strokeWidth=".8" />
      <rect x="-15.6" y="-64" width="31.2" height="3.6" fill={REFL} stroke="#b8c0c8" strokeWidth=".5" />
      <rect x="-15.3" y="-57" width="30.6" height="3.6" fill={REFL} stroke="#b8c0c8" strokeWidth=".5" />
      <rect x="-10.5" y="-82" width="3" height="18" fill={REFL} />
      <rect x="7.5" y="-82" width="3" height="18" fill={REFL} />
      <rect x="4" y="-79" width="3" height="4" rx=".6" fill="#e0b62f" stroke="#8a6d10" strokeWidth=".4" />
      {/* gola */}
      <path d="M-5 -84 L0 -78 L5 -84 Z" fill="#fff" />
      <path d="M-5 -84 L-1.5 -79 L-6.5 -80 Z M5 -84 L1.5 -79 L6.5 -80 Z" fill={SHIRT} />
      {/* cinto com fivela */}
      <rect x="-15.5" y="-50" width="31" height="4" fill="#111" />
      <rect x="-3" y="-50.6" width="6" height="5.2" rx=".8" fill="#c9a227" stroke="#6e5810" strokeWidth=".5" />
      {/* braço do gesto (lado esquerdo da imagem, virado para o carro) */}
      {gesture === 'pare' ? (
        <>
          <rect x="-46" y="-82" width="32" height="8" rx="4" fill={SHIRT} />
          <rect x="-34" y="-82" width="2.8" height="8" fill={REFL} />
          {/* luva com a palma aberta, dedos para cima: sinal de parar */}
          <rect x="-55" y="-92" width="10" height="13" rx="3.2" fill={GLOVE} stroke="#9aa3ab" strokeWidth=".8" />
          <path d="M-52.5 -92 V-85 M-50 -92 V-85 M-47.5 -92 V-85" stroke="#c4cad0" strokeWidth=".7" />
          <ellipse cx="-44.5" cy="-81" rx="2.2" ry="3.2" fill={GLOVE} stroke="#9aa3ab" strokeWidth=".7" transform="rotate(-30 -44.5 -81)" />
        </>
      ) : (
        <>
          <rect x="-21" y="-118" width="8" height="40" rx="4" fill={SHIRT} />
          <rect x="-21" y="-104" width="8" height="2.8" fill={REFL} />
          <rect x="-22" y="-131" width="10" height="13" rx="3.2" fill={GLOVE} stroke="#9aa3ab" strokeWidth=".8" />
          <path d="M-19.5 -131 V-124 M-17 -131 V-124 M-14.5 -131 V-124" stroke="#c4cad0" strokeWidth=".7" />
        </>
      )}
      {/* pescoço e cabeça */}
      <rect x="-3.5" y="-88" width="7" height="6" fill={SKIN} />
      <circle cx="-9.2" cy="-93" r="2.4" fill={SKIN} />
      <circle cx="9.2" cy="-93" r="2.4" fill={SKIN} />
      <ellipse cx="0" cy="-94" rx="9" ry="10" fill={SKIN} />
      <path d="M-5.5 -97.5 h3.5 M2 -97.5 h3.5" stroke="#3a2a20" strokeWidth="1" strokeLinecap="round" />
      <circle cx="-3.6" cy="-94.5" r="1.2" fill={INK} />
      <circle cx="3.6" cy="-94.5" r="1.2" fill={INK} />
      <path d="M0 -93.5 L-1 -90.5 H1" fill="none" stroke="#a5683f" strokeWidth=".7" />
      {whistle ? (
        <>
          <circle cx="-5" cy="-88.6" r="2" fill="#dc9a71" />
          <circle cx="5" cy="-88.6" r="2" fill="#dc9a71" />
          <ellipse cx="0" cy="-87.5" rx="1.8" ry="1.3" fill="#7a3b2a" />
          {/* apito prateado e cordão vermelho até o ombro */}
          <rect x="-11" y="-89.2" width="10" height="3.6" rx="1.6" fill="#d7dde2" stroke={INK} strokeWidth=".7" />
          <circle cx="-9" cy="-87.4" r="1" fill="#8d979f" />
          <path d="M-1.5 -86 Q4 -80 9 -79" fill="none" stroke="#c62828" strokeWidth=".9" />
          <g transform="translate(-25 -88) scale(-1 1)"><Sound x={0} y={0} s={0.8} /></g>
        </>
      ) : (
        <path d="M-2.4 -88.5 H2.4" stroke="#7a3b2a" strokeWidth="1" strokeLinecap="round" />
      )}
      {/* quepe: copa, faixa, pala preta e distintivo */}
      <path d="M-12.5 -103 Q-14 -112 -6 -114.5 L6 -114.5 Q14 -112 12.5 -103 Z" fill={PANTS} />
      <rect x="-11" y="-104.5" width="22" height="5" fill="#14213d" />
      <rect x="-11" y="-104.5" width="22" height="1.2" fill={YELLOW} />
      <path d="M-11.5 -99.5 Q0 -95.5 11.5 -99.5 L11 -98 Q0 -94 -11 -98 Z" fill="#0c0c0c" />
      <circle cx="0" cy="-108.5" r="2.8" fill="#e0b62f" stroke="#8a6d10" strokeWidth=".6" />
      <circle cx="0" cy="-108.5" r="1" fill="#fff3b0" />
    </g>
  );
}

/* ---------------- cenas ---------------- */

const crossroads = <Roads h={[[75, 50]]} v={[[135, 50]]} />;
const crossLines = (
  <>
    <line x1="0" y1="100" x2="125" y2="100" stroke={LINE} strokeWidth="2" strokeDasharray="10 8" />
    <line x1="195" y1="100" x2="320" y2="100" stroke={LINE} strokeWidth="2" strokeDasharray="10 8" />
    <line x1="160" y1="0" x2="160" y2="65" stroke={LINE} strokeWidth="2" strokeDasharray="10 8" />
    <line x1="160" y1="135" x2="160" y2="200" stroke={LINE} strokeWidth="2" strokeDasharray="10 8" />
  </>
);
/** quarteirões em volta do cruzamento: casas e árvores nos cantos */
const crossBlocks = (
  <>
    <House x={22} y={14} w={60} h={40} roof="#c4543d" />
    <Tree x={104} y={40} r={13} />
    <House x={232} y={150} w={64} h={40} roof="#6b7fa6" />
    <Tree x={214} y={36} r={15} />
    <Tree x={262} y={30} r={11} />
    <Tree x={32} y={164} r={12} />
    <House x={62} y={150} w={48} h={40} roof="#a0603a" />
  </>
);

/** rua vertical larga de mão dupla (cenas da ambulância) */
const avenida = (
  <>
    <Grass />
    <Roads v={[[95, 130]]} />
    <line x1="160" y1="0" x2="160" y2="200" stroke={LINE} strokeWidth="3" strokeDasharray="14 10" />
    <Bueiro x={104} y={110} />
    <Tree x={44} y={40} r={16} />
    <Tree x={52} y={140} r={13} />
    <Tree x={276} y={96} r={14} />
  </>
);

const SCENES: Record<SceneId, React.ReactNode> = {
  'cruzamento-direita': (
    <>
      <Grass />
      {crossroads}
      {crossLines}
      {crossBlocks}
      <Car x={172} y={160} label="Você" side />
      <Car x={250} y={88} rot={-90} color={RED} />
      <Arrow d="M172 135 V95" />
      <Arrow d="M225 88 H180" color="#b8383c" />
    </>
  ),
  'cruzamento-caminhao': (
    <>
      <Grass />
      {crossroads}
      {crossLines}
      {crossBlocks}
      <Car x={172} y={160} label="Você" side />
      <Truck x={62} y={112} rot={90} />
      <Arrow d="M172 135 V95" />
      <Arrow d="M98 112 H140" color="#b8383c" />
    </>
  ),
  'cruzamento-aproximacao': (
    <>
      <Grass />
      {crossroads}
      {crossLines}
      {crossBlocks}
      <Car x={172} y={168} label="Você" side />
      <Arrow d="M172 143 V108" />
    </>
  ),
  rotatoria: (
    <>
      <Grass />
      <Roads v={[[135, 50]]} />
      <circle cx="160" cy="95" r="83" fill="url(#sc-calc)" />
      <circle cx="160" cy="95" r="75" fill={CURB} />
      <circle cx="160" cy="95" r="73" fill="url(#sc-asf)" />
      <rect x="135" y="160" width="50" height="40" fill="url(#sc-asf)" />
      <circle cx="160" cy="95" r="53" fill="none" stroke={LINE} strokeWidth="2" strokeDasharray="10 8" />
      <circle cx="160" cy="95" r="35" fill={CURB} />
      <circle cx="160" cy="95" r="33" fill="#8fca82" />
      <circle cx="160" cy="95" r="22" fill="none" stroke="#7bb86e" strokeWidth="5" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={160 + 22 * Math.cos((a * Math.PI) / 180)} cy={95 + 22 * Math.sin((a * Math.PI) / 180)} r="2.2" fill={a % 120 ? '#f5a3c7' : '#ffd84a'} />
      ))}
      <Tree x={160} y={93} r={11} />
      <Tree x={42} y={44} r={15} />
      <Tree x={282} y={160} r={14} />
      <House x={250} y={14} w={56} h={38} roof="#c4543d" />
      <Car x={172} y={182} label="Você" />
      <Car x={218} y={119} rot={22} color={RED} />
      <Arrow d="M232 90 Q230 60 205 40" color="#b8383c" />
    </>
  ),
  'rodovia-via-local': (
    <>
      <Grass />
      <rect x="128" y="130" width="64" height="70" fill="url(#sc-calc)" />
      <rect x="137" y="130" width="46" height="70" fill={CURB} />
      <rect x="140" y="130" width="40" height="70" fill="url(#sc-asf)" />
      {/* rodovia com acostamento */}
      <rect x="0" y="50" width="320" height="86" fill="#d3cdbd" />
      <rect x="0" y="56" width="320" height="74" fill="url(#sc-asf)" />
      <rect x="0" y="56" width="320" height="74" fill="#0000000f" />
      <line x1="0" y1="64" x2="320" y2="64" stroke={LINE} strokeWidth="2" />
      <line x1="0" y1="126" x2="320" y2="126" stroke={LINE} strokeWidth="2" />
      <line x1="0" y1="95" x2="320" y2="95" stroke={YELLOW} strokeWidth="3" />
      {/* defensa metálica do lado de cima */}
      <rect x="0" y="47" width="320" height="3" fill="#b9c1c8" />
      {Array.from({ length: 11 }, (_, i) => <rect key={i} x={6 + i * 31} y="45" width="2.5" height="7" fill="#7d878f" />)}
      <Tree x={60} y={22} r={14} />
      <Tree x={250} y={20} r={12} />
      <Tree x={60} y={170} r={15} />
      <Tree x={256} y={168} r={13} />
      <rect x="4" y="28" width="76" height="16" rx="8" fill="#fff" stroke="#0003" />
      <text x="42" y="40" textAnchor="middle" fontSize="11" fontWeight="800" fill={INK}>RODOVIA</text>
      <rect x="196" y="180" width="80" height="16" rx="8" fill="#fff" stroke="#0003" />
      <text x="236" y="192" textAnchor="middle" fontSize="11" fontWeight="800" fill={INK}>VIA LOCAL</text>
      <Car x={160} y={168} label="Você" />
      <Car x={70} y={112} rot={90} color={RED} />
      <Arrow d="M95 112 H140" color="#b8383c" />
    </>
  ),
  'agente-semaforo': (
    <>
      <Side />
      <TrafficLight x={57} y={20} lit="red" />
      <Agent x={232} y={138} gesture="pare" />
      <CarSide x={120} y={160} label="Você" />
      <Arrow d="M160 160 H190" />
    </>
  ),
  'agente-semaforo-verde': (
    <>
      <Side />
      <TrafficLight x={57} y={20} lit="green" />
      <Agent x={232} y={138} gesture="pare" />
      <CarSide x={120} y={160} label="Você" />
    </>
  ),
  'agente-apito': (
    <>
      <Side />
      <Agent x={214} y={138} gesture="alto" whistle />
      <CarSide x={90} y={160} label="Você" />
    </>
  ),
  'pedestre-faixa': (
    <>
      <Grass />
      <Roads h={[[60, 80]]} />
      <line x1="0" y1="100" x2="190" y2="100" stroke={LINE} strokeWidth="2" strokeDasharray="12 10" />
      <line x1="250" y1="100" x2="320" y2="100" stroke={LINE} strokeWidth="2" strokeDasharray="12 10" />
      <Zebra x={200} y0={60} y1={140} />
      <House x={16} y={4} w={58} h={38} roof="#a0603a" />
      <Tree x={110} y={24} r={13} />
      <Tree x={286} y={26} r={14} />
      <House x={236} y={160} w={60} h={36} roof="#6b7fa6" />
      <Tree x={60} y={176} r={13} />
      <Bueiro x={80} y={130} />
      <Person x={220} y={90} />
      <Car x={130} y={118} rot={90} label="Você" />
      <Arrow d="M155 118 Q190 118 196 90" />
    </>
  ),
  'pedestre-semaforo': (
    <>
      <Grass />
      <Roads h={[[70, 76]]} />
      <line x1="0" y1="108" x2="186" y2="108" stroke={LINE} strokeWidth="2" strokeDasharray="12 10" />
      <rect x="190" y="70" width="6" height="76" fill={LINE} />
      <Zebra x={204} y0={70} y1={146} />
      <House x={16} y={8} w={60} h={42} roof="#c4543d" />
      <Tree x={110} y={30} r={14} />
      <House x={60} y={162} w={60} h={34} roof="#6b7fa6" />
      <Tree x={240} y={176} r={13} />
      <Person x={224} y={108} shirt="#e07b39" />
      <Car x={160} y={127} rot={90} label="Você" />
      <MiniLight x={266} y={4} lit="green" />
    </>
  ),
  ambulancia: (
    <>
      {avenida}
      <Car x={130} y={70} label="Você" />
      <Emergency x={130} y={160} />
      <Arrow d="M150 70 Q180 70 190 40" />
      <Sound x={236} y={150} s={0.8} />
      <text x="240" y="186" fontSize="12" fontWeight="800" fill={INK}>sirene</text>
    </>
  ),
  'ambulancia-atras': (
    <>
      {avenida}
      <Car x={128} y={66} label="Você" />
      <Car x={192} y={32} color={GREY} />
      <Emergency x={128} y={158} />
      <Sound x={236} y={150} s={0.8} />
      <text x="240" y="186" fontSize="12" fontWeight="800" fill={INK}>sirene</text>
    </>
  ),
  'bombeiros-atras': (
    <>
      {avenida}
      <Car x={128} y={58} label="Você" />
      <Car x={192} y={28} color={GREY} />
      <Emergency x={128} y={154} kind="bombeiros" />
      <Sound x={236} y={146} s={0.8} />
      <text x="240" y="182" fontSize="12" fontWeight="800" fill={INK}>sirene</text>
    </>
  ),
  'ambulancia-desligada': (
    <>
      {avenida}
      <Car x={128} y={66} label="Você" />
      <Emergency x={128} y={158} on={false} />
      <rect x="236" y="138" width="78" height="34" rx="8" fill="#fff" stroke="#0003" />
      <text x="275" y="152" textAnchor="middle" fontSize="10" fontWeight="800" fill={INK}>luzes e sirene</text>
      <text x="275" y="165" textAnchor="middle" fontSize="10" fontWeight="800" fill={INK}>desligadas</text>
    </>
  ),
  'rua-local': (
    <>
      <Grass />
      <Roads h={[[82, 40]]} walk={11} />
      <line x1="0" y1="102" x2="320" y2="102" stroke={LINE} strokeWidth="2" strokeDasharray="10 10" />
      {/* casas de cima e de baixo, com caminho até a calçada */}
      {[
        [10, '#c4543d'],
        [92, '#6b7fa6'],
        [174, '#a0603a'],
        [256, '#7a4f9c'],
      ].map(([x, roof], i) => (
        <g key={i}>
          <rect x={(x as number) + 22} y="54" width="8" height="17" fill="#d9d1bf" />
          <House x={x as number} y={12} w={52} h={42} roof={roof as string} />
        </g>
      ))}
      {[
        [26, '#a0603a'],
        [126, '#c4543d'],
        [226, '#6b7fa6'],
      ].map(([x, roof], i) => (
        <g key={i}>
          <rect x={(x as number) + 24} y="133" width="8" height="15" fill="#d9d1bf" />
          <House x={x as number} y={148} w={56} h={44} roof={roof as string} />
        </g>
      ))}
      <Tree x={110} y={150} r={9} />
      <Tree x={208} y={152} r={10} />
      <Bueiro x={170} y={114} />
      <Car x={100} y={112} rot={90} label="Você" />
      <Car x={250} y={92} rot={-90} color={GREY} />
    </>
  ),
  'linha-amarela-continua': (
    <>
      <Grass />
      <Roads h={[[55, 90]]} />
      <line x1="0" y1="60" x2="320" y2="60" stroke={LINE} strokeWidth="3" />
      <line x1="0" y1="140" x2="320" y2="140" stroke={LINE} strokeWidth="3" />
      <line x1="0" y1="100" x2="320" y2="100" stroke={YELLOW} strokeWidth="4" />
      <Tree x={40} y={22} r={14} /><Tree x={180} y={20} r={12} /><Tree x={290} y={26} r={15} />
      <Tree x={100} y={178} r={13} /><Tree x={250} y={176} r={14} />
      <Car x={70} y={120} rot={90} label="Você" />
      <Car x={150} y={120} rot={90} color={GREY} />
      <Car x={250} y={80} rot={-90} color={RED} />
    </>
  ),
  'linha-amarela-continua-carro': (
    <>
      <Grass />
      <Roads h={[[55, 90]]} />
      <line x1="0" y1="60" x2="320" y2="60" stroke={LINE} strokeWidth="3" />
      <line x1="0" y1="140" x2="320" y2="140" stroke={LINE} strokeWidth="3" />
      <line x1="0" y1="100" x2="320" y2="100" stroke={YELLOW} strokeWidth="4" />
      <Tree x={40} y={22} r={14} /><Tree x={180} y={20} r={12} /><Tree x={290} y={26} r={15} />
      <Tree x={100} y={178} r={13} /><Tree x={250} y={176} r={14} />
      <Car x={70} y={120} rot={90} label="Você" />
      <Car x={150} y={120} rot={90} color={GREY} />
      <Car x={250} y={80} rot={-90} color={RED} />
    </>
  ),
  'linha-amarela-tracejada': (
    <>
      <Grass />
      <Roads h={[[55, 90]]} />
      <line x1="0" y1="60" x2="320" y2="60" stroke={LINE} strokeWidth="3" />
      <line x1="0" y1="140" x2="320" y2="140" stroke={LINE} strokeWidth="3" />
      <line x1="0" y1="100" x2="320" y2="100" stroke={YELLOW} strokeWidth="4" strokeDasharray="18 16" />
      <Tree x={40} y={22} r={14} /><Tree x={180} y={20} r={12} /><Tree x={290} y={26} r={15} />
      <Tree x={100} y={178} r={13} /><Tree x={250} y={176} r={14} />
      <Car x={70} y={120} rot={90} label="Você" />
      <Car x={150} y={120} rot={90} color={GREY} />
    </>
  ),
  'linha-branca-continua': (
    <>
      <Grass />
      <Roads h={[[55, 90]]} />
      <line x1="0" y1="60" x2="320" y2="60" stroke={LINE} strokeWidth="3" />
      <line x1="0" y1="140" x2="320" y2="140" stroke={LINE} strokeWidth="3" />
      <line x1="0" y1="100" x2="320" y2="100" stroke={LINE} strokeWidth="4" />
      <Tree x={40} y={22} r={14} /><Tree x={180} y={20} r={12} /><Tree x={250} y={176} r={14} />
      <House x={60} y={160} w={56} h={36} roof="#a0603a" />
      <Car x={90} y={120} rot={90} label="Você" />
      <Car x={170} y={80} rot={90} color={GREY} />
      <Car x={262} y={120} rot={90} color={RED} />
      <path d="M296 80 h14 m-6 -6 l6 6 l-6 6" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".75" />
      <path d="M296 120 h14 m-6 -6 l6 6 l-6 6" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".75" />
    </>
  ),
  'linha-retencao': (
    <>
      <Grass />
      <Roads h={[[60, 80]]} />
      <line x1="0" y1="100" x2="186" y2="100" stroke={LINE} strokeWidth="2" strokeDasharray="12 10" />
      <rect x="196" y="60" width="7" height="80" fill={LINE} />
      <Zebra x={212} y0={60} y1={140} />
      <House x={20} y={6} w={64} h={38} roof="#6b7fa6" />
      <Tree x={130} y={26} r={14} />
      <Tree x={50} y={176} r={13} />
      <MiniLight x={282} y={4} lit="red" two />
      <Car x={150} y={118} rot={90} label="Você" />
      <rect x="160" y="152" width="112" height="16" rx="8" fill="#fff" stroke="#0003" />
      <text x="216" y="164" textAnchor="middle" fontSize="11" fontWeight="800" fill={INK}>linha de retenção</text>
    </>
  ),
  'vaga-idoso': (
    <>
      <Grass />
      <rect x="0" y="100" width="320" height="100" fill="url(#sc-asf)" />
      <rect x="0" y="76" width="320" height="22" fill="url(#sc-calc)" />
      <rect x="0" y="97" width="320" height="3" fill={CURB} />
      <rect x="0" y="100" width="320" height="2" fill={CURB_SHADE} />
      <Tree x={40} y={40} r={16} />
      <House x={110} y={14} w={100} h={50} roof="#c4543d" />
      <Tree x={270} y={38} r={14} />
      {[40, 120, 200, 280].map((x) => (
        <line key={x} x1={x} y1="102" x2={x} y2="150" stroke={LINE} strokeWidth="3" />
      ))}
      <line x1="40" y1="150" x2="280" y2="150" stroke={LINE} strokeWidth="3" />
      <text x="160" y="131" textAnchor="middle" fontSize="15" fontWeight="900" fill={LINE} letterSpacing="1">IDOSO</text>
      <Car x={80} y={124} rot={180} color={GREY} />
      <Car x={240} y={124} rot={180} color={RED} />
      <Car x={130} y={178} rot={-90} label="Você" />
    </>
  ),
  'semaforo-amarelo': (
    <>
      <Side />
      <TrafficLight x={160} y={10} lit="yellow" />
      <CarSide x={70} y={164} label="Você" />
    </>
  ),
  'semaforo-amarelo-piscando': (
    <>
      <Side />
      <TrafficLight x={160} y={10} lit="yellow" blink />
      <rect x="198" y="38" width="64" height="18" rx="9" fill="#fff" stroke="#0003" />
      <text x="230" y="51" textAnchor="middle" fontSize="11" fontWeight="800" fill={INK}>piscando</text>
      <CarSide x={70} y={164} label="Você" />
    </>
  ),
  'semaforo-pedestre-piscando': (
    <>
      <Side dashed={false} />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={150 + i * 22} y="150" width="12" height="46" fill={LINE} transform={`skewX(-20)`} />
      ))}
      <g transform="translate(90 18)">
        <rect x="-3.5" y="80" width="7" height="44" fill="#4a5560" />
        <rect x="-3.5" y="80" width="2.5" height="44" fill="#6c7883" />
        <rect x="-24" y="-4" width="48" height="92" rx="8" fill="#11171d" stroke="#f2f2f2" strokeWidth="2" />
        <rect x="-20" y="0" width="40" height="84" rx="7" fill={INK} />
        {/* vermelho aceso: pessoa parada */}
        <circle cx="0" cy="22" r="20" fill="#ff4d4f" opacity=".25" />
        <rect x="-15" y="8" width="30" height="28" rx="3" fill="#3b1c1c" />
        <g fill="#ff4d4f">
          <circle cx="0" cy="13" r="3" />
          <rect x="-4" y="16.5" width="8" height="10" rx="2" />
          <rect x="-6.5" y="17" width="2.5" height="8" rx="1" />
          <rect x="4" y="17" width="2.5" height="8" rx="1" />
          <rect x="-4" y="26" width="3" height="8" />
          <rect x="1" y="26" width="3" height="8" />
        </g>
        {/* verde apagado: pessoa andando */}
        <rect x="-15" y="46" width="30" height="28" rx="3" fill="#1a3024" />
        <g fill="#2f5a3f" stroke="#2f5a3f" strokeWidth="3" strokeLinecap="round">
          <circle cx="1" cy="51" r="3" />
          <line x1="0" y1="56" x2="-1" y2="63" />
          <line x1="-1" y1="63" x2="-6" y2="71" />
          <line x1="-1" y1="63" x2="5" y2="71" />
          <line x1="0" y1="57" x2="-5" y2="62" />
          <line x1="0" y1="57" x2="5" y2="61" />
        </g>
        <path d="M-17 8 Q0 2 17 8" fill="none" stroke="#0b0f13" strokeWidth="3" />
        <path d="M-17 46 Q0 40 17 46" fill="none" stroke="#0b0f13" strokeWidth="3" />
        <Rays x={0} y={22} r={24} len={7} color="#e0a800" n={8} />
      </g>
      <rect x="132" y="22" width="64" height="18" rx="9" fill="#fff" stroke="#0003" />
      <text x="164" y="35" textAnchor="middle" fontSize="11" fontWeight="800" fill={INK}>piscando</text>
      <Person x={44} y={118} s={1.25} />
    </>
  ),
  'placa-escondida': (
    <>
      <Side />
      <rect x="227" y="56" width="5" height="82" fill="#8a949c" />
      <rect x="227" y="56" width="1.8" height="82" fill="#aab3ba" />
      {/* placa redonda de proibição, quase toda coberta pelas folhas */}
      <circle cx="230" cy="56" r="23" fill="#fff" stroke="#c9c9c9" strokeWidth="1" />
      <circle cx="230" cy="56" r="20" fill="#fff" stroke="#d62f2f" strokeWidth="6" />
      <line x1="216" y1="42" x2="244" y2="70" stroke="#d62f2f" strokeWidth="5" />
      {/* árvore na frente */}
      <path d="M185 138 L187 82 Q188 74 192 70 L198 70 Q201 76 201 84 L203 138 Z" fill="#7a5233" />
      <path d="M190 90 Q192 120 189 136" stroke="#5e3d25" strokeWidth="1.5" fill="none" />
      <path d="M195 92 L216 68" stroke="#7a5233" strokeWidth="6" strokeLinecap="round" />
      <g fill="#3f8a3a">
        <circle cx="192" cy="50" r="32" />
        <circle cx="222" cy="40" r="24" />
        <circle cx="238" cy="62" r="17" />
        <circle cx="166" cy="66" r="20" />
      </g>
      <g fill="#55a14c">
        <circle cx="186" cy="42" r="20" />
        <circle cx="220" cy="36" r="15" />
        <circle cx="234" cy="58" r="10" />
        <circle cx="166" cy="60" r="12" />
      </g>
      <g fill="#79c06c">
        <circle cx="178" cy="32" r="7" />
        <circle cx="214" cy="28" r="5" />
        <circle cx="160" cy="54" r="4" />
      </g>
      <CarSide x={80} y={164} label="Você" />
    </>
  ),
  'placa-distancias': (
    <>
      <Side />
      {[86, 228].map((px) => (
        <g key={px}>
          <rect x={px} y="96" width="7" height="42" fill="#8a949c" />
          <rect x={px} y="96" width="2.5" height="42" fill="#aab3ba" />
        </g>
      ))}
      <rect x="42" y="16" width="240" height="88" rx="8" fill="#0003" />
      <rect x="40" y="14" width="240" height="88" rx="8" fill="#0f7a3d" />
      <rect x="45" y="19" width="230" height="78" rx="6" fill="none" stroke="#fff" strokeWidth="2.5" />
      {[[50, 24], [270, 24], [50, 92], [270, 92]].map(([bx, by]) => <circle key={`${bx}${by}`} cx={bx} cy={by} r="1.4" fill="#cfd8d2" />)}
      {[
        ['Vila Nova', '15 km', 42],
        ['Santa Rita', '40 km', 66],
        ['Porto Alto', '72 km', 90],
      ].map(([city, km, y]) => (
        <g key={city as string} fontSize="16" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">
          <text x="58" y={y as number}>{city}</text>
          <text x="262" y={y as number} textAnchor="end">{km}</text>
        </g>
      ))}
      <CarSide x={70} y={170} label="Você" />
    </>
  ),
};
