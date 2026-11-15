/**
 * Cenas paradas do Mundo 1 no estilo 3D (lote aprovado em 15/11/2026). Cada uma mostra o mesmo que a cena plana antiga
 * ensinava, sem entregar a resposta: nada de seta para a faixa certa nem de destaque no carro que tem preferência.
 * Câmera sempre atrás do seu carro (branco, com a etiqueta "Você"), olhando para o norte, sem espelhar.
 */
import type { ReactNode } from 'react';
import { Scene3D, box, camLook, circle, flat, lines, rect, subq, type Cam, type Line, type Obj, type Part, type V2 } from './engine';
import {
  asphalt, bench, bin, building, bush, car, gate, grassPatches, house, hydrant, lampPost, manhole, person, sidewalk, trafficLight, tree, wall, zebra, type Look,
} from './models';
import { utilitario } from './veiculos';
import { signPost } from './signs';
import { Tag } from './iso';
import { PedestreFaixa } from './PedestreFaixa';

const VOCE = '#e9eef3';
const AGENTE: Look = { skin: '#b07a55', hair: '#2b2420', top: '#2c4a7a', bottom: '#1f2c44', shoes: '#1d1d1d', cap: '#2c4a7a', vest: '#c8f03c', gloves: '#ffffff', whistle: true };
const MOCA: Look = { skin: '#7a4e35', hair: '#2b2420', top: '#2fa36b', bottom: '#33415a', bag: '#e0a43a' };
const RAPAZ: Look = { skin: '#d7a77f', hair: '#5a3b25', top: '#f2a13a', bottom: '#3a4a66' };

/* ---------------- peças de chão ---------------- */

/** cruzamento de duas ruas de mão dupla (7 m), com a rua que cruza no centro y = cy */
export function cruzamento(cy: number, opts: { linhaMeio?: boolean } = {}): Part[] {
  const a = 3.5, c = 6.5;
  const ls: Line[] = [];
  if (opts.linhaMeio !== false) {
    ls.push({ p: [[0, -40, 0], [0, cy - a - 0.8, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' });
    ls.push({ p: [[0, cy + a + 0.8, 0], [0, 40, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' });
    ls.push({ p: [[-40, cy, 0], [-a - 0.8, cy, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' });
    ls.push({ p: [[a + 0.8, cy, 0], [40, cy, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' });
  }
  return [
    ...grassPatches(-40, -40, 40, 40, 5),
    ...asphalt(-a, -40, a, 40, 3),
    ...asphalt(-40, cy - a, 40, cy + a, 9),
    lines(ls),
    // quatro esquinas, cada uma com a calçada em L
    ...sidewalk(a, cy + a, c, 40),
    ...sidewalk(c, cy + a, 40, cy + c, 'x'),
    ...sidewalk(-c, cy + a, -a, 40),
    ...sidewalk(-40, cy + a, -c, cy + c, 'x'),
    ...sidewalk(a, -40, c, cy - a),
    ...sidewalk(c, cy - c, 40, cy - a, 'x'),
    ...sidewalk(-c, -40, -a, cy - a),
    ...sidewalk(-40, cy - c, -c, cy - a, 'x'),
  ];
}

/** casas e árvores nas quatro esquinas de um cruzamento de bairro */
export function bairro(cy: number, seed = 0): Obj[] {
  const cores = ['#f3e3b8', '#cfe7c4', '#f1d0b0', '#d9e3f0', '#f6d2d2'];
  const tel = ['#c8553d', '#a8483a', '#b5603f'];
  const k = (i: number) => cores[(i + seed) % cores.length];
  const r = (i: number) => tel[(i + seed) % tel.length];
  return [
    house(8, cy + 8, 15, cy + 14, k(0), r(0), 'w'),
    house(8, cy + 17, 15, cy + 23, k(1), r(1), 'w'),
    house(-15, cy + 8, -8, cy + 14, k(2), r(2), 'e'),
    house(-15, cy + 17, -8, cy + 23, k(3), r(0), 'e'),
    house(8, cy - 15, 15, cy - 8, k(4), r(1), 's'),
    house(-15, cy - 15, -8, cy - 8, k(1), r(2), 's'),
    house(-26, cy - 15, -18, cy - 8, k(3), r(1), 's'),
    house(18, cy - 15, 26, cy - 8, k(2), r(0), 's'),
    tree(5.4, cy + 11, 0.9, 1 + seed),
    tree(-5.4, cy + 17, 0.95, 2 + seed),
    tree(-12, cy - 5.3, 0.85, 3 + seed),
    tree(12.5, cy - 5.3, 0.9, 4 + seed),
    bush(7.6, cy + 7.4, 0.7, 1),
    bush(-7.6, cy - 7.4, 0.7, 2),
    lampPost(5.6, cy + 5.2, -1),
    lampPost(-5.6, cy - 6, 1),
  ];
}

/** ondas de som (apito, sirene), já em pixels */
export function ondas(x: number, y: number, ang = -90, cor = '#ffffff'): ReactNode {
  const a = (ang * Math.PI) / 180;
  return (
    <g fill="none" stroke={cor} strokeLinecap="round" strokeWidth={1.4}>
      {[5, 9, 13].map((r, i) => {
        const a0 = a - 0.6, a1 = a + 0.6;
        const p0 = [x + Math.cos(a0) * r, y + Math.sin(a0) * r], p1 = [x + Math.cos(a1) * r, y + Math.sin(a1) * r];
        return <path key={i} d={`M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}A${r} ${r} 0 0 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`} opacity={1 - i * 0.25} />;
      })}
    </g>
  );
}

export const voce = (pr: (p: [number, number, number]) => V2, x: number, y: number, z = 2.2) => {
  const [px, py] = pr([x, y + 0.4, z]);
  return <Tag x={px} y={py - 8} text="Você" />;
};

export type CenaProps = { id?: string; label?: string };
export const cena = (cam: Cam, ground: Part[], objs: Obj[], overlay: (pr: (p: [number, number, number]) => V2) => ReactNode, { id = 'c', label }: CenaProps) => (
  <Scene3D id={id} cam={cam} ground={ground} objs={objs} overlay={overlay} label={label} />
);

/* ---------------- agente de trânsito ---------------- */

/** o agente apita para o seu carro, com o braço levantado, no meio do cruzamento */
export function AgenteApito(p: CenaProps) {
  const cy = -7;
  const cam = camLook(0.9, -2.2, 0.6, 18, 38, 18);
  const objs = [
    ...bairro(cy, 1),
    // tablado baixo onde o agente fica
    { parts: [box(-0.55, cy + 2.0, 0, 0.55, cy + 3.1, 0.14, '#e9e2cf')] },
    person(0, cy + 2.55, AGENTE, 0, Math.PI, 1.35, { r: [2.5, 0], l: [0.15, 0] }),
    car({ x: 1.75, y: 1.2, color: VOCE }),
  ];
  return cena(cam, cruzamento(cy), objs, (pr) => {
    const [x, y] = pr([0, cy + 2.55 - 0.4, 2.0]);
    return (
      <>
        {ondas(x - 4, y - 2, 200)}
        {voce(pr, 1.75, 1.2)}
      </>
    );
  }, p);
}

/**
 * Semáforo e o agente ao lado, contrariando o sinal. A imagem segue o texto de cada questão:
 * - `luz` vermelho: o agente manda SEGUIR. Ele fica de lado para você, com o braço levantado e o antebraço indo da frente
 *   para trás (CTB, Anexo II). O movimento aparece como um arco curto perto da mão.
 * - `luz` verde: o agente manda PARAR. Ele fica de frente, com o braço levantado na vertical e a palma para a frente.
 * Não use o braço estendido na horizontal: no CTB ele manda parar quem vem na direção que cruza o braço.
 */
export function AgenteSemaforo({ luz = 'vermelho', ...p }: CenaProps & { luz?: 'vermelho' | 'verde' }) {
  const cy = -8;
  const ax = 1.5, ay = cy + 4.6;
  const cam = camLook(1.8, -2.4, 0.6, 18, 38, 17);
  const siga = luz === 'vermelho';
  const agente = siga
    ? person(ax, ay, AGENTE, 0, Math.PI / 2, 1.35, { r: [0.4, 2.6], l: [0.1, 0] })
    : person(ax, ay, AGENTE, 0, Math.PI, 1.35, { r: [2.5, 0], l: [0.15, 0] });
  const objs = [...bairro(cy, 2), trafficLight(4.3, cy + 4.0, luz), agente, car({ x: 1.75, y: 1.4, color: VOCE })];
  return cena(cam, cruzamento(cy), objs, (pr) => (
    <>
      {siga && (() => {
        // arco do antebraço: da frente (leste) para trás (oeste), por cima da cabeça
        const a = pr([ax + 0.75, ay + 0.3, 2.35]), m = pr([ax + 0.15, ay + 0.3, 2.85]), b = pr([ax - 0.45, ay + 0.3, 2.45]);
        return (
          <g fill="none" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
            <path d={`M${a[0]} ${a[1]}Q${m[0]} ${m[1] - 4} ${b[0]} ${b[1]}`} />
            <path d={`M${b[0] + 3.5} ${b[1] - 2.5}L${b[0]} ${b[1]}L${b[0] + 3.8} ${b[1] + 1.6}`} />
          </g>
        );
      })()}
      {voce(pr, 1.75, 1.4)}
    </>
  ), p);
}

/* ---------------- veículos de emergência ---------------- */

/** avenida de mão única com duas faixas; você na da esquerda e o veículo de emergência atrás */
export function avenida(central: 'tracejada' | 'continua' = 'tracejada'): Part[] {
  return [
    ...grassPatches(-40, -40, 40, 40, 2),
    ...asphalt(-3.6, -40, 3.6, 40, 4),
    central === 'tracejada' ? lines([{ p: [[0, -40, 0], [0, 40, 0]], c: '#eeeeea', w: 1, dash: '6 6' }]) : rect(-0.1, -40, 0.1, 40, '#eeeeea'),
    rect(-3.45, -40, -3.32, 40, '#eeeeea'),
    rect(3.32, -40, 3.45, 40, '#eeeeea'),
    ...manhole(1.8, -12),
    // canteiro central à esquerda, calçada à direita
    ...sidewalk(-6.6, -40, -3.6, 40),
    rect(-6.3, -40, -3.9, 40, '#9fd08e', 0.16),
    ...sidewalk(3.6, -40, 6.6, 40),
  ];
}
export function avenidaObjs(seed = 0): Obj[] {
  return [
    tree(-5.1, -14 + seed, 0.9, 1),
    tree(-5.1, -2 + seed, 0.95, 2),
    tree(-5.1, 10 + seed, 0.9, 3),
    lampPost(-5.1, 4, 1),
    lampPost(5.4, -6, -1),
    building({ x0: 8, y0: -30, x1: 16, y1: -18, h: 12, color: '#9fc3e6', shop: 'w', seed: 2 }),
    building({ x0: 8, y0: -17, x1: 15, y1: -7, h: 7.5, color: '#f1dca6', shop: 'w', seed: 5 }),
    building({ x0: 8, y0: -6, x1: 16, y1: 5, h: 10, color: '#e9a47c', shop: 'w', seed: 7 }),
    building({ x0: 8, y0: 6, x1: 15, y1: 16, h: 6.5, color: '#cfe7c4', shop: 'w', seed: 3 }),
    building({ x0: -18, y0: -24, x1: -10, y1: -12, h: 9, color: '#f1dca6', seed: 4 }),
    building({ x0: -18, y0: -10, x1: -10, y1: 2, h: 13, color: '#d9e3f0', seed: 6 }),
    bin(4.2, -1),
    hydrant(4.1, 8),
  ];
}

function emergencia(tipo: 'ambulancia' | 'bombeiros', luzes: boolean, outroCarro: boolean, p: CenaProps) {
  const cam = camLook(-0.4, 0.5, 0, -16, 42, 10.5);
  const yv = -3.5;
  const ye = tipo === 'ambulancia' ? 5.6 : 7.2;
  const objs = [
    ...avenidaObjs(),
    car({ x: -1.8, y: yv, color: VOCE }),
    utilitario({ x: -1.8, y: ye, tipo, luzes, fase: 0 }),
    ...(outroCarro ? [car({ x: 1.8, y: -10.5, color: '#8f98a3' })] : []),
  ];
  return cena(cam, avenida(), objs, (pr) => {
    const zt = tipo === 'ambulancia' ? 2.6 : 3.0;
    const [sx, sy] = pr([-1.8, ye - (tipo === 'ambulancia' ? 1.6 : 3.4), zt]);
    return (
      <>
        {luzes && ondas(sx - 10, sy - 2, 200)}
        {luzes && ondas(sx + 10, sy - 2, -20)}
        {voce(pr, -1.8, yv)}
      </>
    );
  }, p);
}
/** ambulância com luzes ligadas vindo atrás de você */
export const Ambulancia = (p: CenaProps) => emergencia('ambulancia', true, false, p);
/** você na faixa da esquerda, um carro cinza na da direita, ambulância com sirene atrás */
export const AmbulanciaAtras = (p: CenaProps) => emergencia('ambulancia', true, true, p);
export const BombeirosAtras = (p: CenaProps) => emergencia('bombeiros', true, true, p);
/** ambulância atrás com luzes e sirene desligadas */
export const AmbulanciaDesligada = (p: CenaProps) => emergencia('ambulancia', false, false, p);

/* ---------------- cruzamentos ---------------- */

export function CruzamentoAproximacao(p: CenaProps) {
  const cy = -9;
  const cam = camLook(1.2, -3.5, 0, 18, 42, 11.5);
  const objs = [...bairro(cy, 0), person(-5.0, cy + 7, MOCA, 0.6, Math.PI / 2, 1.3), car({ x: 1.75, y: 2.5, color: VOCE })];
  return cena(cam, cruzamento(cy), objs, (pr) => voce(pr, 1.75, 2.5), p);
}

/** cruzamento sem sinalização: um caminhão vem pela sua esquerda */
export function CruzamentoCaminhao(p: CenaProps) {
  const cy = -7;
  const cam = camLook(-1.5, -3.5, 0, 20, 42, 10.5);
  const objs = [...bairro(cy, 3), utilitario({ x: -11.5, y: cy + 1.75, tipo: 'caminhao', heading: Math.PI / 2 }), car({ x: 1.75, y: 1.4, color: VOCE })];
  return cena(cam, cruzamento(cy), objs, (pr) => voce(pr, 1.75, 1.4), p);
}

/** cruzamento sem sinalização: um carro vermelho vem pela sua direita */
export function CruzamentoDireita(p: CenaProps) {
  const cy = -7;
  const cam = camLook(2.5, -3.5, 0, -14, 42, 11);
  const objs = [...bairro(cy, 4), car({ x: 9.5, y: cy - 1.75, heading: -Math.PI / 2, color: '#e0412f' }), car({ x: 1.75, y: 1.4, color: VOCE })];
  return cena(cam, cruzamento(cy), objs, (pr) => voce(pr, 1.75, 1.4), p);
}

/* ---------------- pedestres ---------------- */

export const PedestreFaixaParada = (p: CenaProps) => <PedestreFaixa t={0} id={p.id} />;

/** sinal verde para você, mas a pessoa ainda está no meio da faixa */
export function PedestreSemaforo(p: CenaProps) {
  const cy = -11;
  const cam = camLook(1.0, -3.2, 0, 18, 44, 12);
  const ground = [
    ...cruzamento(cy),
    ...zebra(-3.5, -6.9, 3.5, -4.1, 'y'),
    rect(0.2, -3.5, 3.3, -3.05, '#ffffff'),
    rect(3.6, -7.4, 4.2, -6.6, '#cbbfa6', 0.16),
    rect(-4.2, -7.4, -3.6, -6.6, '#cbbfa6', 0.16),
  ];
  const objs = [
    ...bairro(cy, 2),
    trafficLight(4.4, -7.6, 'verde'),
    person(1.0, -5.5, RAPAZ, 0.8, -Math.PI / 2, 1.4),
    car({ x: 1.75, y: -0.3, color: VOCE }),
  ];
  return cena(cam, ground, objs, (pr) => voce(pr, 1.75, -0.3), p);
}

/* ---------------- placa escondida ---------------- */

/** placa de proibido estacionar inteira dentro da copa da árvore: de fora só se vê o poste */
export function PlacaEscondida(p: CenaProps) {
  const cam = camLook(2.6, -2.5, 0.8, 22, 36, 14);
  const ground = [
    ...grassPatches(-40, -40, 40, 40, 6),
    ...asphalt(-3.5, -40, 3.5, 40, 5),
    lines([{ p: [[0, -40, 0], [0, 40, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
    ...sidewalk(3.5, -40, 6.5, 40),
    ...sidewalk(-6.5, -40, -3.5, 40),
  ];
  const arv = tree(4.55, -3.1, 1.3, 2);
  // a copa vai por último dentro do objeto: cobre a placa de qualquer ângulo
  const copa = { ...arv.parts[1], bias: 100 };
  const poste = signPost({ x: 4.2, y: -2.75, code: 'R-6a', face: 0 });
  const objs: Obj[] = [
    { parts: [...poste.parts, arv.parts[0], copa], shadow: true },
    wall(6.6, -16, 6.85, 12, 1.4, '#e7dcc4'),
    gate(6.7, -2, 1.2, 1.4),
    house(8, -14, 15, -6, '#f3e3b8', '#c8553d', 'w'),
    house(8, -4, 15, 4, '#cfe7c4', '#a8483a', 'w'),
    house(8, 6, 15, 13, '#f1d0b0', '#c8553d', 'w'),
    house(-15, -12, -8, -4, '#d9e3f0', '#b5603f', 'e'),
    house(-15, -1, -8, 7, '#f6d2d2', '#c8553d', 'e'),
    tree(-5.0, 3, 0.9, 4),
    lampPost(5.4, 7, -1),
    bin(4.0, 3.5),
    // seu carro estacionado junto à calçada, logo depois do poste
    car({ x: 2.45, y: 0.2, color: VOCE }),
    car({ x: 2.45, y: -9.5, color: '#4f7fc4' }),
  ];
  return cena(cam, ground, objs, (pr) => voce(pr, 2.45, 0.2), p);
}

/* ---------------- rodovia e via local ---------------- */

export function defensa(x0: number, x1: number, y: number): Obj {
  // lâmina da defensa com uma dobra mais escura no meio
  const parts: Part[] = [box(x0, y - 0.06, 0.5, x1, y + 0.06, 0.82, '#c3c9d0', (k, q) => (k === 'n' || k === 's' ? [{ p: subq(q, 0, 0.42, 1, 0.58), c: '#8f99a2' }] : undefined))];
  for (let x = x0 + 0.3; x < x1; x += 2.5) parts.push(box(x, y - 0.06, 0, x + 0.12, y + 0.14, 0.8, '#7d868e'));
  return { parts, shadow: true };
}

/** rodovia larga cruzando uma estrada local estreita; um carro vermelho vem pela rodovia */
export function RodoviaViaLocal(p: CenaProps) {
  const cam = camLook(0.5, -4, 0, 16, 42, 9);
  const y0 = -13, y1 = -4.6, ym = (y0 + y1) / 2;
  const ground = [
    ...grassPatches(-50, -50, 50, 50, 8),
    // acostamentos de terra e a rodovia
    rect(-50, y0 - 1.2, 50, y1 + 1.2, '#c9b48a'),
    ...asphalt(-50, y0, 50, y1, 6),
    rect(-50, ym - 0.2, 50, ym - 0.07, '#f2c21b'),
    rect(-50, ym + 0.07, 50, ym + 0.2, '#f2c21b'),
    rect(-50, y0 + 0.3, 50, y0 + 0.42, '#eeeeea'),
    rect(-50, y1 - 0.42, 50, y1 - 0.3, '#eeeeea'),
    // estrada local: estreita, sem pintura
    ...asphalt(-2.5, y1, 2.5, 50, 12),
    ...asphalt(-2.5, -50, 2.5, y0, 13),
    flat([[-2.5, y1 + 1.2], [-3.4, y1 + 1.2], [-2.5, y1 + 4]], '#c9b48a'),
    flat([[2.5, y1 + 1.2], [3.4, y1 + 1.2], [2.5, y1 + 4]], '#c9b48a'),
    // cerca das roças
    lines([
      { p: [[-50, 6, 0.9], [-4.5, 6, 0.9]], c: '#8a6a48', w: 0.8 },
      { p: [[4.5, 6, 0.9], [50, 6, 0.9]], c: '#8a6a48', w: 0.8 },
    ]),
  ];
  const cercas: Obj[] = [];
  for (const x of [-20, -16, -12, -8, -4.5, 4.5, 8, 12, 16, 20]) cercas.push({ parts: [box(x - 0.06, 5.94, 0, x + 0.06, 6.06, 1.0, '#8a6a48')], shadow: true });
  const objs: Obj[] = [
    defensa(-50, -3.3, y1 + 0.9),
    defensa(3.3, 50, y1 + 0.9),
    defensa(-50, -3.3, y0 - 0.9),
    defensa(3.3, 50, y0 - 0.9),
    ...cercas,
    tree(-9, 12, 1.1, 1),
    tree(-14, 3, 1, 2),
    tree(10, 11, 1.05, 3),
    tree(15, -22, 1.1, 4),
    tree(-6, -21, 1, 5),
    bush(5, 2, 0.9, 1),
    bush(-5.5, -18, 0.9, 2),
    house(9, -26, 16, -19, '#f3e3b8', '#c8553d', 'w'),
    car({ x: -13, y: ym + 2.1, heading: Math.PI / 2, color: '#e0412f' }),
    car({ x: 1.2, y: 1.2, color: VOCE }),
  ];
  return cena(cam, ground, objs, (pr) => voce(pr, 1.2, 1.2), p);
}

/* ---------------- rotatória ---------------- */

/** rotatória sem sinalização: um carro já circula (vem pela sua esquerda) e você quer entrar */
export function Rotatoria(p: CenaProps) {
  const C: V2 = [0, -12];
  const R = 10.5, ilha = 5;
  const cam = camLook(0, -5.5, 0, 12, 50, 9);
  const disco = (r: number, n: number) => circle(r, n).map(([a, b]): V2 => [C[0] + a, C[1] + b]);
  const ground = [
    ...grassPatches(-40, -40, 40, 40, 3),
    ...asphalt(-3.5, -40, 3.5, 40, 4),
    ...asphalt(-40, C[1] - 3.5, 40, C[1] + 3.5, 5),
    flat(disco(R, 40), '#5b636e'),
    // ilha: meio-fio e grama
    flat(disco(ilha + 0.25, 32), '#dcd5c6', 0.01),
    flat(disco(ilha, 32), '#8cc47c', 0.02),
    flat(disco(ilha - 1.6, 24), '#9fd08e', 0.03),
    // calçadas nos quatro cantos (de longe)
    ...sidewalk(3.5, 1.4, 6.5, 40),
    ...sidewalk(-6.5, 1.4, -3.5, 40),
    ...sidewalk(3.5, -40, 6.5, C[1] - R - 1.5),
    ...sidewalk(-6.5, -40, -3.5, C[1] - R - 1.5),
    lines([
      { p: [[0, 1.4, 0], [0, 40, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' },
      { p: [[0, -40, 0], [0, C[1] - R - 0.5, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' },
    ]),
  ];
  // carro circulando no lado sudoeste do anel, indo para o sudeste (sentido anti-horário visto de cima)
  const a = (140 * Math.PI) / 180, rr = 7.8;
  const cx = C[0] + Math.cos(a) * rr, cyy = C[1] + Math.sin(a) * rr;
  const objs: Obj[] = [
    tree(C[0] - 0.8, C[1] - 0.6, 1.15, 2),
    bush(C[0] + 2.2, C[1] + 1.2, 0.8, 1),
    bush(C[0] + 1.4, C[1] - 2.6, 0.7, 3),
    bush(C[0] - 2.6, C[1] + 2.0, 0.7, 2),
    house(12, 6, 19, 13, '#f3e3b8', '#c8553d', 'w'),
    house(-19, 6, -12, 13, '#cfe7c4', '#a8483a', 'e'),
    building({ x0: 12, y0: -30, x1: 20, y1: -22, h: 8, color: '#9fc3e6', seed: 2 }),
    building({ x0: -20, y0: -30, x1: -12, y1: -22, h: 11, color: '#f1dca6', seed: 4 }),
    tree(7.6, 2.5, 0.9, 4),
    tree(-7.6, 2.5, 0.9, 5),
    // de frente para a tangente do anel (sentido anti-horário); com heading = a o carro anda em (sen a, −cos a)
    car({ x: cx, y: cyy, heading: a, color: '#1e96f0' }),
    car({ x: 1.75, y: 3.6, color: VOCE }),
  ];
  return cena(cam, ground, objs, (pr) => voce(pr, 1.75, 3.6), p);
}

/* ---------------- rua local ---------------- */

/** rua de bairro com casas dos dois lados e nenhuma placa de velocidade */
export function RuaLocal(p: CenaProps) {
  const cam = camLook(0.8, -5, 0, 20, 40, 10.5);
  const ground = [
    ...grassPatches(-40, -40, 40, 40, 9),
    ...asphalt(-3.2, -40, 3.2, 40, 2),
    ...sidewalk(3.2, -40, 5.8, 40),
    ...sidewalk(-5.8, -40, -3.2, 40),
    ...manhole(-1.4, -9),
  ];
  const casas: Obj[] = [];
  const cores = ['#f3e3b8', '#cfe7c4', '#f1d0b0', '#d9e3f0', '#f6d2d2', '#e8d8f0'];
  for (let i = 0; i < 5; i++) {
    const y = -26 + i * 9;
    casas.push(house(8, y, 14.5, y + 6.5, cores[i % 6], i % 2 ? '#a8483a' : '#c8553d', 'w'));
    casas.push(house(-14.5, y + 3, -8, y + 9.5, cores[(i + 3) % 6], i % 2 ? '#c8553d' : '#b5603f', 'e'));
    casas.push(wall(6.0, y - 1.2, 6.25, y + 4.5, 1.2, '#e7dcc4'), gate(6.1, y + 4.5, y + 7.2, 1.2));
    casas.push(wall(-6.25, y + 1.8, -6.0, y + 7.5, 1.2, '#e7dcc4'), gate(-6.1, y + 7.5, y + 10.2, 1.2));
  }
  const objs: Obj[] = [
    ...casas,
    tree(4.6, -12, 0.9, 1),
    tree(4.6, 4, 0.95, 2),
    tree(-4.6, -4, 0.9, 3),
    tree(-4.6, 12, 0.85, 4),
    bush(4.5, -20, 0.6, 1),
    lampPost(4.6, -4.5, -1),
    lampPost(-4.6, 4.5, 1),
    bench(-4.9, -14, Math.PI / 2),
    person(4.4, -7.5, MOCA, 0.5, Math.PI, 1.3),
    car({ x: -2.3, y: -16, heading: Math.PI, color: '#f2c21b' }),
    car({ x: 1.6, y: 1.5, color: VOCE }),
  ];
  return cena(cam, ground, objs, (pr) => voce(pr, 1.6, 1.5), p);
}
