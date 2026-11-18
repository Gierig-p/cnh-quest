/**
 * Cenas paradas do Mundo 6 ("Emergências e primeiros socorros") no estilo 3D (lote de 18/11/2026).
 * Mesmas regras dos outros mundos: a imagem mostra a situação do texto e nunca a resposta
 * (nada de triângulo já colocado, pista isolada, extintor na mão ou gente já afastada).
 * Câmera atrás de quem chega, olhando para o norte.
 */
import type { ReactNode } from 'react';
import { Ry, Rz, T, box, camLook, chain, circle, flat, lathe, lines, rng, tfObj, type Line, type Obj, type Part, type V2, type V3 } from './engine';
import { bush, car, grassPatches, person, tree, type Look } from './models';
import { SignCallout, signPost, signTop } from './signs';
import { Tag } from './iso';
import { avenida, avenidaObjs, bairro, cena, cruzamento, voce, type CenaProps } from './Mundo1';
import { campo, estrada, raios } from './Mundo2';
import { MENINO, MOCA, RAPAZ, SENHORA, fumaca } from './Mundo3';
import { motoCaida, motociclistaNoChao, rua } from './Mundo4';
import { facho, luz } from './videoBase';

type Pr = (p: V3) => V2;
const VOCE = '#e9eef3';
export const SENHOR: Look = { skin: '#8a5a3c', hair: '#1d1a18', top: '#2f80ed', bottom: '#33415a' };
export const MOCO: Look = { skin: '#c98a5e', hair: '#3a2a20', top: '#f4f1e6', bottom: '#2f4f7f' };

/* ---------------- peças ---------------- */

/** carro batido: o próprio carro, um pouco torto, com cacos de vidro e pedaços de para-choque no chão */
export function carroBatido(x: number, y: number, heading: number, color: string, seed = 3): Obj[] {
  const r = rng(seed);
  const pedacos: Part[] = [];
  // cacos espalhados à frente do carro (a frente fica em −y no sistema do carro)
  for (let i = 0; i < 16; i++) {
    const a = (r() - 0.5) * 2.4, d = 2.2 + r() * 1.6;
    const cx = Math.sin(a) * d * 0.8, cy = -Math.cos(a) * d;
    const s = 0.05 + r() * 0.08;
    const vidro = i % 3 !== 0;
    pedacos.push(flat(circle(s, 3, r() * 3).map(([u, v]): V2 => [cx + u, cy + v]), vidro ? '#cfe3f2' : '#2d333c', 0.012, 0.9));
  }
  pedacos.push(box(-0.5, -2.75, 0, 0.1, -2.55, 0.12, '#2d333c'));
  return [
    tfObj(car({ x: 0, y: 0, color }), chain(T(x, y), Rz(heading), Ry(0.03))),
    tfObj({ parts: pedacos }, chain(T(x, y), Rz(heading))),
  ];
}

/** mancha de combustível no asfalto: escura, com o brilho colorido de óleo */
export function mancha(x: number, y: number, rx: number, ry: number, seed = 5): Part[] {
  const r = rng(seed);
  const borda = (k: number): V2[] =>
    Array.from({ length: 20 }, (_, i) => {
      const a = (i / 20) * Math.PI * 2;
      const q = (0.8 + r() * 0.35) * k;
      return [x + Math.cos(a) * rx * q, y + Math.sin(a) * ry * q];
    });
  return [
    flat(borda(1), '#2c2a24', 0.004, 0.95),
    flat(borda(0.72), '#3a3830', 0.006, 0.95),
    lines([
      { p: [[x - rx * 0.5, y - ry * 0.2, 0.008], [x + rx * 0.1, y - ry * 0.45, 0.008]], c: '#a58be0', w: 1.1, o: 0.8 },
      { p: [[x - rx * 0.2, y + ry * 0.1, 0.008], [x + rx * 0.45, y - ry * 0.05, 0.008]], c: '#6fd0b8', w: 1.1, o: 0.8 },
      { p: [[x - rx * 0.35, y + ry * 0.4, 0.008], [x + rx * 0.2, y + ry * 0.35, 0.008]], c: '#e8c95e', w: 1, o: 0.7 },
    ]),
  ];
}

/** poste de concreto com a cruzeta no alto; `tomba` inclina o poste (radianos) para a rua */
function posteRede(x: number, y: number, tomba = 0): Obj {
  const c = '#b9bec5';
  const parts: Part[] = [
    box(-0.14, -0.14, 0, 0.14, 0.14, 7.4, (k) => (k === 'top' ? '#d3d7dc' : c)),
    box(-0.9, -0.07, 6.9, 0.9, 0.07, 7.05, '#8d949c'),
    ...[-0.75, 0, 0.75].map((dx) => box(dx - 0.04, -0.04, 7.05, dx + 0.04, 0.04, 7.22, '#e8ecef')),
  ];
  return tfObj({ parts, shadow: true }, chain(T(x, y), Ry(-tomba)));
}
/** topo do poste (onde os cabos se prendem), já com a inclinação */
const topoPoste = (x: number, y: number, tomba = 0, dx = 0): V3 => [x + dx * Math.cos(tomba) - 7.15 * Math.sin(tomba), y, 7.15 * Math.cos(tomba) + dx * Math.sin(tomba)];

/** cabo pendurado entre dois pontos, com barriga */
function cabo(a: V3, b: V3, barriga = 0.5, w = 1.2): Line {
  const p: V3[] = Array.from({ length: 9 }, (_, i) => {
    const k = i / 8;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k - Math.sin(k * Math.PI) * barriga];
  });
  return { p, c: '#1d2126', w };
}

/** botijão de gás de cozinha, em pé ou deitado (`deitado` = ângulo no chão) */
function botijao(x: number, y: number, deitado: number | null = null, cor = '#4f6f9a'): Obj {
  const perfil: V2[] = [[0.001, 0], [0.17, 0.02], [0.18, 0.06], [0.18, 0.4], [0.16, 0.47], [0.08, 0.5], [0.06, 0.56], [0.001, 0.57]];
  const corpo = lathe(perfil, 10, (i) => (i === 3 ? '#9aa3ad' : cor));
  const alca = box(-0.1, -0.02, 0.52, 0.1, 0.02, 0.6, '#9aa3ad');
  const o: Obj = { parts: [corpo, alca], shadow: true };
  if (deitado === null) return tfObj(o, T(x, y));
  return tfObj(o, chain(T(x, y, 0.18), Rz(deitado), Ry(Math.PI / 2), T(0, 0, -0.28)));
}

/** caminhão de gás: cabine e carroceria aberta com grades e botijões em fileiras */
function caminhaoGas(x: number, y: number, heading: number): Obj[] {
  const cab = '#d9452f', W = 1.1;
  const parts: Part[] = [
    // chassi e para-choque
    box(-W + 0.1, -3.4, 0.45, W - 0.1, 3.4, 0.75, '#2a2f36'),
    // cabine
    box(-W, -3.6, 0.75, W, -1.8, 2.7, (k) => (k === 'top' ? '#e45a43' : cab), (k, q) => {
      if (k === 'n') return [{ p: [q[0], q[1], q[2], q[3]].map((v, i): V3 => [v[0] * 0.86, v[1], i < 2 ? v[2] - 0.15 : v[2] - 0.85]), c: '#3b5470' }];
      return undefined;
    }),
    // carroceria: assoalho e grades
    box(-W, -1.7, 0.75, W, 3.4, 0.9, '#7a5a3c'),
    box(-W, -1.7, 0.9, -W + 0.08, 3.4, 2.0, '#8d949c'),
    box(W - 0.08, -1.7, 0.9, W, 3.4, 2.0, '#8d949c'),
    box(-W, 3.32, 0.9, W, 3.4, 2.0, '#8d949c'),
    box(-W, -1.7, 0.9, W, -1.62, 2.0, '#8d949c'),
  ];
  // botijões na carroceria (fileiras de 4 x 6), faltando alguns que caíram
  const falta = new Set([1, 6, 7, 13]);
  let n = 0;
  for (let j = 0; j < 6; j++)
    for (let i = 0; i < 4; i++) {
      n++;
      if (falta.has(n)) continue;
      const b = botijao(-0.75 + i * 0.5, -1.25 + j * 0.8, null, j % 2 ? '#4f6f9a' : '#5e7fa8');
      parts.push(...tfObj(b, T(0, 0, 0.9)).parts);
    }
  // rodas
  for (const yy of [-2.7, 1.2, 2.5]) for (const sx of [-1, 1]) parts.push(box(sx * W - (sx > 0 ? 0.28 : 0), yy - 0.45, 0, sx * W + (sx < 0 ? 0.28 : 0), yy + 0.45, 0.9, '#262b33'));
  return [tfObj({ parts, shadow: true }, chain(T(x, y), Rz(heading)))];
}

/** nuvem de gás vazando (pixels): manchas brancas meio transparentes e riscos ondulados */
function nuvemGas(x: number, y: number): ReactNode {
  const b = [
    [0, 0, 9],
    [12, -6, 11],
    [-10, -8, 10],
    [4, -16, 13],
    [20, -18, 10],
    [-16, -20, 9],
  ];
  return (
    <g>
      {b.map(([dx, dy, r], i) => (
        <ellipse key={i} cx={x + dx} cy={y + dy} rx={r * 1.3} ry={r} fill="#eef3f6" opacity={0.42 - i * 0.03} />
      ))}
      <g fill="none" stroke="#ffffff" strokeWidth={1.2} strokeLinecap="round" opacity={0.75}>
        {[-14, 0, 14].map((dx) => (
          <path key={dx} d={`M${x + dx} ${y + 4}q4 -5 0 -10q-4 -5 0 -10`} />
        ))}
      </g>
    </g>
  );
}

/** pista que faz uma curva para a direita; devolve o chão e o caminho do meio */
const CURVA_C: V2 = [15, -6], CURVA_R = 15;
function pontoCurva(t: number, d = 0): V3 {
  // t < 0: reta (y = −6 − t... ao sul); 0..1: arco de 90° para a direita
  if (t <= 0) return [d, -6 - t * 46, 0];
  const a = t * (Math.PI / 2);
  const cx = CURVA_C[0] - Math.cos(a) * (CURVA_R - d), cy = CURVA_C[1] - Math.sin(a) * (CURVA_R - d);
  return [cx, cy, 0];
}
function curvaChao(): Part[] {
  const ts = [-1, -0.5, 0, ...Array.from({ length: 16 }, (_, i) => (i + 1) / 16), 1.3];
  const pt = (t: number, d: number): V2 => {
    if (t > 1) {
      const [px, py] = pontoCurva(1, d);
      return [px + (t - 1) * 60, py];
    }
    const [px, py] = pontoCurva(t, d);
    return [px, py];
  };
  const out: Part[] = [...grassPatches(-50, -70, 60, 40, 9)];
  for (let i = 0; i < ts.length - 1; i++) {
    const a = ts[i], b = ts[i + 1];
    out.push(flat([pt(a, -5.2), pt(b, -5.2), pt(b, 5.2), pt(a, 5.2)], '#c9b48a', 0.001));
    out.push(flat([pt(a, -4.6), pt(b, -4.6), pt(b, 4.6), pt(a, 4.6)], '#6d747d', 0.002));
    out.push(flat([pt(a, -3.5), pt(b, -3.5), pt(b, 3.5), pt(a, 3.5)], '#5b636e', 0.003));
  }
  const linha = (d: number) => ts.map((t): V3 => [...pt(t, d), 0.006]);
  out.push(lines([
    { p: linha(-3.4), c: '#eeeeea', w: 1.1 },
    { p: linha(3.4), c: '#eeeeea', w: 1.1 },
    { p: linha(0), c: '#f2c21b', w: 1.2, dash: '6 6' },
  ]));
  return out;
}

/* ---------------- 1. calma e liderança ---------------- */

/** três pessoas pararam os carros no acostamento e foram até um carro batido */
export function TresAjudantes(p: CenaProps) {
  const objs: Obj[] = [
    ...campo(2),
    ...carroBatido(1.3, -11, 0.55, '#4f7fc4'),
    car({ x: 4.9, y: -1.5, color: '#e0412f', blink: 'lr' }),
    car({ x: 4.9, y: 5, color: '#8f98a3', blink: 'lr' }),
    person(4.2, -7.6, MOCA, 0, -2.4, 1.3),
    person(5.0, -6.9, RAPAZ, 0, -2.6, 1.3),
    person(4.5, -6.2, SENHOR, 0, -2.2, 1.3),
  ];
  const cam = camLook(2.8, -8, 0, 14, 38, 15);
  return cena(cam, estrada('tracejada'), objs, (pr) => {
    const [fx, fy] = pr([1.3 - 1.2, -11 - 1.6, 1]);
    return <>{fumaca(fx, fy, 0.9)}</>;
  }, p);
}

/* ---------------- 2. sinalizar ---------------- */

/** avenida: uma moto bateu num carro; o motociclista está no chão (com ou sem a placa de 60 km/h) */
export function SinistroAvenida({ placa60 = false, ...p }: CenaProps & { placa60?: boolean }) {
  const placa = { x: 4.9, y: -5, code: 'R-19' as const, speed: 60, face: 0 };
  const objs: Obj[] = [
    ...avenidaObjs(1),
    ...carroBatido(1.6, -11.5, 0.35, '#8f98a3', 7),
    motoCaida(-0.4, -9.4, 0.9, '#e05a5a'),
    motociclistaNoChao(-1.7, -8.0, 0.4),
    ...(placa60 ? [signPost(placa)] : []),
    car({ x: -1.8, y: -2, color: VOCE }),
  ];
  const cam = camLook(0.4, -7.5, 0, 14, 40, 15);
  return cena(cam, avenida(), objs, (pr) => (
    <>
      {placa60 && <SignCallout at={pr(signTop(placa))} code="R-19" speed={60} dx={34} dy={-24} />}
      {voce(pr, -1.8, -2)}
    </>
  ), p);
}

/** rodovia: logo depois de uma curva, atrás do morro, há um carro batido; você vem chegando (dia ou noite) */
export function SinistroCurva({ noite = false, ...p }: CenaProps & { noite?: boolean }) {
  const [bx, by] = pontoCurva(0.5, 1.75);
  const objs: Obj[] = [
    // mata fechada por dentro da curva esconde o que vem depois
    ...([[6.2, -2.5, 1.2], [6.0, -6.5, 1.3], [11.5, -15.4, 1.2], [9.4, -4.2, 1.3], [9.8, -8.8, 1.35], [12.6, -6.2, 1.2], [13, -11, 1.25], [15.6, -9, 1.2], [8.2, 0.8, 1.1], [11.6, -1.6, 1.15]] as const).map(([x, y, k], i) => tree(x, y, k, (i % 5) + 1)),
    bush(5.6, 1.5, 0.9, 1),
    bush(7.2, -15.6, 0.9, 2),
    tree(-8, -4, 1.1, 5),
    tree(-9, 8, 1.2, 6),
    tree(-7, -16, 1.15, 2),
    tree(4, -27, 1.2, 3),
    tree(14, -29, 1.1, 1),
    bush(-6.5, 2, 0.9, 2),
    ...carroBatido(bx, by, 0.95, '#4f7fc4', 9),
    car({ x: 1.75, y: 1.2, color: VOCE }),
  ];
  const cam = camLook(4.5, -7.5, 0, 8, 52, 11.5);
  return cena(cam, curvaChao(), objs, (pr) => (
    <>
      {noite && (
        <>
          <rect x={0} y={0} width={320} height={200} fill="#070d22" opacity={0.62} />
          {facho(pr, 1.75, 1.2, -1, 0, 0.24)}
          {[-0.6, 0.6].map((dx) => <g key={dx}>{luz(pr, [1.75 + dx, 1.2 + 2.15, 0.85], 1.3, '#ff3b30')}</g>)}
        </>
      )}
      <Tag {...tagEm(pr, [bx, by, 2.2])} text="Carro batido" />
      {voce(pr, 1.75, 1.2)}
    </>
  ), p);
}
const tagEm = (pr: Pr, q: V3) => {
  const [x, y] = pr(q);
  return { x, y: y - 8 };
};

/* ---------------- 3. riscos no local ---------------- */

/** dois carros batidos na estrada e muitos curiosos andando pela pista */
export function CuriososPista(p: CenaProps) {
  const objs: Obj[] = [
    ...campo(5),
    ...carroBatido(1.5, -12, 0.5, '#4f7fc4', 2),
    ...carroBatido(-1.2, -14.6, 2.5, '#f2c21b', 4),
    car({ x: 4.9, y: -3, color: '#8f98a3' }),
    person(0.4, -8.5, MOCA, 0.5, 0.4, 1.3),
    person(-0.9, -9.6, RAPAZ, 0.9, -0.3, 1.3),
    person(2.6, -7.2, SENHORA, 0.2, 0.2, 1.25),
    person(-2.4, -7.8, MENINO, 0.7, 0.6, 1.0),
    person(-1.6, -11.6, SENHOR, 0.3, 2.8, 1.3),
    person(2.8, -15.6, MOCO, 0.6, 3.1, 1.3),
    car({ x: 1.75, y: -1.5, color: VOCE }),
  ];
  const cam = camLook(0.4, -9.5, 0, 12, 38, 14);
  return cena(cam, estrada('tracejada'), objs, (pr) => voce(pr, 1.75, -1.5), p);
}

/** carro batido com combustível vazando na estrada; `curiosos`: gente em volta e um cigarro aceso */
export function VazamentoCombustivel({ curiosos = false, ...p }: CenaProps & { curiosos?: boolean }) {
  const xc = 2.0, yc = -10;
  const ground = [...estrada('tracejada'), ...mancha(xc + 0.5, yc + 1.2, 1.7, 2.9), ...mancha(xc + 1.9, yc + 3.6, 0.7, 1.1, 8)];
  const gente: Obj[] = curiosos
    ? [person(4.6, -11.5, MOCA, 0, -1.8, 1.3), person(4.4, -8.4, SENHOR, 0, -1.4, 1.3, { r: [0.1, 1.9] }), person(-0.4, -7.6, RAPAZ, 0, 0.9, 1.3), person(-0.2, -12.6, MOCO, 0, 1.6, 1.3)]
    : [];
  const objs: Obj[] = [...campo(3), ...carroBatido(xc, yc, -0.35, '#e9a47c', 6), ...gente, car({ x: 1.75, y: -1, color: VOCE })];
  // com curiosos, a câmera chega mais perto do senhor que acende o cigarro
  const cam = curiosos ? camLook(3.4, -8.6, 0, 14, 42, 21) : camLook(2, -8.5, 0, 14, 42, 15.5);
  return cena(cam, ground, objs, (pr) => {
    const [mx, my] = pr([xc + 1.9, yc + 3.6, 0]);
    // cigarro aceso na mão do senhor (braço direito dobrado à frente do rosto)
    const [cx, cy] = pr([4.4 - 0.3, -8.4 - 0.1, 1.7]);
    return (
      <>
        <Tag x={mx + 18} y={my - 4} text="Combustível" />
        {curiosos && (
          <g>
            <line x1={cx + 3.2} y1={cy + 0.8} x2={cx} y2={cy} stroke="#f4f1e8" strokeWidth={1.6} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={3.2} fill="#ff7a2f" opacity={0.35} />
            <circle cx={cx} cy={cy} r={1.5} fill="#ff6a1a" />
            <path d={`M${cx} ${cy - 2.5}q4 -5 0 -10q-4 -5 0 -10`} fill="none" stroke="#e8ecef" strokeWidth={1.3} opacity={0.9} />
            <Tag x={cx} y={cy - 34} text="Cigarro aceso" />
          </g>
        )}
        {voce(pr, 1.75, -1)}
      </>
    );
  }, p);
}

/** um carro bateu num poste e o cabo de energia caiu sobre o teto; `curioso`: alguém vem puxar o cabo */
export function CaboCarro({ curioso = false, ...p }: CenaProps & { curioso?: boolean }) {
  const r = rua(3);
  const tomba = 0.32;
  const xp = 4.1, yp = -11;
  const objs: Obj[] = [
    ...r.objs,
    posteRede(xp, -26),
    posteRede(xp, yp, tomba),
    posteRede(xp, 4),
    ...carroBatido(2.2, -9.6, -0.5, '#2fa36b', 5),
    ...(curioso ? [person(4.9, -5.2, MOCO, 0.6, -2.5, 1.3, { r: [0.15, 1.3] })] : []),
  ];
  const teto: V3 = [2.0, -9.4, 1.48];
  const chao: V3 = [0.2, -7.6, 0.02];
  const fios: Line[] = [
    cabo(topoPoste(xp, -26, 0, -0.75), topoPoste(xp, yp, tomba, -0.75), 0.6),
    cabo(topoPoste(xp, -26, 0, 0.75), topoPoste(xp, yp, tomba, 0.75), 0.6),
    cabo(topoPoste(xp, yp, tomba, -0.75), topoPoste(xp, 4, 0, -0.75), 0.8),
    // o cabo do meio arrebentou: desce até o teto do carro e cai no chão
    cabo(topoPoste(xp, -26, 0, 0), teto, 1.4, 1.5),
    { p: [teto, [1.2, -8.6, 0.9], chao, [-0.6, -6.4, 0.02]], c: '#1d2126', w: 1.5 },
  ];
  return cena(camLook(2.2, -9.5, 0, -14, 36, 16), [...r.ground, lines(fios)], objs, (pr) => {
    const [sx, sy] = pr(teto);
    const [gx, gy] = pr(chao);
    return (
      <>
        {raios(sx, sy, 3, 4, '#ffd84a', 7)}
        {raios(gx, gy, 2, 3, '#ffd84a', 6)}
        <Tag x={sx - 6} y={sy - 16} text="Cabo de energia" />
      </>
    );
  }, p);
}

/** um caminhão de gás bateu na estrada; caíram botijões e o gás está vazando */
export function CaminhaoGas(p: CenaProps) {
  const objs: Obj[] = [
    ...campo(6),
    ...caminhaoGas(0.9, -12, 0.45),
    botijao(2.6, -8.6, 0.4),
    botijao(3.4, -9.6, 1.6),
    botijao(1.5, -7.4, 2.4),
    botijao(-0.6, -8.4, null),
    car({ x: -1.75, y: -30, heading: Math.PI, color: '#4f7fc4' }),
    car({ x: 1.75, y: -1, color: VOCE }),
  ];
  const cam = camLook(1.4, -9.5, 0, 14, 38, 14.5);
  return cena(cam, estrada('tracejada'), objs, (pr) => {
    const [gx, gy] = pr([2.6, -8.6, 0.4]);
    return (
      <>
        {nuvemGas(gx + 8, gy - 4)}
        <Tag x={gx + 46} y={gy - 34} text="Vazamento de gás" />
        {voce(pr, 1.75, -1)}
      </>
    );
  }, p);
}

/* ---------------- 4. a lei ---------------- */

/** dois carros se encostaram no meio do cruzamento; ninguém se feriu e a fila cresce */
export function BatidaCruzamento(p: CenaProps) {
  const cy = -10;
  const objs: Obj[] = [
    ...bairro(cy, 2),
    car({ x: 1.75, y: cy + 0.6, heading: -0.12, color: '#e0412f' }),
    car({ x: 3.4, y: cy - 2.1, heading: -Math.PI / 2 - 0.2, color: '#4f7fc4' }),
    car({ x: 1.75, y: cy + 6.8, color: '#8f98a3', brake: true }),
    car({ x: 1.75, y: cy + 13, color: VOCE, brake: true }),
    car({ x: 9, y: cy - 1.75, heading: -Math.PI / 2, color: '#f2c21b', brake: true }),
    car({ x: -7.5, y: cy + 1.75, heading: Math.PI / 2, color: '#d9e3f0', brake: true }),
    car({ x: -1.75, y: cy - 8, heading: Math.PI, color: '#2fa36b', brake: true }),
  ];
  const cam = camLook(1.2, cy + 2.5, 0, 14, 42, 13.5);
  return cena(cam, cruzamento(cy), objs, (pr) => voce(pr, 1.75, cy + 13), p);
}
