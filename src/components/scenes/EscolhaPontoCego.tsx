/**
 * Vídeo de escolha da moto no ponto cego (w5-rua-4, 17/11/2026).
 * Introdução: você vai pela faixa do meio de uma avenida, com a seta para a esquerda; o espelho parece livre
 * e há barulho de motor bem perto ("O que você faz?"). A câmera olha para a frente: a moto, no ponto cego,
 * fica fora da tela, sem seta apontando para ela.
 * Finais pelo ID da alternativa:
 *  a: começa a ir para a esquerda sem olhar e a cena para logo no começo.
 *  b: buzina (ícone) e começa o mesmo movimento; para logo no começo.
 *  c: começa o movimento mais curto e mais rápido; para logo no começo.
 *  d (certa): vira um pouco a cabeça, a câmera mostra a moto no ponto cego e você espera na sua faixa.
 * Nos errados, ao parar, a câmera recua e mostra a moto (bem longe de encostar); depois um corte volta
 * ao ponto da decisão e mostra o jeito seguro (o mesmo do final d, mais curto).
 */
import type { ReactNode } from 'react';
import { Scene3D, camLook, type Obj } from './engine';
import { car } from './models';
import { AV, AV_OBJS, FX, clamp, ease, janela, lerp, moto, pisca, tag, VOCE, type Pr } from './videoBase';
import { cabeca, espelhoExterno, ondas } from './VideoRetrovisores';
import { quadro } from './infracoesUI';
import { aviso, etiqueta, interroga, visto, xis } from './escolhaUI';
import tempos from '../../content/escolhas/w5-rua-4.json';

export type Parte = 'intro' | 'a' | 'b' | 'c' | 'd';
type Tempo = { dur: number; falas: { ini: number; fim: number }[] };
export const TEMPOS = tempos as Record<Parte, Tempo>;

/* ---------------- lugar e movimento ---------------- */

const V = 5; // velocidade de todos (m/s de desenho)
const Y_INI = 40; // onde o seu carro começa
const X = FX[1]; // sua faixa (meio)
const MX = FX[0] + 0.6; // moto: na faixa da esquerda, perto da linha
const M_REL = 4.4; // moto: um pouco atrás de você, no ponto cego

/** a introdução para na pergunta (última fala) */
export const T_DEC = TEMPOS.intro.falas[TEMPOS.intro.falas.length - 1].ini - 0.3;
/** onde começa o "jeito seguro" nos finais errados (meio segundo antes da fala) */
const corteDe = (p: Parte) => TEMPOS[p].falas[2].ini - 0.5;
export const CORTE: Record<Parte, number> = { intro: Infinity, a: corteDe('a'), b: corteDe('b'), c: corteDe('c'), d: Infinity };

/** começo e fim do movimento para o lado em cada final errado (o fim é onde congela) */
const LADO: Record<'a' | 'b' | 'c', [number, number]> = { a: [0.5, 1.7], b: [1.3, 2.5], c: [0.4, 1.0] };
/** até onde o carro chega quando congela (bem longe da moto) */
const X_CONGELA = X - 0.9;
export const CONGELA: Record<Parte, number> = { intro: T_DEC, a: LADO.a[1], b: LADO.b[1], c: LADO.c[1], d: Infinity };

/** jeito seguro: quando vira a cabeça, quando a câmera mostra a moto e quando a moto passa */
interface Ritmo {
  cabeca: number;
  revela: number;
  passa: number;
}
const RITMO_D: Ritmo = { cabeca: 0.9, revela: 2.6, passa: TEMPOS.d.falas[1].ini + 0.4 };
const RITMO_CORTE: Ritmo = { cabeca: 0.2, revela: 0.9, passa: 2.4 };
const A_MOTO = 2.4; // aceleração da moto ao passar

interface Estado {
  /** tempo do mundo (todos andam juntos) */
  T: number;
  x: number;
  rumo: number;
  /** moto: posição relativa ao seu carro (+ = atrás) */
  mRel: number;
  /** 0 = câmera olhando para a frente (moto fora da tela); 1 = câmera mostra o ponto cego */
  revela: number;
  /** virada da cabeça (0 a 1) */
  cabeca: number;
  /** quadro da cabeça visível */
  qCabeca: number;
  seg: boolean;
  /** tempo dentro do jeito seguro */
  s: number;
  ritmo: Ritmo;
}

function seguro(s: number, r: Ritmo): Estado {
  const p = Math.max(0, s - r.passa);
  return {
    T: T_DEC + s,
    x: X,
    rumo: 0,
    mRel: M_REL - (A_MOTO / 2) * p * p,
    revela: ease((s - r.revela + 0.5) / 0.9),
    cabeca: ease((s - r.cabeca) / 0.8),
    qCabeca: janela(s, r.cabeca - 0.3, r.passa + 0.6, 0.3),
    seg: true,
    s,
    ritmo: r,
  };
}

function estado(parte: Parte, t: number): Estado {
  const base = { mRel: M_REL, cabeca: 0, qCabeca: 0, seg: false, s: 0, ritmo: RITMO_D };
  if (parte === 'intro') return { ...base, T: Math.min(t, T_DEC), x: X, rumo: 0, revela: 0 };
  if (parte === 'd') return seguro(t, RITMO_D);
  if (t >= CORTE[parte]) return seguro(t - CORTE[parte], RITMO_CORTE);
  const [i, f] = LADO[parte];
  const s = Math.min(t, f);
  const k = ease((s - i) / (f - i));
  // depois de parar, a câmera recua e mostra a moto
  return { ...base, T: T_DEC + s, x: lerp(X, X_CONGELA, k), rumo: -0.16 * Math.sin(Math.PI * Math.min(1, k * 0.9)), revela: ease((t - f - 0.4) / 0.9) };
}

/* ---------------- desenho ---------------- */

/** buzina: ícone de corneta com ondas, perto do carro (pixels) */
function buzina(pr: Pr, x: number, y: number, o: number, t: number): ReactNode {
  if (o <= 0.01) return null;
  const [px, py] = pr([x + 1.2, y - 1.5, 1.6]);
  return (
    <g opacity={o}>
      <circle cx={px + 8} cy={py - 8} r={13} fill="#ffffff" opacity={0.95} />
      <path d={`M${px + 1} ${py - 11} L${px + 6} ${py - 11} L${px + 13} ${py - 15} L${px + 13} ${py - 1} L${px + 6} ${py - 5} L${px + 1} ${py - 5} Z`} fill="#1d2430" />
      {ondas(px + 16, py - 8, t, 0.9)}
    </g>
  );
}

/** espelho externo pequeno, no canto de cima à esquerda (pixels) */
function espelho(o: number): ReactNode {
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      <g transform="translate(10 44) scale(0.5)">{espelhoExterno(0, 0, 1, 1)}</g>
      <rect x={10} y={90} width={62} height={15} rx={7.5} fill="#ffffff" opacity={0.95} />
      <text x={41} y={100.5} textAnchor="middle" fontSize={9.5} fontWeight={800} fill="#1d2430" fontFamily="Nunito, system-ui, sans-serif">Espelho</text>
    </g>
  );
}

/** som de motor perto: ícone discreto no canto (não aponta para onde está a moto) */
function somMotor(o: number, t: number): ReactNode {
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      <rect x={10} y={110} width={62} height={22} rx={11} fill="#1d2430" opacity={0.82} />
      <path d="M18 117 h9 l3 3 h4 v6 h-4 l-3 3 h-9 z" fill="#ffd84a" />
      {ondas(40, 121, t, 1)}
    </g>
  );
}

/** quadro da cena: `parte` (introdução ou ID da alternativa) no tempo `t` dela */
export function Cena({ parte, t, id = 'epc' }: { parte: Parte; t: number; id?: string }) {
  const e = estado(parte, t);
  const yV = Y_INI - V * e.T;
  const yM = yV + e.mRel;
  const r = e.revela;
  // câmera: olhando à frente (moto fora da tela) → recua e mostra o ponto cego
  const cam = camLook(lerp(-0.4, -1.4, r), yV + lerp(-6, 0.6, r), 0, lerp(0, 10, r), lerp(70, 44, r), lerp(14, 11.5, r), 160, lerp(64, 100, r));
  const blink = parte === 'intro' && t < 1.2 ? null : (pisca(t, 'l') as 'l' | null);
  const objs: Obj[] = [
    ...AV_OBJS,
    car({ x: FX[1], y: yV - 15, color: '#4f7fc4' }),
    car({ x: FX[2], y: yV - 24, color: '#8f98a3' }),
    car({ x: FX[2], y: yV + 9, color: '#d9d2c3' }),
    car({ x: e.x, y: yV, heading: e.rumo, color: VOCE, blink }),
  ];
  // com a câmera olhando para a frente, a moto estaria na borda de baixo: só entra quando a câmera recua
  if (r > 0.01) objs.push(moto(MX, yM, 0, '#e05a5a'));
  const congela = CONGELA[parte];
  const errado = parte === 'a' || parte === 'b' || parte === 'c';
  const corte = errado ? Math.max(0, 1 - Math.abs(t - CORTE[parte]) / 0.18) : 0;
  const passou = e.seg && e.mRel < -5;

  return (
    <Scene3D
      id={id}
      cam={cam}
      ground={AV}
      objs={objs}
      overlay={(pr) => (
        <>
          {parte === 'intro' && (
            <>
              {tag(pr, [e.x, yV + 0.4, 2.2], 'Você', janela(t, 0, 1.6, 0.3))}
              {espelho(janela(t, TEMPOS.intro.falas[1].ini - 0.2))}
              {somMotor(janela(t, TEMPOS.intro.falas[1].ini + 1.0), t)}
              {aviso('O que você faz?', '#2f6fd6', ease((t - T_DEC) / 0.3), interroga, 'direita')}
            </>
          )}
          {parte === 'b' && buzina(pr, e.x, yV, janela(t, 0.15, 1.3, 0.15), t)}
          {parte === 'd' && aviso('Boa escolha', '#1f9d55', janela(t, 0.2, 2.6), visto)}
          {errado && t < CORTE[parte] && (
            <>
              {t >= congela && <rect x={0} y={0} width={320} height={200} fill="#0b1220" opacity={0.22} />}
              {tag(pr, [MX, yM, 2.1], 'Moto', ease((t - congela - 1.0) / 0.4))}
              {t >= congela + 1.0 && etiqueta('Moto no ponto cego')}
              {aviso('Essa escolha aumenta o perigo', '#d93a35', ease((t - congela) / 0.25), xis)}
            </>
          )}
          {errado && t >= CORTE[parte] && aviso('Jeito seguro', '#1f9d55', janela(e.s, 0.15, 2.8), visto)}
          {e.seg && (
            <>
              {quadro(10, 44, 92, 74, e.qCabeca, (
                <>
                  {cabeca(46, 39, e.cabeca * 0.9)}
                  <text x={46} y={68} textAnchor="middle" fontSize={9.5} fontWeight={800} fill="#1d2430" fontFamily="Nunito, system-ui, sans-serif">Olha o ponto cego</text>
                </>
              ))}
              {tag(pr, [MX, yM, 2.1], 'Moto', clamp(e.revela * 2 - 1) * (passou ? 0 : 1))}
              {e.s >= e.ritmo.revela && etiqueta(passou ? 'A moto passou' : 'Espera na sua faixa')}
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
  escolha: { a: LADO.a[1] + 1.6, b: LADO.b[1] + 1.6, c: LADO.c[1] + 1.6, d: RITMO_D.revela + 1.0 } as Record<string, number>,
  /** tempo dentro do final "d" que mostra a cabeça virada e a moto no ponto cego */
  seguro: RITMO_D.revela + 1.0,
};
