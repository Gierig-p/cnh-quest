/**
 * Placas de indicação (retangulares) para os vídeos do Mundo 2, lote 2 de 15/11/2026.
 * Cada arte é desenhada numa caixa de 100 de largura (a altura varia) e serve tanto para a placa 3D
 * (colada na face da frente de um painel em postes) quanto para o desenho chapado na tela.
 */
import type { ReactNode } from 'react';
import { box, type Obj } from './engine';

export interface Arte {
  node: ReactNode;
  h: number;
}

const FONTE = 'Arial, sans-serif';

/** seta branca: 'cima' ou 'direita', com a ponta em (x, y) */
function seta(x: number, y: number, dir: 'cima' | 'direita', cor = '#fff'): ReactNode {
  const d = dir === 'cima' ? `M${x} ${y} l7 8 h-4.2 v9 h-5.6 v-9 h-4.2 z` : `M${x} ${y} l-8 7 v-4.2 h-9 v-5.6 h9 v-4.2 z`;
  return <path d={d} fill={cor} />;
}

function chapa(cor: string, h: number, borda = '#fff', children: ReactNode): ReactNode {
  return (
    <g fontFamily={FONTE} fontWeight={800}>
      <rect x={0} y={0} width={100} height={h} rx={4} fill={cor} />
      <rect x={3} y={3} width={94} height={h - 6} rx={3} fill="none" stroke={borda} strokeWidth={1.6} />
      {children}
    </g>
  );
}

/** verde, orientação de destino: Centro em frente, Praia à direita */
export const VERDE_DESTINO: Arte = {
  h: 60,
  node: chapa(
    '#0f7a3d',
    60,
    '#fff',
    <g fill="#fff" fontSize={13}>
      <text x={10} y={25}>Centro</text>
      {seta(80, 9, 'cima')}
      <text x={10} y={48}>Praia</text>
      {seta(89, 42, 'direita')}
    </g>,
  ),
};

/** verde de distâncias; `hl` destaca a coluna dos quilômetros ou a ordem (de cima para baixo) */
export function verdeDistancias(hl: 'km' | 'ordem' | 'primeira' | null = null): Arte {
  const linhas: [string, string, number][] = [
    ['Vila Nova', '12 km', 21],
    ['Santa Rita', '45 km', 37],
    ['Porto Alto', '90 km', 53],
  ];
  return {
    h: 62,
    node: chapa(
      '#0f7a3d',
      62,
      '#fff',
      <>
        {hl === 'km' && <rect x={62} y={8} width={28} height={50} rx={3} fill="#ffd84a" opacity={0.35} />}
        {hl === 'primeira' && <rect x={6} y={10} width={88} height={15} rx={3} fill="#ffd84a" opacity={0.35} />}
        {linhas.map(([c, km, y]) => (
          <g key={c} fontSize={7.6} fill="#fff">
            <text x={9} y={y}>{c}</text>
            <text x={88} y={y} textAnchor="end">{km}</text>
          </g>
        ))}
        {hl === 'ordem' && <path d="M92.8 13 V52 M90.3 48.5 L92.8 53 L95.3 48.5" stroke="#ffd84a" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      </>,
    ),
  };
}

/** a placa seguinte, com o destino que não coube na primeira */
export const VERDE_OUTRA: Arte = {
  h: 30,
  node: chapa(
    '#0f7a3d',
    30,
    '#fff',
    <g fontSize={7.6} fill="#fff">
      <text x={9} y={19}>Ouro Fino</text>
      <text x={88} y={19} textAnchor="end">130 km</text>
    </g>,
  ),
};

/** azul, identificação: o nome do município */
export const AZUL_CIDADE: Arte = {
  h: 40,
  node: chapa(
    '#1f5fbf',
    40,
    '#fff',
    <g fill="#fff" textAnchor="middle">
      <text x={50} y={17} fontSize={8} fontWeight={700}>Município de</text>
      <text x={50} y={32} fontSize={12.5}>SANTA RITA</text>
    </g>,
  ),
};

/** azul, identificação: o quilômetro da rodovia */
export const AZUL_KM: Arte = {
  h: 100,
  node: chapa(
    '#1f5fbf',
    100,
    '#fff',
    <g fill="#fff" textAnchor="middle">
      <text x={50} y={42} fontSize={24}>km</text>
      <text x={50} y={80} fontSize={36}>42</text>
    </g>,
  ),
};

/** azul: pedágio adiante */
export const AZUL_PEDAGIO: Arte = {
  h: 40,
  node: chapa(
    '#1f5fbf',
    40,
    '#fff',
    <g fill="#fff">
      <text x={9} y={25} fontSize={11}>Pedágio</text>
      <text x={92} y={25} fontSize={10} textAnchor="end">2 km</text>
    </g>,
  ),
};

/** azul, serviço: posto de combustível (bomba desenhada) */
export const AZUL_POSTO: Arte = {
  h: 100,
  node: chapa(
    '#1f5fbf',
    100,
    '#fff',
    <g>
      <rect x={20} y={14} width={60} height={72} rx={4} fill="#fff" />
      <g fill="#1d2430">
        <rect x={32} y={26} width={24} height={50} rx={2} />
        <rect x={28} y={74} width={32} height={6} />
        <path d="M56 36 h8 l6 6 v22 a4 4 0 0 1 -8 0 v-12 h-6" fill="none" stroke="#1d2430" strokeWidth={3.2} />
      </g>
      <rect x={36} y={31} width={16} height={11} fill="#fff" />
    </g>,
  ),
};

/** marrom: atrativo turístico (parque, com uma árvore desenhada) */
export const MARROM_PARQUE: Arte = {
  h: 50,
  node: chapa(
    '#7a4a24',
    50,
    '#fff',
    <g>
      <g fill="#fff">
        <circle cx={20} cy={20} r={9} />
        <circle cx={14} cy={26} r={6} />
        <circle cx={26} cy={26} r={6} />
        <rect x={18.5} y={28} width={3} height={12} />
      </g>
      <text x={38} y={23} fontSize={12} fill="#fff">Parque</text>
      <text x={38} y={38} fontSize={9} fill="#fff" fontWeight={700}>Municipal  →</text>
    </g>,
  ),
};

/** branca com letras pretas: educativa */
export const BRANCA_EDUCATIVA: Arte = {
  h: 44,
  node: chapa(
    '#ffffff',
    44,
    '#1d1d1d',
    <g fill="#1d1d1d" textAnchor="middle" fontSize={10.5}>
      <text x={50} y={20}>Respeite a</text>
      <text x={50} y={33}>sinalização</text>
    </g>,
  ),
};

/**
 * Painel 3D em dois postes, de frente para a câmera (face +y), de x0 a x1, com a borda de baixo na altura z0.
 * Devolve o objeto e o ponto do alto do painel, para o balão.
 */
export function painel(arte: Arte, x0: number, x1: number, y: number, z0: number, postes = 2): { obj: Obj; topo: [number, number, number] } {
  const w = x1 - x0;
  const z1 = z0 + (w * arte.h) / 100;
  const chapa3d = box(x0, y - 0.08, z0, x1, y, z1, '#7d868e');
  const frente = chapa3d.faces.find((f) => f.n && f.n[1] > 0.9);
  if (frente) {
    frente.flat = true;
    frente.art = { o: [x0, y + 0.001, z1], u: [x1, y + 0.001, z1], v: [x0, y + 0.001, z1 - w], node: arte.node };
  }
  const xs = postes === 1 ? [(x0 + x1) / 2] : [x0 + w * 0.18, x1 - w * 0.18];
  const ps = xs.map((x) => box(x - 0.07, y - 0.2, 0, x + 0.07, y - 0.08, z1 - 0.05, '#8b949c'));
  return { obj: { parts: [...ps, chapa3d], shadow: true }, topo: [(x0 + x1) / 2, y, z1] };
}

/** a arte chapada na tela, centrada em (cx, cy), com largura w */
export function arteTela(arte: Arte, cx: number, cy: number, w: number, o = 1): ReactNode {
  if (o <= 0.01) return null;
  const k = w / 100;
  return (
    <g opacity={o} transform={`translate(${cx - w / 2} ${cy - (arte.h * k) / 2}) scale(${k})`}>
      <rect x={-2} y={-2} width={104} height={arte.h + 4} rx={6} fill="#000" opacity={0.25} transform="translate(1.5 2)" />
      {arte.node}
    </g>
  );
}

/** balão branco ligado ao ponto `at` (pixels), com a arte dentro; (x, y) é o canto do balão, `w` a largura da arte */
export function balaoArte(at: [number, number], arte: Arte, x: number, y: number, w: number, o = 1): ReactNode {
  if (o <= 0.01) return null;
  const k = w / 100, bw = w + 12, bh = arte.h * k + 12;
  return (
    <g opacity={o}>
      <line x1={at[0]} y1={at[1]} x2={x + bw / 2} y2={y + bh / 2} stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={at[0]} cy={at[1]} r={1.8} fill="#fff" />
      <rect x={x} y={y} width={bw} height={bh} rx={8} fill="#fff" stroke="#0002" />
      <g transform={`translate(${x + 6} ${y + 6}) scale(${k})`}>{arte.node}</g>
    </g>
  );
}
