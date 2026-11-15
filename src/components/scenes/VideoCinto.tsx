/**
 * Vídeo do cartão c3-cinto-capacete ("Cinto, cadeirinha e capacete"), lote 5 de 15/11/2026.
 * Um trecho por fala (tempos em content/videos/cinto.json).
 * O carro é aberto em cima (sem teto) e vem de frente para a câmera, para ver o cinto de cada um.
 */
import { Rz, Sc, T, box, camLook, chain, circle, extrude, scale, seg, subq, tf, tfObj, type Obj, type Part, type V2, type V3 } from './engine';
import type { Look } from './models';
import { MENINO, MOCA, RAPAZ, SENHORA } from './Mundo3';
import { VOCE, certo, ease, fazerVideo, janela, lerp, proibido, ruaChao, ruaObjs, tag, type Quadro } from './videoBase';
import tempos from '../../content/videos/cinto.json';

const CHAO = ruaChao();
const OBJS = ruaObjs(3, true);
/** faixa da esquerda da rua, onde o carro desce (para o sul, de frente para a câmera) */
const XC = -1.75;
const cam = (y: number, s = 36, x = XC) => camLook(x, y, 0, -12, 48, s);
const CINTO = '#1d232b';
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const BEBE: Look = { skin: '#e2b48f', hair: '#6b4a30', top: '#f6e7a1', bottom: '#f6e7a1' };
const PILOTO: Look = { skin: '#c98a5e', hair: '#2b2420', top: '#3a3f47', bottom: '#33415a' };

/* ---------------- gente sentada ---------------- */

function cabeca(look: Look): Part[] {
  return [
    box(-0.2, -0.12, 1.12, 0.2, 0.24, 1.46, look.skin, (k, q) =>
      k === 'n'
        ? [
            { p: subq(q, 0, 0.8, 1, 1), c: look.hair },
            { p: subq(q, 0.24, 0.42, 0.36, 0.6), c: '#1d2430', flat: true },
            { p: subq(q, 0.64, 0.42, 0.76, 0.6), c: '#1d2430', flat: true },
            { p: subq(q, 0.44, 0.2, 0.56, 0.25), c: '#7a3b33' },
          ]
        : k === 's'
          ? [{ p: subq(q, 0, 0.15, 1, 1), c: look.hair }]
          : k === 'e' || k === 'w'
            ? [{ p: subq(q, 0, 0.55, 1, 1), c: look.hair }]
            : undefined,
    ),
    box(-0.215, -0.13, 1.44, 0.215, 0.25, 1.52, look.hair),
  ];
}

/**
 * Pessoa sentada, olhando para o norte, com o assento em z 0,5.
 * `cinto` de 0 a 1 puxa a faixa do ombro (lado `lado`) até o quadril; em 1 aparece a faixa da cintura.
 */
function sentado(look: Look, cinto: number, lado: 1 | -1, volante = false): Part[] {
  const P: Part[] = [];
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -0.16 : 0.02, x1 = s < 0 ? -0.02 : 0.16;
    P.push(box(x0, -0.42, 0.5, x1, 0.05, 0.64, look.bottom));
    P.push(box(x0 + 0.01, -0.52, 0.12, x1 - 0.01, -0.4, 0.6, look.bottom));
  }
  P.push(box(-0.19, -0.02, 0.6, 0.19, 0.2, 1.1, look.top));
  for (const s of [-1, 1]) P.push(volante ? seg([s * 0.24, 0.05, 1.02], [s * 0.19, -0.48, 0.98], 0.1, look.top) : seg([s * 0.24, 0.05, 1.02], [s * 0.2, -0.28, 0.7], 0.1, look.top));
  P.push(...cabeca(look));
  if (cinto > 0.01) {
    const a: V3 = [lado * 0.2, -0.05, 1.05], b: V3 = [-lado * 0.17, -0.06, 0.64];
    const k = Math.min(1, cinto);
    P.push(seg(a, [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], 0.075, CINTO));
    if (cinto >= 0.99) P.push(seg([-0.19, -0.07, 0.66], [0.19, -0.07, 0.66], 0.075, CINTO));
  }
  return P;
}

/* ---------------- carro aberto ---------------- */

type Banco = 'mot' | 'pas' | 'te' | 'tm' | 'td';
const SEAT: Record<Banco, [number, number]> = { mot: [-0.45, -0.45], pas: [0.45, -0.45], te: [-0.5, 0.8], tm: [0, 0.8], td: [0.5, 0.8] };
interface Lugar {
  look: Look;
  cinto: number;
  /** tamanho (criança < 1) */
  k?: number;
  disp?: 'bebe' | 'cadeira' | 'assento';
  /** posição local (x, y, z) no lugar do banco, para quem está trocando de lugar */
  pos?: V3;
}

function ocupante(b: Banco, L: Lugar): Part[] {
  const [sx, sy] = L.pos ? [L.pos[0], L.pos[1]] : SEAT[b];
  const lado: 1 | -1 = sx > 0.01 ? 1 : -1;
  const out: Part[] = [];
  const cor = '#d0473f';
  if (L.disp === 'bebe') {
    // bebê conforto virado para trás: concha, alça e o bebê deitado
    const conc = '#5a6f8f';
    out.push(box(-0.24, -0.35, 0.5, 0.24, 0.32, 0.72, conc));
    out.push(box(-0.24, -0.42, 0.6, 0.24, -0.3, 1.05, conc));
    out.push(seg([-0.25, -0.05, 0.72], [-0.25, 0.05, 1.1], 0.05, '#3c4a60'), seg([0.25, -0.05, 0.72], [0.25, 0.05, 1.1], 0.05, '#3c4a60'), seg([-0.25, 0.05, 1.1], [0.25, 0.05, 1.1], 0.05, '#3c4a60'));
    out.push(box(-0.13, -0.25, 0.72, 0.13, 0.12, 0.84, BEBE.top));
    out.push(box(-0.12, 0.1, 0.72, 0.12, 0.3, 0.92, BEBE.skin, (k, q) => (k === 'top' ? [{ p: subq(q, 0, 0.6, 1, 1), c: BEBE.hair }] : undefined)));
    out.push(seg([-0.1, -0.05, 0.86], [0.1, -0.2, 0.86], 0.05, CINTO));
    return out.map((p) => tf(p, T(sx, sy, 0)));
  }
  const k = L.k ?? 1;
  let z = L.pos ? L.pos[2] : 0.5 - 0.5 * k;
  if (L.disp === 'cadeira') {
    out.push(box(-0.26, -0.3, 0.5, 0.26, 0.25, 0.62, cor), box(-0.26, 0.13, 0.62, 0.26, 0.26, 1.28, cor));
    for (const s of [-1, 1]) out.push(box(s < 0 ? -0.28 : 0.21, -0.25, 0.62, s < 0 ? -0.21 : 0.28, 0.2, 1.05, scale(cor, 0.85)));
    z = 0.62 - 0.5 * k;
  }
  if (L.disp === 'assento') {
    out.push(box(-0.24, -0.32, 0.5, 0.24, 0.2, 0.7, '#3b7dd8'));
    z = 0.7 - 0.5 * k;
  }
  const corpo = sentado(L.look, L.cinto, lado).map((p) => tf(p, chain(T(0, 0, z), Sc(k))));
  if (L.disp === 'cadeira' && L.cinto > 0.99) {
    // cinto de cinco pontos da cadeirinha
    for (const s of [-1, 1]) corpo.push(seg([s * 0.09, -0.06, z + 0.98 * k], [s * 0.05, -0.08, z + 0.62 * k], 0.06, CINTO));
  }
  return [...out, ...corpo].map((p) => tf(p, T(sx, sy, 0)));
}

/** carro sem teto, de frente para o sul (para a câmera) quando `heading` = π */
function carroAberto(x: number, y: number, cor: string, L: Partial<Record<Banco, Lugar>>, heading = Math.PI): Obj {
  const P: Part[] = [];
  const esc = scale(cor, 0.8);
  P.push(box(-0.88, -2.1, 0.22, 0.88, 2.1, 0.35, '#2b313a'));
  for (const yy of [-1.35, 1.35]) for (const s of [-1, 1]) P.push(extrude(circle(0.34, 12).map(([a, b]): V2 => [yy + a, 0.34 + b]), 'x', s < 0 ? -0.98 : 0.84, s < 0 ? -0.84 : 0.98, '#262b33'));
  for (const s of [-1, 1]) P.push(box(s < 0 ? -0.93 : 0.85, -1.1, 0.35, s < 0 ? -0.85 : 0.93, 1.25, 0.95, cor));
  P.push(
    box(-0.93, -2.15, 0.35, 0.93, -1.1, 0.92, cor, (k, q) =>
      k === 'n'
        ? [
            { p: subq(q, 0.06, 0.45, 0.28, 0.8), c: '#f7f3d6', flat: true },
            { p: subq(q, 0.72, 0.45, 0.94, 0.8), c: '#f7f3d6', flat: true },
            { p: subq(q, 0.34, 0.4, 0.66, 0.75), c: '#2d333c' },
            { p: subq(q, 0, 0, 1, 0.25), c: '#2d333c' },
          ]
        : undefined,
    ),
  );
  P.push(box(-0.85, -1.1, 0.92, 0.85, -0.95, 1.12, '#2a2f37'));
  // para-brisa baixo, só a moldura
  P.push(seg([-0.9, -1.1, 0.92], [-0.9, -0.9, 1.45], 0.06, esc), seg([0.9, -1.1, 0.92], [0.9, -0.9, 1.45], 0.06, esc));
  P.push(box(-0.62, -0.95, 0.95, -0.28, -0.88, 1.25, '#1f2630'));
  P.push(box(-0.93, 1.25, 0.35, 0.93, 2.15, 0.95, cor, (k, q) => (k === 's' ? [{ p: subq(q, 0.05, 0.55, 0.25, 0.85), c: '#b8322c' }, { p: subq(q, 0.75, 0.55, 0.95, 0.85), c: '#b8322c' }] : undefined)));
  // bancos
  for (const s of [-1, 1]) {
    const sx = s * 0.45;
    P.push(box(sx - 0.27, -0.7, 0.35, sx + 0.27, -0.2, 0.5, '#4a505a'), box(sx - 0.27, -0.22, 0.5, sx + 0.27, -0.08, 1.15, '#4a505a'));
  }
  P.push(box(-0.84, 0.55, 0.35, 0.84, 1.05, 0.5, '#4a505a'), box(-0.84, 1.0, 0.5, 0.84, 1.18, 1.1, '#4a505a'));
  for (const b of Object.keys(L) as Banco[]) {
    const l = L[b];
    if (l) P.push(...ocupante(b, l));
  }
  // volante na frente do motorista
  if (L.mot) P.push(...sentadoMaos());
  return tfObj({ parts: P, shadow: true }, chain(T(x, y), Rz(heading)));
}
/** mãos do motorista no volante (pequenas, só a pele) */
function sentadoMaos(): Part[] {
  return [-1, 1].map((s) => box(-0.45 + s * 0.17 - 0.05, -0.95, 1.0, -0.45 + s * 0.17 + 0.05, -0.85, 1.08, '#d7a77f'));
}

/** ponto do mundo para um ponto local do carro virado para o sul */
const pw = (x: number, y: number, lx: number, ly: number, z: number): V3 => [x - lx, y - ly, z];

/** a família de sempre, todos de cinto, com a criança atrás no assento de elevação */
const familia = (cintos = 1): Partial<Record<Banco, Lugar>> => ({
  mot: { look: RAPAZ, cinto: cintos },
  pas: { look: MOCA, cinto: cintos },
  te: { look: SENHORA, cinto: cintos },
  td: { look: MENINO, cinto: cintos, k: 0.8, disp: 'assento' },
});

/* ---------------- moto ---------------- */

interface MotoOpts {
  capacete?: boolean;
  maos?: 1 | 2;
  garupa?: boolean;
}
/** moto com piloto (e passageiro atrás, se `garupa`), indo para o norte quando `face` = 0 */
function motoca(x: number, y: number, face: number, cor: string, { capacete = true, maos = 2, garupa = false }: MotoOpts = {}): Obj {
  const parts: Part[] = [];
  for (const cy of [-0.72, 0.72]) parts.push(extrude(circle(0.33, 12).map(([a, b]): V2 => [cy + a, 0.33 + b]), 'x', -0.09, 0.09, '#262b33'));
  parts.push(box(-0.2, -0.55, 0.42, 0.2, 0.5, 0.8, cor));
  parts.push(box(-0.16, -0.15, 0.8, 0.16, garupa ? 0.78 : 0.6, 0.92, '#1f2630'));
  parts.push(box(-0.12, -0.8, 0.5, 0.12, -0.55, 1.05, scale(cor, 0.75), (k, q) => (k === 'n' ? [{ p: subq(q, 0.2, 0.55, 0.8, 0.85), c: '#f7f3d6', flat: true }] : undefined)));
  parts.push(seg([-0.32, -0.62, 1.12], [0.32, -0.62, 1.12], 0.06, '#1f2630'));
  // piloto de jaqueta, calça e bota
  parts.push(seg([0, 0.15, 0.95], [0, -0.1, 1.55], 0.42, PILOTO.top, 0.26));
  for (const s of [-1, 1]) {
    if (s > 0 && maos === 1) parts.push(seg([0.2, -0.05, 1.5], [0.36, 0.08, 1.0], 0.1, PILOTO.top));
    else parts.push(seg([s * 0.2, -0.05, 1.5], [s * 0.3, -0.6, 1.15], 0.1, PILOTO.top));
    parts.push(seg([s * 0.16, 0.1, 0.95], [s * 0.2, -0.3, 0.6], 0.14, PILOTO.bottom));
    parts.push(box(s * 0.2 - 0.07, -0.42, 0.42, s * 0.2 + 0.07, -0.22, 0.62, '#2b2420'));
  }
  if (capacete) parts.push(box(-0.19, -0.3, 1.55, 0.19, 0.08, 1.92, '#f4f1e6', (k, q) => (k === 'n' ? [{ p: subq(q, 0.12, 0.35, 0.88, 0.8), c: '#2b3a48' }] : undefined)));
  else {
    parts.push(box(-0.17, -0.28, 1.55, 0.17, 0.06, 1.86, PILOTO.skin, (k, q) => (k === 'n' ? [{ p: subq(q, 0.22, 0.45, 0.36, 0.6), c: '#1d2430', flat: true }, { p: subq(q, 0.64, 0.45, 0.78, 0.6), c: '#1d2430', flat: true }, { p: subq(q, 0, 0.82, 1, 1), c: PILOTO.hair }] : undefined)));
    parts.push(box(-0.18, -0.29, 1.84, 0.18, 0.07, 1.92, PILOTO.hair));
  }
  if (garupa) {
    const top = '#2f6fb3';
    parts.push(seg([0, 0.68, 0.95], [0, 0.5, 1.46], 0.38, top, 0.24));
    for (const s of [-1, 1]) {
      parts.push(seg([s * 0.19, 0.52, 1.4], [s * 0.21, 0.22, 1.15], 0.09, top));
      parts.push(seg([s * 0.15, 0.65, 0.95], [s * 0.22, 0.42, 0.6], 0.13, '#3a4a66'));
    }
    parts.push(box(-0.18, 0.34, 1.46, 0.18, 0.68, 1.8, '#e0412f', (k, q) => (k === 'n' ? [{ p: subq(q, 0.12, 0.35, 0.88, 0.8), c: '#2b3a48' }] : undefined)));
  }
  return tfObj({ parts, shadow: true }, chain(T(x, y), Rz(face)));
}

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. em qualquer viagem, curta ou longa, o corpo precisa estar protegido
    case 0: {
      const y = -10 + 3 * lt;
      return {
        cam: cam(y + 1, 24),
        ground: CHAO,
        objs: [...OBJS, carroAberto(XC, y, VOCE, familia())],
        over: (pr) => (
          <>
            {tag(pr, pw(XC, y, 0, 0, 1.8), 'Curta ou longa', janela(lt, 0.6, 2.5, 0.2))}
            {tag(pr, pw(XC, y, 0, 0, 1.8), 'Corpo protegido', ease((lt - 2.6) / 0.3))}
            {certo(pr, pw(XC, y, 0, -2.6, 0.6), ease((lt - 3.2) / 0.3))}
          </>
        ),
      };
    }
    // 1. cinto obrigatório para o motorista e todos os passageiros
    case 1: {
      const c = (a: number) => clamp01((lt - a) / 0.7);
      const y = -4;
      return {
        cam: cam(y - 0.9),
        ground: CHAO,
        objs: [...OBJS, carroAberto(XC, y, VOCE, { mot: { look: RAPAZ, cinto: c(1.0) }, pas: { look: MOCA, cinto: c(2.6) }, te: { look: SENHORA, cinto: c(3.4) }, td: { look: MENINO, cinto: c(3.8), k: 0.8, disp: 'assento' } })],
        over: (pr) => (
          <>
            {tag(pr, pw(XC, y, -0.45, -1.7, 1.0), 'Motorista', janela(lt, 0.8, 2.6, 0.2))}
            {tag(pr, pw(XC, y, 0, 1.9, 1.3), 'Todos os passageiros', ease((lt - 2.8) / 0.3))}
            {certo(pr, pw(XC, y, -1.4, -0.45, 1.0), ease((lt - 4.8) / 0.3))}
          </>
        ),
      };
    }
    // 2. vale no banco da frente e no de trás
    case 2: {
      const y = -4;
      return {
        cam: cam(y - 0.9),
        ground: CHAO,
        objs: [...OBJS, carroAberto(XC, y, VOCE, familia())],
        over: (pr) => (
          <>
            {tag(pr, pw(XC, y, 0, -1.7, 1.0), 'Na frente', janela(lt, 0.4, 1.6, 0.2))}
            {certo(pr, pw(XC, y, -1.4, -0.45, 1.0), ease((lt - 0.7) / 0.3))}
            {tag(pr, pw(XC, y, 0, 1.9, 1.3), 'Atrás', ease((lt - 1.7) / 0.3))}
            {certo(pr, pw(XC, y, -1.4, 0.8, 1.0), ease((lt - 2.0) / 0.3))}
          </>
        ),
      };
    }
    // 3. criança com menos de 10 anos e menos de 1,45 m vai no banco de trás
    case 3: {
      const y = -4;
      const km = ease((lt - 2.6) / 0.9);
      const lx = lerp(0.45, 0.5, km), ly = lerp(-0.45, 0.8, km), lz = 0.5 - 0.5 * 0.8 + 0.5 * Math.sin(Math.PI * km);
      return {
        cam: cam(y - 0.9),
        ground: CHAO,
        objs: [...OBJS, carroAberto(XC, y, VOCE, { mot: { look: RAPAZ, cinto: 1 }, td: { look: MENINO, cinto: km > 0.99 ? clamp01((lt - 3.6) / 0.5) : 0, k: 0.8, pos: [lx, ly, km > 0.99 ? 0.7 - 0.4 : lz], disp: km > 0.99 ? 'assento' : undefined } })],
        over: (pr) => (
          <>
            {tag(pr, pw(XC, y, 0.45, -1.7, 1.0), 'Menos de 10 anos', janela(lt, 0.4, 1.5, 0.2))}
            {tag(pr, pw(XC, y, 0.45, -1.7, 1.0), 'Menos de 1,45 m', janela(lt, 1.5, 2.6, 0.2))}
            {proibido(pr, pw(XC, y, 1.5, -0.45, 1.0), janela(lt, 0.8, 2.6, 0.2))}
            {tag(pr, pw(XC, y, 0.5, 1.9, 1.3), 'Banco de trás', ease((lt - 3.6) / 0.3))}
            {certo(pr, pw(XC, y, 1.5, 0.8, 1.0), ease((lt - 4.0) / 0.3))}
          </>
        ),
      };
    }
    // 4. na proteção certa: bebê conforto, cadeirinha ou assento de elevação
    case 4: {
      const y = -4;
      const fase = lt < 4.4 ? 0 : lt < 5.3 ? 1 : 2;
      const td: Lugar = fase === 0 ? { look: BEBE, cinto: 1, disp: 'bebe' } : fase === 1 ? { look: MENINO, cinto: 1, k: 0.66, disp: 'cadeira' } : { look: MENINO, cinto: 1, k: 0.82, disp: 'assento' };
      const nome = ['Bebê conforto', 'Cadeirinha', 'Assento de elevação'][fase];
      const p = pw(XC, y, 0.5, 1.9, 1.3);
      return {
        cam: cam(y - 0.6, 42, XC - 0.3),
        ground: CHAO,
        objs: [...OBJS, carroAberto(XC, y, VOCE, { mot: { look: RAPAZ, cinto: 1 }, pas: { look: MOCA, cinto: 1 }, td })],
        over: (pr) => (
          <>
            {tag(pr, pw(XC, y, 0, -1.7, 1.0), 'Idade, peso e altura', janela(lt, 0.8, 3.6, 0.2))}
            {tag(pr, p, nome, lt > 3.8 ? 1 : 0)}
          </>
        ),
      };
    }
    // 5. na moto, quem pilota usa capacete com viseira ou óculos
    case 5: {
      const y = -8 + 2.5 * lt;
      return {
        cam: cam(y - 0.7, 52),
        ground: CHAO,
        objs: [...OBJS, motoca(XC, y, Math.PI, '#e0412f')],
        over: (pr) => (
          <>
            {tag(pr, [XC, y, 2.2], 'Capacete', janela(lt, 0.6, 2.2, 0.2))}
            {tag(pr, [XC, y, 2.2], 'Viseira ou óculos', ease((lt - 2.3) / 0.3))}
            {certo(pr, [XC + 1.1, y, 1.7], ease((lt - 2.9) / 0.3))}
          </>
        ),
      };
    }
    // 6. as duas mãos no guidão e roupa de proteção
    case 6: {
      const y = -8 + 2.5 * lt;
      const duas = lt > 1.4;
      return {
        cam: cam(y - 0.7, 52),
        ground: CHAO,
        objs: [...OBJS, motoca(XC, y, Math.PI, '#e0412f', { maos: duas ? 2 : 1 })],
        over: (pr) => (
          <>
            {proibido(pr, [XC + 1.1, y, 1.4], janela(lt, 0.3, 1.3, 0.15))}
            {tag(pr, [XC, y, 2.2], 'Duas mãos', ease((lt - 1.4) / 0.3) * (1 - ease((lt - 2.4) / 0.2)))}
            {tag(pr, [XC, y, 2.2], 'Roupa de proteção', ease((lt - 2.5) / 0.3))}
            {certo(pr, [XC + 1.1, y, 1.4], ease((lt - 1.6) / 0.3))}
          </>
        ),
      };
    }
    // 7. o passageiro também usa capacete e roupa, sentado atrás de quem pilota
    case 7: {
      const y = -8 + 2.5 * lt;
      return {
        cam: cam(y - 0.7, 52),
        ground: CHAO,
        objs: [...OBJS, motoca(XC, y, Math.PI, '#e0412f', { garupa: true })],
        over: (pr) => (
          <>
            {tag(pr, [XC, y - 0.5, 2.1], 'Passageiro', janela(lt, 0.4, 1.8, 0.2))}
            {tag(pr, [XC, y - 0.5, 2.1], 'Capacete e roupa', janela(lt, 1.9, 3.6, 0.2))}
            {tag(pr, [XC, y - 0.5, 2.1], 'Sentado atrás', ease((lt - 3.7) / 0.3))}
            {certo(pr, [XC + 1.2, y, 1.5], ease((lt - 4.2) / 0.3))}
          </>
        ),
      };
    }
    // 8. para guardar: todo mundo de cinto, criança atrás, capacete fechado
    default: {
      const y = -10 + 2.5 * lt;
      return {
        cam: cam(y + 2, 22, 0),
        ground: CHAO,
        objs: [...OBJS, carroAberto(XC, y, VOCE, familia()), motoca(1.75, y + 4.5, Math.PI, '#e0412f', { garupa: true })],
        over: (pr) => (
          <>
            {tag(pr, pw(XC, y, 0, -0.45, 1.8), 'Todos de cinto', janela(lt, 0.9, 1.9, 0.2))}
            {tag(pr, pw(XC, y, 0.5, 0.8, 1.5), 'Criança atrás', ease((lt - 2.0) / 0.3))}
            {tag(pr, [1.75, y + 4.5, 2.2], 'Capacete fechado', ease((lt - 3.0) / 0.3))}
            {certo(pr, [0, y + 7.5, 0.4], ease((lt - Math.min(3.8, d - 0.5)) / 0.3))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
