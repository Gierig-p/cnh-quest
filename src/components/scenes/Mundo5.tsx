/**
 * Cenas paradas do Mundo 5 ("Motorista defensivo") no estilo 3D (lote de 16/11/2026).
 * Mesmas regras dos outros mundos: a imagem mostra a situação do texto e nunca a resposta
 * (nada de luz certa acesa, criança atrás da bola ou distância "boa" marcada na cena).
 * Câmera atrás de você, olhando para o norte.
 */
import type { ReactNode } from 'react';
import { T, box, camLook, flat, lathe, lines, rng, tfObj, type Obj, type Part, type V2, type V3 } from './engine';
import { asphalt, car, cyclist, grassPatches, house, lampPost, person, sidewalk, tree } from './models';
import { utilitario } from './veiculos';
import { SignCallout, signPost, signTop } from './signs';
import { Tag } from './iso';
import { avenida, avenidaObjs, cena, voce, type CenaProps } from './Mundo1';
import { Balao, CAM_ESTRADA, campo, estrada, raios } from './Mundo2';
import { MOCA, RAPAZ, SENHORA, chuva } from './Mundo3';
import { AV, AV_OBJS, FX, facho, farolPar, luz, moto } from './videoBase';

type Pr = (p: V3) => V2;
const VOCE = '#e9eef3';

/* ---------------- peças ---------------- */

/** bola de futebol no chão */
export function bola(x: number, y: number, r = 0.28): Obj {
  const perfil: V2[] = Array.from({ length: 9 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 8) * Math.PI;
    return [Math.max(0.001, Math.cos(a) * r), r + Math.sin(a) * r];
  });
  const cores = (i: number) => (i === 3 || i === 4 ? '#f4f1e6' : '#f26b1d');
  return { ...tfObj({ parts: [lathe(perfil, 10, cores)] }, T(x, y)), shadow: true };
}

/** poça de água no asfalto: mancha azulada com reflexos */
function poca(x: number, y: number, rx: number, ry: number): Part[] {
  const r = rng(5);
  const pts: V2[] = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    const k = 0.85 + r() * 0.25;
    return [x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k];
  });
  return [
    flat(pts, '#5f7f9f', 0.004, 0.95),
    flat(pts.map(([a, b]): V2 => [x + (a - x) * 0.7, y + (b - y) * 0.75]), '#88a6c2', 0.006, 0.85),
    lines([
      { p: [[x - rx * 0.4, y - ry * 0.3, 0.008], [x + rx * 0.1, y - ry * 0.5, 0.008]], c: '#dfeaf5', w: 1.1 },
      { p: [[x - rx * 0.1, y + ry * 0.2, 0.008], [x + rx * 0.45, y, 0.008]], c: '#dfeaf5', w: 0.9 },
    ]),
  ];
}

/** marco de quilômetro na beira da estrada: um poste com a plaquinha verde */
function marco(x: number, y: number): Obj {
  return {
    parts: [
      box(x - 0.08, y - 0.08, 0, x + 0.08, y + 0.08, 2.2, '#d9dde2'),
      box(x - 0.1, y - 0.7, 1.6, x + 0.1, y + 0.7, 2.6, '#1f7a4d'),
    ],
    shadow: true,
  };
}

/** morros ao fundo (serra) */
function morros(): Obj[] {
  return [
    { parts: [box(-60, -90, 0, -8, -45, 14, (k) => (k === 'top' ? '#7fb26c' : '#6a965a'))] },
    { parts: [box(8, -90, 0, 60, -50, 18, (k) => (k === 'top' ? '#86b873' : '#6f9b5d'))] },
    { parts: [box(-60, -110, 0, 60, -88, 24, (k) => (k === 'top' ? '#90bf7e' : '#78a266'))] },
  ];
}

/** granizo: pedrinhas brancas caindo e espalhadas no chão (em pixels) */
function granizo(): ReactNode {
  const r = rng(17);
  const ar = Array.from({ length: 90 }, () => [r() * 320, r() * 200, 1 + r() * 1.4] as const);
  const chao = Array.from({ length: 140 }, () => [r() * 320, 110 + r() * 90, 0.7 + r() * 1] as const);
  return (
    <g>
      <rect x={0} y={0} width={320} height={200} fill="#4f5b68" opacity={0.45} />
      <g fill="#f4f8fb" opacity={0.85}>
        {chao.map(([x, y, rr], i) => <circle key={`c${i}`} cx={x} cy={y} r={rr} />)}
      </g>
      <g fill="#ffffff">
        {ar.map(([x, y, rr], i) => (
          <g key={`a${i}`}>
            <line x1={x} y1={y - rr * 4} x2={x} y2={y} stroke="#ffffff" strokeWidth={0.6} opacity={0.5} />
            <circle cx={x} cy={y} r={rr} />
          </g>
        ))}
      </g>
    </g>
  );
}

/** neblina fechada: branco forte ao longe e mais fraco perto de você */
function neblina(id: string): ReactNode {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-neb`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8edf1" stopOpacity="0.97" />
          <stop offset="0.55" stopColor="#e8edf1" stopOpacity="0.85" />
          <stop offset="1" stopColor="#e8edf1" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={320} height={200} fill={`url(#${id}-neb)`} />
    </>
  );
}

/* ---------------- 1. pensar antes ---------------- */

/** rua de bairro com casas e carros estacionados dos dois lados (usada também no vídeo c5-defensiva) */
export const BAIRRO_A = 3.6;
export const BAIRRO_CHAO: Part[] = [
  ...grassPatches(-40, -50, 40, 40, 4),
  ...asphalt(-3.6, -50, 3.6, 40, 6),
  ...sidewalk(3.6, -50, 6.2, 40),
  ...sidewalk(-6.2, -50, -3.6, 40),
];
export const BAIRRO_OBJS: Obj[] = (() => {
  const c = 6.2;
  return [
    house(c + 1.5, -30, c + 8, -21, '#f3e3b8', '#c8553d', 'w'),
    house(c + 1.5, -18, c + 8, -9, '#cfe7c4', '#8b5a3c', 'w'),
    house(c + 1.5, -6, c + 8, 3, '#d9e3f0', '#c8553d', 'w'),
    house(-c - 8, -27, -c - 1.5, -18, '#f1d0b0', '#8b5a3c', 'e'),
    house(-c - 8, -15, -c - 1.5, -6, '#9fc3e6', '#c8553d', 'e'),
    house(-c - 8, -3, -c - 1.5, 6, '#f1dca6', '#8b5a3c', 'e'),
    tree(4.9, -14.5, 0.85, 2),
    tree(-4.9, -20, 0.9, 3),
    lampPost(4.9, -26, -1),
    // estacionados à direita e à esquerda
    car({ x: 2.6, y: -5.6, color: '#4f7fc4' }),
    car({ x: 2.6, y: -12.6, color: '#d9e3f0' }),
    car({ x: 2.6, y: -18.6, color: '#2fa36b' }),
    car({ x: -2.6, y: -8, heading: Math.PI, color: '#e0412f' }),
    car({ x: -2.6, y: -14, heading: Math.PI, color: '#8f98a3' }),
    car({ x: -2.6, y: -21, heading: Math.PI, color: '#f2c21b' }),
  ];
})();

export function BolaCarros(p: CenaProps) {
  const ground = BAIRRO_CHAO;
  const objs: Obj[] = [
    ...BAIRRO_OBJS,
    bola(1.2, -9.3),
    car({ x: 0, y: 3, color: VOCE }),
  ];
  const cam = camLook(0.4, -6, 0, 12, 38, 12.5);
  return cena(cam, ground, objs, (pr) => {
    const [bx, by] = pr([1.2, -9.3, 0.6]);
    return (
      <>
        <Tag x={bx} y={by - 10} text="Bola" />
        {voce(pr, 0, 3)}
      </>
    );
  }, p);
}

/** você dirige um caminhão na estrada; um ciclista vai à frente, junto à borda */
export function CaminhaoCiclista(p: CenaProps) {
  const objs = [...campo(3), cyclist(2.85, -9.5, 0.4, 0), car({ x: -1.75, y: -30, heading: Math.PI, color: '#4f7fc4' }), utilitario({ x: 1.6, y: 0.5, tipo: 'caminhao' })];
  return cena(CAM_ESTRADA, estrada('tracejada'), objs, (pr) => {
    const [bx, by] = pr([2.85, -9.5, 1.9]);
    return (
      <>
        <Tag x={bx} y={by - 8} text="Bicicleta" />
        {voce(pr, 1.6, 0.5, 3.9)}
      </>
    );
  }, p);
}

/* ---------------- 2. postura e visão ---------------- */

/** avenida de três faixas: você na do meio; uma moto vem logo atrás, na faixa da esquerda */
export function PontoCego(p: CenaProps) {
  const objs = [...AV_OBJS, car({ x: FX[1], y: -14, color: '#4f7fc4' }), car({ x: FX[2], y: -22, color: '#8f98a3' }), moto(FX[0] + 0.6, 4.6, 0, '#e05a5a'), car({ x: FX[1], y: 1.5, color: VOCE })];
  const cam = camLook(-0.4, -1, 0, 10, 40, 11.5);
  return cena(cam, AV, objs, (pr) => {
    const [mx, my] = pr([FX[0] + 0.6, 4.6, 1.8]);
    return (
      <>
        <Tag x={mx} y={my - 8} text="Moto" />
        {voce(pr, FX[1], 1.5)}
      </>
    );
  }, p);
}

/** espelho retrovisor interno (60 x 24) com os faróis de trás refletindo */
function Retrovisor() {
  return (
    <g>
      <rect x={0} y={0} width={84} height={30} rx={11} fill="#20262e" />
      <rect x={4} y={4} width={76} height={22} rx={8} fill="#1b2a44" />
      <rect x={4} y={18} width={76} height={8} rx={3} fill="#2a3446" />
      {[30, 54].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={15} r={9} fill="#fff6c8" opacity={0.35} />
          <circle cx={cx} cy={15} r={4.2} fill="#fffbe6" />
          {raios(cx, 15, 6, 4, '#fff6c8', 8)}
        </g>
      ))}
    </g>
  );
}

/** à noite, numa avenida: o carro de trás vem com o farol batendo no seu retrovisor */
export function RetrovisorOfusca(p: CenaProps) {
  const objs = [...avenidaObjs(2), car({ x: 1.8, y: -16, color: '#8f98a3' }), car({ x: 1.8, y: 1.5, color: VOCE }), car({ x: 1.8, y: 8.6, color: '#4f7fc4' })];
  const cam = camLook(0.2, -2, 0, 12, 40, 13);
  return cena(cam, avenida(), objs, (pr) => (
    <>
      {escuroAvenida(pr)}
      {facho(pr, 1.8, 8.6, -1, 0.6, 0.22)}
      {farolPar(pr, 1.8, 8.6, -1, 1.8)}
      {[-0.6, 0.6].map((dx) => <g key={dx}>{luz(pr, [1.8 + dx, 1.5 + 2.15, 0.85], 1.4, '#ff3b30')}</g>)}
      <Balao at={pr([1.8, 1.2, 1.35])} x={214} y={10} w={96} h={42}>
        <g transform="translate(6 6)">
          <Retrovisor />
        </g>
      </Balao>
      {voce(pr, 1.8, 1.5)}
    </>
  ), p);
}

/** noite na avenida, com a luz dos postes */
function escuroAvenida(pr: Pr): ReactNode {
  return (
    <>
      <rect x={0} y={0} width={320} height={200} fill="#0a1430" opacity={0.6} />
      {[[4.2, -12, 4.3], [-4.2, -26, 4.3]].map((q, i) => {
        const [x, y] = pr(q as V3);
        return <circle key={i} cx={x} cy={y} r={6} fill="#ffe7a8" opacity={0.55} />;
      })}
    </>
  );
}

/* ---------------- 3. distância e velocidade ---------------- */

/** você segue um caminhão na estrada; ele passa por um marco na beira da pista */
export function DoisSegundos(p: CenaProps) {
  const objs = [...campo(4), marco(4.6, -10.5), utilitario({ x: 1.75, y: -9.5, tipo: 'caminhao' }), car({ x: -1.75, y: -34, heading: Math.PI, color: '#e0412f' }), car({ x: 1.75, y: 1.5, color: VOCE })];
  return cena(CAM_ESTRADA, estrada('tracejada'), objs, (pr) => {
    const [px, py] = pr([4.6, -10.5, 3.3]);
    return (
      <>
        <Tag x={px} y={py - 8} text="Placa" />
        {voce(pr, 1.75, 1.5)}
      </>
    );
  }, p);
}

/** estrada com a placa de 80 km/h, chuva e gente andando na beira */
export function Chuva80(p: CenaProps) {
  const placa = { x: 6.8, y: -8, code: 'R-19' as const, speed: 80, face: 0 };
  const objs: Obj[] = [
    ...campo(6),
    signPost(placa),
    person(6.9, -3.5, MOCA, 0.3, Math.PI, 1.3),
    person(7.4, -1, RAPAZ, 0.6, Math.PI, 1.3),
    person(-6.8, -6, SENHORA, 0.2, 0, 1.25),
    car({ x: -1.75, y: -30, heading: Math.PI, color: '#4f7fc4' }),
    car({ x: 1.75, y: 1.5, color: VOCE }),
  ];
  return cena(CAM_ESTRADA, estrada('tracejada'), objs, (pr) => (
    <>
      {chuva()}
      <SignCallout at={pr(signTop(placa))} code="R-19" speed={80} dx={30} dy={-26} />
      {voce(pr, 1.75, 1.5)}
    </>
  ), p);
}

/* ---------------- 4. chuva, neblina e luz ---------------- */

/** chuva forte na rodovia; uma poça grande cobre a sua faixa lá na frente */
export function PocaRodovia(p: CenaProps) {
  const ground = [...estrada('tracejada'), ...poca(1.6, -9, 1.75, 4.6)];
  const objs = [...campo(5), car({ x: -1.75, y: -32, heading: Math.PI, color: '#8f98a3' }), car({ x: 1.75, y: 1.5, color: VOCE })];
  return cena(CAM_ESTRADA, ground, objs, (pr) => {
    const [px, py] = pr([1.6, -9, 0]);
    return (
      <>
        {chuva()}
        <Tag x={px} y={py - 12} text="Poça" />
        {voce(pr, 1.75, 1.5)}
      </>
    );
  }, p);
}

/** chuva de granizo forte na estrada */
export function Granizo(p: CenaProps) {
  const objs = [...campo(8), car({ x: 1.75, y: -14, color: '#8f98a3', brake: true }), car({ x: -1.75, y: -28, heading: Math.PI, color: '#e0412f' }), car({ x: 1.75, y: 1.5, color: VOCE })];
  return cena(CAM_ESTRADA, estrada('tracejada'), objs, (pr) => (
    <>
      {granizo()}
      {voce(pr, 1.75, 1.5)}
    </>
  ), p);
}

/** neblina fechada na serra: mal se vê a traseira do carro da frente */
export function NeblinaSerra(p: CenaProps) {
  const objs = [...morros(), ...campo(2), car({ x: 1.75, y: -9, color: '#8f98a3' }), car({ x: 1.75, y: 1.5, color: VOCE })];
  return cena(CAM_ESTRADA, estrada('continua'), objs, (pr) => (
    <>
      {neblina(p.id ?? 'nb')}
      {[-0.6, 0.6].map((dx) => <g key={dx}>{luz(pr, [1.75 + dx, -9 + 2.15, 0.85], 1.3, '#ff5a50')}</g>)}
      {voce(pr, 1.75, 1.5)}
    </>
  ), p);
}

/** à noite, um carro vem de frente com o farol alto e ofusca você */
export function FarolAltoFrente(p: CenaProps) {
  const yo = -17;
  const objs = [...campo(7), car({ x: -1.75, y: yo, heading: Math.PI, color: '#4f7fc4' }), car({ x: 1.75, y: 1.5, color: VOCE })];
  return cena(CAM_ESTRADA, estrada('tracejada'), objs, (pr) => (
    <>
      <rect x={0} y={0} width={320} height={200} fill="#070d22" opacity={0.68} />
      {facho(pr, 1.75, 1.5, -1, 0, 0.22)}
      {facho(pr, -1.75, yo, 1, 1, 0.3)}
      {[-0.6, 0.6].map((dx) => {
        const [x, y] = pr([-1.75 + dx, yo + 2.15, 0.75]);
        return (
          <g key={dx}>
            <circle cx={x} cy={y} r={11} fill="#fff6c8" opacity={0.3} />
            <circle cx={x} cy={y} r={3.6} fill="#fffbe6" />
            {raios(x, y, 5, 6, '#fff6c8', 10)}
          </g>
        );
      })}
      {[-0.6, 0.6].map((dx) => <g key={`t${dx}`}>{luz(pr, [1.75 + dx, 1.5 + 2.15, 0.85], 1.4, '#ff3b30')}</g>)}
      {voce(pr, 1.75, 1.5)}
    </>
  ), p);
}
