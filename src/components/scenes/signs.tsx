/**
 * Placas de trânsito nas cenas 3D (plano aprovado em 14/11/2026).
 * - A chapa tem o recorte da placa (octógono, triângulo, círculo, losango, X, retângulo), borda fina e costas cinza.
 * - Na frente vai o desenho oficial de `public/placas/` (ou o desenho do app, quando não há arquivo), sem luz nem sombra.
 * - Poste de cano cinza; a chapa começa a uns 2 m do chão e é desenhada 1,5× maior que a real, para dar para ler.
 * - `SignCallout`: balão com a placa grande, ligado ao poste por uma linha fina (como a etiqueta "Você").
 */
import type { ReactNode } from 'react';
import type { SignCode } from '../../content/types';
import { signGraphic } from '../SignArt';
import { Rz, T, chain, circle, extrude, lathe, tfObj, type Obj, type Part, type V2, type V3 } from './engine';

type Forma = 'octogono' | 'triangulo' | 'circulo' | 'losango' | 'x' | 'retangulo';

function forma(code: SignCode): Forma {
  if (code === 'R-1') return 'octogono';
  if (code === 'R-2') return 'triangulo';
  if (code === 'A-41') return 'x';
  if (code.startsWith('A-')) return 'losango';
  if (code === 'IND-destino') return 'retangulo';
  return 'circulo';
}

/** cor da chapa por baixo do desenho (a cor da borda da placa, caso um fio apareça) */
const BASE: Record<Forma, string> = { octogono: '#ffffff', triangulo: '#ef2c30', circulo: '#c50000', losango: '#ffd700', x: '#ffd700', retangulo: '#0f7a3d' };

/** largura real de cada forma, em metros (antes do aumento de 1,5×) */
const LARGURA: Record<Forma, number> = { octogono: 0.75, triangulo: 0.8, circulo: 0.75, losango: 0.85, x: 1.2, retangulo: 1.3 };

/** contorno da placa em (x, z), centrado em (0, 0), um pouco menor que o desenho (o desenho cobre a borda) */
function contorno(f: Forma, W: number, H: number): V2[] {
  const k = 0.96;
  const w = (W / 2) * k, h = (H / 2) * k;
  switch (f) {
    case 'octogono': {
      const R = w / Math.cos(Math.PI / 8);
      return circle(R, 8, Math.PI / 8);
    }
    case 'circulo':
      return circle(w, 20);
    case 'triangulo':
      // ponta para baixo; os cantos do desenho oficial são arredondados, então o contorno entra mais um pouco
      return [[-w * 0.94, h * 0.97], [w * 0.94, h * 0.97], [0, -h * 0.92]];
    case 'losango':
      return [[0, h * 0.97], [w * 0.97, 0], [0, -h * 0.97], [-w * 0.97, 0]];
    case 'retangulo':
      return [[-w, h], [w, h], [w, -h], [-w, -h]];
    case 'x': {
      // duas barras cruzadas (cruz de santo andré), com a meia-espessura t; o ângulo faz caber em w x h
      const t = h * 0.3;
      let a = Math.atan2(h, w);
      for (let n = 0; n < 6; n++) a = Math.atan2(h - t * Math.cos(a), w - t * Math.sin(a));
      const [c, s] = [Math.cos(a), Math.sin(a)];
      const L = (w - t * s) / c;
      const [X, Y, u, v] = [L * c, L * s, t * s, t * c];
      return [
        [t / s, 0], [X + u, Y - v], [X - u, Y + v],
        [0, t / c], [-X + u, Y + v], [-X - u, Y - v],
        [-t / s, 0], [-X - u, -Y + v], [-X + u, -Y - v],
        [0, -t / c], [X - u, -Y - v], [X + u, -Y + v],
      ];
    }
  }
}

export interface SignPostOpts {
  x: number;
  y: number;
  code: SignCode;
  /** velocidade da R-19 */
  speed?: number;
  /** para onde a frente olha: 0 = sul (para a câmera de sempre), π/2 = oeste, −π/2 = leste, π = norte (como o semáforo).
   *  A frente deve olhar para o motorista que se aproxima, no lado direito do fluxo. */
  face?: number;
  /** altura da borda de baixo da chapa, medida a partir de `chao` (urbana: 2 a 2,5 m pelo MBST) */
  h?: number;
  /** altura do chão onde o poste está: 0,16 na calçada (padrão), 0 no asfalto ou na terra */
  chao?: number;
  /** aumento em relação ao tamanho real */
  k?: number;
}

/** medidas da placa, para posicionar o balão */
export function signSize(code: SignCode, speed = 60, k = 1.5) {
  const f = forma(code);
  const { aspect } = signGraphic(code, speed);
  const W = LARGURA[f] * k;
  return { W, H: W / aspect };
}

export function signPost({ x, y, code, speed = 60, face = 0, h = 2.0, chao = 0.16, k = 1.5 }: SignPostOpts): Obj {
  const f = forma(code);
  const g = signGraphic(code, speed);
  const W = LARGURA[f] * k;
  const H = W / g.aspect;
  const zc = chao + h + H / 2;
  const espessura = 0.03;
  const poly = contorno(f, W, H).map(([a, b]): V2 => [a, b + zc]);
  const costas = '#9aa3ab';
  const chapa = extrude(poly, 'y', 0, espessura, (key) => (key === 'cap1' ? BASE[f] : key === 'cap0' ? costas : '#7d868e'));
  // a frente (cap1, em y = espessura, olhando para +y) vai por último, para o desenho ficar por cima das bordas
  const frente = chapa.faces.find((fc) => fc.n && fc.n[1] > 0.9 && Math.abs(fc.p[0][1] - espessura) < 1e-6);
  if (!frente) throw new Error(`signPost: chapa sem frente (${code})`);
  frente.flat = true;
  const yf = espessura + 0.001;
  frente.art = { o: [-W / 2, yf, zc + H / 2], u: [W / 2, yf, zc + H / 2], v: [-W / 2, yf, zc + H / 2 - W], node: g.node };
  chapa.faces = [...chapa.faces.filter((fc) => fc !== frente), frente];
  // cano atrás da chapa, do chão até perto do alto da placa
  const topo = f === 'x' ? zc : chao + h + H * 0.85;
  const cano: Part = tfObj({ parts: [lathe([[0.045, chao], [0.045, topo], [0.03, topo + 0.02]], 8, '#8b949c')] }, T(0, -0.06)).parts[0];
  return tfObj({ parts: [cano, chapa], shadow: true }, chain(T(x, y), Rz(face)));
}

/** ponto do alto da caixa da placa (onde a linha do balão encosta) */
export function signTop({ x, y, code, speed = 60, h = 2.0, chao = 0.16, k = 1.5 }: SignPostOpts): V3 {
  return [x, y, chao + h + signSize(code, speed, k).H];
}

/**
 * Balão com a placa em tamanho de leitura, ligado ao poste por uma linha fina.
 * `at` é o ponto da tela onde a linha encosta (use `pr(signTop(...))`); `dx`/`dy` levam o balão para o lado livre.
 */
export function SignCallout({ at, code, speed = 60, dx = 34, dy = -30, size = 46 }: { at: V2; code: SignCode; speed?: number; dx?: number; dy?: number; size?: number }): ReactNode {
  const g = signGraphic(code, speed);
  const w = size, hh = size / g.aspect;
  const pad = 5;
  const bw = w + pad * 2, bh = hh + pad * 2;
  // o balão inteiro fica dentro da cena (320 x 200), com 4 de margem
  const cx = Math.max(4 + bw / 2, Math.min(316 - bw / 2, at[0] + dx));
  const cy = Math.max(4 + bh / 2, Math.min(196 - bh / 2, at[1] + dy));
  const s = w / 100;
  return (
    <g>
      <line x1={at[0]} y1={at[1]} x2={cx} y2={cy} stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={at[0]} cy={at[1]} r={1.8} fill="#fff" />
      <rect x={cx - bw / 2} y={cy - bh / 2} width={bw} height={bh} rx={8} fill="#fff" stroke="#0002" />
      <g transform={`translate(${cx - w / 2} ${cy - hh / 2}) scale(${s})`}>{g.node}</g>
    </g>
  );
}
