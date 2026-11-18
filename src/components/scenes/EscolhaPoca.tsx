/**
 * Vídeo de escolha da poça na chuva (w5-rua-1, piloto de 17/11/2026).
 * Introdução: você vem pela rodovia na chuva, com luz baixa, e para antes da poça ("O que você faz?").
 * Finais pelo ID da alternativa:
 *  a (certa): freia antes da poça, a luz de freio apaga antes da água, passa reto com o volante firme.
 *  b: acelera em direção à água e a cena para na entrada (sem derrapar).
 *  c: entra, a luz de freio acende em cima da água e a cena para (sem rodar).
 *  d: começa a ir para a outra faixa, onde vem um carro, e a cena para antes de entrar nela.
 * Nos finais errados, depois do aviso, um corte volta ao ponto da decisão e mostra o jeito seguro.
 * Nada de batida, giro ou alagamento: a cena para antes.
 */
import type { ReactNode } from 'react';
import { Scene3D, camLook, flat, lines, rng, type Obj, type Part, type V2 } from './engine';
import { car } from './models';
import { campo, estrada } from './Mundo2';
import { chuva, clamp, ease, facho, janela, lerp, tag, VOCE, type Pr } from './videoBase';
import { volante } from './VideoManutencao';
import { aviso, etiqueta, interroga, visto, xis } from './escolhaUI';
import tempos from '../../content/escolhas/w5-rua-1.json';

export type Parte = 'intro' | 'a' | 'b' | 'c' | 'd';
type Tempo = { dur: number; falas: { ini: number; fim: number }[] };
export const TEMPOS = tempos as Record<Parte, Tempo>;

/* ---------------- lugar e movimento ---------------- */

const X = 1.75; // centro da sua faixa
const POCA = { x: 1.7, y: -28.6, rx: 2.0, ry: 4.6 };
const BORDA = POCA.y + POCA.ry; // começo da poça (-24)
const FIM_POCA = POCA.y - POCA.ry; // fim da poça (-33.2)
const FRENTE = 2.15; // do centro do carro até o para-choque
const V = 4.5; // velocidade da cena (m/s de desenho)
const Y_DEC = BORDA + FRENTE + 8; // onde o carro para na decisão: 8 m antes da poça

/** a introdução para na pergunta (última fala) */
export const T_DEC = TEMPOS.intro.falas[TEMPOS.intro.falas.length - 1].ini - 0.3;
/** onde começa o "jeito seguro" nos finais errados (meio segundo antes da fala) */
const corteDe = (p: Parte) => TEMPOS[p].falas[2].ini - 0.5;
export const CORTE: Record<Parte, number> = { intro: Infinity, a: Infinity, b: corteDe('b'), c: corteDe('c'), d: corteDe('d') };

/** jeito seguro: freia até 3 m/s, solta o freio 1 m antes da água e passa reto */
const A_FREIO = 0.8;
const T_FREIO = (V - 3) / A_FREIO;
const Y_SOLTA = Y_DEC - (V * T_FREIO - (A_FREIO / 2) * T_FREIO ** 2);
function seguro(s: number) {
  if (s <= T_FREIO) return { y: Y_DEC - (V * s - (A_FREIO / 2) * s * s), freio: s > 0.15 };
  return { y: Y_SOLTA - 3 * (s - T_FREIO), freio: false };
}

/** b: acelera até a borda da água e para ali */
const A_ACEL = 2.2;
const T_B = (-V + Math.sqrt(V * V + 2 * A_ACEL * (Y_DEC - (BORDA + FRENTE)))) / A_ACEL;
/** c: entra na poça e freia 2,5 m dentro dela */
const T_C_FREIO = (Y_DEC - (BORDA - 2.5 + FRENTE)) / V;
const T_C = T_C_FREIO + 0.3;
/** d: desvia para a esquerda sem olhar, para antes de passar da linha do meio */
const T_D0 = 0.3, T_D = 1.3;

/** momento em que cada final errado congela */
export const CONGELA: Record<Parte, number> = { intro: T_DEC, a: Infinity, b: T_B, c: T_C, d: T_D };

/** carro que vem na outra faixa (tempo contado desde o começo da introdução) */
const outro = (T: number) => -25.4 + 2.6 * (T - T_DEC - T_D);

interface Estado {
  x: number;
  y: number;
  rumo: number;
  freio: boolean;
  /** tempo "do mundo" para o carro da outra faixa */
  T: number;
  /** no jeito seguro (quadro do volante, respingos) */
  seg: boolean;
  /** acelerando (riscos de velocidade) */
  acel: number;
}

function estado(parte: Parte, t: number): Estado {
  if (parte === 'intro') {
    const tt = Math.min(t, T_DEC);
    return { x: X, y: Y_DEC + V * (T_DEC - tt), rumo: 0, freio: false, T: tt, seg: false, acel: 0 };
  }
  if (t >= CORTE[parte] || parte === 'a') {
    const s = parte === 'a' ? t : t - CORTE[parte];
    const g = seguro(s);
    return { x: X, y: g.y, rumo: 0, freio: g.freio, T: T_DEC + s, seg: true, acel: 0 };
  }
  if (parte === 'b') {
    const s = Math.min(t, T_B);
    return { x: X, y: Y_DEC - (V * s + (A_ACEL / 2) * s * s), rumo: 0, freio: false, T: T_DEC + s, seg: false, acel: t < T_B ? clamp(t / 0.4) : 0 };
  }
  if (parte === 'c') {
    const s = Math.min(t, T_C);
    return { x: X, y: Y_DEC - V * s, rumo: 0, freio: s >= T_C_FREIO, T: T_DEC + s, seg: false, acel: 0 };
  }
  // d
  const s = Math.min(t, T_D);
  const k = ease((s - T_D0) / (T_D - T_D0));
  return { x: lerp(X, 0.5, k), y: Y_DEC - V * s, rumo: -0.24 * Math.sin(Math.PI * Math.min(1, k * 1.15)), freio: false, T: T_DEC + s, seg: false, acel: 0 };
}

/* ---------------- desenho ---------------- */

function poca(): Part[] {
  const { x, y, rx, ry } = POCA;
  const r = rng(5);
  const pts: V2[] = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    const k = 0.88 + r() * 0.18;
    return [x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k];
  });
  return [
    flat(pts, '#5f7f9f', 0.004, 0.95),
    flat(pts.map(([a, b]): V2 => [x + (a - x) * 0.7, y + (b - y) * 0.8]), '#88a6c2', 0.006, 0.85),
    lines([
      { p: [[x - rx * 0.4, y - ry * 0.3, 0.008], [x + rx * 0.1, y - ry * 0.5, 0.008]], c: '#dfeaf5', w: 1.1 },
      { p: [[x - rx * 0.1, y + ry * 0.2, 0.008], [x + rx * 0.45, y, 0.008]], c: '#dfeaf5', w: 0.9 },
    ]),
  ];
}

const CHAO = [...estrada('tracejada'), ...poca()];
const CAMPO = campo(5);

/** quadro do volante seguro com as duas mãos (pixels) */
export function volanteFirme(o: number): ReactNode {
  if (o <= 0.01) return null;
  const cx = 272, cy = 84, r = 19;
  const mao = (a: number) => <circle cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={5.4} fill="#c98a5e" stroke="#8a5a3a" strokeWidth={1} />;
  return (
    <g opacity={o}>
      <rect x={234} y={48} width={76} height={74} rx={12} fill="#ffffff" opacity={0.94} />
      {volante(cx, cy, r)}
      {mao((-150 * Math.PI) / 180)}
      {mao((-30 * Math.PI) / 180)}
      <text x={272} y={116} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#1d2430" fontFamily="Nunito, system-ui, sans-serif">Volante firme</text>
    </g>
  );
}

/** respingos nas rodas de trás quando o carro está na água (pixels) */
function respingos(pr: Pr, e: Estado, t: number): ReactNode {
  const traseira = e.y + FRENTE - 0.4;
  const naAgua = e.y - FRENTE < BORDA && traseira > FIM_POCA;
  if (!naAgua) return null;
  return (
    <g stroke="#e9f3fb" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.85}>
      {[-1, 1].map((s) => {
        const [x, y] = pr([e.x + s * 1.0, traseira, 0.1]);
        const b = 3 + 1.5 * Math.sin(t * 22 + s);
        return <path key={s} d={`M${x} ${y} q${s * 5} ${-b * 2} ${s * 10} ${-b}`} />;
      })}
    </g>
  );
}

function riscos(pr: Pr, e: Estado): ReactNode {
  if (e.acel <= 0.01) return null;
  return (
    <g stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" opacity={0.8 * e.acel}>
      {[-0.7, 0, 0.7].map((dx) => {
        const [x0, y0] = pr([e.x + dx, e.y + FRENTE + 0.6, 0.5]);
        const [x1, y1] = pr([e.x + dx, e.y + FRENTE + 3.2, 0.5]);
        return <line key={dx} x1={x0} y1={y0} x2={x1} y2={y1} />;
      })}
    </g>
  );
}

/** quadro da cena: `parte` (introdução ou ID da alternativa) no tempo `t` dela */
export function Cena({ parte, t, id = 'ep' }: { parte: Parte; t: number; id?: string }) {
  const e = estado(parte, t);
  const yo = outro(e.T);
  const cam = camLook(0.9, e.y - 7.5, 0, 10, 38, 11.5, 160, 92);
  const objs: Obj[] = [...CAMPO, car({ x: e.x, y: e.y, heading: e.rumo, color: VOCE, brake: e.freio })];
  if (yo > -68) objs.push(car({ x: -X, y: yo, heading: Math.PI, color: '#8f98a3' }));
  const congela = CONGELA[parte];
  const errado = parte !== 'intro' && parte !== 'a';
  // perto do corte, um piscar escuro
  const corte = errado ? Math.max(0, 1 - Math.abs(t - CORTE[parte]) / 0.18) : 0;
  const naAgua = e.seg && e.y - FRENTE < BORDA - 0.3 && e.y + FRENTE > FIM_POCA;
  const sTempo = errado ? t - CORTE[parte] : t;

  return (
    <Scene3D
      id={id}
      cam={cam}
      ground={CHAO}
      objs={objs}
      overlay={(pr) => (
        <>
          {facho(pr, e.x, e.y, -1, 0, 0.16)}
          {chuva(t + (parte === 'intro' ? 0 : 20), 1)}
          {respingos(pr, e, t)}
          {riscos(pr, e)}
          {e.freio && tag(pr, [e.x, e.y + FRENTE + 0.6, 1.5], 'Freio', 1)}
          {parte === 'intro' && (
            <>
              {tag(pr, [e.x, e.y + 0.4, 2.2], 'Você', janela(t, 0, 1.5, 0.3))}
              {tag(pr, [e.x, e.y - FRENTE - 4, 0.2], 'Luz baixa', janela(t, 1.8, TEMPOS.intro.falas[0].fim, 0.3))}
              {tag(pr, [POCA.x, POCA.y + 1.5, 0.3], 'Poça', janela(t, TEMPOS.intro.falas[1].ini - 0.3))}
              {aviso('O que você faz?', '#2f6fd6', ease((t - T_DEC) / 0.3), interroga, 'direita')}
            </>
          )}
          {parte === 'a' && aviso('Boa escolha', '#1f9d55', janela(t, 0.2, 2.6), visto)}
          {errado && t < CORTE[parte] && (
            <>
              {t >= congela && <rect x={0} y={0} width={320} height={200} fill="#0b1220" opacity={0.22} />}
              {aviso('Essa escolha aumenta o perigo', '#d93a35', ease((t - congela) / 0.25), xis)}
            </>
          )}
          {errado && t >= CORTE[parte] && aviso('Jeito seguro', '#1f9d55', janela(sTempo, 0.15, 2.8), visto)}
          {e.seg && etiqueta(e.freio ? 'Freia antes da poça' : naAgua ? 'Sem frear na água' : 'Freio solto')}
          {volanteFirme(naAgua ? 1 : 0)}
          {corte > 0 && <rect x={0} y={0} width={320} height={200} fill="#0b1220" opacity={0.85 * corte} />}
        </>
      )}
    />
  );
}

/** quadros parados (movimento reduzido): fim da introdução, a escolha e o jeito seguro */
export const QUADRO = {
  intro: T_DEC + 0.4,
  escolha: { a: T_FREIO + 1.2, b: T_B + 0.6, c: T_C + 0.6, d: T_D + 0.6 } as Record<string, number>,
  /** tempo dentro do final "a" que mostra o carro na água com o volante firme */
  seguro: T_FREIO + 1.2,
};
