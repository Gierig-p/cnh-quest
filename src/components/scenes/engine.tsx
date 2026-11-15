/**
 * Mini motor 3D em SVG para as cenas novas ("3D disfarçado de 2D", piloto de 14/11/2026).
 *
 * - Mundo em metros: x = leste, y = sul (para perto da câmera), z = para cima.
 * - Câmera ortográfica fixa por cena (giro `yaw` e inclinação `pitch`), sem perspectiva: parece ilustração.
 * - Cada peça é um sólido convexo (caixa, extrusão, torno). As faces de costas para a câmera somem,
 *   as peças são desenhadas de trás para a frente e cada face é sombreada pela luz (que acompanha a câmera,
 *   para todas as cenas terem a mesma luz: do alto, à esquerda da tela).
 * - Sombras de verdade: cada objeto projeta a sua sombra no chão, na direção da luz.
 * - Tudo é função pura das entradas (sem aleatório solto), então a mesma cena sai sempre igual.
 */
import type { ReactNode } from 'react';

export type V3 = [number, number, number];
export type V2 = [number, number];
/** matriz 3x4 (linha a linha) */
export type Mat = number[];

/* ---------------- matrizes ---------------- */
export const I: Mat = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
export function mul(a: Mat, b: Mat): Mat {
  const r: number[] = new Array(12);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 4; j++) {
      let s = j === 3 ? a[i * 4 + 3] : 0;
      for (let k = 0; k < 3; k++) s += a[i * 4 + k] * b[k * 4 + j];
      r[i * 4 + j] = s;
    }
  return r;
}
export const chain = (...ms: Mat[]) => ms.reduce((a, b) => mul(a, b), I);
export const T = (x: number, y: number, z = 0): Mat => [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z];
export const Sc = (k: number, ky = k, kz = k): Mat => [k, 0, 0, 0, 0, ky, 0, 0, 0, 0, kz, 0];
export const Rz = (a: number): Mat => {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0];
};
export const Rx = (a: number): Mat => {
  const c = Math.cos(a), s = Math.sin(a);
  return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0];
};
export const Ry = (a: number): Mat => {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0];
};
export const ap = (m: Mat, p: V3): V3 => [
  m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + m[3],
  m[4] * p[0] + m[5] * p[1] + m[6] * p[2] + m[7],
  m[8] * p[0] + m[9] * p[1] + m[10] * p[2] + m[11],
];

/* ---------------- vetores ---------------- */
const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const mean = (ps: V3[]): V3 => {
  let x = 0, y = 0, z = 0;
  for (const p of ps) {
    x += p[0];
    y += p[1];
    z += p[2];
  }
  return [x / ps.length, y / ps.length, z / ps.length];
};
/** normal de Newell (funciona para polígonos planos de qualquer número de lados) */
function newell(ps: V3[]): V3 {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < ps.length; i++) {
    const a = ps[i], b = ps[(i + 1) % ps.length];
    x += (a[1] - b[1]) * (a[2] + b[2]);
    y += (a[2] - b[2]) * (a[0] + b[0]);
    z += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return norm([x, y, z]);
}
export const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/** ponto (u, v) de um quadrilátero q0..q3 (q0 = (0,0), q1 = (1,0), q2 = (1,1), q3 = (0,1)) */
export const bil = (q: V3[], u: number, v: number): V3 => lerp3(lerp3(q[0], q[1], u), lerp3(q[3], q[2], u), v);
/** pedaço retangular (em u, v) de um quadrilátero */
export const subq = (q: V3[], u0: number, v0: number, u1: number, v1: number): V3[] => [bil(q, u0, v0), bil(q, u1, v0), bil(q, u1, v1), bil(q, u0, v1)];
/** encolhe um polígono em direção ao centro */
export const inset = (ps: V3[], k: number): V3[] => {
  const c = mean(ps);
  return ps.map((p) => lerp3(c, p, k));
};

/* ---------------- cores ---------------- */
const hx = (c: string): V3 => {
  const n = parseInt(c.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
export function mix(a: string, b: string, k: number) {
  const A = hx(a), B = hx(b);
  return toHex(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k);
}
export function scale(c: string, k: number) {
  const A = hx(c);
  return toHex(A[0] * k, A[1] * k, A[2] * k);
}

/* ---------------- peças ---------------- */
export interface Dec {
  p: V3[];
  c: string;
  /** cor exata, sem luz (lâmpadas, reflexos) */
  flat?: boolean;
  o?: number;
}
export interface Face {
  p: V3[];
  c: string;
  flat?: boolean;
  /** opacidade (manchas no chão) */
  o?: number;
  /** desenha também quando está de costas (placa fina, porta) */
  both?: boolean;
  dec?: Dec[];
  n?: V3;
  /** desenho SVG colado na face (placa oficial): `node` em unidades próprias, com (0,0) em `o`,
   *  (100,0) em `u` e (0,100) em `v`. Só aparece de frente, sem luz nem sombra (cores exatas). */
  art?: Art;
}
export interface Art {
  o: V3;
  u: V3;
  v: V3;
  node: ReactNode;
}
export interface Line {
  p: V3[];
  c: string;
  /** espessura em pixels da tela */
  w: number;
  dash?: string;
  o?: number;
}
export interface Part {
  faces: Face[];
  lines?: Line[];
  center: V3;
  /** empurra a peça para a frente (+) ou para trás (−) na ordem de desenho */
  bias?: number;
}
export interface Glow {
  p: V3;
  /** normal da lâmpada: só brilha se estiver virada para a câmera */
  n?: V3;
  r: number;
  c: string;
  o?: number;
}
export interface Obj {
  parts: Part[];
  /** projeta sombra no chão */
  shadow?: boolean;
  glows?: Glow[];
}

/** fecha a peça: calcula o centro e vira todas as faces para fora */
export function part(faces: Face[], lines: Line[] = [], bias = 0): Part {
  const all = faces.flatMap((f) => f.p);
  const center = all.length ? mean(all) : mean(lines.flatMap((l) => l.p));
  for (const f of faces) {
    let n = newell(f.p);
    if (!f.both && dot(n, sub3(mean(f.p), center)) < 0) {
      f.p = [...f.p].reverse();
      n = [-n[0], -n[1], -n[2]];
    }
    f.n = n;
  }
  return { faces, lines, center, bias };
}

export function tf(pt: Part, m: Mat): Part {
  const rot = (n: V3): V3 => norm([m[0] * n[0] + m[1] * n[1] + m[2] * n[2], m[4] * n[0] + m[5] * n[1] + m[6] * n[2], m[8] * n[0] + m[9] * n[1] + m[10] * n[2]]);
  return {
    center: ap(m, pt.center),
    bias: pt.bias,
    faces: pt.faces.map((f) => ({ ...f, p: f.p.map((p) => ap(m, p)), n: f.n && rot(f.n), dec: f.dec?.map((d) => ({ ...d, p: d.p.map((p) => ap(m, p)) })), art: f.art && { ...f.art, o: ap(m, f.art.o), u: ap(m, f.art.u), v: ap(m, f.art.v) } })),
    lines: pt.lines?.map((l) => ({ ...l, p: l.p.map((p) => ap(m, p)) })),
  };
}
export const tfObj = (o: Obj, m: Mat): Obj => ({
  ...o,
  parts: o.parts.map((p) => tf(p, m)),
  glows: o.glows?.map((g) => ({ ...g, p: ap(m, g.p), n: g.n && norm([m[0] * g.n[0] + m[1] * g.n[1] + m[2] * g.n[2], m[4] * g.n[0] + m[5] * g.n[1] + m[6] * g.n[2], m[8] * g.n[0] + m[9] * g.n[1] + m[10] * g.n[2]]) })),
});

export type BoxKey = 'top' | 'n' | 's' | 'e' | 'w' | 'bot';
type Col<K> = string | ((k: K) => string);
const pick = <K,>(c: Col<K>, k: K) => (typeof c === 'string' ? c : c(k));

/** Caixa alinhada aos eixos. `dec` recebe a face (q0..q3: q0-q1 na horizontal, q0-q3 subindo) e devolve detalhes pintados nela. */
export function box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: Col<BoxKey>, dec?: (k: BoxKey, q: V3[]) => Dec[] | undefined, bot = false): Part {
  const F: [BoxKey, V3[]][] = [
    ['top', [[x0, y1, z1], [x1, y1, z1], [x1, y0, z1], [x0, y0, z1]]],
    ['s', [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]],
    ['n', [[x1, y0, z0], [x0, y0, z0], [x0, y0, z1], [x1, y0, z1]]],
    ['e', [[x1, y1, z0], [x1, y0, z0], [x1, y0, z1], [x1, y1, z1]]],
    ['w', [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]]],
  ];
  if (bot) F.push(['bot', [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]]]);
  return part(F.map(([k, p]) => ({ p, c: pick(c, k), dec: dec?.(k, p) })));
}

export type ExKey = number | 'cap0' | 'cap1';
/**
 * Extrusão: o polígono `poly` (no plano dos outros dois eixos) é puxado ao longo de `axis`, de d0 a d1.
 * axis 'x': poly em (y, z). axis 'y': poly em (x, z). axis 'z': poly em (x, y).
 * Nas faces laterais (chave = índice da aresta), q0-q1 segue a aresta e q0-q3 segue a extrusão.
 */
export function extrude(poly: V2[], axis: 'x' | 'y' | 'z', d0: number, d1: number, c: Col<ExKey>, dec?: (k: ExKey, q: V3[]) => Dec[] | undefined): Part {
  const P = (a: number, b: number, d: number): V3 => (axis === 'x' ? [d, a, b] : axis === 'y' ? [a, d, b] : [a, b, d]);
  const faces: Face[] = [];
  const c0 = poly.map(([a, b]) => P(a, b, d0));
  const c1 = poly.map(([a, b]) => P(a, b, d1));
  faces.push({ p: c0, c: pick(c, 'cap0'), dec: dec?.('cap0', c0) });
  faces.push({ p: c1, c: pick(c, 'cap1'), dec: dec?.('cap1', c1) });
  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;
    const q: V3[] = [c0[i], c0[j], c1[j], c1[i]];
    faces.push({ p: q, c: pick(c, i), dec: dec?.(i, q) });
  }
  return part(faces);
}

/** Torno: perfil [raio, altura] girado em volta do eixo z. Bom para copas, latas, postes, caixa d'água. */
export function lathe(profile: V2[], sides: number, c: Col<number>, rot0 = 0): Part {
  const ring = (r: number, z: number) => Array.from({ length: sides }, (_, k): V3 => {
    const a = rot0 + (k / sides) * Math.PI * 2;
    return [Math.cos(a) * r, Math.sin(a) * r, z];
  });
  const rings = profile.map(([r, z]) => ring(r, z));
  const faces: Face[] = [];
  for (let i = 0; i < rings.length - 1; i++)
    for (let k = 0; k < sides; k++) {
      const k2 = (k + 1) % sides;
      const a = rings[i][k], b = rings[i][k2], cc = rings[i + 1][k2], d = rings[i + 1][k];
      const pts: V3[] = profile[i][0] === 0 ? [a, cc, d] : profile[i + 1][0] === 0 ? [a, b, d] : [a, b, cc, d];
      faces.push({ p: pts, c: pick(c, i) });
    }
  // tampa de cima, quando o perfil termina com raio > 0
  const last = profile[profile.length - 1];
  if (last[0] > 0) faces.push({ p: rings[rings.length - 1], c: pick(c, profile.length - 1) });
  return part(faces);
}

/** círculo (polígono) no plano de dois eixos, para rodas e bueiros */
export const circle = (r: number, n = 12, a0 = 0): V2[] => Array.from({ length: n }, (_, k) => [Math.cos(a0 + (k / n) * Math.PI * 2) * r, Math.sin(a0 + (k / n) * Math.PI * 2) * r]);

/** chão: polígono plano (sem lado), com cor exata */
export const flat = (pts: V2[], c: string, z = 0, o?: number): Part => ({
  faces: [{ p: pts.map(([x, y]): V3 => [x, y, z]), c, flat: true, n: [0, 0, 1], o }],
  center: [0, 0, z],
  lines: [],
});
export const rect = (x0: number, y0: number, x1: number, y1: number, c: string, z = 0, o?: number): Part => flat([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], c, z, o);
/** só linhas no chão (faixas tracejadas, rejuntes) */
export const lines = (ls: Line[]): Part => ({ faces: [], lines: ls, center: [0, 0, 0] });

/** Caixa entre dois pontos (braço, perna, quadro de bicicleta). `w` = largura, `h` = espessura. */
export function seg(a: V3, b: V3, w: number, c: Col<BoxKey>, h = w): Part {
  const d = sub3(b, a);
  const L = Math.hypot(d[0], d[1], d[2]) || 1e-6;
  const ez = norm(d);
  const up: V3 = Math.abs(ez[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  const ex = norm([up[1] * ez[2] - up[2] * ez[1], up[2] * ez[0] - up[0] * ez[2], up[0] * ez[1] - up[1] * ez[0]]);
  const ey: V3 = [ez[1] * ex[2] - ez[2] * ex[1], ez[2] * ex[0] - ez[0] * ex[2], ez[0] * ex[1] - ez[1] * ex[0]];
  const m: Mat = [ex[0], ey[0], ez[0], a[0], ex[1], ey[1], ez[1], a[1], ex[2], ey[2], ez[2], a[2]];
  return tf(box(-w / 2, -h / 2, 0, w / 2, h / 2, L, c), m);
}

/** números pseudoaleatórios com semente (para espalhar detalhes sempre do mesmo jeito) */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

/* ---------------- câmera e desenho ---------------- */
export interface Cam {
  /** giro em graus (0 = olhando para o norte; positivo vê a face leste) */
  yaw: number;
  /** inclinação em graus (90 = de cima) */
  pitch: number;
  /** pixels por metro */
  s: number;
  /** onde a origem do mundo cai na tela */
  ox: number;
  oy: number;
}

export function camera(cam: Cam) {
  const th = (cam.yaw * Math.PI) / 180, e = (cam.pitch * Math.PI) / 180;
  const ct = Math.cos(th), st = Math.sin(th), se = Math.sin(e), ce = Math.cos(e);
  const V: V3 = [st * ce, ct * ce, se];
  // luz presa à câmera: vem da esquerda da tela, um pouco da frente, bem do alto
  const lu = -0.62, lw = 0.32, lz = 0.86;
  const L = norm([lu * ct + lw * st, -lu * st + lw * ct, lz]);
  const pr = (p: V3): V2 => [cam.ox + cam.s * (p[0] * ct - p[1] * st), cam.oy + cam.s * ((p[0] * st + p[1] * ct) * se - p[2] * ce)];
  const depth = (p: V3) => (p[0] * st + p[1] * ct) * ce + p[2] * se;
  return { V, L, pr, depth };
}

/** luz numa face: topo claro, frente média, lado escuro e levemente azulado (sombra fria) */
export function shadeColor(c: string, n: V3, L: V3) {
  const d = Math.max(0, dot(n, L));
  const k = 0.6 + 0.48 * d;
  const base = scale(c, k);
  return d < 0.35 ? mix(base, '#2c3f63', 0.1 * (1 - d / 0.35)) : d > 0.8 ? mix(base, '#fff6e0', (d - 0.8) * 0.5) : base;
}

const path = (pts: V2[], close = true) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}${close ? 'Z' : ''}`;

function hull(pts: V2[]): V2[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o: V2, a: V2, b: V2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: V2[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: V2[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/* ---------------- ordem de desenho ---------------- */
const EPS = 0.025;
type Box3 = { min: V3; max: V3 };
function aabb(parts: Part[]): Box3 {
  const min: V3 = [Infinity, Infinity, Infinity], max: V3 = [-Infinity, -Infinity, -Infinity];
  for (const p of parts) {
    const vs = p.faces.length ? p.faces.flatMap((f) => f.p) : (p.lines ?? []).flatMap((l) => l.p);
    for (const v of vs)
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], v[k]);
        max[k] = Math.max(max[k], v[k]);
      }
  }
  return { min, max };
}
/** -1: a antes de b; 1: b antes de a; 0: não sei (fica a profundidade) */
function boxCmp(a: Box3, b: Box3, V: V3): number {
  for (let k = 0; k < 3; k++) {
    if (Math.abs(V[k]) < 1e-6) continue;
    if (a.max[k] <= b.min[k] + EPS) return V[k] > 0 ? -1 : 1;
    if (b.max[k] <= a.min[k] + EPS) return V[k] > 0 ? 1 : -1;
  }
  return 0;
}
function partCmp(A: Part, B: Part, V: V3): number {
  const vA = A.faces.flatMap((f) => f.p), vB = B.faces.flatMap((f) => f.p);
  if (!vA.length || !vB.length) return 0;
  for (const f of B.faces) {
    if (f.both || !f.n) continue;
    const s = dot(f.n, V);
    if (Math.abs(s) < 1e-3) continue;
    if (vA.every((v) => dot(sub3(v, f.p[0]), f.n!) >= -EPS)) return s > 0 ? 1 : -1;
  }
  for (const f of A.faces) {
    if (f.both || !f.n) continue;
    const s = dot(f.n, V);
    if (Math.abs(s) < 1e-3) continue;
    if (vB.every((v) => dot(sub3(v, f.p[0]), f.n!) >= -EPS)) return s > 0 ? -1 : 1;
  }
  return 0;
}
/** ordenação topológica: respeita as regras de "quem vem antes"; no empate (ou ciclo), o mais fundo primeiro */
function topo(ids: number[], depth: (i: number) => number, cmp: (a: number, b: number) => number): number[] {
  const n = ids.length;
  const d = ids.map(depth);
  const before: number[][] = ids.map(() => []);
  const indeg: number[] = new Array(n).fill(0);
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++) {
      const r = cmp(ids[a], ids[b]);
      if (r < 0) {
        before[a].push(b);
        indeg[b]++;
      } else if (r > 0) {
        before[b].push(a);
        indeg[a]++;
      }
    }
  const done: boolean[] = new Array(n).fill(false);
  const out: number[] = [];
  for (let step = 0; step < n; step++) {
    let best = -1;
    for (let i = 0; i < n; i++) if (!done[i] && indeg[i] === 0 && (best < 0 || d[i] < d[best])) best = i;
    if (best < 0) for (let i = 0; i < n; i++) if (!done[i] && (best < 0 || indeg[i] < indeg[best] || (indeg[i] === indeg[best] && d[i] < d[best]))) best = i;
    done[best] = true;
    out.push(ids[best]);
    for (const j of before[best]) indeg[j]--;
  }
  return out;
}

function drawPart(pt: Part, cam: ReturnType<typeof camera>, key: string, out: ReactNode[], cru?: V2[][]) {
  const { V, L, pr } = cam;
  pt.faces.forEach((f, i) => {
    const n = f.n ?? [0, 0, 1];
    const vis = dot(n, V);
    if (vis <= 1e-4 && !f.both) return;
    const nn: V3 = vis < 0 ? [-n[0], -n[1], -n[2]] : n;
    const col = f.flat ? f.c : shadeColor(f.c, nn, L);
    out.push(<path key={`${key}f${i}`} d={path(f.p.map(pr))} fill={col} opacity={f.o} stroke={f.flat ? undefined : scale(col, 0.84)} strokeWidth={f.flat ? undefined : 0.45} strokeLinejoin="round" />);
    f.dec?.forEach((d, j) =>
      out.push(<path key={`${key}f${i}d${j}`} d={path(d.p.map(pr))} fill={d.flat ? d.c : shadeColor(d.c, nn, L)} opacity={d.o} />),
    );
    if (f.art && vis > 0) {
      // câmera sem perspectiva: um plano vira uma transformação afim exata (o desenho não deforma)
      const [o, u, v] = [pr(f.art.o), pr(f.art.u), pr(f.art.v)];
      const m = [(u[0] - o[0]) / 100, (u[1] - o[1]) / 100, (v[0] - o[0]) / 100, (v[1] - o[1]) / 100, o[0], o[1]].map((x) => +x.toFixed(4));
      out.push(<g key={`${key}f${i}a`} transform={`matrix(${m.join(' ')})`}>{f.art.node}</g>);
      cru?.push(f.p.map(pr));
    }
  });
  pt.lines?.forEach((l, i) =>
    out.push(<path key={`${key}l${i}`} d={path(l.p.map(pr), false)} fill="none" stroke={l.c} strokeWidth={l.w} strokeDasharray={l.dash} strokeLinecap="round" strokeLinejoin="round" opacity={l.o} />),
  );
}

export interface SceneProps {
  cam: Cam;
  /** chão, desenhado na ordem dada (asfalto, faixas, calçadas...) */
  ground: Part[];
  /** objetos com volume, ordenados automaticamente de trás para a frente */
  objs: Obj[];
  /** coisas desenhadas por cima de tudo, já em pixels (etiquetas) */
  overlay?: (pr: (p: V3) => V2) => ReactNode;
  id: string;
  label?: string;
}

/** Desenha a cena inteira num SVG 320x200. */
export function Scene3D({ cam, ground, objs, overlay, id, label }: SceneProps) {
  const C = camera(cam);
  const out: ReactNode[] = [];
  ground.forEach((g, i) => drawPart(g, C, `g${i}`, out));

  // sombras: casca convexa da projeção de cada objeto no chão, todas num grupo só (sem escurecer duas vezes)
  const sombras: ReactNode[] = [];
  const contato: ReactNode[] = [];
  objs.forEach((o, i) => {
    if (!o.shadow) return;
    const pts: V2[] = [];
    const base: V2[] = [];
    for (const p of o.parts)
      for (const f of p.faces)
        for (const v of f.p) {
          const z = Math.max(0, v[2]);
          pts.push(C.pr([v[0] - (C.L[0] * z) / C.L[2], v[1] - (C.L[1] * z) / C.L[2], 0]));
          if (z < 0.5) base.push(C.pr([v[0], v[1], 0]));
        }
    sombras.push(<path key={`s${i}`} d={path(hull(pts))} />);
    if (base.length > 2) contato.push(<path key={`c${i}`} d={path(hull(base))} />);
  });

  // ordem: primeiro os objetos (pela caixa de cada um), depois as peças dentro de cada objeto (por planos que separam)
  const corpo: ReactNode[] = [];
  // frentes de placa: ficam fora do sol e da vinheta, para as cores oficiais não mudarem
  const cru: V2[][] = [];
  const caixas = objs.map((o) => aabb(o.parts));
  const oOrd = topo(
    objs.map((_, i) => i),
    (i) => C.depth(lerp3(caixas[i].min, caixas[i].max, 0.5)),
    (a, b) => boxCmp(caixas[a], caixas[b], C.V),
  );
  for (const i of oOrd) {
    const ps = objs[i].parts;
    const pOrd = topo(
      ps.map((_, j) => j),
      (j) => C.depth(ps[j].center) + (ps[j].bias ?? 0),
      (a, b) => (ps[a].bias || ps[b].bias ? 0 : partCmp(ps[a], ps[b], C.V)),
    );
    for (const j of pOrd) drawPart(ps[j], C, `o${i}p${j}`, corpo, cru);
  }

  const brilhos: ReactNode[] = [];
  objs.forEach((o, i) =>
    o.glows?.forEach((g, j) => {
      if (g.n && dot(g.n, C.V) <= 0) return;
      const [x, y] = C.pr(g.p);
      brilhos.push(<circle key={`b${i}-${j}`} cx={x} cy={y} r={g.r} fill={`url(#${id}-glow)`} style={{ color: g.c }} opacity={g.o ?? 1} />);
      brilhos.push(<circle key={`bc${i}-${j}`} cx={x} cy={y} r={g.r * 0.28} fill={g.c} />);
    }),
  );

  return (
    <svg viewBox="0 0 320 200" width="100%" role="img" aria-label={label} aria-hidden={label ? undefined : true} style={{ display: 'block' }}>
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="currentColor" stopOpacity={0.75} />
          <stop offset="1" stopColor="currentColor" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-vin`} cx="0.42" cy="0.38" r="0.75">
          <stop offset="0.55" stopColor="#0d1b2a" stopOpacity={0} />
          <stop offset="1" stopColor="#0d1b2a" stopOpacity={0.22} />
        </radialGradient>
        {cru.length > 0 && (
          <mask id={`${id}-cru`} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="200">
            <rect width="320" height="200" fill="#fff" />
            {cru.map((q, k) => <path key={k} d={path(q)} fill="#000" />)}
          </mask>
        )}
        <linearGradient id={`${id}-sol`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c9" stopOpacity={0.16} />
          <stop offset="0.5" stopColor="#fff1c9" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="#9fcf8f" />
      {out}
      <g fill="#14233a" opacity={0.2}>{sombras}</g>
      <g fill="#0b1626" opacity={0.18}>{contato}</g>
      {corpo}
      {brilhos}
      <g mask={cru.length ? `url(#${id}-cru)` : undefined}>
        <rect width="320" height="200" fill={`url(#${id}-sol)`} />
        <rect width="320" height="200" fill={`url(#${id}-vin)`} />
      </g>
      {overlay?.(C.pr)}
    </svg>
  );
}

/** câmera apontada para um ponto do mundo (que fica no centro da tela, ou em `sx`, `sy`) */
export function camLook(x: number, y: number, z: number, yaw: number, pitch: number, s: number, sx = 160, sy = 100): Cam {
  const c = camera({ yaw, pitch, s, ox: 0, oy: 0 });
  const [px, py] = c.pr([x, y, z]);
  return { yaw, pitch, s, ox: sx - px, oy: sy - py };
}
