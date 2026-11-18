/**
 * Cenas paradas do Mundo 3 ("Regras para circular") no estilo 3D (lote de 15/11/2026).
 * Mesmas regras dos Mundos 1 e 2: a imagem mostra a situação do texto sem entregar a resposta,
 * e a câmera fica atrás de você, olhando para o norte. Ficaram sem cena as questões em que a
 * posição do carro na pista é a própria resposta (w3-l3-q6 e q7).
 */
import type { ReactNode } from 'react';
import { box, camLook, chain, circle, extrude, flat, lines, rect, rng, Rx, scale, subq, T, tfObj, type Dec, type Obj, type Part, type V2, type V3 } from './engine';
import { asphalt, bench, building, bush, car, cyclist, grassPatches, lampPost, person, sidewalk, tree, wall, zebra, type Look } from './models';
import { utilitario } from './veiculos';
import { SignCallout, signPost, signTop } from './signs';
import { Tag } from './iso';
import { avenida, avenidaObjs, bairro, cena, cruzamento, voce, type CenaProps } from './Mundo1';
import { ACOST, CAM_ESTRADA, campo, estrada, raios } from './Mundo2';
import { CAM as CAM_SEMAFORO, PARA, balaoLuz, chaoSemaforo, eu, objsSemaforo } from './cruzSemaforo';

const VOCE = '#e9eef3';
const TIRE = '#262b33';
const GLASS = '#3b5470';
export const MOCA: Look = { skin: '#7a4e35', hair: '#2b2420', top: '#2fa36b', bottom: '#33415a', bag: '#e0a43a' };
export const RAPAZ: Look = { skin: '#d7a77f', hair: '#5a3b25', top: '#f2a13a', bottom: '#3a4a66' };
export const SENHORA: Look = { skin: '#c98a5e', hair: '#d9d9d9', top: '#8e5cc2', bottom: '#4a4a5a', skirt: true };
export const MENINA: Look = { skin: '#c98a5e', hair: '#3a2a20', top: '#e86aa6', bottom: '#5a4fa0', bag: '#2fa36b', bun: true, skirt: true };
export const MENINO: Look = { skin: '#b07a55', hair: '#2b2420', top: '#e05a5a', bottom: '#2f4f7f', bag: '#2f80ed' };
type Pr = (p: V3) => V2;

/* ---------------- peças ---------------- */

/** ônibus urbano indo para o norte, porta do lado direito (leste) */
export function onibus(x: number, y: number, cor = '#f2a13a'): Obj {
  const W = 1.25, L = 5.6, z0 = 0.35, z1 = 3.15;
  const corpo = box(x - W, y - L, z0, x + W, y + L, z1, (k) => (k === 'top' ? '#e6e9ed' : cor), (k, q) => {
    const D: Dec[] = [];
    if (k === 'e' || k === 'w') {
      D.push({ p: subq(q, 0.03, 0.48, 0.97, 0.86), c: GLASS });
      for (const v of [0.2, 0.36, 0.52, 0.68, 0.84]) D.push({ p: subq(q, v - 0.006, 0.48, v + 0.006, 0.86), c: scale(cor, 0.75) });
      D.push({ p: subq(q, 0, 0.3, 1, 0.36), c: '#ffffff' });
    }
    if (k === 'e') {
      // portas abertas (o vão escuro) na frente e no meio
      const f = (u: number) => u; // u cresce para o sul na face leste
      D.push({ p: subq(q, f(0.05), 0.02, f(0.15), 0.86), c: '#1c232b' });
      D.push({ p: subq(q, f(0.48), 0.02, f(0.58), 0.86), c: '#1c232b' });
    }
    if (k === 'n') {
      D.push({ p: subq(q, 0.05, 0.42, 0.95, 0.94), c: GLASS });
      D.push({ p: subq(q, 0.2, 0.9, 0.8, 0.98), c: '#1c232b' });
    }
    if (k === 's') {
      D.push({ p: subq(q, 0.12, 0.6, 0.88, 0.9), c: GLASS });
      D.push({ p: subq(q, 0.05, 0.12, 0.15, 0.24), c: '#c0392b' });
      D.push({ p: subq(q, 0.85, 0.12, 0.95, 0.24), c: '#c0392b' });
      D.push({ p: subq(q, 0.3, 0.1, 0.7, 0.2), c: '#f4f1e6' });
    }
    return D.length ? D : undefined;
  });
  const rodas = [-L + 1.6, L - 1.9].map((yw) => extrude(circle(0.5, 10).map(([a, b]): V2 => [a + y + yw, b + 0.5]), 'x', x - W - 0.02, x + W + 0.02, TIRE));
  const teto = box(x - 0.6, y - 1.2, z1, x + 0.6, y + 0.6, z1 + 0.25, '#d5dade');
  return { parts: [corpo, ...rodas, teto], shadow: true };
}

/** abrigo do ponto de ônibus, com banco, de costas para o leste */
export function abrigo(x: number, y0: number, y1: number): Obj {
  const parts: Part[] = [
    box(x - 0.9, y0, 2.4, x + 0.5, y1, 2.55, '#8b949c'),
    box(x + 0.4, y0, 0, x + 0.5, y1, 2.4, '#a9c8e3', (k, q) => (k === 'w' ? [{ p: subq(q, 0.05, 0.1, 0.95, 0.9), c: '#c3dbee' }] : undefined)),
    box(x - 0.85, y0, 0, x - 0.75, y0 + 0.1, 2.4, '#6b747c'),
    box(x - 0.85, y1 - 0.1, 0, x - 0.75, y1, 2.4, '#6b747c'),
  ];
  return { parts, shadow: true };
}

/** fumaça (pixels): bolinhas cinza subindo de um ponto */
export function fumaca(x: number, y: number, k = 1): ReactNode {
  const b = [
    [0, 0, 5],
    [4, -7, 6.5],
    [-2, -15, 8],
    [5, -23, 9],
    [0, -32, 10],
  ];
  return (
    <g>
      {b.map(([dx, dy, r], i) => (
        <circle key={i} cx={x + dx * k} cy={y + dy * k} r={r * k} fill="#d7dbe0" opacity={0.75 - i * 0.11} />
      ))}
    </g>
  );
}

/** poeira (pixels) atrás do carro, na estrada de terra */
function poeira(x: number, y: number): ReactNode {
  const b = [
    [-14, 2, 7],
    [12, 3, 7],
    [-22, -4, 9],
    [20, -3, 9],
    [-6, 8, 8],
    [8, 9, 8],
  ];
  return (
    <g>
      {b.map(([dx, dy, r], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r={r} fill="#e3cfa3" opacity={0.55} />
      ))}
    </g>
  );
}

/** chuva forte (pixels): céu cinza e riscos inclinados */
export function chuva(): ReactNode {
  const r = rng(31);
  const riscos = Array.from({ length: 110 }, () => [r() * 340 - 10, r() * 210 - 10, 7 + r() * 6] as const);
  return (
    <g>
      <rect x={0} y={0} width={320} height={200} fill="#5d6b7a" opacity={0.42} />
      <g stroke="#e9f1f8" strokeWidth={0.9} strokeLinecap="round" opacity={0.75}>
        {riscos.map(([x, y, l], i) => (
          <line key={i} x1={x} y1={y} x2={x - l * 0.28} y2={y + l} />
        ))}
      </g>
    </g>
  );
}

/** cone de luz do farol no chão, à frente de um carro indo para o norte */
function farol(pr: Pr, x: number, yFrente: number, alcance: number, abre: number, o: number): ReactNode {
  const pts: V3[] = [[x - 0.7, yFrente, 0], [x + 0.7, yFrente, 0], [x + abre, yFrente - alcance, 0], [x - abre, yFrente - alcance, 0]];
  const d = 'M' + pts.map((p) => pr(p).map((v) => v.toFixed(1)).join(' ')).join('L') + 'Z';
  return <path d={d} fill="#fff4c8" opacity={o} />;
}

/** luzinha redonda (farol, lanterna) em pixels */
function luz(pr: Pr, p: V3, r: number, cor: string): ReactNode {
  const [x, y] = pr(p);
  return (
    <g>
      <circle cx={x} cy={y} r={r * 2.2} fill={cor} opacity={0.25} />
      <circle cx={x} cy={y} r={r} fill={cor} />
    </g>
  );
}

/** só a escuridão da noite, sem postes */
function escuro(o = 0.66): ReactNode {
  return <rect x={0} y={0} width={320} height={200} fill="#070d22" opacity={o} />;
}

/* ---------------- 1. faixas e ultrapassagem ---------------- */

/** avenida de mão única com três faixas; um caminhão lento chega por uma rua da esquerda */
export function AvenidaTresFaixas(p: CenaProps) {
  const a = 5.25, cy = -16;
  const ground: Part[] = [
    ...grassPatches(-50, -50, 50, 40, 4),
    ...asphalt(-a, -50, a, 40, 5),
    ...asphalt(-40, cy - 3.2, -a, cy + 3.2, 6),
    lines([
      { p: [[-1.75, -50, 0], [-1.75, cy - 3.6, 0]], c: '#eeeeea', w: 1, dash: '6 6' },
      { p: [[1.75, -50, 0], [1.75, cy - 3.6, 0]], c: '#eeeeea', w: 1, dash: '6 6' },
      { p: [[-1.75, cy + 3.6, 0], [-1.75, 40, 0]], c: '#eeeeea', w: 1, dash: '6 6' },
      { p: [[1.75, cy + 3.6, 0], [1.75, 40, 0]], c: '#eeeeea', w: 1, dash: '6 6' },
      { p: [[-40, cy, 0], [-a - 0.6, cy, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' },
    ]),
    rect(-a + 0.15, -50, -a + 0.28, cy - 3.2, '#eeeeea'),
    rect(-a + 0.15, cy + 3.2, -a + 0.28, 40, '#eeeeea'),
    rect(a - 0.28, -50, a - 0.15, 40, '#eeeeea'),
    // linha de retenção da rua que chega
    rect(-a - 0.6, cy - 3.2, -a - 0.2, cy, '#ffffff'),
    ...sidewalk(a, -50, a + 3, 40),
    ...sidewalk(-a - 3, -50, -a, cy - 3.2),
    ...sidewalk(-40, cy - 6.2, -a - 3, cy - 3.2, 'x'),
    ...sidewalk(-a - 3, cy + 3.2, -a, 40),
    ...sidewalk(-40, cy + 3.2, -a - 3, cy + 6.2, 'x'),
  ];
  const objs: Obj[] = [
    building({ x0: a + 4, y0: -34, x1: a + 12, y1: -22, h: 12, color: '#9fc3e6', shop: 'w', seed: 2 }),
    building({ x0: a + 4, y0: -21, x1: a + 11, y1: -10, h: 8, color: '#f1dca6', shop: 'w', seed: 5 }),
    building({ x0: a + 4, y0: -9, x1: a + 12, y1: 3, h: 10, color: '#e9a47c', shop: 'w', seed: 7 }),
    tree(-a - 6, cy + 9, 0.9, 3),
    bush(-a - 9, cy + 8, 0.8, 1),
    building({ x0: -a - 14, y0: cy - 16, x1: -a - 4, y1: cy - 7, h: 11, color: '#d9e3f0', shop: 'e', seed: 6 }),
    tree(a + 1.6, -6, 0.9, 1),
    tree(-a - 1.6, cy + 10, 0.95, 2),
    lampPost(a + 1.4, -16, -1),
    utilitario({ x: -a - 7, y: cy + 1.6, tipo: 'caminhao', heading: Math.PI / 2 }),
    car({ x: 3.5, y: -26, color: '#4f7fc4' }),
    car({ x: -3.5, y: -34, color: '#8f98a3' }),
  ];
  const cam = camLook(-4.5, -13, 0, 20, 48, 9);
  return cena(cam, ground, objs, (pr) => {
    const [tx, ty] = pr([-a - 7, cy + 1.6, 3.5]);
    return <Tag x={tx} y={ty - 8} text="Caminhão lento" />;
  }, p);
}

/** você na faixa da esquerda; o carro de trás pisca o farol, querendo passar */
export function FaixaEsquerdaCarroAtras(p: CenaProps) {
  const cam = camLook(-0.4, 0.5, 0, -16, 42, 10.5);
  const yv = -3.5, yt = 4.6;
  const objs = [...avenidaObjs(1), car({ x: -1.8, y: yv, color: VOCE }), car({ x: -1.8, y: yt, color: '#e0412f' }), car({ x: 1.8, y: -16, color: '#8f98a3' })];
  return cena(cam, avenida(), objs, (pr) => {
    const fl = [-2.45, -1.15].map((x) => pr([x, yt - 2.15, 0.75]));
    return (
      <>
        {fl.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={6} fill="#fff6c8" opacity={0.55} />
            {raios(x, y, 4, 4, '#fff1a8', 6)}
          </g>
        ))}
        {voce(pr, -1.8, yv)}
      </>
    );
  }, p);
}

/** ônibus parado no ponto, passageiros descendo; você vem atrás */
export function OnibusPonto(p: CenaProps) {
  const a = 3.5, c = 6.6;
  const ground: Part[] = [
    ...grassPatches(-40, -50, 40, 40, 6),
    ...asphalt(-a, -50, a, 40, 4),
    lines([{ p: [[0, -50, 0], [0, 40, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
    ...sidewalk(a, -50, c, 40),
    ...sidewalk(-c, -50, -a, 40),
    // faixa amarela do ponto, no meio-fio
    rect(a - 0.25, -17, a - 0.1, -5, '#f2c21b'),
  ];
  const yb = -11;
  const objs: Obj[] = [
    building({ x0: c + 1.5, y0: -30, x1: c + 9, y1: -19, h: 9, color: '#f1dca6', shop: 'w', seed: 5 }),
    building({ x0: c + 1.5, y0: -18, x1: c + 10, y1: -6, h: 12, color: '#9fc3e6', shop: 'w', seed: 2 }),
    building({ x0: -c - 9, y0: -26, x1: -c - 1.5, y1: -12, h: 10, color: '#cfe7c4', shop: 'e', seed: 3 }),
    building({ x0: -c - 9, y0: -11, x1: -c - 1.5, y1: 2, h: 8, color: '#d9e3f0', shop: 'e', seed: 6 }),
    abrigo(5.6, -13.5, -10),
    bench(5.25, -11.8, Math.PI / 2),
    tree(5.4, -2, 0.85, 2),
    tree(-5.2, -8, 0.9, 1),
    onibus(1.75, yb),
    person(3.95, yb + 0.6, SENHORA, 0.7, Math.PI / 2, 1.2),
    person(4.7, yb + 1.9, MENINO, 0.2, Math.PI * 0.75, 1.0),
    person(5.0, yb - 0.6, RAPAZ, 0, Math.PI * 0.6, 1.2),
    car({ x: -1.75, y: -30, heading: Math.PI, color: '#4f7fc4' }),
    car({ x: 1.75, y: 2.4, color: VOCE }),
  ];
  const cam = camLook(2.6, -7, 0, 16, 44, 12.5);
  return cena(cam, ground, objs, (pr) => voce(pr, 1.75, 2.4), p);
}

/* ---------------- 2. sair da garagem e virar ---------------- */

/** você sai da garagem de casa: na calçada passa uma pessoa e, na rua, um carro */
export function SaidaGaragem(p: CenaProps) {
  const r0 = -9, r1 = -2, s1 = 1.2; // rua leste-oeste e a calçada até o muro
  const ground: Part[] = [
    ...grassPatches(-40, -40, 40, 40, 2),
    ...asphalt(-40, r0, 40, r1, 5),
    lines([{ p: [[-40, (r0 + r1) / 2, 0], [40, (r0 + r1) / 2, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
    ...sidewalk(-40, r1, 40, s1, 'x'),
    ...sidewalk(-40, r0 - 3, 40, r0, 'x'),
    // rampa da garagem (guia rebaixada) e o piso do quintal
    rect(-1.5, r1 + 0.05, 1.5, s1, '#bdb3a0', 0.17),
    rect(-1.5, s1, 1.5, 9, '#c9c3b6', 0.02),
  ];
  const objs: Obj[] = [
    wall(-12, s1, -1.6, s1 + 0.2, 1.8, '#e8d9b8'),
    wall(1.6, s1, 12, s1 + 0.2, 1.8, '#e8d9b8'),
    bush(-3.2, 3.2, 0.9, 1),
    bush(3.3, 3.4, 0.8, 2),
    tree(4.6, 6, 0.85, 3),
    building({ x0: -14, y0: r0 - 13, x1: -4, y1: r0 - 4, h: 7, color: '#d9e3f0', shop: 's', seed: 6 }),
    building({ x0: -3, y0: r0 - 13, x1: 7, y1: r0 - 4, h: 9, color: '#f1dca6', shop: 's', seed: 5 }),
    building({ x0: 8, y0: r0 - 13, x1: 17, y1: r0 - 4, h: 6.5, color: '#e9a47c', shop: 's', seed: 7 }),
    tree(-6, r1 + 1.4, 0.85, 1),
    tree(6.5, r1 + 1.4, 0.9, 2),
    person(-2.6, r1 + 1.6, MOCA, 0.8, Math.PI / 2, 1.25),
    car({ x: -9, y: (r0 + r1) / 2 + 1.75, heading: Math.PI / 2, color: '#e0412f' }),
    car({ x: 0, y: 4.6, color: VOCE }),
  ];
  const cam = camLook(-0.5, -0.5, 0, 8, 48, 12.5);
  return cena(cam, ground, objs, (pr) => voce(pr, 0, 4.6), p);
}

/** rodovia de mão dupla com acostamento; você quer entrar numa estrada de terra do lado esquerdo */
export function RodoviaVirarEsquerda(p: CenaProps) {
  const ys = -18;
  const ground: Part[] = [
    ...estrada('tracejada'),
    // estrada de terra que sai para a esquerda
    rect(-50, ys - 2.2, -ACOST - 0.7, ys + 2.2, '#b99b6b', 0.01),
    rect(-50, ys - 1.2, -ACOST - 0.7, ys - 0.8, '#a4875a', 0.012),
    rect(-50, ys + 0.8, -ACOST - 0.7, ys + 1.2, '#a4875a', 0.012),
  ];
  const objs: Obj[] = [
    ...campo(4, [ys - 2.4, ys + 2.4]),
    car({ x: -1.75, y: -40, heading: Math.PI, color: '#4f7fc4' }),
    car({ x: 1.75, y: 1.5, color: VOCE }),
  ];
  const cam = camLook(-1.5, -9, 0, 14, 38, 8);
  return cena(cam, ground, objs, (pr) => {
    const [dx, dy] = pr([-14, ys, 0.8]);
    return (
      <>
        <Tag x={dx} y={dy - 10} text="Você quer ir para lá" />
        {voce(pr, 1.75, 1.5)}
      </>
    );
  }, p);
}

/** você vira à direita, com a seta ligada; uma pessoa atravessa a rua para onde você vai */
export function VirarDireitaPedestre(p: CenaProps) {
  const cy = -9;
  const ground: Part[] = [...cruzamento(cy), ...zebra(5.0, cy - 3.5, 7.6, cy + 3.5, 'x')];
  const objs: Obj[] = [
    ...bairro(cy, 2),
    person(6.3, cy + 0.6, MOCA, 0.8, 0, 1.3),
    car({ x: 1.75, y: -1.2, color: VOCE, blink: 'r' }),
  ];
  const cam = camLook(3.4, -5.5, 0, 10, 42, 11.5);
  return cena(cam, ground, objs, (pr) => voce(pr, 1.75, -1.2), p);
}

/* ---------------- 3. luzes ---------------- */

/** de dia, numa estrada, começa a chover forte */
export function ChuvaDia(p: CenaProps) {
  const objs = [...campo(5), car({ x: 1.75, y: -16, color: '#8f98a3' }), car({ x: -1.75, y: -30, heading: Math.PI, color: '#e0412f' }), car({ x: 1.75, y: 1.5, color: VOCE })];
  return cena(CAM_ESTRADA, estrada('tracejada'), objs, (pr) => (
    <>
      {chuva()}
      {voce(pr, 1.75, 1.5)}
    </>
  ), p);
}

/** à noite, numa estrada sem iluminação e sem ninguém por perto */
export function EstradaEscura(p: CenaProps) {
  const objs = [...campo(6), car({ x: 1.75, y: 1.5, color: VOCE })];
  return cena(CAM_ESTRADA, estrada('tracejada'), objs, (pr) => (
    <>
      {escuro(0.7)}
      {[1.15, 2.35].map((x) => <g key={x}>{luz(pr, [x, 1.5 + 2.15, 0.85], 1.6, '#ff3b30')}</g>)}
      {voce(pr, 1.75, 1.5)}
    </>
  ), p);
}

/** à noite, você de luz alta; um carro aparece vindo de frente */
export function LuzAltaCarroFrente(p: CenaProps) {
  const yo = -24;
  const objs = [...campo(7), car({ x: -1.75, y: yo, heading: Math.PI, color: '#4f7fc4' }), car({ x: 1.75, y: 1.5, color: VOCE })];
  return cena(CAM_ESTRADA, estrada('tracejada'), objs, (pr) => (
    <>
      {escuro(0.66)}
      {farol(pr, 1.75, 1.5 - 2.1, 30, 4.2, 0.28)}
      {[-2.4, -1.1].map((x) => <g key={x}>{luz(pr, [x, yo + 2.15, 0.75], 2, '#fff6c8')}</g>)}
      {[1.15, 2.35].map((x) => <g key={x}>{luz(pr, [x, 1.5 + 2.15, 0.85], 1.4, '#ff3b30')}</g>)}
      {voce(pr, 1.75, 1.5)}
    </>
  ), p);
}

/* ---------------- 4. parada e estacionamento ---------------- */

/** letreiro da padaria (100 x 24) */
const letreiro = (
  <g>
    <rect x={0} y={0} width={100} height={24} rx={2} fill="#7a3b1f" />
    <text x={50} y={17} textAnchor="middle" fontSize={15} fontWeight={900} fill="#ffe7b0" fontFamily="Arial, sans-serif" letterSpacing={1}>PADARIA</text>
  </g>
);

/** seu carro encostado no meio-fio; você vai entrar na padaria */
export function CarroPadaria(p: CenaProps) {
  const a = 3.4, c = 6.2;
  const ground: Part[] = [
    ...grassPatches(-40, -50, 40, 40, 8),
    ...asphalt(-a, -50, a, 40, 2),
    lines([{ p: [[0, -50, 0], [0, 40, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
    ...sidewalk(a, -50, c, 40),
    ...sidewalk(-c, -50, -a, 40),
  ];
  const x0 = c, ya = -9.2, yb = -5.6, z0 = 3.0, z1 = z0 + ((yb - ya) * 24) / 100;
  const placa = box(x0 - 0.12, ya, z0, x0, yb, z1, (k) => (k === 'w' ? '#7a3b1f' : '#5a2b16'));
  const frente = placa.faces.find((f) => f.n && f.n[0] < -0.9);
  if (frente) {
    frente.flat = true;
    frente.art = { o: [x0 - 0.121, ya, z1], u: [x0 - 0.121, yb, z1], v: [x0 - 0.121, ya, z1 - (yb - ya)], node: letreiro };
  }
  const objs: Obj[] = [
    building({ x0: c, y0: -22, x1: c + 8, y1: -11, h: 10, color: '#9fc3e6', shop: 'w', seed: 2 }),
    building({ x0: c, y0: -10.5, x1: c + 7, y1: -3.5, h: 6, color: '#f1dca6', shop: 'w', seed: 5 }),
    { parts: [placa] },
    building({ x0: -c - 8, y0: -24, x1: -c, y1: -10, h: 11, color: '#cfe7c4', shop: 'e', seed: 3 }),
    building({ x0: -c - 8, y0: -9, x1: -c, y1: 4, h: 8, color: '#d9e3f0', shop: 'e', seed: 6 }),
    tree(-4.8, -3, 0.9, 1),
    lampPost(4.8, -15, -1),
    car({ x: 2.2, y: -3.2, color: VOCE }),
    person(5.2, -7.0, RAPAZ, 0.8, Math.PI / 2, 1.25),
    car({ x: -1.75, y: -26, heading: Math.PI, color: '#e0412f' }),
  ];
  const cam = camLook(3.2, -6.5, 0, -48, 38, 12.5);
  return cena(cam, ground, objs, (pr) => {
    const [tx, ty] = pr([5.2, -7.0, 2.4]);
    return <Tag x={tx} y={ty - 8} text="Você" />;
  }, p);
}

/** seu carro quebrou e parou na pista; sai fumaça do motor e outro carro vem atrás */
export function CarroQuebrado(p: CenaProps) {
  const yv = -6;
  const objs = [...campo(8), car({ x: 1.75, y: yv, color: VOCE }), car({ x: 1.75, y: 9, color: '#4f7fc4' })];
  const cam = camLook(1.4, -2, 0, 12, 38, 11);
  return cena(cam, estrada('tracejada'), objs, (pr) => {
    const [fx, fy] = pr([1.75, yv - 1.6, 1.1]);
    return (
      <>
        {fumaca(fx, fy, 1.6)}
        {voce(pr, 1.75, yv)}
      </>
    );
  }, p);
}

/* ---------------- 5. velocidade ---------------- */

/** estrada de terra entre as roças, sem placa */
export const TERRA_CHAO: Part[] = [
    ...grassPatches(-50, -70, 50, 40, 12),
    rect(-4.2, -70, 4.2, 40, '#c2a476'),
    rect(-3.4, -70, 3.4, 40, '#b99b6b', 0.001),
    // marcas dos pneus
    rect(-2.6, -70, -2.0, 40, '#a4875a', 0.002, 0.8),
    rect(-0.5, -70, 0.1, 40, '#a4875a', 0.002, 0.8),
    rect(0.9, -70, 1.5, 40, '#a4875a', 0.002, 0.8),
    rect(2.3, -70, 2.9, 40, '#a4875a', 0.002, 0.8),
];

export function EstradaTerra(p: CenaProps) {
  const ground = TERRA_CHAO;
  const objs = [...campo(9), bush(-5.5, -12, 0.8, 3), bush(5.8, -26, 0.8, 4), car({ x: 1.6, y: 1.5, color: VOCE })];
  return cena(CAM_ESTRADA, ground, objs, (pr) => {
    const [px, py] = pr([1.6, 4.2, 0.4]);
    return (
      <>
        {poeira(px, py)}
        {voce(pr, 1.6, 1.5)}
      </>
    );
  }, p);
}

/** sua pista, duas faixas para o norte, entre x = e0 e x = e1; a outra é o espelho */
export const DUPLA_E0 = 0.8, DUPLA_E1 = 8.0;
const e0 = DUPLA_E0, e1 = DUPLA_E1;
export const DUPLA_CHAO: Part[] = [
  ...grassPatches(-50, -70, 50, 40, 13),
  rect(e1, -70, e1 + 2.2, 40, '#6d747d', 0, 0.55),
  ...asphalt(e0, -70, e1, 40, 3),
  rect(e1, -70, e1 + 2.2, 40, '#757c85'),
  lines([{ p: [[(e0 + e1) / 2, -70, 0], [(e0 + e1) / 2, 40, 0]], c: '#eeeeea', w: 1, dash: '6 6' }]),
  rect(e1 - 0.15, -70, e1, 40, '#eeeeea'),
  rect(e0, -70, e0 + 0.15, 40, '#f2c21b'),
  // canteiro de grama e a outra pista
  rect(-e0, -70, e0, 40, '#8cc47a', 0.01),
  ...asphalt(-e1, -70, -e0, 40, 9),
  rect(-e1 - 2.2, -70, -e1, 40, '#757c85'),
  lines([{ p: [[-(e0 + e1) / 2, -70, 0], [-(e0 + e1) / 2, 40, 0]], c: '#eeeeea', w: 1, dash: '6 6' }]),
  rect(-e0 - 0.15, -70, -e0, 40, '#f2c21b'),
  rect(-e1, -70, -e1 + 0.15, 40, '#eeeeea'),
];

// defensa de metal no canteiro, no sentido norte-sul
export const defensaY = (x: number): Obj => {
  const parts: Part[] = [box(x - 0.06, -70, 0.5, x + 0.06, 40, 0.82, '#c3c9d0', (k, q) => (k === 'e' || k === 'w' ? [{ p: subq(q, 0, 0.42, 1, 0.58), c: '#8f99a2' }] : undefined))];
  for (let y = -60; y < 40; y += 2.5) parts.push(box(x - 0.06, y, 0, x + 0.14, y + 0.12, 0.8, '#7d868e'));
  return { parts, shadow: true };
};

/** rodovia de pista dupla (canteiro no meio) com a placa de 80 km/h */
export function RodoviaDupla80(p: CenaProps) {
  return rodoviaDupla(p, 80);
}

/** rodovia de pista dupla; `velocidade` põe a placa R-19, e `caminhao` troca o seu carro por um caminhão */
function rodoviaDupla(p: CenaProps, velocidade?: number, caminhao = false) {
  const placa = { x: 10.6, y: -9, code: 'R-19' as const, speed: velocidade ?? 80, face: 0 };
  const ground = DUPLA_CHAO;
  const objs: Obj[] = [
    defensaY(0),
    tree(-14, -6, 1.1, 1),
    tree(15, 4, 1.05, 2),
    tree(14, -24, 1.2, 3),
    tree(-15, -30, 1.1, 4),
    bush(12.5, -14, 0.9, 1),
    ...(velocidade ? [signPost(placa)] : []),
    car({ x: -2.75, y: -30, heading: Math.PI, color: '#e0412f' }),
    car({ x: -6.25, y: -12, heading: Math.PI, color: '#8f98a3' }),
    car({ x: 2.75, y: -22, color: '#4f7fc4' }),
    caminhao ? utilitario({ x: 6.2, y: 0.5, tipo: 'caminhao' }) : car({ x: 6.2, y: 1.5, color: VOCE }),
  ];
  const cam = camLook(3.5, -7, 0, 12, 34, 10);
  return cena(cam, ground, objs, (pr) => (
    <>
      {velocidade && <SignCallout at={pr(signTop(placa))} code="R-19" speed={velocidade} dx={34} dy={-24} />}
      {caminhao ? voce(pr, 6.2, 0.5, 3.9) : voce(pr, 6.2, 1.5)}
    </>
  ), p);
}

/** rodovia de pista dupla, sem placa de velocidade */
export function RodoviaDupla(p: CenaProps) {
  return rodoviaDupla(p);
}

/** você dirige um caminhão numa rodovia de pista dupla, sem placa */
export function RodoviaDuplaCaminhao(p: CenaProps) {
  return rodoviaDupla(p, undefined, true);
}

/** rodovia com a placa de 100 km/h */
export function RodoviaPlaca100(p: CenaProps) {
  return rodoviaDupla(p, 100);
}


/* ---------------- lote 2 (15/11/2026): mais questões com imagem ---------------- */

/** rua de mão dupla com calçadas e prédios dos dois lados, para as cenas junto ao meio-fio */
function ruaMeioFio(seed = 0): { ground: Part[]; objs: Obj[] } {
  const a = 3.4, c = 6.2;
  const ground: Part[] = [
    ...grassPatches(-40, -50, 40, 40, 8 + seed),
    ...asphalt(-a, -50, a, 40, 2 + seed),
    lines([{ p: [[0, -50, 0], [0, 40, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
    ...sidewalk(a, -50, c, 40),
    ...sidewalk(-c, -50, -a, 40),
  ];
  const objs: Obj[] = [
    building({ x0: c, y0: -22, x1: c + 8, y1: -11, h: 10, color: '#9fc3e6', shop: 'w', seed: 2 + seed }),
    building({ x0: c, y0: -10.5, x1: c + 7, y1: 2, h: 7, color: '#f1dca6', shop: 'w', seed: 5 + seed }),
    building({ x0: -c - 8, y0: -24, x1: -c, y1: -10, h: 11, color: '#cfe7c4', shop: 'e', seed: 3 + seed }),
    building({ x0: -c - 8, y0: -9, x1: -c, y1: 4, h: 8, color: '#d9e3f0', shop: 'e', seed: 6 + seed }),
    tree(-4.8, -3, 0.9, 1 + seed),
    lampPost(4.8, -15, -1),
  ];
  return { ground, objs };
}
const CAM_MEIO_FIO = camLook(3.6, -4, 0, -40, 40, 17);

/** congestionamento numa rodovia com acostamento: a fila parada e você nela */
export function CongestionamentoAcostamento(p: CenaProps) {
  const cores = ['#4f7fc4', '#8f98a3', '#e0412f', '#2fa36b', '#f2a13a'];
  const fila = [-4, -9.5, -15, -20.5, -26].map((y, i) => car({ x: 1.75, y, color: cores[i], brake: true }));
  const objs = [...campo(10), ...fila, car({ x: -1.75, y: -18, heading: Math.PI, color: '#d9e3f0' }), car({ x: 1.75, y: 1.5, color: VOCE, brake: true })];
  return cena(CAM_ESTRADA, estrada('tracejada'), objs, (pr) => voce(pr, 1.75, 1.5), p);
}

/** um carro e uma bicicleta na mesma rua */
export function CarroBicicleta(p: CenaProps) {
  const objs = [...avenidaObjs(2), cyclist(2.6, -5.5, 0.6, 0), car({ x: 1.6, y: 3, color: VOCE }), car({ x: -1.8, y: -22, heading: Math.PI, color: '#4f7fc4' })];
  const cam = camLook(0.8, -3, 0, 12, 40, 10.5);
  return cena(cam, avenida(), objs, (pr) => {
    const [bx, by] = pr([2.6, -5.5, 1.9]);
    return (
      <>
        <Tag x={bx} y={by - 8} text="Bicicleta" />
        {voce(pr, 1.6, 3)}
      </>
    );
  }, p);
}

/** você na faixa da direita; um carro passa por você pela faixa da esquerda */
export function SendoUltrapassado(p: CenaProps) {
  const objs = [...avenidaObjs(1), car({ x: 1.8, y: -1, color: VOCE }), car({ x: -1.8, y: -2.6, color: '#e0412f' }), car({ x: 1.8, y: -20, color: '#8f98a3' })];
  const cam = camLook(0, -3, 0, 12, 40, 11);
  return cena(cam, avenida(), objs, (pr) => voce(pr, 1.8, -1), p);
}

/** atrás de um caminhão devagar, chegando perto de um cruzamento; ninguém vem de frente */
export function CruzamentoUltrapassar(p: CenaProps) {
  const cy = -14;
  const objs: Obj[] = [...bairro(cy, 3), utilitario({ x: 1.75, y: -3.5, tipo: 'caminhao' }), car({ x: 1.75, y: 6, color: VOCE })];
  const cam = camLook(1.2, -6, 0, 12, 40, 12.5);
  return cena(cam, cruzamento(cy), objs, (pr) => {
    const [cx, cyy] = pr([-4.5, cy, 0.5]);
    return (
      <>
        <Tag x={cx} y={cyy - 6} text="Cruzamento" />
        {voce(pr, 1.75, 6)}
      </>
    );
  }, p);
}

/** sinal verde para você, mas a fila do outro lado do cruzamento está parada */
export function VerdeFilaParada(p: CenaProps) {
  const cores = ['#4f7fc4', '#8f98a3', '#2fa36b'];
  const fila = [-19.6, -25, -30.4].map((y, i) => car({ x: 1.75, y, color: cores[i], brake: true }));
  const cam = camLook(1.4, -13, 0.6, 12, 42, 9.5);
  return cena(cam, chaoSemaforo(), objsSemaforo('verde', [...fila, eu(0.8)]), (pr) => {
    const [fx, fy] = pr([1.75, -25, 1.8]);
    return (
      <>
        <Tag x={fx} y={fy - 8} text="Fila parada" />
        {balaoLuz(pr, 'verde')}
        {voce(pr, 1.75, 0.8)}
      </>
    );
  }, p);
}

/** você parado no sinal vermelho, com a seta da direita ligada; a rua está vazia */
export function VermelhoDireita(p: CenaProps) {
  return cena(CAM_SEMAFORO, chaoSemaforo(), objsSemaforo('vermelho', [eu(PARA, true, 'r')]), (pr) => (
    <>
      {balaoLuz(pr, 'vermelho')}
      {voce(pr, 1.75, PARA)}
    </>
  ), p);
}

/** rodovia de pista simples, de dia, fora da cidade */
export function RodoviaSimples(p: CenaProps) {
  const objs = [...campo(11), car({ x: 1.75, y: -18, color: '#8f98a3' }), car({ x: -1.75, y: -28, heading: Math.PI, color: '#4f7fc4' }), car({ x: 1.75, y: 1.5, color: VOCE })];
  return cena(CAM_ESTRADA, estrada('tracejada'), objs, (pr) => voce(pr, 1.75, 1.5), p);
}

/** a entrada de um túnel na estrada, num dia de sol */
export function TunelDia(p: CenaProps) {
  const y0 = -15;
  const morro = box(-45, -60, 0, 45, y0, 8.5, (k) => (k === 'top' ? '#8cc47a' : '#7a9c5e'));
  const morro2 = box(-45, -60, 8.5, 45, y0 - 6, 12, (k) => (k === 'top' ? '#94c982' : '#83a866'));
  const boca = box(-6.6, y0, 0, 6.6, y0 + 0.6, 7, '#b3b8bd', (k, q) => {
    if (k !== 's') return undefined;
    const D: Dec[] = [{ p: subq(q, 0.06, 0, 0.94, 0.8), c: '#151a20' }];
    for (const u of [0.2, 0.4, 0.6, 0.8]) D.push({ p: subq(q, u - 0.02, 0.7, u + 0.02, 0.74), c: '#ffd76a' });
    D.push({ p: subq(q, 0, 0.88, 1, 0.92), c: '#8d949a' });
    return D;
  });
  const cerca: Obj[] = [];
  for (const x of [-9, 9]) {
    cerca.push({ parts: [lines([{ p: [[x, y0 + 0.8, 0.95], [x, 40, 0.95]], c: '#8a6a48', w: 0.8 }, { p: [[x, y0 + 0.8, 0.55], [x, 40, 0.55]], c: '#8a6a48', w: 0.7 }])] });
    for (let y = y0 + 2; y < 30; y += 4) cerca.push({ parts: [box(x - 0.06, y - 0.06, 0, x + 0.06, y + 0.06, 1.05, '#8a6a48')], shadow: true });
  }
  const objs: Obj[] = [
    { parts: [morro2] },
    { parts: [morro] },
    { parts: [boca] },
    ...cerca,
    tree(-12, y0 + 4, 1, 2),
    tree(13, y0 + 5, 1.1, 3),
    tree(-13, 4, 1.1, 1),
    bush(11, 8, 0.9, 2),
    car({ x: 1.75, y: 1.5, color: VOCE }),
  ];
  const cam = camLook(1.2, -6, 1.5, 10, 26, 11);
  return cena(cam, estrada('tracejada'), objs, (pr) => {
    const [tx, ty] = pr([0, y0, 7.6]);
    return (
      <>
        <Tag x={tx} y={ty - 6} text="Túnel" />
        {voce(pr, 1.75, 1.5)}
      </>
    );
  }, p);
}

/** seu carro encostado no meio-fio; um passageiro desce para a calçada */
export function PassageiroDesce(p: CenaProps) {
  const r = ruaMeioFio(0);
  const objs = [...r.objs, car({ x: 2.2, y: -3.2, color: VOCE }), person(4.5, -5.6, RAPAZ, 0.8, Math.PI / 2, 1.25), car({ x: -1.75, y: -26, heading: Math.PI, color: '#e0412f' })];
  return cena(CAM_MEIO_FIO, r.ground, objs, (pr) => {
    const [tx, ty] = pr([4.5, -5.6, 2.4]);
    return (
      <>
        <Tag x={tx} y={ty - 8} text="Passageiro" />
        {voce(pr, 2.2, -3.2)}
      </>
    );
  }, p);
}

/** caminhão junto à calçada; uma pessoa leva caixas para a loja */
export function CargaDescarga(p: CenaProps) {
  const r = ruaMeioFio(1);
  const caixa = (x: number, y: number, z: number, l = 0.5) =>
    box(x - l / 2, y - l / 2, z, x + l / 2, y + l / 2, z + l * 0.8, '#c89a5b', (k, q) => (k === 'top' ? [{ p: subq(q, 0.45, 0, 0.55, 1), c: '#e3c48a' }] : undefined));
  const objs: Obj[] = [
    ...r.objs,
    utilitario({ x: 2.0, y: -7, tipo: 'caminhao' }),
    { parts: [caixa(4.0, -2.0, 0.17)], shadow: true },
    { parts: [caixa(4.6, -2.1, 0.17)], shadow: true },
    { parts: [caixa(4.3, -2.0, 0.57)] },
    person(5.0, -0.6, MOCA, 0.6, Math.PI / 2, 1.25, { l: [0, 1.3], r: [0, 1.3] }),
    { parts: [caixa(5.45, -0.6, 1.0, 0.45)] },
    car({ x: -1.75, y: -28, heading: Math.PI, color: '#4f7fc4' }),
  ];
  return cena(CAM_MEIO_FIO, r.ground, objs, () => null, p);
}

/** uma criança de 7 anos e 1,20 m, com um adulto, vai entrar no seu carro */
export function CriancaCarro(p: CenaProps & { menina?: boolean }) {
  const r = ruaMeioFio(2);
  const objs = [...r.objs, car({ x: 2.2, y: -3.2, color: VOCE }), person(4.4, -7.6, p.menina ? MENINA : MENINO, 0, -Math.PI / 2, 0.82), person(5.3, -6.3, MOCA, 0, -Math.PI / 2, 1.25)];
  return cena(CAM_MEIO_FIO, r.ground, objs, (pr) => {
    const [tx, ty] = pr([4.4, -7.6, 1.5]);
    return (
      <>
        <Tag x={tx} y={ty - 8} text="7 anos, 1,20 m" />
        {voce(pr, 2.2, -3.2)}
      </>
    );
  }, p);
}


/* ---------------- situações "Na rua" (18/11/2026): imagem para todas ---------------- */

const suave = (v: number) => {
  const k = Math.max(0, Math.min(1, v));
  return k * k * (3 - 2 * k);
};

/** subida em estrada de mão dupla: a pista sobe até o topo e some do outro lado (também usada no vídeo "Onde não ultrapassar") */
export const Y_PE = -6, Y_TOPO = -30, H = 4.2;
export const altura = (y: number) => (y > Y_PE ? 0 : y > Y_TOPO ? H * suave((Y_PE - y) / (Y_PE - Y_TOPO)) : Math.max(0, H - (Y_TOPO - y) * 0.25));
/** chão da subida; `tracejada` troca a linha amarela contínua do meio por uma tracejada */
function chaoSubida(tracejada = false): Part[] {
  const out: Part[] = [...grassPatches(-50, -70, 50, 40, 9)];
  const tira = (ya: number, yb: number, x0: number, x1: number, c: string, z = 0) =>
    ({ ...flat([[x0, ya], [x1, ya], [x1, yb], [x0, yb]], c), faces: [{ p: [[x0, ya, altura(ya) + z], [x1, ya, altura(ya) + z], [x1, yb, altura(yb) + z], [x0, yb, altura(yb) + z]] as V3[], c, n: [0, 0, 1] as V3 }] }) as Part;
  // do fundo para a frente: o lado de lá do morro é pintado antes, e o topo o cobre
  for (let y = -60; y < 40; y += 2) {
    const y1 = y + 2;
    const k = 1 + (altura(y) - altura(y1)) * 0.35;
    const g = scale('#7fbf6a', k);
    out.push(tira(y, y1, -14, -4.2, g));
    out.push(tira(y, y1, 4.2, 14, g));
    out.push(tira(y, y1, -4.2, 4.2, '#c9b48a', 0.01));
    out.push(tira(y, y1, -3.5, 3.5, '#5b636e', 0.02));
    if (!tracejada) out.push(tira(y, y1, -0.08, 0.08, '#f2c21b', 0.03));
    else if (((y % 6) + 6) % 6 === 0) out.push(tira(y, y1, -0.08, 0.08, '#f2c21b', 0.03));
  }
  return out;
}
export const SUBIDA = chaoSubida();
/** na cena parada a linha do meio é tracejada: quem decide é a falta de visão no topo, não a pintura */
const SUBIDA_TRACEJADA = chaoSubida(true);
/** veículo no morro, inclinado como a pista (`fazer` monta o veículo na origem) */
export function noMorro(x: number, y: number, heading: number, cor: string, fazer?: () => Obj): Obj {
  const z = altura(y);
  const incl = Math.atan2(altura(y - 0.5) - altura(y + 0.5), 1);
  const ang = heading === 0 ? -incl : incl;
  return tfObj(fazer ? fazer() : car({ x: 0, y: 0, heading, color: cor }), chain(T(x, y, z), Rx(ang)));
}

/** w3-rua-2: estrada de mão dupla e pista única; um caminhão devagar começa a subir o morro na sua frente */
export function SubidaCaminhao(p: CenaProps) {
  const objs = [
    tree(-7, 6, 1.1, 1), tree(-8.5, -4, 1.2, 2), tree(7.5, 2, 1.1, 3), tree(8, -12, 1.2, 4), bush(6, 9, 1, 2), bush(-6, -14, 1, 1),
    noMorro(1.75, -9.5, 0, '', () => utilitario({ x: 0, y: 0, tipo: 'caminhao' })),
    noMorro(1.75, 2.2, 0, VOCE),
  ];
  const cam = camLook(0.8, -10, 0, 12, 22, 8.2, 160, 118);
  return cena(cam, SUBIDA_TRACEJADA, objs, (pr) => {
    const [tx, ty] = pr([0, Y_TOPO, H + 0.4]);
    return (
      <>
        <Tag x={tx} y={ty - 6} text="Topo do morro" />
        {voce(pr, 1.75, 2.2)}
      </>
    );
  }, p);
}

/** w3-rua-1: rodovia de pista dupla; você na faixa da esquerda e um carro chegando rápido atrás */
export function RodoviaEsquerdaCarroAtras(p: CenaProps) {
  const xe = DUPLA_E0 + (DUPLA_E1 - DUPLA_E0) / 4;
  const yv = -2, yt = 6.4;
  const objs: Obj[] = [
    defensaY(0),
    tree(-14, -6, 1.1, 1), tree(15, 4, 1.05, 2), tree(14, -24, 1.2, 3), tree(-15, -30, 1.1, 4), bush(12.5, -14, 0.9, 1),
    car({ x: -2.75, y: -26, heading: Math.PI, color: '#8f98a3' }),
    car({ x: xe, y: yv, color: VOCE }),
    car({ x: xe, y: yt, color: '#e0412f' }),
  ];
  const cam = camLook(3.2, -4, 0, 12, 34, 10);
  return cena(cam, DUPLA_CHAO, objs, (pr) => {
    const [rx, ry] = pr([xe, yt + 2.4, 0.5]);
    return (
      <>
        {/* riscos de velocidade atrás do carro que chega */}
        {[-8, 0, 8].map((d) => (
          <line key={d} x1={rx + d} y1={ry + 6} x2={rx + d * 1.3} y2={ry + 22} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
        ))}
        {voce(pr, xe, yv)}
      </>
    );
  }, p);
}

/** w3-rua-4: de dia, na cidade, começa uma chuva forte */
export function ChuvaCidade(p: CenaProps) {
  const cam = camLook(0, -4, 0, -16, 42, 10.5);
  const objs = [
    ...avenidaObjs(3),
    car({ x: -1.8, y: -12, color: '#8f98a3' }),
    car({ x: 1.8, y: -20, color: '#4f7fc4' }),
    car({ x: 1.8, y: 1.5, color: VOCE }),
  ];
  return cena(cam, avenida(), objs, (pr) => (
    <>
      {chuva()}
      {voce(pr, 1.8, 1.5)}
    </>
  ), p);
}
