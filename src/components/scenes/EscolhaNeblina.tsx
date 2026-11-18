/**
 * Vídeo de escolha da neblina na serra (w5-rua-5, 17/11/2026).
 * Introdução: de manhã cedo, você desce a serra (paredão de pedra à esquerda, guard-rail à direita) atrás
 * de outro carro. A neblina fecha aos poucos até quase esconder o carro da frente: sobram as lanternas.
 * A imagem para na pergunta ("O que você faz?").
 * Finais pelo ID da alternativa:
 *  a: acende a luz alta; a luz bate na neblina e clareia a névoa na frente do carro (sem clarão na tela).
 *  b: para no meio da pista; um X marca o carro parado. Nenhum outro carro chega.
 *  c (certa): luz baixa, reduz e a distância do carro da frente aumenta; depois um corte
 *     "Se não der para seguir" mostra o carro entrando num posto e parando.
 *  d: encosta no carro da frente até perto (ainda sem tocar) e a cena para.
 * Nos errados, depois do aviso, um corte volta ao ponto da decisão e mostra o jeito seguro (igual ao c, mais curto).
 * Na estrada, a câmera acompanha o seu carro e a paisagem é que passa (igual a EscolhaSono).
 * A neblina é uma camada por cima da cena, mais densa quanto mais longe do seu carro.
 */
import type { ReactNode } from 'react';
import { Scene3D, box, camLook, rect, type Obj, type Part } from './engine';
import { car, house, tree } from './models';
import { estrada } from './Mundo2';
import { clamp, ease, janela, lerp, luz, pisca, tag, VOCE, type Pr } from './videoBase';
import { aviso, etiqueta, interroga, visto, xis } from './escolhaUI';
import tempos from '../../content/escolhas/w5-rua-5.json';

export type Parte = 'intro' | 'a' | 'b' | 'c' | 'd';
type Tempo = { dur: number; falas: { ini: number; fim: number }[] };
export const TEMPOS = tempos as Record<Parte, Tempo>;

/* ---------------- tempos ---------------- */

const V = 6; // velocidade na descida (m/s de desenho)
const V_LENTO = 3.5; // depois de reduzir
const X = 1.75; // centro da sua faixa
const D0 = 14; // distância do carro da frente na introdução
/** a pergunta (última fala) */
export const T_DEC = TEMPOS.intro.falas[TEMPOS.intro.falas.length - 1].ini - 0.3;
/** onde o carro estava na hora da decisão */
const S0 = V * T_DEC;

/** nos finais errados, o "jeito seguro" começa meio segundo antes da fala dele */
const corteDe = (p: Parte) => TEMPOS[p].falas[2].ini - 0.5;
export const CORTE: Record<Parte, number> = { intro: Infinity, a: corteDe('a'), b: corteDe('b'), c: Infinity, d: corteDe('d') };
/** a cena para (finais errados) */
export const CONGELA: Record<Parte, number> = { intro: T_DEC, a: 1.6, b: 1.9, c: Infinity, d: 2.0 };

/** jeito seguro: corte para o posto ("Se não der para seguir"), um pouco antes da fala */
interface Ritmo {
  posto: number;
}
const RITMO_C: Ritmo = { posto: TEMPOS.c.falas[2].ini - 0.4 };
const ritmoCorte = (p: Parte): Ritmo => ({ posto: TEMPOS[p].falas[3].ini - CORTE[p] - 0.4 });
const RITMO: Record<Parte, Ritmo> = { intro: RITMO_C, a: ritmoCorte('a'), b: ritmoCorte('b'), c: RITMO_C, d: ritmoCorte('d') };

/** no posto: anda reto até a entrada e depois faz a curva até parar ao lado da bomba */
const RETO = 0.6;
const CURVA = 2.4;
const PARADO = RETO + CURVA;

/* ---------------- movimento ---------------- */

/** distância percorrida em `s` segundos com a velocidade mudando em linha reta de v0 para v1 entre a e b */
function percorre(s: number, v0: number, v1: number, a: number, b: number): number {
  if (s <= a) return v0 * s;
  const u = Math.min(s, b) - a;
  const meio = v0 * u + ((v1 - v0) * u * u) / (2 * (b - a));
  return v0 * a + meio + v1 * Math.max(0, s - b);
}

/** neblina: 0,2 (névoa fraca) até 1 (fechada) */
const neblinaIntro = (t: number) => 0.2 + 0.8 * ease((t - TEMPOS.intro.falas[1].ini + 0.2) / 2.2);

interface Estado {
  vista: 'estrada' | 'posto';
  sC: number;
  /** distância do carro da frente (null = já sumiu) */
  D: number | null;
  x: number;
  rumo: number;
  freio: boolean;
  seta: boolean;
  /** luz alta (0 a 1) */
  alta: number;
  neblina: number;
  seg: boolean;
  s: number;
  r: Ritmo;
}

const BASE = { x: X, rumo: 0, freio: false, seta: false, alta: 0, neblina: 1, seg: false, s: 0, r: RITMO_C };

/** no posto (sp = tempo desde o corte): o posto começa em PR */
export const PR = 0;
function noPosto(sp: number) {
  if (sp < RETO) return { sC: PR - V_LENTO * (RETO - sp), x: X, rumo: 0 };
  const tau = clamp((sp - RETO) / CURVA);
  const B1 = 3;
  const c = (V_LENTO * CURVA) / (3 * B1);
  const u = c * tau + (3 - 2 * c) * tau * tau + (c - 2) * tau ** 3;
  const P: [number, number][] = [[PR, X], [PR + B1, X], [PR + 5.5, 5], [PR + 5.5, 11.0]];
  const m = 1 - u;
  const pos = (i: number) => m * m * m * P[0][i] + 3 * m * m * u * P[1][i] + 3 * m * u * u * P[2][i] + u * u * u * P[3][i];
  const der = (i: number) => 3 * m * m * (P[1][i] - P[0][i]) + 6 * m * u * (P[2][i] - P[1][i]) + 3 * u * u * (P[3][i] - P[2][i]);
  return { sC: pos(0), x: pos(1), rumo: u >= 1 ? Math.PI / 2 : Math.atan2(der(1), der(0)) };
}

function seguro(s: number, r: Ritmo): Estado {
  if (s >= r.posto) {
    const sp = s - r.posto;
    const p = noPosto(sp);
    return { ...BASE, vista: 'posto', ...p, D: null, freio: sp > RETO && sp < PARADO + 0.2, seta: sp < PARADO, neblina: 0.85, seg: true, s, r };
  }
  // reduz de V para V_LENTO; o carro da frente segue um pouco mais rápido e se afasta
  return {
    ...BASE,
    vista: 'estrada',
    sC: S0 + percorre(s, V, V_LENTO, 0.3, 1.9),
    D: D0 + 7 * ease((s - 0.4) / 3.2),
    freio: s > 0.3 && s < 1.9,
    seg: true,
    s,
    r,
  };
}

function estado(parte: Parte, t: number): Estado {
  if (parte === 'intro') {
    const tt = Math.min(t, T_DEC);
    return { ...BASE, vista: 'estrada', sC: V * tt, D: D0, neblina: neblinaIntro(tt) };
  }
  if (parte === 'c') return seguro(t, RITMO_C);
  if (t >= CORTE[parte]) return seguro(t - CORTE[parte], RITMO[parte]);
  const s = Math.min(t, CONGELA[parte]);
  if (parte === 'a') return { ...BASE, vista: 'estrada', sC: S0 + V * s, D: D0, alta: ease((s - 0.25) / 0.6) };
  if (parte === 'b') {
    // freia até parar; o carro da frente segue
    const anda = percorre(s, V, 0, 0.2, 1.8);
    return { ...BASE, vista: 'estrada', sC: S0 + anda, D: D0 + V * s - anda, freio: s > 0.2 };
  }
  // d: chega perto do carro da frente
  return { ...BASE, vista: 'estrada', sC: S0 + V * s, D: lerp(D0, 6.8, ease((s - 0.2) / 1.7)) };
}

/* ---------------- serra ---------------- */

export const SERRA: Part[] = [
  ...estrada('continua').slice(0, -1),
  // lado do vale (à direita, depois do guard-rail): mato mais escuro
  rect(7.4, -70, 50, 40, '#5f7a4c'),
  // faixa dupla amarela: na serra não se ultrapassa
  rect(-0.22, -70, -0.08, 40, '#f2c21b'),
  rect(0.08, -70, 0.22, 40, '#f2c21b'),
];

/** número fixo entre 0 e 1 para cada trecho (pedras com alturas diferentes) */
const sorte = (k: number) => {
  const v = Math.sin(k * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

/** paisagem que passa (sC = onde está o seu carro); `vao` = trecho da direita sem guard-rail (entrada do posto) */
export function paisagem(sC: number, vao: [number, number] | null) {
  const y = (s: number) => -(s - sC);
  const dentro = (s: number) => vao !== null && s > vao[0] - 0.5 && s < vao[1] + 0.5;
  const objs: Obj[] = [];
  // paredão de pedra à esquerda, em blocos de 3 m
  for (let k = Math.floor((sC - 22) / 3); k * 3 < sC + 60; k++) {
    const h = 2.2 + 2.4 * sorte(k);
    const x1 = -7.3 - 0.7 * sorte(k + 31);
    const musgo = sorte(k + 7) > 0.55;
    const cor = (topo: string) => (f: string) => (f === 'top' ? topo : f === 'e' ? '#8f8a81' : f === 'n' ? '#7a756c' : '#66615a');
    const y0 = y(k * 3 + 3);
    const y1 = y(k * 3);
    const m = (y0 + y1) / 2 + (sorte(k + 3) - 0.5) * 1.2;
    objs.push({
      parts: [
        box(-14, y0, 0, x1, y1, h, cor(musgo ? '#6f8650' : '#9a968d')),
        // lasca mais alta, recuada, para o paredão não parecer uma escada
        box(-14, sorte(k + 5) > 0.5 ? y0 : m, h, x1 - 0.6 - 0.8 * sorte(k + 9), sorte(k + 5) > 0.5 ? m : y1, h + 0.6 + 1.4 * sorte(k + 11), cor(musgo ? '#9a968d' : '#748a55')),
      ],
      shadow: true,
    });
  }
  // guard-rail à direita: postes a cada 3 m e a lâmina contínua (fica parada)
  for (let k = Math.floor((sC - 22) / 3); k * 3 < sC + 60; k++)
    if (!dentro(k * 3)) objs.push({ parts: [box(6.92, y(k * 3) - 0.06, 0, 7.04, y(k * 3) + 0.06, 0.78, '#8e959d')], shadow: true });
  const trechos: [number, number][] = vao ? [[-70, y(vao[1])], [y(vao[0]), 40]] : [[-70, 40]];
  for (const [a, b] of trechos) if (b > a) objs.push({ parts: [box(6.86, a, 0.52, 6.92, b, 0.76, (f) => (f === 'w' ? '#dfe3e7' : '#aab1b8'))] });
  // pinheiros lá embaixo, no vale
  const PER = 30;
  for (let k = Math.floor((sC - 25) / PER); k * PER < sC + 60; k++)
    for (const [x, d, sd] of [[11, 5, 1], [15, 14, 3], [12.5, 23, 2]] as const) {
      const ss = k * PER + d;
      const yy = y(ss);
      if (yy < -50 || yy > 22 || dentro(ss)) continue;
      objs.push(tree(x, yy, 1.15, sd));
    }
  return { objs };
}

/** posto à direita: entrada entre PR + 1 e PR + 14 */
export function posto(y: (s: number) => number) {
  const chao: Part[] = [rect(7, y(PR + 16.5), 19, y(PR + 0.5), '#6a7077')];
  const cobertura = (f: string) => (f === 'top' ? '#eceeea' : f === 'bot' ? '#d9dcd6' : '#d93a35');
  const objs: Obj[] = [
    // colunas e cobertura
    ...[9.6, 15.2].flatMap((x) => [PR + 10, PR + 14].map((s) => ({ parts: [box(x - 0.15, y(s) - 0.15, 0, x + 0.15, y(s) + 0.15, 3.1, '#c9cdd2')], shadow: true }))),
    { parts: [box(9, y(PR + 15), 3.1, 15.8, y(PR + 9.2), 3.45, cobertura, undefined, true)] },
    // bombas
    ...[PR + 10.6, PR + 13.4].map((s) => ({
      parts: [
        box(12.7, y(s) - 0.4, 0, 13.6, y(s) + 0.4, 0.2, '#b9bdc2'),
        box(12.85, y(s) - 0.3, 0.2, 13.45, y(s) + 0.3, 1.5, (f: string) => (f === 'w' ? '#f4f4f1' : f === 'top' ? '#d93a35' : '#e2e3df')),
      ],
      shadow: true,
    })),
    house(15.2, y(PR + 8), 21, y(PR + 2.5), '#f2efe6', '#3d6fb6', 'w'),
  ];
  return { chao, objs };
}

/* ---------------- neblina e luzes ---------------- */

/** quanto a neblina esconde algo a `d` metros à frente do seu carro (0 a 1) */
export const vela = (d: number, n: number) => clamp(n * (0.14 + 0.86 * (1 - Math.exp(-Math.max(0, d) / 6.5))));

/** camada de neblina: degradê de cima para baixo, com a opacidade de cada altura da tela
 *  igual à da distância que aparece ali; `alta` clareia a névoa logo à frente (luz refletida) */
export function neblina(id: string, pr: Pr, n: number, alta: number): ReactNode {
  const ds = [60, 40, 28, 20, 14, 10, 7, 4, 2, 0, -3, -8];
  const stops = ds.map((d) => ({ y: pr([X, -d, 0])[1], o: d < 0 ? n * 0.14 : vela(d, n) }));
  const [gx, gy] = pr([X, -6.5, 1.0]);
  return (
    <>
      <defs>
        <linearGradient id={`${id}-nev`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={200}>
          <stop offset={0} stopColor="#dde2e6" stopOpacity={n * 0.98} />
          {stops.map((p, i) => (
            <stop key={i} offset={clamp(p.y / 200)} stopColor="#dde2e6" stopOpacity={p.o} />
          ))}
        </linearGradient>
        <radialGradient id={`${id}-alta`}>
          <stop offset="0" stopColor="#fbfcfd" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#f3f6f8" stopOpacity="0.6" />
          <stop offset="1" stopColor="#f3f6f8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={320} height={200} fill="#7d8792" opacity={0.12} />
      <rect x={0} y={0} width={320} height={200} fill={`url(#${id}-nev)`} />
      {alta > 0.01 && <ellipse cx={gx} cy={gy} rx={120} ry={62} fill={`url(#${id}-alta)`} opacity={alta} />}
    </>
  );
}

/** facho dos faróis no chão, virado para onde o carro aponta (curto = luz baixa) */
export function fachoRumo(pr: Pr, x: number, y: number, rumo: number, alcance: number, o: number): ReactNode {
  if (o <= 0.01) return null;
  const f = [Math.sin(rumo), -Math.cos(rumo)];
  const r = [Math.cos(rumo), Math.sin(rumo)];
  const abre = 0.7 + alcance * 0.2;
  const p = (a: number, b: number) => pr([x + f[0] * a + r[0] * b, y + f[1] * a + r[1] * b, 0]).map((v) => v.toFixed(1)).join(' ');
  return <path d={`M${p(2.1, -0.7)}L${p(2.1, 0.7)}L${p(2.1 + alcance, abre)}L${p(2.1 + alcance, -abre)}Z`} fill="#fff7d6" opacity={o} />;
}

/** luzes do seu carro: faróis, lanternas (mais fortes na freada) e a seta da direita */
function luzesCarro(pr: Pr, e: Estado, t: number): ReactNode {
  const f = [Math.sin(e.rumo), -Math.cos(e.rumo)];
  const r = [Math.cos(e.rumo), Math.sin(e.rumo)];
  const at = (a: number, b: number, z: number): [number, number, number] => [e.x + f[0] * a + r[0] * b, f[1] * a + r[1] * b, z];
  const seta = e.seta && pisca(t, 'r');
  return (
    <>
      {[-0.6, 0.6].map((b) => luz(pr, at(2.15, b, 0.75), 1.2 + 0.6 * e.alta, '#fff6c8', `f${b}`))}
      {[-0.6, 0.6].map((b) => luz(pr, at(-2.15, b, 0.75), e.freio ? 1.7 : 1.0, '#ff3b30', `l${b}`))}
      {seta && [2.0, -2.0].map((a) => luz(pr, at(a, 0.82, 0.72), 1.4, '#ffb020', `s${a}`))}
    </>
  );
}

/** chip do farol no canto de cima (símbolo do painel: verde = luz baixa, azul = luz alta) */
export function chipFarol(alta: boolean, o: number): ReactNode {
  if (o <= 0.01) return null;
  const cor = alta ? '#3d8bff' : '#35c46a';
  const linhas = [0, 1, 2, 3].map((k) => {
    const y = 49 + k * 4;
    return <line key={k} x1={18} y1={y} x2={25} y2={alta ? y : y + 3} stroke={cor} strokeWidth={1.8} strokeLinecap="round" />;
  });
  return (
    <g opacity={o}>
      <rect x={10} y={42} width={92} height={26} rx={13} fill="#1d2430" opacity={0.88} />
      {linhas}
      <path d="M28 47 C38 46 40 52 40 55 C40 58 38 64 28 63 Z" fill={cor} />
      <text x={71} y={59.5} textAnchor="middle" fontSize={11.5} fontWeight={800} fill="#ffffff" fontFamily="Nunito, system-ui, sans-serif">{alta ? 'Luz alta' : 'Luz baixa'}</text>
    </g>
  );
}

/** chip branco de texto no canto de cima (pixels) */
export function chipTexto(texto: string, o: number): ReactNode {
  if (o <= 0.01) return null;
  const w = texto.length * 6.5 + 18;
  return (
    <g opacity={o}>
      <rect x={10} y={42} width={w} height={22} rx={11} fill="#ffffff" opacity={0.96} />
      <text x={10 + w / 2} y={57} textAnchor="middle" fontSize={11} fontWeight={800} fill="#1d2430" fontFamily="Nunito, system-ui, sans-serif">{texto}</text>
    </g>
  );
}

/* ---------------- quadro ---------------- */

const ETIQUETA: Record<'a' | 'b' | 'd', string> = {
  a: 'A luz alta reflete na neblina',
  b: 'Parado na pista, quem vem atrás não vê você',
  d: 'Na neblina, a distância deve aumentar',
};

/** quadro da cena: `parte` (introdução ou ID da alternativa) no tempo `t` dela */
export function Cena({ parte, t, id = 'enb' }: { parte: Parte; t: number; id?: string }) {
  const e = estado(parte, t);
  const congela = CONGELA[parte];
  const errado = parte === 'a' || parte === 'b' || parte === 'd';
  // cortes com escurecida rápida: erro → jeito seguro, estrada → posto
  const bate = (a: number) => Math.max(0, 1 - Math.abs(t - a) / 0.18);
  const ini = parte === 'c' ? 0 : errado ? CORTE[parte] : Infinity;
  const corte = Math.max(errado ? bate(CORTE[parte]) : 0, Number.isFinite(ini) ? bate(ini + e.r.posto) : 0);
  const naPosto = e.vista === 'posto';
  const sp = e.s - e.r.posto;

  const y = (s: number) => -(s - e.sC);
  const vao: [number, number] | null = naPosto ? [PR + 0.5, PR + 16.5] : null;
  const pais = paisagem(e.sC, vao);
  const pst = naPosto ? posto(y) : null;
  const objs: Obj[] = [...pais.objs, ...(pst?.objs ?? [])];
  if (e.D !== null) objs.push(car({ x: X, y: -e.D, color: '#5d7fa6', brake: false }));
  objs.push(car({ x: e.x, y: 0, heading: e.rumo, color: VOCE, brake: e.freio }));
  const kx = clamp((e.x - X) / 10);
  const cam = camLook(lerp(1.0, 10.5, kx), lerp(-10.5, -5, kx), 0, 10, 38, 10, 160, 104);
  // a luz alta também deixa o carro da frente ainda mais escondido
  const veu = e.D !== null ? vela(e.D, e.neblina) : 1;
  const lanterna = e.D !== null ? (1 - 0.55 * veu) * (1 - 0.8 * e.alta) : 0;

  return (
    <Scene3D
      id={id}
      cam={cam}
      ground={[...SERRA, ...(pst?.chao ?? [])]}
      objs={objs}
      overlay={(pr) => (
        <>
          {fachoRumo(pr, e.x, 0, e.rumo, lerp(5, 16, e.alta), 0.2 + 0.1 * e.alta)}
          {neblina(id, pr, e.neblina, e.alta * 0.9)}
          {/* lanternas do carro da frente: atravessam a neblina mais que a lataria */}
          {e.D !== null && lanterna > 0.02 && (
            <g opacity={lanterna}>{[-0.6, 0.6].map((b) => luz(pr, [X + b, -e.D! + 2.15, 0.75], 1.3, '#ff3b30', `t${b}`))}</g>
          )}
          {luzesCarro(pr, e, t)}
          {naPosto && (() => {
            const [px, py] = pr([12.4, y(PR + 9.2), 3.28]);
            return (
              <g>
                <rect x={px - 17} y={py - 8} width={34} height={13} rx={2.5} fill="#ffffff" stroke="#d93a35" strokeWidth={1.4} />
                <text x={px} y={py + 2} textAnchor="middle" fontSize={8.5} fontWeight={900} fill="#d93a35" fontFamily="Nunito, system-ui, sans-serif">POSTO</text>
              </g>
            );
          })()}
          {naPosto && tag(pr, [11, y(PR + 5.5), 2.7], 'Local seguro', ease((sp - PARADO + 0.2) / 0.4))}
          {/* b: X em cima do carro parado na pista */}
          {parte === 'b' && t >= congela && t < CORTE.b && (() => {
            const [px, py] = pr([X, 0, 2.6]);
            return (
              <g opacity={ease((t - congela - 0.3) / 0.3)}>
                <circle cx={px} cy={py} r={11} fill="#d93a35" stroke="#ffffff" strokeWidth={1.6} />
                <g transform={`translate(${px} ${py})`}>{xis}</g>
              </g>
            );
          })()}
          {parte === 'intro' && (
            <>
              {tag(pr, [X, 0.4, 2.2], 'Você', janela(t, 0, 2.2, 0.3))}
              {aviso('O que você faz?', '#2f6fd6', ease((t - T_DEC) / 0.3), interroga, 'direita')}
            </>
          )}
          {parte === 'a' && t < CORTE.a && chipFarol(true, ease((t - 0.1) / 0.3))}
          {parte === 'c' && aviso('Boa escolha', '#1f9d55', janela(t, 0.2, 2.4), visto)}
          {errado && t < CORTE[parte] && (
            <>
              {t >= congela && <rect x={0} y={0} width={320} height={200} fill="#0b1220" opacity={0.22} />}
              {t >= congela + 0.6 && etiqueta(ETIQUETA[parte])}
              {aviso('Essa escolha aumenta o perigo', '#d93a35', ease((t - congela) / 0.25), xis)}
            </>
          )}
          {errado && t >= CORTE[parte] && aviso('Jeito seguro', '#1f9d55', janela(e.s, 0.15, 2.3), visto)}
          {e.seg && !naPosto && chipFarol(false, ease((e.s - 0.1) / 0.3))}
          {e.seg && !naPosto && e.s >= 1.6 && etiqueta('Reduz e aumenta a distância')}
          {naPosto && chipTexto('Se não der para seguir', ease((sp - 0.2) / 0.3))}
          {naPosto && sp >= PARADO && etiqueta('Parou num local seguro')}
          {corte > 0 && <rect x={0} y={0} width={320} height={200} fill="#0b1220" opacity={0.9 * corte} />}
        </>
      )}
    />
  );
}

/** quadros parados (movimento reduzido): fim da introdução, a escolha e o jeito seguro */
export const QUADRO = {
  intro: T_DEC + 0.4,
  escolha: { a: CONGELA.a + 1.0, b: CONGELA.b + 1.0, c: RITMO_C.posto + PARADO + 0.4, d: CONGELA.d + 1.0 } as Record<string, number>,
  /** tempo dentro do final "c" que mostra o carro parado no posto */
  seguro: RITMO_C.posto + PARADO + 0.4,
};
