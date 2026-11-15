/**
 * Peças comuns dos vídeos dos cartões de conceito (formato aprovado em 15/11/2026 com o VideoFaixas).
 * Cada vídeo é uma lista de trechos, um por fala; `fazerVideo` cuida da linha do tempo e do piscar escuro
 * nos cortes. Os tempos vêm de src/content/videos/<id>.json (gerados com a narração).
 */
import type { ReactNode } from 'react';
import { Scene3D, box, camLook, circle, extrude, lines, rect, rng, scale, seg, subq, tfObj, chain, T, Rz, type Obj, type Part, type V2, type V3 } from './engine';
import { asphalt, building, bush, grassPatches, lampPost, sidewalk, tree } from './models';
import { Tag } from './iso';

export type Pr = (p: V3) => V2;
export const VOCE = '#e9eef3';
export const VERDE = '#5fd08a';
export const AZUL = '#5aa0ff';
export const AMARELO = '#ffd84a';
export const VERMELHO = '#ff5a5f';

export const clamp = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (v: number) => {
  const k = clamp(v);
  return k * k * (3 - 2 * k);
};
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** aparece em `a` e some em `b` (meio segundo de transição) */
export const janela = (lt: number, a: number, b = Infinity, f = 0.4) => ease((lt - a) / f) * (1 - ease((lt - b) / f));
/** pisca da seta: aceso em metade do tempo */
export const pisca = (lt: number, lado: 'l' | 'r' | 'lr' | null) => (lado && Math.floor(lt * 3) % 2 === 0 ? lado : null);

/** etiqueta presa a um ponto da cena */
export const tag = (pr: Pr, p: V3, text: string, o = 1): ReactNode => {
  if (o <= 0.01) return null;
  const [x, y] = pr(p);
  return (
    <g opacity={o}>
      <Tag x={x} y={y - 8} text={text} />
    </g>
  );
};

/** placa redonda de "proibido" (círculo vermelho cortado), em pixels, presa a um ponto da cena */
export const proibido = (pr: Pr, p: V3, o = 1, r = 11): ReactNode => {
  if (o <= 0.01) return null;
  const [x, y] = pr(p);
  const d = r * 0.7;
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill="#fff" stroke="#d93a35" strokeWidth={3.2} />
      <line x1={x - d} y1={y + d} x2={x + d} y2={y - d} stroke="#d93a35" strokeWidth={3.2} />
    </g>
  );
};

/** visto "ok" verde, em pixels */
export const certo = (pr: Pr, p: V3, o = 1, r = 10): ReactNode => {
  if (o <= 0.01) return null;
  const [x, y] = pr(p);
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill="#22b357" stroke="#fff" strokeWidth={2} />
      <path d={`M${x - r * 0.45} ${y} L${x - r * 0.1} ${y + r * 0.38} L${x + r * 0.5} ${y - r * 0.38}`} fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/* ---------------- avenida de mão única, três faixas para o norte ---------------- */

export const A = 5.25;
export const FX = [-3.5, 0, 3.5] as const;
const Y0 = -130, Y1 = 60;

export const AV: Part[] = [
  ...grassPatches(-60, Y0, 60, Y1, 4),
  ...asphalt(-A, Y0, A, Y1, 5),
  lines([
    { p: [[-1.75, Y0, 0], [-1.75, Y1, 0]], c: '#eeeeea', w: 1, dash: '6 6' },
    { p: [[1.75, Y0, 0], [1.75, Y1, 0]], c: '#eeeeea', w: 1, dash: '6 6' },
  ]),
  rect(-A + 0.15, Y0, -A + 0.28, Y1, '#eeeeea'),
  rect(A - 0.28, Y0, A - 0.15, Y1, '#eeeeea'),
  ...sidewalk(A, Y0, A + 3, Y1),
  ...sidewalk(-A - 3, Y0, -A, Y1),
];

export const AV_OBJS: Obj[] = (() => {
  const r = rng(9);
  const cores = ['#9fc3e6', '#f1dca6', '#e9a47c', '#d9e3f0', '#cfe7c4', '#f1d0b0'];
  const out: Obj[] = [];
  for (let y = Y0 + 6; y < Y1 - 10; y += 15) {
    const h1 = 7 + Math.round(r() * 6), h2 = 7 + Math.round(r() * 6);
    out.push(building({ x0: A + 4, y0: y, x1: A + 12, y1: y + 12, h: h1, color: cores[Math.floor(r() * cores.length)], shop: 'w', seed: Math.floor(r() * 9) }));
    out.push(building({ x0: -A - 12, y0: y + 4, x1: -A - 4, y1: y + 15, h: h2, color: cores[Math.floor(r() * cores.length)], shop: 'e', seed: Math.floor(r() * 9) }));
    out.push(tree(A + 1.6, y + 13.5, 0.85, Math.floor(r() * 6)));
    out.push(tree(-A - 1.6, y + 2, 0.9, Math.floor(r() * 6)));
  }
  for (let y = Y0 + 20; y < Y1; y += 30) {
    out.push(lampPost(A + 1.4, y, -1));
    out.push(lampPost(-A - 1.4, y + 15, 1));
  }
  out.push(bush(A + 2.4, -2, 0.7, 1));
  return out;
})();

/** pintura transparente sobre uma faixa da avenida */
export const faixa = (i: number, cor: string, o: number): Part[] => (o > 0.01 ? [rect(FX[i] - 1.7, Y0, FX[i] + 1.7, Y1, cor, 0.01, o)] : []);

/** chuva que cai (os riscos descem com o tempo) */
export function chuva(t: number, o: number): ReactNode {
  if (o <= 0.01) return null;
  const r = rng(31);
  const riscos = Array.from({ length: 110 }, () => [r() * 340 - 10, r() * 220, 7 + r() * 6] as const);
  const d = t * 240;
  return (
    <g opacity={o}>
      <rect x={0} y={0} width={320} height={200} fill="#5d6b7a" opacity={0.42} />
      <g stroke="#e9f1f8" strokeWidth={0.9} strokeLinecap="round" opacity={0.75}>
        {riscos.map(([x, y, l], i) => {
          const yy = ((y + d) % 220) - 10;
          return <line key={i} x1={x} y1={yy} x2={x - l * 0.28} y2={yy + l} />;
        })}
      </g>
    </g>
  );
}

/** moto com piloto de capacete, indo para o norte quando `face` = 0 */
export function moto(x: number, y: number, face = 0, cor = '#2f80ed'): Obj {
  const parts: Part[] = [];
  for (const cy of [-0.72, 0.72]) parts.push(extrude(circle(0.33, 12).map(([a, b]): V2 => [cy + a, 0.33 + b]), 'x', -0.09, 0.09, '#262b33'));
  parts.push(box(-0.2, -0.55, 0.42, 0.2, 0.5, 0.8, cor));
  parts.push(box(-0.16, -0.15, 0.8, 0.16, 0.6, 0.92, '#1f2630'));
  parts.push(box(-0.12, -0.8, 0.5, 0.12, -0.55, 1.05, scale(cor, 0.75)));
  parts.push(seg([-0.32, -0.62, 1.12], [0.32, -0.62, 1.12], 0.06, '#1f2630'));
  // piloto
  parts.push(seg([0, 0.15, 0.95], [0, -0.1, 1.55], 0.42, '#3a3f47', 0.26));
  for (const s of [-1, 1]) {
    parts.push(seg([s * 0.2, -0.05, 1.5], [s * 0.3, -0.6, 1.15], 0.1, '#3a3f47'));
    parts.push(seg([s * 0.16, 0.1, 0.95], [s * 0.2, -0.3, 0.6], 0.14, '#33415a'));
  }
  parts.push(box(-0.19, -0.3, 1.55, 0.19, 0.08, 1.92, '#f4f1e6', (k, q) => (k === 'n' ? [{ p: subq(q, 0.12, 0.35, 0.88, 0.8), c: '#2b3a48' }] : undefined)));
  return tfObj({ parts, shadow: true }, chain(T(x, y), Rz(face)));
}

/* ---------------- linha do tempo ---------------- */

export interface Quadro {
  cam: ReturnType<typeof camLook>;
  ground: Part[];
  objs: Obj[];
  over?: (pr: Pr) => ReactNode;
}

/** `trecho(k, lt, d)`: quadro da fala k, `lt` segundos depois do início do trecho, que dura `d` */
export function fazerVideo(tempos: { dur: number; falas: { ini: number; fim: number }[] }, trecho: (k: number, lt: number, d: number) => Quadro) {
  const DUR = tempos.dur;
  /** começo de cada trecho: meio segundo antes da fala (o corte chega antes da voz) */
  const INI = tempos.falas.map((f, i) => (i === 0 ? 0 : f.ini - 0.5));
  const falaEm = (t: number): number => {
    let k = 0;
    for (let i = 0; i < INI.length; i++) if (t >= INI[i]) k = i;
    return k;
  };
  function Video({ t = 0, id = 'v' }: { t?: number; id?: string }) {
    const k = falaEm(t);
    const fim = k + 1 < INI.length ? INI[k + 1] : DUR;
    const q = trecho(k, t - INI[k], fim - INI[k]);
    // corte: um piscar escuro curto na troca de trecho
    const perto = Math.min(...INI.slice(1).map((b) => Math.abs(t - b)));
    const corte = Math.max(0, 1 - perto / 0.18);
    return (
      <Scene3D
        id={id}
        cam={q.cam}
        ground={q.ground}
        objs={q.objs}
        overlay={(pr) => (
          <>
            {q.over?.(pr)}
            {corte > 0 && <rect x={0} y={0} width={320} height={200} fill="#0b1220" opacity={0.85 * corte} />}
          </>
        )}
      />
    );
  }
  return { Video, DUR, falaEm };
}

/* ---------------- caminhos (virar, retorno) ---------------- */

/** pontos de um arco de círculo, do ângulo a0 ao a1 (radianos; 0 = leste, π/2 = sul) */
export const arco = (cx: number, cy: number, r: number, a0: number, a1: number, n = 14): V2[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

/**
 * Caminho feito de retas e arcos (uma lista de pontos). `em(s)` dá a posição e a direção do carro
 * a `s` metros do começo (direção no padrão do `car`: 0 = norte, π/2 = leste). `total` é o comprimento.
 */
export function caminho(pts: V2[]) {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = acc[acc.length - 1];
  const em = (s: number) => {
    const d = Math.max(0, Math.min(total, s));
    let i = 1;
    while (i < pts.length - 1 && acc[i] < d) i++;
    const [a, b] = [pts[i - 1], pts[i]];
    const k = acc[i] > acc[i - 1] ? (d - acc[i - 1]) / (acc[i] - acc[i - 1]) : 0;
    return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, heading: Math.atan2(b[0] - a[0], -(b[1] - a[1])) };
  };
  return { em, total, pts };
}

/** linha tracejada no chão mostrando um caminho (seta de manobra), em pixels */
export function rastro(pr: Pr, pts: V2[], cor: string, o = 1, ponta = true): ReactNode {
  if (o <= 0.01 || pts.length < 2) return null;
  const P = pts.map(([x, y]) => pr([x, y, 0.05]));
  const d = 'M' + P.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join('L');
  const [a, b] = [P[P.length - 2], P[P.length - 1]];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const s = 5;
  const tri = `M${b[0] + Math.cos(ang) * s} ${b[1] + Math.sin(ang) * s}L${b[0] + Math.cos(ang + 2.4) * s} ${b[1] + Math.sin(ang + 2.4) * s}L${b[0] + Math.cos(ang - 2.4) * s} ${b[1] + Math.sin(ang - 2.4) * s}Z`;
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke="#0b1220" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
      <path d={d} fill="none" stroke={cor} strokeWidth={2.4} strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />
      {ponta && <path d={tri} fill={cor} />}
    </g>
  );
}

/* ---------------- luzes (lote 4: farol piscando, pisca-alerta) ---------------- */

/** escurece a cena: noite (`o` alto) ou fim de tarde (`o` baixo, cor arroxeada) */
export const escuro = (o: number, cor = '#070d22'): ReactNode => (o > 0.01 ? <rect x={0} y={0} width={320} height={200} fill={cor} opacity={o} /> : null);

/** luzinha redonda em pixels, presa a um ponto da cena */
export function luz(pr: Pr, p: V3, r: number, cor: string, k: string | number = 0): ReactNode {
  const [x, y] = pr(p);
  return (
    <g key={k}>
      <circle cx={x} cy={y} r={r * 2.2} fill={cor} opacity={0.25} />
      <circle cx={x} cy={y} r={r} fill={cor} />
    </g>
  );
}

/** os dois faróis de um carro em (x, y); `dir` -1 = indo para o norte, 1 = indo para o sul */
export const farolPar = (pr: Pr, x: number, y: number, dir: 1 | -1, r = 1.6) => [-0.6, 0.6].map((dx) => luz(pr, [x + dx, y + dir * 2.15, 0.75], r, '#fff6c8', `f${dx}`));

/** facho no chão à frente do carro: luz baixa (k = 0) até luz alta (k = 1) */
export function facho(pr: Pr, x: number, y: number, dir: 1 | -1, k: number, o = 0.3): ReactNode {
  if (o <= 0.01) return null;
  const yf = y + dir * 2.1, alcance = lerp(8, 28, k), abre = lerp(2.2, 4.4, k);
  const pts: V3[] = [[x - 0.7, yf, 0], [x + 0.7, yf, 0], [x + abre, yf + dir * alcance, 0], [x - abre, yf + dir * alcance, 0]];
  const d = 'M' + pts.map((p) => pr(p).map((v) => v.toFixed(1)).join(' ')).join('L') + 'Z';
  return <path d={d} fill="#fff4c8" opacity={o} />;
}

/** triângulo de sinalização no chão, virado para quem vem do sul */
export function triangulo(x: number, y: number): Obj {
  const s = 0.75, h = s * 0.87;
  const fora: V2[] = [[-s / 2, 0.06], [s / 2, 0.06], [0, 0.06 + h]];
  const dentro: V2[] = [[-s / 4, 0.06 + h * 0.2], [s / 4, 0.06 + h * 0.2], [0, 0.06 + h * 0.62]];
  return {
    parts: [
      box(-0.3, -0.12, 0, 0.3, 0.12, 0.05, '#2d333c'),
      extrude(fora, 'y', 0, 0.04, (k) => (k === 'cap1' ? '#ef2c30' : '#b8322c')),
      extrude(dentro, 'y', 0.041, 0.05, '#f4f1e6'),
    ].map((pt) => tfObj({ parts: [pt] }, T(x, y)).parts[0]),
    shadow: true,
  };
}

/** relógio em pixels; `k` = voltas do ponteiro */
export function relogio(x: number, y: number, k: number, o = 1, r = 9): ReactNode {
  if (o <= 0.01) return null;
  const a = k * Math.PI * 2 - Math.PI / 2, b = (k / 12) * Math.PI * 2 - Math.PI / 2;
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill="#fff" stroke="#22313f" strokeWidth={2} />
      <line x1={x} y1={y} x2={x + Math.cos(b) * r * 0.5} y2={y + Math.sin(b) * r * 0.5} stroke="#22313f" strokeWidth={2} strokeLinecap="round" />
      <line x1={x} y1={y} x2={x + Math.cos(a) * r * 0.78} y2={y + Math.sin(a) * r * 0.78} stroke="#d93a35" strokeWidth={1.4} strokeLinecap="round" />
    </g>
  );
}

/* ---------------- rua de mão dupla com meio-fio (parar, estacionar, portas) ---------------- */

/** meia largura do asfalto; a calçada vai de RA até RC */
export const RA = 3.4, RC = 6.2;
/** x do carro estacionado junto ao meio-fio da direita */
export const XM = RA - 1.15;

export function ruaChao(extra: Part[] = []): Part[] {
  return [
    ...grassPatches(-40, -60, 40, 40, 8),
    ...asphalt(-RA, -60, RA, 40, 2),
    lines([{ p: [[0, -60, 0], [0, 40, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
    ...extra,
    ...sidewalk(RA, -60, RC, 40),
    ...sidewalk(-RC, -60, -RA, 40),
  ];
}

/** `baixo`: prédios do lado esquerdo baixos, para a câmera ver o meio-fio da direita por cima deles */
export function ruaObjs(seed = 0, baixo = false): Obj[] {
  const r = rng(40 + seed);
  const cores = ['#9fc3e6', '#f1dca6', '#e9a47c', '#d9e3f0', '#cfe7c4', '#f1d0b0'];
  const out: Obj[] = [];
  for (let y = -52; y < 30; y += 11) {
    out.push(building({ x0: RC, y0: y, x1: RC + 8, y1: y + 10, h: 6 + Math.round(r() * 5), color: cores[Math.floor(r() * cores.length)], shop: 'w', seed: Math.floor(r() * 9) }));
    out.push(building({ x0: -RC - 8, y0: y + 3, x1: -RC, y1: y + 13, h: baixo ? 2.6 + Math.round(r() * 1) : 6 + Math.round(r() * 5), color: cores[Math.floor(r() * cores.length)], shop: 'e', seed: Math.floor(r() * 9) }));
  }
  for (let y = -46; y < 30; y += 22) {
    out.push(tree(RA + 1.2, y, 0.8, Math.floor(r() * 6)));
    out.push(lampPost(-RA - 1.1, y + 11, 1));
  }
  return out;
}
