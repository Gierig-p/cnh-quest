/**
 * Peças comuns dos vídeos do Mundo 5, lote 4 (velocidade na via, chuva, neblina), 17/11/2026:
 * rodovia com a câmera atrás, serra (a mesma da situação da neblina), velocímetro, câmbio, poça, granizo,
 * pneu visto de perto, lombada, buraco e manchas na pista.
 */
import type { ReactNode } from 'react';
import { box, camLook, flat, lines, rng, subq, tfObj, T, type Dec, type Obj, type Part, type V2 } from './engine';
import { car } from './models';
import { campo, estrada } from './Mundo2';
import { SERRA, neblina, paisagem, posto, PR } from './EscolhaNeblina';
import { TINTA, chip, ruaFundo } from './infracoesUI';
import { cabine } from './VideoPosicao';
import { volante } from './VideoManutencao';
import { VOCE, escuro, luz, pisca, type Pr, type Quadro } from './videoBase';

export const AZ = '#2f6db5';
export const VERDE = '#2fa36b';
export const LARANJA = '#ea7b2c';
export const VERM = '#d93a35';
export const AMAR = '#ffd84a';
export const XV = 1.75;

const ESTRADA = estrada('tracejada');
const CAMPO = campo(5);

/** estrada de mão dupla com a câmera atrás de quem está em `y` */
export function rodovia(y: number, objs: Obj[], over?: Quadro['over'], chao: Part[] = [], s = 8.5): Quadro {
  return { cam: camLook(1.2, y - 8, 0, 12, 36, s), ground: [...ESTRADA, ...chao], objs: [...CAMPO, ...objs], over };
}

/** estrada vista de lado (a pista corre pela tela) */
export function deLado(yc: number, s: number, objs: Obj[], over?: Quadro['over'], chao: Part[] = []): Quadro {
  return { cam: camLook(1.2, yc, 0, 78, 30, s, 160, 118), ground: [...ESTRADA, ...chao], objs: [...CAMPO, ...objs], over };
}

interface SerraOpts {
  /** neblina (0 a 1) e luz alta refletida (0 a 1) */
  nev?: number;
  alta?: number;
  /** mostra o posto à direita (a paisagem abre o guard-rail na entrada) */
  posto?: boolean;
  cam?: ReturnType<typeof camLook>;
}

/** descida da serra: o seu carro fica em y = 0 e a paisagem passa (`sC` = metros já andados) */
export function serra(sC: number, objs: Obj[], over?: Quadro['over'], o: SerraOpts = {}): Quadro {
  const y = (s: number) => -(s - sC);
  const p = paisagem(sC, o.posto ? [PR + 0.5, PR + 16.5] : null);
  const pst = o.posto ? posto(y) : null;
  return {
    cam: o.cam ?? camLook(1.0, -10.5, 0, 10, 38, 10, 160, 104),
    ground: [...SERRA, ...(pst?.chao ?? [])],
    objs: [...p.objs, ...(pst?.objs ?? []), ...objs],
    over: (pr) => (
      <>
        {(o.nev ?? 0) > 0.01 && neblina('vdf', pr, o.nev!, o.alta ?? 0)}
        {over?.(pr)}
      </>
    ),
  };
}

/** carro que pula um pouco (lombada) */
export const carroZ = (o: Parameters<typeof car>[0], z: number): Obj => (z > 0.001 ? tfObj(car(o), T(0, 0, z)) : car(o));

/** o seu carro */
export const voce = (x: number, y: number, brake = false, heading = 0) => car({ x, y, color: VOCE, brake, heading });

/* ---------------- painel ---------------- */

/** velocímetro (pixels) de 0 a 120 km/h, centrado em (x, y) */
export function velocimetro(x: number, y: number, kmh: number, o = 1, r = 24): ReactNode {
  if (o < 0.01) return null;
  const ang = (v: number) => ((-220 + (v / 120) * 260) * Math.PI) / 180;
  const at = (v: number, k: number): V2 => [x + Math.cos(ang(v)) * r * k, y + Math.sin(ang(v)) * r * k];
  const ticks = Array.from({ length: 13 }, (_, i) => i * 10);
  const [nx, ny] = at(kmh, 0.78);
  return (
    <g opacity={o}>
      <circle cx={x + 1.5} cy={y + 2.5} r={r + 4} fill="#0005" />
      <circle cx={x} cy={y} r={r + 4} fill="#1b2027" stroke="#4a525d" strokeWidth={1.6} />
      <circle cx={x} cy={y} r={r} fill="#242a33" />
      {ticks.map((v) => {
        const [ax, ay] = at(v, v % 40 === 0 ? 0.76 : 0.84);
        const [bx, by] = at(v, 0.95);
        return <line key={v} x1={ax} y1={ay} x2={bx} y2={by} stroke={v >= 100 ? '#ff6b5f' : '#e8edf2'} strokeWidth={v % 40 === 0 ? 1.8 : 1} />;
      })}
      {[0, 40, 80, 120].map((v) => {
        const [tx, ty] = at(v, 0.56);
        return <text key={v} x={tx} y={ty + 2.6} textAnchor="middle" fontSize={r * 0.27} fontWeight={800} fill="#e8edf2">{v}</text>;
      })}
      <text x={x} y={y + r * 0.62} textAnchor="middle" fontSize={r * 0.22} fontWeight={700} fill="#9aa5b1">km/h</text>
      <line x1={x} y1={y} x2={nx} y2={ny} stroke="#ff5a3c" strokeWidth={2.2} strokeLinecap="round" />
      <circle cx={x} cy={y} r={r * 0.14} fill="#c9d1da" stroke="#1b2027" strokeWidth={1} />
    </g>
  );
}

/** posições do câmbio em H (pixels, relativas ao centro): 1 3 5 em cima, 2 4 R embaixo, N no meio */
const POS: Record<string, V2> = { '1': [-18, -18], '2': [-18, 18], '3': [0, -18], '4': [0, 18], '5': [18, -18], R: [18, 18], N: [0, 0] };

/** alavanca do câmbio (pixels): a bola vai da marcha `de` para `para` conforme `k`; cartão branco com rótulo */
export function cambio(x: number, y: number, de: string, para: string, k: number, o = 1, rotulo?: string, s = 1): ReactNode {
  if (o < 0.01) return null;
  // caminho em H: passa pelo meio (N) quando troca de coluna ou de linha
  const a = POS[de], b = POS[para];
  const meioA: V2 = [a[0], 0], meioB: V2 = [b[0], 0];
  const pts: V2[] = [a, meioA, meioB, b];
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const tot = lens.reduce((u, v) => u + v, 0) || 1;
  let d = k * tot, bola: V2 = a;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const u = lens[i] ? Math.min(1, d / lens[i]) : 1;
      bola = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
      break;
    }
    d -= lens[i];
  }
  const h = rotulo ? 92 : 74;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-37.5} y={-35} width={78} height={h} rx={10} fill="#0004" />
      <rect x={-39} y={-37.5} width={78} height={h} rx={10} fill="#ffffff" />
      <rect x={-31} y={-30} width={62} height={60} rx={8} fill="#2a3038" />
      {/* trilho em H */}
      <path d="M-18 -18 L-18 18 M0 -18 L0 18 M18 -18 L18 18 M-18 0 L18 0" stroke="#4d5662" strokeWidth={5} strokeLinecap="round" />
      {Object.entries(POS).filter(([m]) => m !== 'N').map(([m, [px, py]]) => (
        <text key={m} x={px + (px > 0 ? 8 : px < 0 ? -8 : 7)} y={py + (py < 0 ? -2 : 8)} textAnchor="middle" fontSize={8} fontWeight={900} fill={m === para && k >= 1 ? AMAR : '#c5ccd4'}>{m}</text>
      ))}
      <circle cx={bola[0] + 0.8} cy={bola[1] + 1.4} r={7} fill="#0006" />
      <circle cx={bola[0]} cy={bola[1]} r={7} fill="#1b1f25" stroke="#7d8896" strokeWidth={1.2} />
      <circle cx={bola[0] - 2} cy={bola[1] - 2.2} r={2.2} fill="#ffffff" opacity={0.35} />
      {rotulo && <text x={0} y={46} textAnchor="middle" fontSize={9} fontWeight={800} fill={TINTA}>{rotulo}</text>}
    </g>
  );
}

/* ---------------- na pista ---------------- */

/** contorno irregular em volta de (x, y) */
function borrao(x: number, y: number, rx: number, ry: number, seed: number, n = 16): V2[] {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 0.85 + r() * 0.22;
    return [x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k];
  });
}

/** poça d'água na pista, com reflexo */
export function poca(x: number, y: number, rx: number, ry: number, seed = 5): Part[] {
  const pts = borrao(x, y, rx, ry, seed, 18);
  return [
    flat(pts, '#5f7f9f', 0.004, 0.95),
    flat(pts.map(([a, b]): V2 => [x + (a - x) * 0.7, y + (b - y) * 0.8]), '#88a6c2', 0.006, 0.85),
    lines([
      { p: [[x - rx * 0.4, y - ry * 0.3, 0.008], [x + rx * 0.1, y - ry * 0.5, 0.008]], c: '#dfeaf5', w: 1.1 },
      { p: [[x - rx * 0.1, y + ry * 0.2, 0.008], [x + rx * 0.45, y, 0.008]], c: '#dfeaf5', w: 0.9 },
    ]),
  ];
}

/** buraco no asfalto: borda clara quebrada e fundo escuro */
export function buraco(x: number, y: number, r = 0.9): Part[] {
  return [flat(borrao(x, y, r * 1.25, r, 9), '#8b9097', 0.004), flat(borrao(x, y, r, r * 0.78, 4), '#2a2d31', 0.006), flat(borrao(x + 0.1, y - 0.1, r * 0.55, r * 0.4, 2), '#1a1c1f', 0.008)];
}

/** manchas na pista: óleo (com brilho colorido), areia ou barro */
export function mancha(tipo: 'oleo' | 'areia' | 'barro', x: number, y: number): Part[] {
  if (tipo === 'oleo')
    return [
      flat(borrao(x, y, 1.3, 0.9, 3), '#1f2228', 0.004, 0.9),
      lines([
        { p: [[x - 0.8, y - 0.2, 0.008], [x - 0.1, y - 0.5, 0.008], [x + 0.7, y - 0.2, 0.008]], c: '#7f5fc8', w: 1.1 },
        { p: [[x - 0.6, y + 0.15, 0.008], [x + 0.1, y - 0.1, 0.008], [x + 0.8, y + 0.15, 0.008]], c: '#3fb7a5', w: 1 },
        { p: [[x - 0.4, y + 0.45, 0.008], [x + 0.5, y + 0.35, 0.008]], c: '#d8b44a', w: 0.9 },
      ]),
    ];
  const r = rng(tipo === 'areia' ? 21 : 33);
  const base = tipo === 'areia' ? '#d9c28c' : '#7a5634';
  const pinta = tipo === 'areia' ? '#b9a06a' : '#5c3f24';
  return [
    flat(borrao(x, y, 1.6, 1.0, tipo === 'areia' ? 7 : 8), base, 0.004, 0.95),
    ...Array.from({ length: 9 }, () => {
      const px = x + (r() - 0.5) * 2.2, py = y + (r() - 0.5) * 1.3;
      return flat(borrao(px, py, 0.14, 0.1, Math.floor(r() * 99)), pinta, 0.006);
    }),
  ];
}

/** lombada atravessando a sua faixa, com faixas amarelas e pretas */
export function lombada(y: number, x0 = 0.1, x1 = 3.4): Obj {
  const listras = (k: string, q: Parameters<NonNullable<Parameters<typeof box>[7]>>[1]): Dec[] | undefined => {
    if (k !== 'top' && k !== 's') return undefined;
    return Array.from({ length: 5 }, (_, i) => ({ p: subq(q, i / 5 + 0.03, 0, i / 5 + 0.13, 1), c: '#f2c21b' }));
  };
  return { parts: [box(x0, y - 0.6, 0, x1, y + 0.6, 0.12, (k) => (k === 'top' ? '#2c2f34' : '#3a3e44'), listras)] };
}

/** placa (pixels) presa num poste à direita da pista: poste 3D separado em `postePlaca` */
export const postePlaca = (x: number, y: number, h = 2.3): Obj => ({ parts: [box(x - 0.06, y - 0.06, 0, x + 0.06, y + 0.06, h, '#9aa3ad')], shadow: true });

/* ---------------- tempo ---------------- */

/** granizo (pixels): pedrinhas brancas caindo e quicando embaixo */
export function granizo(t: number, o: number): ReactNode {
  if (o <= 0.01) return null;
  const r = rng(77);
  const pedras = Array.from({ length: 70 }, () => [r() * 330 - 5, r() * 220, 1.1 + r() * 1.3] as const);
  const d = t * 300;
  return (
    <g opacity={o}>
      <rect x={0} y={0} width={320} height={200} fill="#4f5b68" opacity={0.4} />
      {pedras.map(([x, y, s], i) => {
        const yy = ((y + d) % 220) - 10;
        return (
          <g key={i}>
            <line x1={x + 1.2} y1={yy - 6} x2={x} y2={yy} stroke="#e9f1f8" strokeWidth={0.6} opacity={0.5} />
            <circle cx={x} cy={yy} r={s} fill="#f7fbff" stroke="#b9c8d6" strokeWidth={0.4} />
          </g>
        );
      })}
    </g>
  );
}

/** pneu visto de frente, de perto (pixels): `gasto` = 0 (sulcos fundos) até 1 (careca) */
export function pneu(x: number, y: number, gasto: number, o = 1, s = 1, agua = 0, t = 0): ReactNode {
  if (o < 0.01) return null;
  const fundo = 1 - gasto;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-27} y={-41} width={54} height={82} rx={14} fill="#0005" />
      <rect x={-28} y={-43} width={56} height={82} rx={14} fill="#25292f" />
      <rect x={-24} y={-39} width={48} height={74} rx={11} fill="#30353c" />
      {/* sulcos: quanto mais gasto, mais rasos e claros */}
      {fundo > 0.05 &&
        [-12, 0, 12].map((gx) => <rect key={gx} x={gx - 2.2} y={-37} width={4.4} height={70} rx={1.5} fill="#121418" opacity={0.25 + 0.75 * fundo} />)}
      {fundo > 0.05 &&
        Array.from({ length: 7 }, (_, i) => -33 + i * 10).flatMap((gy) =>
          [-18, -6, 6, 18].map((gx) => <path key={`${gx}${gy}`} d={`M${gx - 3} ${gy} l6 4`} stroke="#121418" strokeWidth={1.6} opacity={0.25 + 0.75 * fundo} />),
        )}
      {/* água escoando pelos sulcos */}
      {agua > 0.01 && fundo > 0.05 &&
        [-12, 0, 12].map((gx) => (
          <line key={gx} x1={gx} y1={-34 + ((t * 40) % 12)} x2={gx} y2={30} stroke="#6fb6ff" strokeWidth={2} strokeDasharray="5 7" strokeDashoffset={-t * 40} opacity={agua} />
        ))}
      {gasto > 0.6 && <rect x={-20} y={-30} width={40} height={56} rx={9} fill="#3d434b" opacity={(gasto - 0.6) * 1.5} />}
    </g>
  );
}

/* ---------------- motorista, réguas e luzes ---------------- */

/** o motorista visto de lado, com a rua passando atrás */
export function naCabine(lt: number, over: () => ReactNode, extra: Partial<Parameters<typeof cabine>[0]> = {}): Quadro {
  const q = ruaFundo(lt);
  return {
    ...q,
    over: () => (
      <>
        {escuro(0.5)}
        {cabine({ dobra: 1, apoio: 1, lt, ...extra })}
        {over()}
      </>
    ),
  };
}

/** olho e pé (no pedal) do motorista na cabine (dobra = 1) */
export const OLHO: V2 = [166.5, 69];
export const PE: V2 = [240, 170];
export const anel = (x: number, y: number, r: number, o: number) => (o > 0.01 ? <circle cx={x} cy={y} r={r} fill="none" stroke={AMAR} strokeWidth={3} strokeDasharray="5 4" opacity={o} /> : null);

/** régua no chão, ao lado da pista, de y0 a y1, com o rótulo no meio */
export function regua(pr: Pr, y0: number, y1: number, texto: string, o: number, cor = TINTA, x = 4.6): ReactNode {
  if (o < 0.01) return null;
  const [ax, ay] = pr([x, y0, 0]);
  const [bx, by] = pr([x, y1, 0]);
  return (
    <g opacity={o}>
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#ffffff" strokeWidth={2.4} />
      <line x1={ax - 6} y1={ay} x2={ax + 6} y2={ay} stroke="#ffffff" strokeWidth={2.4} />
      <line x1={bx - 6} y1={by} x2={bx + 6} y2={by} stroke="#ffffff" strokeWidth={2.4} />
      {chip((ax + bx) / 2 + 40, (ay + by) / 2, texto, cor, 1, 10)}
    </g>
  );
}

/** lanternas de um carro virado para o norte em (x, y); `forte` = freando */
export const lanternas = (pr: Pr, x: number, y: number, forte = false, k = 'l') =>
  [-0.6, 0.6].map((b) => luz(pr, [x + b, y + 2.15, 0.75], forte ? 1.7 : 1.0, '#ff3b30', `${k}${b}`));

/** pisca-alerta de um carro virado para o norte (as quatro setas) */
export const alerta = (pr: Pr, x: number, y: number, lt: number, k = 'a') =>
  pisca(lt, 'lr') ? [-2.0, 2.0].flatMap((a) => [-0.85, 0.85].map((b) => luz(pr, [x + b, y + a, 0.72], 1.3, '#ffb020', `${k}${a}${b}`))) : null;

/** volante (pixels) girado `ang` radianos, num cartão branco com rótulo */
export function volanteCartao(x: number, y: number, ang: number, o: number, rotulo: string): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <rect x={x - 38} y={y - 34} width={76} height={74} rx={12} fill="#ffffff" opacity={0.95} />
      <g transform={`rotate(${(ang * 180) / Math.PI} ${x} ${y - 4})`}>{volante(x, y - 4, 19)}</g>
      <text x={x} y={y + 32} textAnchor="middle" fontSize={10} fontWeight={800} fill={TINTA}>{rotulo}</text>
    </g>
  );
}
