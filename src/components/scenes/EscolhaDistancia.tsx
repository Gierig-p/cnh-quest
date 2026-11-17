/**
 * Vídeo de escolha da distância atrás do caminhão (w5-rua-2, 17/11/2026).
 * Introdução: você segue um caminhão na rodovia, num dia de sol. O caminhão passa pela placa, você conta
 * "cinquenta e um..." e o seu carro já chega à placa: a imagem para nesse instante ("O que você faz?").
 * Finais pelo ID da alternativa:
 *  a: mantém a velocidade; a distância continua curta e a cena para.
 *  b: pisca o farol (pulso suave no facho, sem clarão na tela); a distância não aumenta e a cena para.
 *  c (certa): tira o pé, a distância aumenta; o caminhão passa pela placa seguinte, a contagem
 *     "cinquenta e um, cinquenta e dois" acompanha e o carro só chega à placa depois dela.
 *  d: encosta mais; a distância diminui e a cena para, com separação visível.
 * Nos errados, depois do aviso, um corte volta ao ponto da decisão e mostra o jeito seguro (igual ao c).
 * Tempo fiel: tudo anda na mesma velocidade, então a distância em segundos é a distância dividida por V,
 * e as placas ficam onde o caminhão está quando a contagem começa (a fala da contagem dura 2 s de verdade).
 * A câmera acompanha o seu carro; a paisagem (tracejado, mourões, árvores, placas) é que passa.
 */
import type { ReactNode } from 'react';
import { Scene3D, box, camLook, rect, type Obj } from './engine';
import { bush, car, tree } from './models';
import { utilitario } from './veiculos';
import { estrada } from './Mundo2';
import { ease, facho, janela, tag, VOCE, type Pr } from './videoBase';
import { aviso, etiqueta, interroga, visto, xis } from './escolhaUI';
import tempos from '../../content/escolhas/w5-rua-2.json';

export type Parte = 'intro' | 'a' | 'b' | 'c' | 'd';
type Tempo = { dur: number; falas: { ini: number; fim: number }[] };
export const TEMPOS = tempos as Record<Parte, Tempo>;

/* ---------------- lugar e movimento ---------------- */

const V = 7; // velocidade de todos (m/s de desenho)
const X = 1.75; // centro da sua faixa
const FR = 2.15; // do centro do carro até o para-choque da frente
const TR = 3.8; // do centro do caminhão até a traseira
const X_PLACA = 4.6;

/** introdução: a traseira do caminhão passa pela placa quando começa o "cinquenta e um"; o carro chega logo depois */
const T_A = TEMPOS.intro.falas[2].ini;
const T_B = TEMPOS.intro.falas[2].fim + 0.1;
/** a pergunta (última fala) */
export const T_DEC = TEMPOS.intro.falas[TEMPOS.intro.falas.length - 1].ini - 0.3;
/** distância curta da decisão (m): só cerca de um segundo */
const D1 = V * (T_B - T_A);
/** placa da introdução (posição ao longo da estrada) */
const P1 = V * T_B + FR;

/** nos finais errados, o "jeito seguro" começa meio segundo antes da fala dele */
const corteDe = (p: Parte) => TEMPOS[p].falas[2].ini - 0.5;
export const CORTE: Record<Parte, number> = { intro: Infinity, a: corteDe('a'), b: corteDe('b'), c: Infinity, d: corteDe('d') };

/** a cena para (finais errados) */
export const CONGELA: Record<Parte, number> = { intro: T_B, a: 1.5, b: 1.7, c: Infinity, d: 1.7 };

/** jeito seguro: a contagem começa em `sc` (caminhão na placa) e o carro chega à placa em `sChega` */
interface Ritmo {
  sc: number;
  sChega: number;
}
const ritmo = (p: Parte, k: number, desde: number): Ritmo => ({ sc: TEMPOS[p].falas[k].ini - desde, sChega: TEMPOS[p].falas[k].fim + 0.1 - desde });
const RITMO: Record<Parte, Ritmo> = {
  intro: { sc: Infinity, sChega: Infinity },
  a: ritmo('a', 3, CORTE.a),
  b: ritmo('b', 3, CORTE.b),
  c: ritmo('c', 1, 0),
  d: ritmo('d', 3, CORTE.d),
};

interface Estado {
  /** tempo do mundo (carro que vem de frente) */
  W: number;
  /** posição do seu carro e do caminhão ao longo da estrada */
  sC: number;
  sT: number;
  /** no jeito seguro */
  seg: boolean;
  /** tempo dentro do jeito seguro */
  s: number;
  r: Ritmo;
  /** tirando o pé (perdendo distância para o caminhão) */
  tirandoPe: boolean;
}

/** caminhão: anda sempre em V (só para quando a cena congela) */
const caminhao = (W: number) => P1 + TR + V * (W - T_A);

function seguro(s: number, r: Ritmo): Estado {
  const D2 = V * (r.sChega - r.sc);
  const k = (s - 0.2) / (r.sChega - 0.2);
  const e = (D2 - D1) * ease(k);
  return { W: T_B + s, sC: V * (T_B + s) - e, sT: caminhao(T_B + s), seg: true, s, r, tirandoPe: k > 0 && k < 0.85 };
}

function estado(parte: Parte, t: number): Estado {
  const base = { seg: false, s: 0, r: RITMO.intro, tirandoPe: false };
  if (parte === 'intro') {
    const tt = Math.min(t, T_B);
    return { ...base, W: tt, sC: V * tt, sT: caminhao(tt) };
  }
  if (parte === 'c') return seguro(t, RITMO.c);
  if (t >= CORTE[parte]) return seguro(t - CORTE[parte], RITMO[parte]);
  const s = Math.min(t, CONGELA[parte]);
  // d: encosta ainda mais (a distância cai para pouco mais da metade, sem encostar)
  const e = parte === 'd' ? -0.45 * D1 * ease((s - 0.2) / 1.4) : 0;
  return { ...base, W: T_B + s, sC: V * (T_B + s) - e, sT: caminhao(T_B + s) };
}

/* ---------------- desenho ---------------- */

const CHAO = estrada('tracejada').slice(0, -1); // sem a linha do meio: o tracejado é desenhado andando
const CAM = camLook(1.0, -10.5, 0, 10, 38, 10, 160, 104);

/** placa verde na beira da pista (ponto fixo) */
function placa(x: number, y: number): Obj {
  return {
    parts: [box(x - 0.08, y - 0.08, 0, x + 0.08, y + 0.08, 2.2, '#d9dde2'), box(x - 0.1, y - 0.7, 1.6, x + 0.1, y + 0.7, 2.6, '#1f7a4d')],
    shadow: true,
  };
}

/** paisagem que passa: tracejado, mourões da cerca, árvores e moitas (sC = onde está o seu carro) */
function paisagem(sC: number) {
  const y = (s: number) => -(s - sC);
  const chao = [];
  const objs: Obj[] = [];
  for (let k = Math.floor((sC - 20) / 8); k * 8 < sC + 50; k++) chao.push(rect(-0.08, y(k * 8 + 3), 0.08, y(k * 8), '#f2c21b'));
  for (let k = Math.floor((sC - 20) / 4); k * 4 < sC + 50; k++)
    for (const x of [-9, 9]) objs.push({ parts: [box(x - 0.06, y(k * 4) - 0.06, 0, x + 0.06, y(k * 4) + 0.06, 1.05, '#8a6a48')], shadow: true });
  const PER = 36;
  const enfeites: [number, number, 'arvore' | 'moita', number][] = [[-12.5, 4, 'arvore', 1], [13, 11, 'arvore', 3], [-14, 21, 'arvore', 2], [11, 27, 'moita', 2], [-10.5, 31, 'moita', 1], [15, 33, 'arvore', 4]];
  for (let k = Math.floor((sC - 25) / PER); k * PER < sC + 55; k++)
    for (const [x, d, tipo, sd] of enfeites) {
      const yy = y(k * PER + d);
      if (yy < -45 || yy > 22) continue;
      objs.push(tipo === 'arvore' ? tree(x, yy, 1.1, sd) : bush(x, yy, 0.9, sd));
    }
  return { chao, objs };
}

/** cerca: os arames são contínuos, então ficam parados */
const CERCA: Obj[] = [-9, 9].map((x) => ({
  parts: [rect(x - 0.03, -70, x + 0.03, 40, '#8a6a48', 0.95), rect(x - 0.03, -70, x + 0.03, 40, '#8a6a48', 0.55)],
}));

/** colchete da distância entre a traseira do caminhão e a frente do seu carro (pixels) */
function distancia(pr: Pr, yTras: number, yFrente: number, cor: string, texto: string, o: number): ReactNode {
  if (o <= 0.01) return null;
  const [x0, y0] = pr([3.05, yTras, 0.05]);
  const [x1, y1] = pr([3.05, yFrente, 0.05]);
  const w = texto.length * 5.9 + 14;
  const ym = (y0 + y1) / 2;
  return (
    <g opacity={o}>
      <g stroke={cor} strokeWidth={2.4} strokeLinecap="round">
        <line x1={x0} y1={y0} x2={x1} y2={y1} />
        <line x1={x0 - 5} y1={y0} x2={x0 + 5} y2={y0} />
        <line x1={x1 - 5} y1={y1} x2={x1 + 5} y2={y1} />
      </g>
      <rect x={Math.max(x0, x1) + 8} y={ym - 9} width={w} height={18} rx={9} fill={cor} />
      <text x={Math.max(x0, x1) + 8 + w / 2} y={ym + 3.8} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff" fontFamily="Nunito, system-ui, sans-serif">{texto}</text>
    </g>
  );
}

/** balão da contagem no canto de cima à esquerda (pixels) */
function contagem(texto: string, o: number): ReactNode {
  if (o <= 0.01) return null;
  const w = texto.length * 8 + 22;
  return (
    <g opacity={o}>
      <rect x={10} y={44} width={w} height={26} rx={13} fill="#ffffff" opacity={0.96} />
      <text x={10 + w / 2} y={62} textAnchor="middle" fontSize={14} fontWeight={900} fill="#1d2430" fontFamily="Nunito, system-ui, sans-serif">{texto}</text>
    </g>
  );
}

/** quadro da cena: `parte` (introdução ou ID da alternativa) no tempo `t` dela */
export function Cena({ parte, t, id = 'edi' }: { parte: Parte; t: number; id?: string }) {
  const e = estado(parte, t);
  const y = (s: number) => -(s - e.sC);
  const pais = paisagem(e.sC);
  const P2 = e.seg ? P1 + V * (T_B - T_A + e.r.sc) : Infinity;
  const yTras = y(e.sT - TR);
  const objs: Obj[] = [...CERCA, ...pais.objs];
  for (const P of [P1, P2]) if (Number.isFinite(P) && y(P) > -48 && y(P) < 22) objs.push(placa(X_PLACA, y(P)));
  for (const s0 of [150, 330]) {
    const yo = y(s0 - 9 * e.W);
    if (yo > -60 && yo < 30) objs.push(car({ x: -X, y: yo, heading: Math.PI, color: '#e0412f' }));
  }
  objs.push(utilitario({ x: X, y: y(e.sT), tipo: 'caminhao' }), car({ x: X, y: 0, color: VOCE }));

  const congela = CONGELA[parte];
  const errado = parte === 'a' || parte === 'b' || parte === 'd';
  const corte = errado ? Math.max(0, 1 - Math.abs(t - CORTE[parte]) / 0.18) : 0;
  // b: o farol pisca duas vezes, com um pulso suave no facho
  const pulso = parte === 'b' && t < congela ? Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.25) / 0.45))), Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.85) / 0.45)))) : 0;
  const tc = e.s - e.r.sc; // tempo desde o começo da nova contagem
  const durConta = e.r.sChega - 0.1 - e.r.sc;
  const chegou = e.seg && e.s >= e.r.sChega;

  return (
    <Scene3D
      id={id}
      cam={CAM}
      ground={[...CHAO, ...pais.chao]}
      objs={objs}
      overlay={(pr) => (
        <>
          {pulso > 0.01 && facho(pr, X, 0, -1, 0.3, 0.32 * pulso)}
          {parte === 'intro' && (
            <>
              {tag(pr, [X, 0.4, 2.2], 'Você', janela(t, 0, 2.0, 0.3))}
              {tag(pr, [X_PLACA, y(P1), 3.0], 'Placa', janela(t, TEMPOS.intro.falas[1].ini - 0.6))}
              {contagem('51...', janela(t, T_A, Infinity, 0.15))}
              {t >= T_B && etiqueta('Seu carro já chegou à placa')}
              {aviso('O que você faz?', '#2f6fd6', ease((t - T_DEC) / 0.3), interroga, 'direita')}
            </>
          )}
          {parte === 'c' && aviso('Boa escolha', '#1f9d55', janela(t, 0.2, 2.6), visto)}
          {errado && t < CORTE[parte] && (
            <>
              {t >= congela && <rect x={0} y={0} width={320} height={200} fill="#0b1220" opacity={0.22} />}
              {distancia(pr, yTras, -FR, '#d93a35', 'Distância curta', ease((t - congela - 0.5) / 0.3))}
              {parte === 'b' && t >= congela + 0.5 && etiqueta('Quem ajusta a distância é você')}
              {aviso('Essa escolha aumenta o perigo', '#d93a35', ease((t - congela) / 0.25), xis)}
            </>
          )}
          {errado && t >= CORTE[parte] && aviso('Jeito seguro', '#1f9d55', janela(e.s, 0.15, 2.8), visto)}
          {e.seg && (
            <>
              {tag(pr, [X_PLACA, y(P2), 3.0], 'Placa', ease((tc + 1.2) / 0.3) * (y(P2) < 8 ? 1 : 0))}
              {contagem(tc < durConta * 0.5 ? '51' : '51, 52', janela(tc, 0, durConta + 1.2, 0.12))}
              {chegou && distancia(pr, yTras, -FR, '#1f9d55', 'Distância segura', ease((e.s - e.r.sChega) / 0.3))}
              {e.tirandoPe ? etiqueta('Tira o pé') : chegou ? etiqueta('Passou depois da contagem') : null}
            </>
          )}
          {corte > 0 && <rect x={0} y={0} width={320} height={200} fill="#0b1220" opacity={0.85 * corte} />}
        </>
      )}
    />
  );
}

/** quadros parados (movimento reduzido): fim da introdução, a escolha e o jeito seguro */
export const QUADRO = {
  intro: T_DEC + 0.4,
  escolha: { a: CONGELA.a + 1.0, b: CONGELA.b + 1.0, c: RITMO.c.sChega + 0.8, d: CONGELA.d + 1.0 } as Record<string, number>,
  /** tempo dentro do final "c" que mostra o carro passando pela placa depois da contagem */
  seguro: RITMO.c.sChega + 0.8,
};

/** usado pelos testes: distância (em segundos) quando o carro chega à placa no jeito seguro */
export const segundosNoSeguro = (p: Parte) => RITMO[p].sChega - RITMO[p].sc;
export const segundosNaDecisao = D1 / V;
