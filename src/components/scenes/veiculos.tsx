/**
 * Veículos grandes para o motor 3D em SVG: ambulância, caminhão dos bombeiros e caminhão baú.
 * Mesma convenção do `car`: frente para −y (heading 0 = indo para o norte), largura em x, medidas em metros.
 */
import { box, chain, circle, extrude, inset, Rz, scale, subq, T, tfObj, type BoxKey, type Dec, type Glow, type Obj, type Part, type V2, type V3 } from './engine';

const GLASS = '#3b5470';
const GLASS_HI = '#a9c8e3';
const TIRE = '#262b33';

export type TipoUtilitario = 'ambulancia' | 'bombeiros' | 'caminhao';

export interface UtilitarioOpts {
  x: number;
  y: number;
  tipo: TipoUtilitario;
  /** direção em radianos: 0 = indo para o norte (−y); π/2 = indo para o leste */
  heading?: number;
  /** giroflex e luzes de emergência ligados */
  luzes?: boolean;
  /** qual metade das luzes está acesa neste quadro (0 ou 1) */
  fase?: number;
  brake?: boolean;
}

/** retângulo numa face de caixa, em metros: centro (cu, cv) em frações da face, tamanho (wu, wv) em metros */
function rq(q: V3[], cu: number, cv: number, wu: number, wv: number): V3[] {
  const Lu = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]);
  const Lv = Math.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1], q[3][2] - q[0][2]);
  const du = wu / Lu / 2, dv = wv / Lv / 2;
  return subq(q, cu - du, cv - dv, cu + du, cv + dv);
}
/** cruz da vida (ou cruz simples) centrada em (cu, cv), com braço de `b` metros */
function cruz(q: V3[], cu: number, cv: number, b: number, c: string): Dec[] {
  return [{ p: rq(q, cu, cv, b * 0.34, b), c }, { p: rq(q, cu, cv, b, b * 0.34), c }];
}

interface Medidas {
  L: number;
  /** fim da cabine (y), começo da carroceria (y) */
  yCab: number;
  yBau: number;
  hCab: number;
  hVidro: number;
  zBau: number;
  hBau: number;
  cab: string;
  bau: string;
  rodas: number[];
  rRoda: number;
}
const M: Record<TipoUtilitario, Medidas> = {
  ambulancia: { L: 5.6, yCab: -1.0, yBau: -1.0, hCab: 2.25, hVidro: 1.25, zBau: 0.45, hBau: 2.7, cab: '#f4f6f8', bau: '#f4f6f8', rodas: [-1.85, 1.75], rRoda: 0.4 },
  bombeiros: { L: 8.2, yCab: -1.7, yBau: -1.55, hCab: 2.75, hVidro: 1.55, zBau: 0.6, hBau: 2.75, cab: '#d32f2f', bau: '#d32f2f', rodas: [-2.85, 1.6, 2.85], rRoda: 0.5 },
  caminhao: { L: 7.6, yCab: -1.75, yBau: -1.55, hCab: 2.7, hVidro: 1.55, zBau: 0.85, hBau: 3.3, cab: '#2f6fb3', bau: '#e9e4d6', rodas: [-2.75, 1.75, 2.85], rRoda: 0.5 },
};

export function utilitario({ x, y, tipo, heading = 0, luzes = false, fase = 0, brake = false }: UtilitarioOpts): Obj {
  const m = M[tipo];
  const yf = -m.L / 2, yr = m.L / 2;
  const W = 1.05;
  const parts: Part[] = [];
  const glows: Glow[] = [];
  const zCh = tipo === 'ambulancia' ? 0.45 : 0.6;

  // cabine: perfil (y, z) puxado na largura. Arestas: 0 chão, 1 fundo, 2 teto, 3 para-brisa, 4 frente
  const pf: V2[] = [[yf, zCh], [m.yCab, zCh], [m.yCab, m.hCab], [yf + (tipo === 'ambulancia' ? 0.95 : 0.3), m.hCab], [yf + (tipo === 'ambulancia' ? 0.05 : 0.02), m.hVidro]];
  parts.push(
    extrude(pf, 'x', -W, W, (k) => (k === 3 ? GLASS : k === 0 ? '#20252c' : m.cab), (k, q) => {
      if (k === 3) return [{ p: subq(q, 0.15, 0.2, 0.4, 0.75), c: GLASS_HI, o: 0.45 }];
      if (k === 4) {
        // frente: u desce do para-brisa ao chão, v cruza a largura
        return [
          { p: subq(q, 0.5, 0.06, 0.66, 0.24), c: '#f7f3d6', flat: true },
          { p: subq(q, 0.5, 0.76, 0.66, 0.94), c: '#f7f3d6', flat: true },
          { p: subq(q, 0.3, 0.32, 0.72, 0.68), c: '#2d333c' },
          { p: subq(q, 0.82, 0, 1, 1), c: '#2d333c' },
          ...(tipo === 'ambulancia' ? [{ p: subq(q, 0.08, 0.2, 0.2, 0.8), c: '#d8262c' }] : []),
        ];
      }
      if (k === 'cap0' || k === 'cap1') {
        const xd = q[0][0];
        const P = (yy: number, zz: number): V3 => [xd, yy, zz];
        const yv = yf + (tipo === 'ambulancia' ? 0.95 : 0.3);
        const D: Dec[] = [
          // janela lateral acompanhando o para-brisa
          { p: [P(m.yCab - 0.25, m.hVidro + 0.05), P(yf + 0.12, m.hVidro + 0.05), P(yv + 0.08, m.hCab - 0.14), P(m.yCab - 0.25, m.hCab - 0.14)], c: GLASS },
          { p: [P(m.yCab - 0.55, m.hVidro + 0.2), P(m.yCab - 0.35, m.hVidro + 0.2), P(m.yCab - 0.35, m.hCab - 0.25), P(m.yCab - 0.55, m.hCab - 0.25)], c: GLASS_HI, o: 0.4 },
          // saia escura e friso da porta
          { p: [P(yf, zCh), P(m.yCab, zCh), P(m.yCab, zCh + 0.14), P(yf, zCh + 0.14)], c: scale(m.cab, 0.55) },
          { p: [P(m.yCab - 0.12, zCh + 0.1), P(m.yCab - 0.09, zCh + 0.1), P(m.yCab - 0.09, m.hCab - 0.1), P(m.yCab - 0.12, m.hCab - 0.1)], c: scale(m.cab, 0.7) },
        ];
        if (tipo === 'ambulancia') D.push({ p: [P(yf + 0.02, 0.92), P(m.yCab, 0.92), P(m.yCab, 1.04), P(yf + 0.02, 1.04)], c: '#d8262c' });
        if (tipo === 'bombeiros') D.push({ p: [P(yf + 0.02, 1.05), P(m.yCab, 1.05), P(m.yCab, 1.2), P(yf + 0.02, 1.2)], c: '#f4f6f8' });
        return D;
      }
      return undefined;
    }),
  );
  // retrovisores
  for (const sx of [-1, 1]) parts.push(box(sx < 0 ? -W - 0.2 : W, yf + 0.55, m.hVidro, sx < 0 ? -W : W + 0.2, yf + 0.7, m.hVidro + 0.35, '#2d333c'));

  // carroceria (baú)
  const corBau = m.bau;
  parts.push(
    box(-W, m.yBau, m.zBau, W, yr, m.hBau, corBau, (k: BoxKey, q) => {
      const D: Dec[] = [];
      if (k === 'e' || k === 'w') {
        if (tipo === 'ambulancia') {
          D.push({ p: subq(q, 0, 0.2, 1, 0.27), c: '#d8262c' });
          D.push(...cruz(q, 0.55, 0.62, 0.75, '#d8262c'));
          D.push({ p: rq(q, 0.18, 0.66, 0.6, 0.55), c: GLASS });
        }
        if (tipo === 'bombeiros') {
          // compartimentos de equipamento (portas de enrolar) e faixa branca
          for (let i = 0; i < 4; i++) {
            D.push({ p: subq(q, 0.04 + i * 0.24, 0.12, 0.24 + i * 0.24, 0.7), c: '#b9c0c8' });
            for (let j = 0; j < 5; j++) D.push({ p: subq(q, 0.04 + i * 0.24, 0.2 + j * 0.1, 0.24 + i * 0.24, 0.22 + j * 0.1), c: '#8d959e' });
          }
          D.push({ p: subq(q, 0, 0.78, 1, 0.85), c: '#f4f6f8' });
        }
        if (tipo === 'caminhao') {
          for (let i = 1; i < 8; i++) D.push({ p: subq(q, i / 8 - 0.004, 0, i / 8 + 0.004, 1), c: scale(corBau, 0.86) });
          D.push({ p: subq(q, 0, 0, 1, 0.05), c: scale(corBau, 0.7) });
        }
      }
      if (k === 's') {
        // traseira (vista quando o veículo vai para o norte e a câmera está atrás)
        if (tipo === 'ambulancia') {
          D.push({ p: subq(q, 0.495, 0.05, 0.505, 0.95), c: '#9aa3ab' });
          D.push({ p: subq(q, 0.12, 0.55, 0.44, 0.85), c: GLASS });
          D.push({ p: subq(q, 0.56, 0.55, 0.88, 0.85), c: GLASS });
          D.push(...cruz(q, 0.5, 0.33, 0.5, '#d8262c'));
          D.push({ p: subq(q, 0, 0.12, 1, 0.17), c: '#d8262c' });
        }
        if (tipo === 'bombeiros') {
          D.push({ p: subq(q, 0.08, 0.15, 0.45, 0.8), c: '#b9c0c8' }, { p: subq(q, 0.55, 0.15, 0.92, 0.8), c: '#b9c0c8' });
          D.push({ p: subq(q, 0, 0.85, 1, 0.9), c: '#f4f6f8' });
        }
        if (tipo === 'caminhao') {
          D.push({ p: subq(q, 0.495, 0.03, 0.505, 0.97), c: scale(corBau, 0.75) });
          D.push({ p: subq(q, 0.2, 0.3, 0.23, 0.7), c: '#7b828b' }, { p: subq(q, 0.77, 0.3, 0.8, 0.7), c: '#7b828b' });
        }
        const lt = brake ? '#ff3b30' : '#b8322c';
        D.push({ p: subq(q, 0.03, 0.02, 0.13, 0.1), c: lt, flat: brake }, { p: subq(q, 0.87, 0.02, 0.97, 0.1), c: lt, flat: brake });
      }
      if (k === 'top') {
        if (tipo === 'ambulancia') D.push(...cruz(q, 0.5, 0.45, 1.0, '#d8262c'));
        if (tipo === 'caminhao') D.push({ p: inset(q, 0.94), c: scale(corBau, 0.94) });
      }
      return D;
    }),
  );
  // vão entre cabine e baú (caminhões)
  if (m.yBau > m.yCab) parts.push(box(-W * 0.9, m.yCab, zCh, W * 0.9, m.yBau, zCh + 0.3, '#2d333c'));
  // para-choque traseiro
  parts.push(box(-W, yr, zCh - 0.05, W, yr + 0.12, zCh + 0.15, '#2d333c'));

  // escada no teto do caminhão dos bombeiros
  if (tipo === 'bombeiros') {
    const z0 = m.hBau, y0 = m.yBau - 1.3, y1 = yr + 0.3;
    for (const sx of [-0.55, 0.45]) parts.push(box(sx, y0, z0 + 0.15, sx + 0.1, y1, z0 + 0.3, '#d9dee4'));
    for (let yy = y0 + 0.2; yy < y1; yy += 0.45) parts.push(box(-0.45, yy, z0 + 0.19, 0.45, yy + 0.07, z0 + 0.26, '#c3c9d0'));
    parts.push(box(-0.6, y0 + 0.6, z0, -0.4, y0 + 0.8, z0 + 0.15, '#9aa3ab'), box(0.4, y1 - 0.8, z0, 0.6, y1 - 0.6, z0 + 0.15, '#9aa3ab'));
  }

  // giroflex (barra de luzes) em cima da cabine
  if (tipo !== 'caminhao') {
    const yb0 = (tipo === 'ambulancia' ? yf + 1.05 : yf + 0.35), yb1 = yb0 + 0.32, zb = m.hCab;
    const on = (i: number) => luzes && (i + fase) % 2 === 0;
    const corLuz = (i: number) => (i % 2 === 0 ? '#ff2a2a' : tipo === 'ambulancia' ? '#ffffff' : '#ff2a2a');
    const seg = 4;
    for (let i = 0; i < seg; i++) {
      const xa = -0.8 + (1.6 * i) / seg, xb = xa + 1.6 / seg;
      const c = on(i) ? corLuz(i) : i % 2 === 0 ? '#7a2226' : '#c9ced6';
      parts.push({ ...box(xa + 0.01, yb0, zb, xb - 0.01, yb1, zb + 0.2, c), faces: box(xa + 0.01, yb0, zb, xb - 0.01, yb1, zb + 0.2, c).faces.map((f) => ({ ...f, flat: on(i) })) });
      if (on(i)) glows.push({ p: [(xa + xb) / 2, (yb0 + yb1) / 2, zb + 0.2], r: 13, c: corLuz(i) === '#ffffff' ? '#ff6b6b' : corLuz(i) });
    }
    parts.push(box(-0.85, yb0 - 0.03, zb - 0.02, 0.85, yb1 + 0.03, zb + 0.02, '#2d333c'));
    // luzes nos cantos de cima da traseira
    for (const sx of [-1, 1]) {
      const lit = luzes && (sx > 0 ? fase : 1 - fase) === 1;
      const xa = sx < 0 ? -W + 0.05 : W - 0.3;
      parts.push({ ...box(xa, yr - 0.02, m.hBau - 0.3, xa + 0.25, yr + 0.06, m.hBau - 0.08, lit ? '#ff2a2a' : '#7a2226'), bias: 0 });
      if (lit) glows.push({ p: [xa + 0.12, yr + 0.07, m.hBau - 0.19], n: [0, 1, 0], r: 10, c: '#ff2a2a' });
    }
  }
  if (brake) glows.push({ p: [-W + 0.15, yr + 0.02, m.zBau + 0.2], n: [0, 1, 0], r: 6, c: '#ff3b30' }, { p: [W - 0.15, yr + 0.02, m.zBau + 0.2], n: [0, 1, 0], r: 6, c: '#ff3b30' });
  if (tipo === 'ambulancia' || tipo === 'bombeiros') {
    // faróis acesos na frente quando em atendimento
    if (luzes) glows.push({ p: [-0.75, yf - 0.02, 0.85], n: [0, -1, 0], r: 6, c: '#fff4c2' }, { p: [0.75, yf - 0.02, 0.85], n: [0, -1, 0], r: 6, c: '#fff4c2' });
  }

  // rodas: só a face de fora aparece; ficam atrás da carroceria (bias), e a parte de baixo aparece
  for (const wy of m.rodas)
    for (const wx of [-1, 1]) {
      const x0 = wx < 0 ? -W - 0.02 : W - 0.25, x1 = wx < 0 ? -W + 0.25 : W + 0.02;
      const r = m.rRoda;
      const p = extrude(circle(r, 12), 'x', x0, x1, TIRE, (k, q) => ((k === 'cap0' && wx < 0) || (k === 'cap1' && wx > 0) ? [{ p: inset(q, 0.55), c: '#c9ced6' }, { p: inset(q, 0.2), c: '#7c848f' }] : undefined));
      parts.push({ ...p, faces: p.faces.map((f) => ({ ...f, p: f.p.map(([a, b, c]): V3 => [a, b + wy, c + r]) })), center: [p.center[0], p.center[1] + wy, p.center[2] + r], bias: -50 });
    }
  return tfObj({ parts, glows, shadow: true }, chain(T(x, y), Rz(heading)));
}
