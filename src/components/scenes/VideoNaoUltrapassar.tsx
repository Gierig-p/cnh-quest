/**
 * Vídeo do cartão c3-onde-nao-ultrapassar ("Onde não ultrapassar"), lote de 15/11/2026.
 * Um trecho por fala (tempos em content/videos/nao-ultrapassar.json).
 * Aqui a estrada tem curva e subida: a pista é montada em tiras a partir da linha do meio.
 */
import { box, camLook, flat, lines, rect, seg, type Obj, type Part, type V2, type V3 } from './engine';
import { bench, building, bush, car, grassPatches, person, sidewalk, tree, zebra, asphalt } from './models';
import { utilitario } from './veiculos';
import { bairro, cruzamento } from './Mundo1';
import { ACOST, campo, estrada } from './Mundo2';
import { MENINO, RAPAZ, SENHORA, SUBIDA, Y_TOPO, H, abrigo, altura, noMorro, onibus } from './Mundo3';
import { VERMELHO, VOCE, ease, fazerVideo, janela, lerp, proibido, tag, type Quadro } from './videoBase';
import tempos from '../../content/videos/nao-ultrapassar.json';

const DIR = 1.75, ESQ = -1.75;
const CONTINUA = estrada('continua');
const CAMPO = campo(6);

/* ---------------- curva para a direita, escondida pelas árvores ---------------- */

const R = 22, Y_CURVA = -10;
/** ponto da linha do meio a `s` metros do começo (y = 40), com o rumo (0 = norte, π/2 = leste) */
function caminho(s: number): { p: V2; rumo: number; dentro: V2 } {
  const reta = 40 - Y_CURVA;
  if (s <= reta) return { p: [0, 40 - s], rumo: 0, dentro: [1, 0] };
  const fi = Math.min(Math.PI / 2, (s - reta) / R);
  const c: V2 = [R, Y_CURVA];
  const p: V2 = [c[0] - R * Math.cos(fi), c[1] - R * Math.sin(fi)];
  const dentro: V2 = [Math.cos(fi), Math.sin(fi)];
  const resto = s - reta - (Math.PI / 2) * R;
  if (resto > 0) return { p: [R + resto, Y_CURVA - R], rumo: Math.PI / 2, dentro: [0, 1] };
  return { p, rumo: fi, dentro };
}
/** ponto deslocado `off` metros para dentro da curva (positivo = pista da direita de quem sobe) */
function naPista(s: number, off: number): { x: number; y: number; rumo: number } {
  const c = caminho(s);
  return { x: c.p[0] + c.dentro[0] * off, y: c.p[1] + c.dentro[1] * off, rumo: c.rumo };
}

const CURVA: Part[] = (() => {
  const out: Part[] = [...grassPatches(-50, -70, 60, 40, 8)];
  const N = 70, L = 110;
  const borda = (s: number, off: number): V2 => {
    const q = naPista(s, off);
    return [q.x, q.y];
  };
  for (let i = 0; i < N; i++) {
    const s0 = (i / N) * L, s1 = ((i + 1) / N) * L;
    out.push(flat([borda(s0, -4.2), borda(s1, -4.2), borda(s1, 4.2), borda(s0, 4.2)], '#c9b48a'));
  }
  for (let i = 0; i < N; i++) {
    const s0 = (i / N) * L, s1 = ((i + 1) / N) * L;
    out.push(flat([borda(s0, -3.6), borda(s1, -3.6), borda(s1, 3.6), borda(s0, 3.6)], '#5b636e'));
  }
  const linha = (off: number): V3[] => Array.from({ length: N + 1 }, (_, i) => [...borda((i / N) * L, off), 0] as V3);
  out.push(lines([
    { p: linha(0), c: '#f2c21b', w: 1.5 },
    { p: linha(3.4), c: '#eeeeea', w: 0.9 },
    { p: linha(-3.4), c: '#eeeeea', w: 0.9 },
  ]));
  return out;
})();
const CURVA_OBJS: Obj[] = [
  // mata fechada por dentro da curva: tapa a vista de quem vem
  tree(6.5, -12, 1.25, 1), tree(9, -17, 1.3, 2), tree(7.5, -21, 1.2, 3), tree(12, -22, 1.25, 4), tree(10.5, -14, 1.2, 5),
  tree(14, -17.5, 1.3, 1), tree(6, -7, 1.1, 2), bush(5.6, -15, 1.1, 1), bush(8, -9.5, 1.0, 2), bush(12, -26, 1.1, 3),
  tree(-7, 4, 1.1, 3), tree(-8, -18, 1.2, 4), tree(-9, -34, 1.1, 5), tree(-6.5, 18, 1.0, 1),
  tree(26, -40, 1.1, 2), tree(14, -42, 1.2, 3), bush(-6, -5, 0.9, 2),
];
/** carro que vem de frente pela curva (pista da esquerda de quem sobe) */
function contraCurva(s: number, cor = '#e0412f'): Obj {
  const q = naPista(s, -1.75);
  return car({ x: q.x, y: q.y, heading: q.rumo + Math.PI, color: cor });
}

/* ---------------- subida: a pista sobe até o topo e some do outro lado ---------------- */

// a pista da subida (SUBIDA, altura, noMorro) mora em Mundo3.tsx, para a cena parada da w3-rua-2 usar a mesma

/* ---------------- passagem de nível, ponte e faixa ---------------- */

const Y_TRILHO = -16;
const TRILHO: Part[] = [
  ...CONTINUA,
  rect(-50, Y_TRILHO - 1.6, 50, Y_TRILHO + 1.6, '#9c8f7e', 0.02),
  ...Array.from({ length: 50 }, (_, i) => rect(-49 + i * 2, Y_TRILHO - 1.3, -48.4 + i * 2, Y_TRILHO + 1.3, '#6b4f36', 0.03)),
  rect(-50, Y_TRILHO - 0.8, 50, Y_TRILHO - 0.68, '#b8bec6', 0.06),
  rect(-50, Y_TRILHO + 0.68, 50, Y_TRILHO + 0.8, '#b8bec6', 0.06),
];
/** placa em X (cruz de santo andré) que avisa a passagem de nível */
function cruzX(x: number, y: number): Obj {
  return {
    parts: [
      box(x - 0.07, y - 0.07, 0, x + 0.07, y + 0.07, 2.6, '#eeeeea'),
      seg([x - 0.75, y - 0.12, 1.85], [x + 0.75, y - 0.12, 2.75], 0.22, '#f4f4f0', 0.05),
      seg([x + 0.75, y - 0.14, 1.85], [x - 0.75, y - 0.14, 2.75], 0.22, '#f4f4f0', 0.05),
    ],
    shadow: true,
  };
}

const Y_RIO0 = -34, Y_RIO1 = -14;
const PONTE: Part[] = [
  ...CONTINUA,
  rect(-50, Y_RIO0, -ACOST - 0.7, Y_RIO1, '#4f8fc6', 0.01),
  rect(ACOST + 0.7, Y_RIO0, 50, Y_RIO1, '#4f8fc6', 0.01),
  rect(-50, Y_RIO0 - 0.6, -ACOST - 0.7, Y_RIO0, '#b59f78', 0.01),
  rect(ACOST + 0.7, Y_RIO0 - 0.6, 50, Y_RIO0, '#b59f78', 0.01),
  rect(-50, Y_RIO1, -ACOST - 0.7, Y_RIO1 + 0.6, '#b59f78', 0.01),
  rect(ACOST + 0.7, Y_RIO1, 50, Y_RIO1 + 0.6, '#b59f78', 0.01),
];
const PONTE_OBJS: Obj[] = [
  ...[-1, 1].map((s) => ({ parts: [box(s * (ACOST + 0.55) - 0.15, Y_RIO0 - 1, 0, s * (ACOST + 0.55) + 0.15, Y_RIO1 + 1, 0.9, '#c3c8cf')], shadow: true })),
  tree(-11, -8, 1.1, 2), tree(12, -6, 1.1, 3), tree(-12, -42, 1.2, 4), tree(11, -44, 1.1, 5), bush(9, -11, 0.9, 1),
];

/** rua de bairro de mão dupla com faixa de pedestres */
const Y_ZEBRA = -18;
const RUA: Part[] = [
  ...grassPatches(-40, -60, 40, 40, 3),
  ...asphalt(-3.5, -60, 3.5, 40, 6),
  rect(-0.08, -60, 0.08, 40, '#f2c21b'),
  ...sidewalk(3.5, -60, 6.5, 40),
  ...sidewalk(-6.5, -60, -3.5, 40),
  ...zebra(-3.5, Y_ZEBRA - 1.5, 3.5, Y_ZEBRA + 1.5, 'y'),
];
const RUA_OBJS: Obj[] = [
  building({ x0: 8, y0: -34, x1: 16, y1: -22, h: 9, color: '#f1dca6', shop: 'w', seed: 5 }),
  building({ x0: 8, y0: -14, x1: 15, y1: -2, h: 7, color: '#9fc3e6', shop: 'w', seed: 2 }),
  building({ x0: -16, y0: -30, x1: -8, y1: -20, h: 10, color: '#cfe7c4', shop: 'e', seed: 3 }),
  building({ x0: -16, y0: -12, x1: -8, y1: 0, h: 8, color: '#d9e3f0', shop: 'e', seed: 6 }),
  tree(5.2, -6, 0.85, 1), tree(-5.2, -26, 0.9, 2), tree(5.2, -30, 0.85, 3),
];

/* ---------------- ônibus no ponto ---------------- */

const PONTO: Part[] = [
  ...grassPatches(-40, -50, 40, 40, 6),
  ...asphalt(-3.5, -50, 3.5, 40, 4),
  lines([{ p: [[0, -50, 0], [0, 40, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
  ...sidewalk(3.5, -50, 6.6, 40),
  ...sidewalk(-6.6, -50, -3.5, 40),
  rect(3.25, -17, 3.4, -5, '#f2c21b'),
];
const YB = -11;
const PONTO_OBJS: Obj[] = [
  building({ x0: 8.1, y0: -30, x1: 15.6, y1: -19, h: 9, color: '#f1dca6', shop: 'w', seed: 5 }),
  building({ x0: 8.1, y0: -18, x1: 16.6, y1: -6, h: 12, color: '#9fc3e6', shop: 'w', seed: 2 }),
  building({ x0: -15.6, y0: -26, x1: -8.1, y1: -12, h: 10, color: '#cfe7c4', shop: 'e', seed: 3 }),
  abrigo(5.6, -13.5, -10),
  bench(5.25, -11.8, Math.PI / 2),
  tree(5.4, -2, 0.85, 2),
  tree(-5.2, -8, 0.9, 1),
  onibus(DIR, YB),
  person(3.95, YB + 0.6, SENHORA, 0.7, Math.PI / 2, 1.2),
  person(5.0, YB - 0.6, RAPAZ, 0, Math.PI * 0.6, 1.2),
];

/* ---------------- trechos ---------------- */

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. há lugares em que é proibido ultrapassar
    case 0: {
      const yt = -2 * lt, yv = 9 - 2 * lt;
      return {
        cam: camLook(0.6, yv - 6, 0, 14, 40, 8.4),
        ground: CONTINUA,
        objs: [...CAMPO, utilitario({ x: DIR, y: yt, tipo: 'caminhao' }), car({ x: DIR, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {tag(pr, [DIR, yv + 0.4, 2.2], 'Você')}
            {proibido(pr, [ESQ, yt - 6, 1.2], ease((lt - 0.5) / 0.3), 13)}
          </>
        ),
      };
    }
    // 1. você não enxerga quem vem de frente (a curva com mata esconde o carro)
    case 1: {
      const sv = 38 + 1.2 * lt;
      const v = naPista(sv, 1.75);
      const so = 95 - 6.5 * lt;
      const aparece = so < 70;
      return {
        cam: camLook(4, -11, 0, 16, 40, 7.4),
        ground: CURVA,
        objs: [...CURVA_OBJS, car({ x: v.x, y: v.y, heading: v.rumo, color: VOCE }), contraCurva(so)],
        over: (pr) => (
          <>
            {tag(pr, [v.x, v.y + 0.4, 2.2], 'Você')}
            {tag(pr, [9, -18, 4.2], 'Quem vem de frente?', janela(lt, 0.6, aparece ? 2.6 : 99))}
            {aparece && tag(pr, [naPista(so, -1.75).x, naPista(so, -1.75).y, 2.2], 'Não dava para ver', ease((70 - so) / 2.5))}
          </>
        ),
      };
    }
    // 2. pista única de mão dupla: nem na curva, nem na subida sem boa visão
    case 2: {
      if (lt < d * 0.5) {
        const v = naPista(24 + 1.4 * lt, 1.75);
        const so = 90 - 4 * lt;
        return {
          cam: camLook(3.5, -10, 0, 16, 42, 8.2),
          ground: CURVA,
          objs: [...CURVA_OBJS, car({ x: v.x, y: v.y, heading: v.rumo, color: VOCE }), utilitario({ x: naPista(36 + 1.4 * lt, 1.75).x, y: naPista(36 + 1.4 * lt, 1.75).y, tipo: 'caminhao' }), contraCurva(so)],
          over: (pr) => (
            <>
              {tag(pr, [-4, 2, 0.2], 'Curva', ease((lt - 0.3) / 0.3))}
              {proibido(pr, [-1.2, -6, 1.0], ease((lt - 0.8) / 0.3), 12)}
            </>
          ),
        };
      }
      const l2 = lt - d * 0.5;
      const yt = -8 - 1.2 * l2, yv = 3 - 1.2 * l2;
      const yo = -60 + 5 * l2;
      const visivel = yo > Y_TOPO - 2;
      return {
        cam: camLook(0.8, -10, 0, 12, 22, 8.2, 160, 115),
        ground: SUBIDA,
        objs: [noMorro(DIR, yt, 0, '#4f7fc4'), noMorro(DIR, yv, 0, VOCE), ...(visivel ? [noMorro(ESQ, yo, Math.PI, '#e0412f')] : [])],
        over: (pr) => (
          <>
            {tag(pr, [0, Y_TOPO, H + 0.2], 'Subida', ease((l2 - 0.2) / 0.3))}
            {proibido(pr, [ESQ, -16, altura(-16) + 1.0], ease((l2 - 0.6) / 0.3), 12)}
          </>
        ),
      };
    }
    // 3. passagem de nível: a via cruza o trilho do trem
    case 3: {
      const yv = 6 - 1.6 * lt;
      return {
        cam: camLook(1.2, -10, 0, 14, 40, 9),
        ground: TRILHO,
        objs: [...CAMPO, cruzX(4.4, Y_TRILHO + 3), cruzX(-4.4, Y_TRILHO - 3), car({ x: DIR, y: yv - 9, color: '#4f7fc4' }), car({ x: DIR, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {tag(pr, [-12, Y_TRILHO, 0.2], 'Trilho do trem', ease((lt - 0.3) / 0.4))}
            {tag(pr, [0, Y_TRILHO - 6, 0.2], 'Passagem de nível', ease((lt - 1.4) / 0.4))}
            {proibido(pr, [ESQ, Y_TRILHO + 4, 1.0], ease((lt - 2.0) / 0.3), 12)}
          </>
        ),
      };
    }
    // 4. pontes e viadutos; faixas de pedestres
    case 4: {
      if (lt < d * 0.5) {
        const yv = 0 - 1.6 * lt;
        return {
          cam: camLook(0.6, -18, 0, 14, 42, 8.2),
          ground: PONTE,
          objs: [...PONTE_OBJS, car({ x: DIR, y: yv - 9, color: '#4f7fc4' }), car({ x: DIR, y: yv, color: VOCE })],
          over: (pr) => (
            <>
              {tag(pr, [-12, -24, 0.2], 'Ponte', ease((lt - 0.2) / 0.3))}
              {proibido(pr, [ESQ, -24, 1.0], ease((lt - 0.6) / 0.3), 12)}
            </>
          ),
        };
      }
      const l2 = lt - d * 0.5;
      return {
        cam: camLook(0.8, Y_ZEBRA + 6, 0, 16, 44, 10),
        ground: RUA,
        objs: [...RUA_OBJS, car({ x: DIR, y: Y_ZEBRA + 4.6, color: '#4f7fc4', brake: true }), car({ x: DIR, y: Y_ZEBRA + 11, color: VOCE, brake: true }), person(4.6 - 1.1 * l2, Y_ZEBRA, MENINO, l2 * 6, -Math.PI / 2, 1.1)],
        over: (pr) => (
          <>
            {tag(pr, [-1.0, Y_ZEBRA - 2.4, 0.2], 'Faixa de pedestres', ease((l2 - 0.2) / 0.3))}
            {proibido(pr, [ESQ, Y_ZEBRA + 6, 1.0], ease((l2 - 0.6) / 0.3), 12)}
          </>
        ),
      };
    }
    // 5. nos cruzamentos e perto deles
    case 5: {
      const cy = -16;
      const yv = 10 - 1.2 * lt;
      return {
        cam: camLook(0.8, -11, 0, 16, 44, 9.5),
        ground: [...cruzamento(cy), rect(-3.5, cy - 3.5, 3.5, cy + 3.5, VERMELHO, 0.01, 0.2 * ease((lt - 0.4) / 0.4))],
        objs: [...bairro(cy, 1), car({ x: DIR, y: yv - 8, color: '#4f7fc4' }), car({ x: DIR, y: yv, color: VOCE }), car({ x: -14 + 5 * lt, y: cy + 1.75, heading: Math.PI / 2, color: '#e0412f' })],
        over: (pr) => (
          <>
            {tag(pr, [0, cy - 6, 0.2], 'Cruzamento', ease((lt - 0.3) / 0.4))}
            {proibido(pr, [ESQ, yv - 4, 1.0], ease((lt - 0.8) / 0.3), 12)}
          </>
        ),
      };
    }
    // 6. ônibus parado no ponto: reduza, redobre a atenção ou pare
    // 7. alguém pode surgir na frente dele
    case 6:
    case 7: {
      const lt6 = k === 6 ? lt : 5 + lt;
      const yv = lerp(10, 4.5, ease(lt6 / 4));
      const xm = k === 7 ? lerp(2.6, -1.3, ease((lt - 0.2) / 1.2)) : 3.0;
      return {
        cam: camLook(1.6, k === 7 ? -9 : -6, 0, 16, 44, 9.5),
        ground: PONTO,
        objs: [
          ...PONTO_OBJS,
          ...(k === 7 ? [person(xm, YB - 6.2, MENINO, lt * 7, -Math.PI / 2, 1.0)] : []),
          car({ x: DIR, y: yv, color: VOCE, brake: lt6 > 0.4 }),
        ],
        over: (pr) =>
          k === 6 ? (
            <>
              {tag(pr, [DIR, yv + 0.4, 2.2], 'Reduza', janela(lt, 0.3, 2.6))}
              {tag(pr, [DIR, yv + 0.4, 2.2], 'Atenção', ease((lt - 2.8) / 0.4))}
            </>
          ) : (
            tag(pr, [xm, YB - 6.2, 2.0], 'Alguém pode surgir', ease((lt - 0.9) / 0.3))
          ),
      };
    }
    // 8. para guardar: se não dá para ver quem vem, não dá para passar
    default: {
      const v = naPista(22 + 0.8 * lt, 1.75);
      return {
        cam: camLook(3, -8, 0, 16, 40, 8.6),
        ground: CURVA,
        objs: [...CURVA_OBJS, car({ x: v.x, y: v.y, heading: v.rumo, color: VOCE }), utilitario({ x: naPista(33 + 0.8 * lt, 1.75).x, y: naPista(33 + 0.8 * lt, 1.75).y, tipo: 'caminhao' })],
        over: (pr) => (
          <>
            {tag(pr, [9, -18, 4.2], 'Não vê quem vem?', ease((lt - 0.3) / 0.4))}
            {tag(pr, [-1.75, -4, 0.2], 'Não passe', ease((lt - 1.6) / 0.4))}
            {proibido(pr, [-1.75, -10, 1.0], ease((lt - 1.6) / 0.3), 12)}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
