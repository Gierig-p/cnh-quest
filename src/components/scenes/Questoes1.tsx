/**
 * Cenas paradas para as questões dos Mundos 1 e 2 que ainda não tinham imagem (pedido do dono, 18/11/2026).
 * Cada cena mostra o lugar da pergunta sem entregar a resposta: nada de etiqueta com o nome do sinal,
 * nem destaque no que "vale mais".
 */
import type { ReactNode } from 'react';
import { Ry, T, box, camLook, chain, lathe, rect, tfObj, type Obj, type Part } from './engine';
import { asphalt, bin, car, cyclist, grassPatches, house, lampPost, manhole, person, sidewalk, trafficLight, tree, wall, zebra, type Look } from './models';
import { signPost, signTop } from './signs';
import { Tag } from './iso';
import { avenida, avenidaObjs, bairro, cena, cruzamento, voce, type CenaProps } from './Mundo1';

const VOCE = '#e9eef3';
const AGENTE: Look = { skin: '#b07a55', hair: '#2b2420', top: '#2c4a7a', bottom: '#1f2c44', shoes: '#1d1d1d', cap: '#2c4a7a', vest: '#c8f03c', gloves: '#ffffff', whistle: true };
const RAPAZ: Look = { skin: '#d7a77f', hair: '#5a3b25', top: '#f2a13a', bottom: '#3a4a66' };
const SENHOR: Look = { skin: '#8a5a3c', hair: '#d9d9d9', top: '#7b5ea7', bottom: '#2f3640', shoes: '#3a2a20' };

/** cone de sinalização (laranja com faixas brancas) */
function cone(x: number, y: number): Obj {
  const corpo = lathe([[0.21, 0.06], [0.17, 0.3], [0.14, 0.44], [0.11, 0.58], [0.07, 0.76], [0, 0.8]], 8, (i) => (i === 1 || i === 3 ? '#f4f4f4' : '#f06a2a'));
  return tfObj({ parts: [box(-0.27, -0.27, 0, 0.27, 0.27, 0.06, '#d9561f'), corpo], shadow: true }, T(x, y));
}

/** painel de propaganda em dois pés, virado para quem vem do sul */
function outdoor(x0: number, x1: number, y: number): Obj {
  const z0 = 2.2, z1 = 4.6, W = x1 - x0;
  const painel = box(x0, y - 0.12, z0, x1, y, z1, '#d8dde3');
  const frente = painel.faces.find((f) => f.n && f.n[1] > 0.9);
  if (frente) {
    frente.flat = true;
    const yf = y + 0.002;
    const h = (100 * (z1 - z0)) / W;
    frente.art = {
      o: [x0, yf, z1], u: [x1, yf, z1], v: [x0, yf, z1 - W],
      node: (
        <g>
          <rect x={0} y={0} width={100} height={h} fill="#ffd84a" />
          <circle cx={78} cy={h / 2} r={h * 0.36} fill="#e0412f" />
          <text x={78} y={h / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={900} fill="#fff">50%</text>
          <text x={8} y={h * 0.42} fontSize={12} fontWeight={900} fill="#1d2430">SUPER</text>
          <text x={8} y={h * 0.78} fontSize={12} fontWeight={900} fill="#1d2430">OFERTA</text>
        </g>
      ),
    };
  }
  const pe = (x: number) => box(x - 0.09, y - 0.15, 0, x + 0.09, y - 0.03, z0, '#7d868e');
  return { parts: [pe(x0 + W * 0.22), pe(x1 - W * 0.22), painel], shadow: true };
}

/** troca o desenho da placa por uma versão desbotada, sem dar para ler */
function apagar(o: Obj, k = 0.14): Obj {
  return {
    ...o,
    parts: o.parts.map((p) => ({
      ...p,
      faces: p.faces.map((f) => (f.art ? { ...f, c: '#e8e2d6', art: { ...f.art, node: <g opacity={k}>{f.art.node}</g> } } : f)),
    })),
  };
}

/* ---------------- cruzamento com os tipos de sinal ---------------- */

const CY = -8;
const PLACA = { x: 4.6, y: CY + 4.6, code: 'R-6a' as const, face: 0 };

/**
 * Cruzamento com placa, faixa pintada, semáforo, agente apitando e cones. Com `propaganda`, há também um painel de
 * propaganda na esquina (para a questão que pergunta o que NÃO é sinal; o painel aparece sem destaque).
 */
export function RuaSinais({ propaganda = false, ...p }: CenaProps & { propaganda?: boolean }) {
  const cam = camLook(propaganda ? -1.6 : 0.6, -1.0, 0.6, 16, 38, propaganda ? 12.5 : 14);
  const ground: Part[] = [
    ...cruzamento(CY),
    ...zebra(-3.5, CY + 4.1, 3.5, CY + 6.9, 'y'),
    rect(0.2, CY + 7.5, 3.3, CY + 7.95, '#ffffff'),
    ...manhole(-1.75, 6),
  ];
  const ay = CY + 1.6;
  const objs: Obj[] = [
    ...bairro(CY, 2),
    signPost(PLACA),
    trafficLight(4.4, CY + 3.4, 'vermelho'),
    { parts: [box(-0.55, ay - 0.55, 0, 0.55, ay + 0.55, 0.14, '#e9e2cf')] },
    person(0, ay, AGENTE, 0, Math.PI, 1.35, { r: [2.3, 0], l: [0.15, 0] }),
    cone(-1.0, 7.0), cone(-2.5, 7.0), cone(-1.75, 9.4),
    car({ x: 1.75, y: 3.0, color: VOCE, brake: true }),
  ];
  if (propaganda) objs.push(outdoor(-14.2, -8.6, CY + 7.4));
  return cena(cam, ground, objs, (pr) => voce(pr, 1.75, 3.0), p);
}

/* ---------------- semáforo e placa na mesma esquina ---------------- */

/** semáforo e placa de PARE na mesma esquina, olhando para você */
export function SemaforoPlaca(p: CenaProps) {
  const cy = -7;
  const cam = camLook(2.0, -2.6, 0.8, 20, 34, 15);
  const objs: Obj[] = [
    ...bairro(cy, 4),
    trafficLight(4.4, cy + 4.0, 'verde'),
    signPost({ x: 4.7, y: cy + 5.6, code: 'R-1', face: 0 }),
    car({ x: 1.75, y: 1.0, color: VOCE }),
  ];
  return cena(cam, [...cruzamento(cy), rect(0.2, cy + 4.6, 3.3, cy + 5.05, '#ffffff')], objs, (pr) => voce(pr, 1.75, 1.0), p);
}

/* ---------------- placa apagada e placa torta ---------------- */

function ruaReta(): Part[] {
  return [
    ...grassPatches(-40, -40, 40, 40, 6),
    ...asphalt(-3.5, -40, 3.5, 40, 5),
    rect(-0.08, -40, 0.08, 40, '#f2c21b'),
    ...sidewalk(3.5, -40, 6.5, 40),
    ...sidewalk(-6.5, -40, -3.5, 40),
  ];
}
function casasRua(): Obj[] {
  return [
    wall(6.6, -16, 6.85, 12, 1.4, '#e7dcc4'),
    house(8, -14, 15, -6, '#f3e3b8', '#c8553d', 'w'),
    house(8, -4, 15, 4, '#cfe7c4', '#a8483a', 'w'),
    house(8, 6, 15, 13, '#f1d0b0', '#c8553d', 'w'),
    house(-15, -12, -8, -4, '#d9e3f0', '#b5603f', 'e'),
    house(-15, -1, -8, 7, '#f6d2d2', '#c8553d', 'e'),
    tree(-5.0, 3, 0.9, 4),
    tree(5.0, 8, 0.9, 2),
    lampPost(5.4, -8, -1),
    bin(4.0, 3.5),
  ];
}

/** balão com a placa ampliada, mas tão desbotada que não dá para ler */
function balaoApagado(at: [number, number], dx = 40, dy = -28): ReactNode {
  const cx = Math.min(290, at[0] + dx), cy = Math.max(30, at[1] + dy);
  return (
    <g>
      <line x1={at[0]} y1={at[1]} x2={cx} y2={cy} stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={at[0]} cy={at[1]} r={1.8} fill="#fff" />
      <rect x={cx - 28} y={cy - 28} width={56} height={56} rx={8} fill="#fff" stroke="#0002" />
      <circle cx={cx} cy={cy} r={22} fill="#ece6da" stroke="#e7b8b0" strokeWidth={4} />
      <path d={`M${cx - 14} ${cy - 6}q8 -4 14 2t13 -1M${cx - 12} ${cy + 8}q7 3 12 -2t12 3`} stroke="#d6cfc2" strokeWidth={3} fill="none" strokeLinecap="round" />
      <circle cx={cx + 6} cy={cy - 10} r={3} fill="#d9d2c5" />
    </g>
  );
}

/** placa de rua tão desbotada que não dá para ler; você vem pela rua */
export function PlacaApagada(p: CenaProps) {
  const cam = camLook(2.4, -3.5, 0.8, 20, 36, 13);
  const placa = { x: 4.2, y: -4.2, code: 'R-6a' as const, face: 0 };
  const objs: Obj[] = [...casasRua(), apagar(signPost(placa)), car({ x: 1.75, y: 1.8, color: VOCE }), car({ x: -1.75, y: -14, heading: Math.PI, color: '#4f7fc4' })];
  return cena(cam, ruaReta(), objs, (pr) => (
    <>
      {balaoApagado(pr(signTop(placa)))}
      {voce(pr, 1.75, 1.8)}
    </>
  ), p);
}

/** placa tombada para o lado, quase caindo, com o desenho virado para longe de quem passa */
export function PlacaTorta(p: CenaProps) {
  const cam = camLook(2.4, -3.5, 0.8, 20, 36, 13);
  const torta = tfObj(signPost({ x: 0, y: 0, code: 'R-19', speed: 40, face: 0 }), chain(T(4.3, -4.4), Ry(0.75)));
  const objs: Obj[] = [
    ...casasRua(),
    torta,
    person(5.4, -1.2, SENHOR, 0, Math.PI * 0.85, 1.3),
    car({ x: 1.75, y: 1.8, color: VOCE }),
  ];
  return cena(cam, ruaReta(), objs, (pr) => {
    const [x, y] = pr([4.9, -4.4, 2.6]);
    return (
      <>
        <Tag x={x + 14} y={y - 4} text="Placa torta" />
        {voce(pr, 1.75, 1.8)}
      </>
    );
  }, p);
}

/* ---------------- faixa de pedestres com semáforo ---------------- */

/** faixa com semáforo; a pessoa espera na calçada e você chega de carro */
export function FaixaSemaforo(p: CenaProps) {
  const cy = -11;
  const cam = camLook(1.0, -3.2, 0, 18, 44, 12);
  const ground = [
    ...cruzamento(cy),
    ...zebra(-3.5, -6.9, 3.5, -4.1, 'y'),
    rect(0.2, -3.5, 3.3, -3.05, '#ffffff'),
  ];
  const objs = [
    ...bairro(cy, 1),
    trafficLight(4.4, -7.6, 'verde'),
    trafficLight(-4.4, -3.4, 'vermelho', Math.PI),
    person(4.6, -5.4, RAPAZ, 0, -Math.PI / 2, 1.4),
    car({ x: 1.75, y: 0.4, color: VOCE }),
  ];
  return cena(cam, ground, objs, (pr) => voce(pr, 1.75, 0.4), p);
}

/* ---------------- avenida da cidade ---------------- */

/** avenida larga da cidade, com prédios e trânsito, sem nenhuma placa de velocidade */
export function AvenidaCidade(p: CenaProps) {
  const cam = camLook(-0.2, -3, 0, -16, 40, 10.5);
  const objs: Obj[] = [
    ...avenidaObjs(),
    car({ x: -1.8, y: -12, color: '#e0412f' }),
    car({ x: 1.8, y: -6.5, color: '#4f7fc4' }),
    car({ x: 1.8, y: 1.5, color: VOCE }),
  ];
  return cena(cam, avenida(), objs, (pr) => voce(pr, 1.8, 1.5), p);
}

/* ---------------- Mundo 2: cenas que não mostram cor nem ordem ---------------- */

/** cruzamento sem nenhuma pintura no chão: carros nos dois sentidos, ciclista e carro estacionado */
export function CruzamentoSemPintura({ semaforo = false, ...p }: CenaProps & { semaforo?: boolean }) {
  const cy = -9;
  const cam = camLook(0.4, -3.2, 0, 18, 42, 12);
  const objs: Obj[] = [
    ...bairro(cy, 3),
    car({ x: 1.75, y: 2.2, color: VOCE }),
    car({ x: -1.75, y: -3.2, heading: Math.PI, color: '#4f7fc4' }),
    car({ x: 2.6, y: -20, color: '#7a8a99' }),
  ];
  if (semaforo) objs.push(trafficLight(4.4, cy + 4.0, 'verde'));
  else objs.push(cyclist(3.0, -1.4, 0.4, 0, '#2f6db5'), car({ x: -2.7, y: 7.5, heading: Math.PI, color: '#e0a43a' }));
  return cena(cam, cruzamento(cy, { linhaMeio: false }), objs, (pr) => voce(pr, 1.75, 2.2), p);
}

/** cruzamento visto de trás do semáforo: dá para ver o poste, mas não as luzes */
export function SemaforoCostas(p: CenaProps) {
  const cy = -8;
  const cam = camLook(-0.6, -3.0, 0, 18, 40, 12);
  const objs: Obj[] = [
    ...bairro(cy, 1),
    trafficLight(-4.4, cy - 3.6, 'verde', Math.PI),
    trafficLight(4.4, cy + 0.2, 'vermelho', Math.PI / 2),
    person(-5.0, cy + 4.8, RAPAZ, 0, 0, 1.3),
    car({ x: 1.75, y: 1.2, color: VOCE }),
    car({ x: -1.75, y: -16, heading: Math.PI, color: '#4f7fc4' }),
  ];
  return cena(cam, cruzamento(cy), objs, (pr) => voce(pr, 1.75, 1.2), p);
}

/** placa grande de indicação num pórtico de dois pés; com `costas`, só se vê o verso cinza */
function painel(x0: number, x1: number, y: number, z0: number, z1: number): Obj {
  const pe = (x: number) => box(x - 0.08, y - 0.08, 0, x + 0.08, y + 0.08, z1 - 0.2, '#8b949c');
  return { parts: [pe(x0 + 0.3), pe(x1 - 0.3), box(x0, y - 0.03, z0, x1, y + 0.03, z1, '#9aa3ab')], shadow: true };
}

/** estrada com placas de indicação vistas por trás: dá para saber que são placas, mas não a cor nem o texto */
export function EstradaPlacasCostas(p: CenaProps) {
  const cam = camLook(1.2, -6, 0, 18, 36, 13);
  const objs: Obj[] = [
    painel(4.2, 7.6, -3.0, 1.8, 3.6),
    painel(4.2, 6.6, -13.0, 1.6, 2.6),
    painel(-7.2, -4.2, -9.0, 1.8, 3.2),
    tree(9.5, -6, 1, 3), tree(10.5, 2, 1.1, 1), tree(-9, -1, 1, 2), tree(-10, -16, 1.2, 4), tree(9, -20, 1, 5),
    car({ x: 1.75, y: 1.0, color: VOCE }),
    car({ x: -1.75, y: -12, heading: Math.PI, color: '#e0412f' }),
  ];
  const chao: Part[] = [
    ...grassPatches(-40, -40, 40, 40, 8),
    ...asphalt(-3.5, -40, 3.5, 40, 2),
    rect(-0.08, -40, 0.08, 40, '#f2c21b'),
    rect(3.3, -40, 3.4, 40, '#f4f4f4'),
    rect(-3.4, -40, -3.3, 40, '#f4f4f4'),
  ];
  return cena(cam, chao, objs, (pr) => voce(pr, 1.75, 1.0), p);
}

/** obra na rua: cavaletes listrados, monte de terra e operário; a placa de aviso aparece de costas */
export function ObraPlacaCostas(p: CenaProps) {
  const cam = camLook(0.6, -5, 0, 18, 38, 12.5);
  const cavalete = (x: number, y: number): Obj => ({
    parts: [
      box(x - 0.9, y - 0.06, 0.55, x + 0.9, y + 0.06, 0.85, '#f4f4f4'),
      ...[-0.75, -0.05, 0.65].map((u) => box(x + u - 0.15, y + 0.06, 0.56, x + u + 0.15, y + 0.075, 0.84, '#d8452f')),
      box(x - 0.8, y - 0.05, 0, x - 0.7, y + 0.05, 0.55, '#7d868e'),
      box(x + 0.7, y - 0.05, 0, x + 0.8, y + 0.05, 0.55, '#7d868e'),
    ],
    shadow: true,
  });
  const terra = lathe([[1.5, 0], [1.2, 0.35], [0.7, 0.7], [0, 0.85]], 10, '#8a6a48');
  const objs: Obj[] = [
    ...casasRua(),
    signPost({ x: 4.2, y: -1.0, code: 'A-24', face: Math.PI }),
    cavalete(-1.75, -7.2), cavalete(-1.75, -12.8),
    tfObj({ parts: [terra], shadow: true }, T(-1.9, -10)),
    person(-0.6, -9.4, AGENTE_OBRA, 0.3, Math.PI / 2, 1.3),
    car({ x: 1.75, y: 2.4, color: VOCE }),
  ];
  return cena(cam, ruaReta(), objs, (pr) => voce(pr, 1.75, 2.4), p);
}
const AGENTE_OBRA: Look = { skin: '#c48a62', hair: '#2b2420', top: '#3a6fb0', bottom: '#2f3640', shoes: '#3a2a20', vest: '#c8f03c', cap: '#f4f4f4' };

/* ---------------- Mundo 3 ---------------- */

/** rua de mão única com duas faixas: todos vão no mesmo sentido; você vem pela faixa da direita */
export function MaoUnica(p: CenaProps) {
  const cam = camLook(0.4, -4, 0, 18, 40, 12);
  const chao: Part[] = [
    ...grassPatches(-40, -40, 40, 40, 6),
    ...asphalt(-3.5, -40, 3.5, 40, 4),
    ...sidewalk(3.5, -40, 6.5, 40),
    ...sidewalk(-6.5, -40, -3.5, 40),
  ];
  const objs: Obj[] = [
    ...casasRua(),
    car({ x: -1.75, y: -6, color: '#4f7fc4' }),
    car({ x: 1.75, y: -14, color: '#e0412f' }),
    car({ x: 1.75, y: 1.6, color: VOCE }),
  ];
  const tracos = Array.from({ length: 16 }, (_, i) => rect(-0.07, -40 + i * 5, 0.07, -37.6 + i * 5, '#eeeeea'));
  return cena(cam, [...chao, ...tracos], objs, (pr) => voce(pr, 1.75, 1.6), p);
}

/* ---------------- Mundo 4 ---------------- */

/** agente de trânsito anota algo ao lado de um carro encostado no meio-fio (sem mostrar o que é anotado) */
export function AgenteAutuando(p: CenaProps) {
  const cam = camLook(1.6, -2.2, 0.6, 22, 38, 19);
  const objs: Obj[] = [
    ...casasRua(),
    car({ x: 2.4, y: -1.6, color: '#4f7fc4' }),
    person(0.8, -2.0, AGENTE, 0, Math.PI / 2, 1.35, { r: [1.3, 0], l: [1.1, 0] }),
    { parts: [box(1.0, -2.25, 1.15, 1.3, -1.95, 1.19, '#f4f4f4'), box(1.02, -2.27, 1.12, 1.28, -1.93, 1.15, '#5a4630')] },
    car({ x: -1.75, y: -15, heading: Math.PI, color: '#e0a43a' }),
  ];
  return cena(cam, ruaReta(), objs, () => null, p);
}

/** carta da notificação chegando: caixa de correio na frente de casa, com um envelope saindo */
export function NotificacaoCasa(p: CenaProps) {
  const cam = camLook(5.8, -1.8, 1.0, -62, 30, 30);
  const X = 6.1, Y = -2.6;
  const objs: Obj[] = [
    ...casasRua(),
    {
      parts: [
        box(X - 0.06, Y - 0.06, 0, X + 0.06, Y + 0.06, 0.95, '#6b4a33'),
        box(X - 0.3, Y - 0.22, 0.95, X + 0.3, Y + 0.22, 1.32, '#d8452f'),
        box(X - 0.17, Y - 0.03, 1.32, X + 0.17, Y + 0.03, 1.52, '#ffffff'),
      ],
      shadow: true,
    },
    person(4.9, -0.9, RAPAZ, 0, Math.PI * 1.17, 1.3, { r: [1.2, 0] }),
    car({ x: 1.75, y: -8, color: VOCE }),
  ];
  return cena(cam, ruaReta(), objs, (pr) => {
    const [x, y] = pr([X, Y, 1.55]);
    const bx = x - 34, by = Math.max(26, y - 40);
    return (
      <g>
        <line x1={x} y1={y} x2={bx} y2={by} stroke="#fff" strokeWidth={1.6} />
        <rect x={bx - 22} y={by - 16} width={44} height={32} rx={7} fill="#fff" stroke="#0002" />
        <rect x={bx - 14} y={by - 9} width={28} height={18} rx={2} fill="#f6f1e4" stroke="#8a7f6a" strokeWidth={1.2} />
        <path d={`M${bx - 14} ${by - 9}L${bx} ${by + 2}L${bx + 14} ${by - 9}`} fill="none" stroke="#8a7f6a" strokeWidth={1.2} />
      </g>
    );
  }, p);
}

/* ---------------- Mundo 5 (18/11) ---------------- */

const MECANICO: Look = { skin: '#c48a62', hair: '#2b2420', top: '#3f5f8a', bottom: '#3f5f8a', shoes: '#2a2a2a', cap: '#d8452f' };

/** pneu deitado (para a pilha da oficina) */
function pneu(x: number, y: number, z: number): Part {
  return tfObj({ parts: [lathe([[0.2, 0], [0.34, 0.02], [0.36, 0.13], [0.34, 0.24], [0.2, 0.26]], 12, (i) => (i === 2 ? '#3a3f48' : '#262b33'))] }, T(x, y, z)).parts[0];
}

/** carro parado na frente de uma oficina, com o mecânico olhando a roda: revisão, sem mostrar o defeito */
export function OficinaCarro(p: CenaProps) {
  const cam = camLook(4.6, -1.2, 0.8, 22, 36, 17);
  const objs: Obj[] = [
    ...casasRua().filter((_, i) => i !== 2),
    { parts: [box(8, -4, 0, 15, 4, 3.4, '#cfd6de')], shadow: true },
    { parts: [box(7.95, -2.6, 0, 8.0, 2.6, 2.6, '#3b4250'), box(7.9, -3.2, 2.75, 7.98, 3.2, 3.25, '#d8452f')] },
    car({ x: 2.4, y: -1.6, color: '#4f7fc4' }),
    person(4.0, -2.4, MECANICO, 0, -Math.PI / 2, 1.3, { r: [1.0, 0], l: [0.6, 0] }),
    { parts: [pneu(5.0, 0.6, 0), pneu(5.0, 0.6, 0.27), pneu(5.0, 0.6, 0.54)], shadow: true },
    { parts: [box(4.6, -3.6, 0, 5.2, -3.2, 0.35, '#c0392b'), box(4.65, -3.55, 0.35, 5.15, -3.25, 0.4, '#8f98a3')], shadow: true },
    car({ x: -1.75, y: -15, heading: Math.PI, color: '#e0a43a' }),
  ];
  return cena(cam, ruaReta(), objs, () => null, p);
}

/** motorista prestes a entrar no carro, porta aberta: postura e ajustes, sem mostrar como ficam */
export function CarroPortaAberta(p: CenaProps) {
  const cam = camLook(1.8, -1.4, 0.7, 22, 36, 26);
  const objs: Obj[] = [
    ...casasRua(),
    car({ x: 2.4, y: -1.6, color: VOCE, door: 1 }),
    person(0.9, -0.5, RAPAZ, 0, 0, 1.3),
    car({ x: -1.75, y: -15, heading: Math.PI, color: '#e0a43a' }),
  ];
  return cena(cam, ruaReta(), objs, () => null, p);
}
