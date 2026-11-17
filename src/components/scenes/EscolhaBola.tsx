/**
 * Vídeo de escolha da bola entre os carros (w5-rua-6, 17/11/2026).
 * Introdução: rua de bairro de mão dupla, carros estacionados dos dois lados, casas e calçadas. Uma bola sai
 * rolando do espaço entre dois carros à direita; a imagem para assim que ela entra na rua ("O que você faz?").
 * Finais pelo ID da alternativa:
 *  a (certa): tira o pé, freia e para antes da bola; o espaço de onde ela saiu fica marcado ("pode vir uma criança").
 *  b: buzina (ícone) e segue na mesma velocidade; a cena para antes de chegar na bola.
 *  c: acelera (riscos de velocidade); a cena para antes de chegar na bola.
 *  d: começa a desviar para a contramão sem diminuir; a cena para no meio do desvio.
 * Nunca aparece uma criança: a habilidade é prever, sem esperar alguém surgir.
 * Nos errados, depois do aviso, um corte volta ao ponto da decisão e mostra o jeito seguro (igual ao a).
 * A câmera acompanha o seu carro e a rua é que passa (igual a EscolhaSono).
 */
import type { ReactNode } from 'react';
import { Scene3D, camLook, rect, type Obj, type Part } from './engine';
import { asphalt, car, house, tree } from './models';
import { clamp, ease, janela, lerp, tag, VOCE, type Pr } from './videoBase';
import { ondas } from './VideoRetrovisores';
import { aviso, etiqueta, interroga, visto, xis } from './escolhaUI';
import tempos from '../../content/escolhas/w5-rua-6.json';

export type Parte = 'intro' | 'a' | 'b' | 'c' | 'd';
type Tempo = { dur: number; falas: { ini: number; fim: number }[] };
export const TEMPOS = tempos as Record<Parte, Tempo>;

/* ---------------- tempos ---------------- */

const V = 4; // velocidade no bairro (m/s de desenho)
const X = 1.3; // centro da sua faixa
const XP = 3.55; // centro dos carros estacionados
/** a pergunta (última fala) */
export const T_DEC = TEMPOS.intro.falas[TEMPOS.intro.falas.length - 1].ini - 0.3;
/** onde o carro estava na hora da decisão */
const S0 = V * T_DEC;
/** a bola sai do vão entre dois carros à direita, 10 m à frente de onde você decide */
const SB = S0 + 10;
/** a bola começa a rolar durante a fala dela */
const BOLA_INI = TEMPOS.intro.falas[2].ini + 1.0;

/** nos finais errados, o "jeito seguro" começa meio segundo antes da fala dele */
const corteDe = (p: Parte) => TEMPOS[p].falas[2].ini - 0.5;
export const CORTE: Record<Parte, number> = { intro: Infinity, a: Infinity, b: corteDe('b'), c: corteDe('c'), d: corteDe('d') };
/** a cena para (finais errados) */
export const CONGELA: Record<Parte, number> = { intro: T_DEC, a: Infinity, b: 1.3, c: 0.9, d: 1.2 };

/** jeito seguro: começo e fim da freada e quando aparece o "pode vir uma criança" */
interface Ritmo {
  freia: number;
  para: number;
  pode: number;
}
const RITMO_A: Ritmo = { freia: 0.3, para: 2.3, pode: TEMPOS.a.falas[2].ini - 0.2 };
const ritmoCorte = (p: Parte): Ritmo => ({ freia: 0.2, para: 2.2, pode: TEMPOS[p].falas[3].ini - CORTE[p] - 0.2 });
const RITMO: Record<Parte, Ritmo> = { intro: RITMO_A, a: RITMO_A, b: ritmoCorte('b'), c: ritmoCorte('c'), d: ritmoCorte('d') };

/* ---------------- movimento ---------------- */

/** distância percorrida em `s` segundos com a velocidade mudando em linha reta de v0 para v1 entre a e b */
function percorre(s: number, v0: number, v1: number, a: number, b: number): number {
  if (s <= a) return v0 * s;
  const u = Math.min(s, b) - a;
  return v0 * a + v0 * u + ((v1 - v0) * u * u) / (2 * (b - a)) + v1 * Math.max(0, s - b);
}

/** bola: sai de perto da calçada da direita e rola devagar até perto dos carros da esquerda (W = tempo do mundo) */
function bola(W: number) {
  const tau = Math.max(0, W - BOLA_INI);
  const ALC = 6.6;
  const x = 4.1 - ALC * (1 - Math.exp((-0.95 * tau) / ALC));
  return { x, giro: (4.1 - x) / 0.3, vis: tau > 0 };
}

interface Estado {
  /** tempo do mundo (a bola) */
  W: number;
  sC: number;
  x: number;
  rumo: number;
  freio: boolean;
  veloz: number;
  seg: boolean;
  s: number;
  r: Ritmo;
}

const BASE = { x: X, rumo: 0, freio: false, veloz: 0, seg: false, s: 0, r: RITMO_A };

function seguro(s: number, r: Ritmo): Estado {
  return { ...BASE, W: T_DEC + s, sC: S0 + percorre(s, V, 0, r.freia, r.para), freio: s > r.freia, seg: true, s, r };
}

function estado(parte: Parte, t: number): Estado {
  if (parte === 'intro') {
    const tt = Math.min(t, T_DEC);
    return { ...BASE, W: tt, sC: V * tt };
  }
  if (parte === 'a') return seguro(t, RITMO_A);
  if (t >= CORTE[parte]) return seguro(t - CORTE[parte], RITMO[parte]);
  const s = Math.min(t, CONGELA[parte]);
  if (parte === 'c') return { ...BASE, W: T_DEC + s, sC: S0 + percorre(s, V, 7.5, 0.15, 0.9), veloz: clamp((s - 0.15) / 0.6) };
  if (parte === 'd') {
    // desvia para a esquerda sem reduzir
    const k = ease((s - 0.15) / 1.1);
    const dk = clamp((s - 0.15) / 1.1);
    return { ...BASE, W: T_DEC + s, sC: S0 + V * s, x: lerp(X, -1.0, k), rumo: -0.32 * Math.sin(Math.PI * Math.min(1, dk * 0.85)) };
  }
  return { ...BASE, W: T_DEC + s, sC: S0 + V * s };
}

/* ---------------- rua ---------------- */

const CORES = ['#c94f43', '#3f6fb0', '#6f8a4a', '#5c6670', '#d9a441', '#2f8a6a', '#8a4fa0', '#9a5a3a'];
const PAREDES = ['#f2e3c6', '#e3eef2', '#f4d9cf', '#e8efd9', '#efe6f2'];
const TELHAS = ['#b5523b', '#7a4a3a', '#8a5c3e', '#a2453a'];
const sorte = (k: number) => {
  const v = Math.sin(k * 12.9898 + 4.1) * 43758.5453;
  return v - Math.floor(v);
};

/** carros estacionados (s ao longo da rua, lado, cor); à direita, o vão da bola fica entre SB - 3,6 e SB + 3,6 */
function estacionados(sC: number): [number, number, string][] {
  const out: [number, number, string][] = [];
  for (let k = 0; k < 14; k++) {
    for (const s of [SB + 3.6 + 5.4 * k, SB - 3.6 - 5.4 * k]) {
      if (k > 0 && sorte(k * 7 + (s > SB ? 1 : 2)) > 0.78) continue; // entrada de garagem
      if (s > sC - 20 && s < sC + 55) out.push([s, 1, CORES[(k * 3 + (s > SB ? 1 : 4)) % CORES.length]]);
    }
  }
  for (let k = Math.floor((sC - 20) / 5.6); k * 5.6 < sC + 55; k++) {
    if (sorte(k * 5 + 3) > 0.8) continue;
    out.push([k * 5.6 + 1.3, -1, CORES[(k * 5 + 2 + 8 * 100) % CORES.length]]);
  }
  return out;
}

/** chão: asfalto, guias, calçadas e gramados; as juntas da calçada andam com a rua */
function chao(sC: number): Part[] {
  const y = (s: number) => -(s - sC);
  const out: Part[] = [
    rect(-40, -70, 40, 40, '#7fae62'),
    ...asphalt(-4.6, -70, 4.6, 40, 5),
    rect(4.6, -70, 7.4, 40, '#dcd5c6'),
    rect(-7.4, -70, -4.6, 40, '#dcd5c6'),
    rect(4.6, -70, 4.78, 40, '#b9b1a1'),
    rect(-4.78, -70, -4.6, 40, '#b9b1a1'),
  ];
  for (let k = Math.floor((sC - 22) / 1.8); k * 1.8 < sC + 60; k++) for (const [a, b] of [[4.78, 7.4], [-7.4, -4.78]]) out.push(rect(a, y(k * 1.8) - 0.04, b, y(k * 1.8) + 0.04, '#c4bcab'));
  return out;
}

function enfeites(sC: number): Obj[] {
  const y = (s: number) => -(s - sC);
  const objs: Obj[] = [];
  const LOTE = 11;
  for (let k = Math.floor((sC - 30) / LOTE); k * LOTE < sC + 60; k++) {
    const s0 = k * LOTE;
    objs.push(house(9.5, y(s0 + 8.5), 15.5, y(s0 + 1.5), PAREDES[((k % 5) + 5) % 5], TELHAS[((k % 4) + 4) % 4], 'w'));
    objs.push(house(-15.5, y(s0 + 9.5 + 2), -9.5, y(s0 + 2.5 + 2), PAREDES[((k * 3 + 2) % 5 + 5) % 5], TELHAS[((k + 1) % 4 + 4) % 4], 'e'));
    if (sorte(k + 11) > 0.35) objs.push(tree(6.6, y(s0 + 10), 0.85, (((k % 4) + 4) % 4) + 1));
    if (sorte(k + 23) > 0.4) objs.push(tree(-6.6, y(s0 + 5), 0.85, ((((k + 2) % 4) + 4) % 4) + 1));
  }
  return objs;
}

/* ---------------- peças da tela ---------------- */

/** bola de capotão: círculo com degradê e gomos que giram, e sombra no chão */
function desenhaBola(pr: Pr, id: string, x: number, yb: number, giro: number): ReactNode {
  const [gx, gy] = pr([x, yb, 0]);
  const r = Math.max(7, Math.abs(pr([x, yb, 0.44])[1] - gy) * 0.9 + 1);
  // a bola fica maior que o real para aparecer bem; o centro sobe para ela encostar no chão
  const [cx, cy] = [gx, gy - r * 0.9];
  const [sx, sy] = [gx + r * 0.3, gy];
  const a = (giro * 180) / Math.PI;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-bola`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f0f0ec" />
          <stop offset="1" stopColor="#b9bcc0" />
        </radialGradient>
      </defs>
      <ellipse cx={sx} cy={sy} rx={r * 1.05} ry={r * 0.45} fill="#1d2430" opacity={0.28} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-bola)`} stroke="#8a8f96" strokeWidth={0.4} />
      <g transform={`translate(${cx} ${cy}) rotate(${a.toFixed(1)})`}>
        <path d={`M0 ${-r * 0.42} L${r * 0.4} ${-r * 0.13} L${r * 0.25} ${r * 0.34} L${-r * 0.25} ${r * 0.34} L${-r * 0.4} ${-r * 0.13} Z`} fill="#e0412f" />
        <path d={`M0 ${-r * 0.42} L0 ${-r} M${r * 0.4} ${-r * 0.13} L${r * 0.95} ${-r * 0.3} M${-r * 0.4} ${-r * 0.13} L${-r * 0.95} ${-r * 0.3}`} stroke="#c23526" strokeWidth={0.6} />
      </g>
    </g>
  );
}

/** buzina: ícone de corneta com ondas, perto do carro (pixels) */
function buzina(pr: Pr, x: number, o: number, t: number): ReactNode {
  if (o <= 0.01) return null;
  const [px, py] = pr([x + 1.2, -1.5, 1.6]);
  return (
    <g opacity={o}>
      <circle cx={px + 8} cy={py - 8} r={13} fill="#ffffff" opacity={0.95} />
      <path d={`M${px + 1} ${py - 11} L${px + 6} ${py - 11} L${px + 13} ${py - 15} L${px + 13} ${py - 1} L${px + 6} ${py - 5} L${px + 1} ${py - 5} Z`} fill="#1d2430" />
      {ondas(px + 16, py - 8, t, 0.9)}
    </g>
  );
}

/** riscos de velocidade nas bordas (pixels) */
function riscos(k: number, t: number): ReactNode {
  if (k <= 0.01) return null;
  return (
    <g stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" opacity={0.6 * k}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const lado = i % 2 ? 1 : -1;
        const ph = (t * 2.2 + i * 0.37) % 1;
        const x = 160 + lado * (110 + ph * 40);
        const y = 60 + ph * 120 + (i % 3) * 8;
        return <line key={i} x1={x} y1={y} x2={x + lado * 8} y2={y + 22} />;
      })}
    </g>
  );
}

/** o vão de onde a bola saiu, marcado no chão (amarelo tracejado, pulsando) */
function vao(pr: Pr, yb: number, o: number, t: number): ReactNode {
  if (o <= 0.01) return null;
  const pts = [[2.6, yb - 1.4], [4.6, yb - 1.4], [4.6, yb + 1.4], [2.6, yb + 1.4]].map(([x, y]) => pr([x, y, 0.02]).map((v) => v.toFixed(1)).join(' '));
  return (
    <g opacity={o * (0.75 + 0.25 * Math.sin(t * 5))}>
      <path d={`M${pts.join('L')}Z`} fill="#ffd84a" opacity={0.6} stroke="#ff9a00" strokeWidth={2} strokeDasharray="3 2" />
    </g>
  );
}

/* ---------------- quadro ---------------- */

const ETIQUETA: Record<'b' | 'c' | 'd', string> = {
  b: 'A buzina não para uma criança correndo',
  c: 'Acelerar tira o tempo de reagir',
  d: 'Desviar sem reduzir cria outro perigo',
};

/** quadro da cena: `parte` (introdução ou ID da alternativa) no tempo `t` dela */
export function Cena({ parte, t, id = 'ebo' }: { parte: Parte; t: number; id?: string }) {
  const e = estado(parte, t);
  const congela = CONGELA[parte];
  const errado = parte === 'b' || parte === 'c' || parte === 'd';
  const tt = Math.min(t, congela);
  const corte = errado ? Math.max(0, 1 - Math.abs(t - CORTE[parte]) / 0.18) : 0;
  const y = (s: number) => -(s - e.sC);
  const b = bola(e.W);
  const yb = y(SB);

  const objs: Obj[] = [
    ...enfeites(e.sC),
    ...estacionados(e.sC).map(([s, lado, cor]) => car({ x: lado * XP, y: y(s), heading: lado > 0 ? 0 : Math.PI, color: cor })),
    car({ x: e.x, y: 0, heading: e.rumo, color: VOCE, brake: e.freio }),
  ];
  const kx = clamp((X - e.x) / 3);
  const cam = camLook(lerp(0.6, -0.2, kx), -7, 0, 10, 42, 14, 160, 80);
  const parou = e.seg && e.s >= e.r.para;

  return (
    <Scene3D
      id={id}
      cam={cam}
      ground={chao(e.sC)}
      objs={objs}
      overlay={(pr) => (
        <>
          {e.seg && vao(pr, yb, ease((e.s - e.r.pode + 0.3) / 0.4), e.s)}
          {b.vis && desenhaBola(pr, id, b.x, yb, b.giro)}
          {parte === 'intro' && (
            <>
              {tag(pr, [X, 0.4, 2.2], 'Você', janela(t, 0, 2.2, 0.3))}
              {tag(pr, [b.x, yb, 0.9], 'Bola', ease((t - BOLA_INI - 0.6) / 0.3))}
              {aviso('O que você faz?', '#2f6fd6', ease((t - T_DEC) / 0.3), interroga, 'direita')}
            </>
          )}
          {parte === 'b' && t < congela + 0.2 && buzina(pr, e.x, janela(t, 0.1, 1.2, 0.15), t)}
          {riscos(e.veloz, tt)}
          {parte === 'a' && aviso('Boa escolha', '#1f9d55', janela(t, 0.2, 2.6), visto)}
          {errado && t < CORTE[parte] && (
            <>
              {t >= congela && <rect x={0} y={0} width={320} height={200} fill="#0b1220" opacity={0.22} />}
              {t >= congela + 0.6 && etiqueta(ETIQUETA[parte])}
              {aviso('Essa escolha aumenta o perigo', '#d93a35', ease((t - congela) / 0.25), xis)}
            </>
          )}
          {errado && t >= CORTE[parte] && aviso('Jeito seguro', '#1f9d55', janela(e.s, 0.15, 2.3), visto)}
          {e.seg && e.s >= 0.8 && etiqueta(e.s >= e.r.pode ? 'Pode vir uma criança atrás da bola' : parou ? 'Parou antes da bola' : 'Tira o pé e freia')}
          {corte > 0 && <rect x={0} y={0} width={320} height={200} fill="#0b1220" opacity={0.85 * corte} />}
        </>
      )}
    />
  );
}

/** quadros parados (movimento reduzido): fim da introdução, a escolha e o jeito seguro */
export const QUADRO = {
  intro: T_DEC + 0.4,
  escolha: { a: RITMO_A.pode + 0.8, b: CONGELA.b + 1.0, c: CONGELA.c + 1.0, d: CONGELA.d + 1.0 } as Record<string, number>,
  /** tempo dentro do final "a" que mostra o carro parado e o vão marcado */
  seguro: RITMO_A.pode + 0.8,
};
