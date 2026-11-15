/**
 * Peças das cenas novas ("3D disfarçado de 2D", piloto de 14/11/2026).
 *
 * Câmera fixa, olhando para o norte de cima e um pouco de lado (vista 3/4 oblíqua):
 * - o chão é desenhado como planta (x para a direita, y para baixo = para perto da câmera);
 * - a altura z sobe na tela e escorrega um pouco para a direita, então vemos o topo, a face sul (da frente)
 *   e a face leste (da direita) de cada objeto;
 * - luz sempre do alto à esquerda: topo mais claro, frente média, lado direito mais escuro, sombra para baixo à direita.
 * Tudo é SVG puro, sem filtros nem desfoque (leve em celular simples).
 */
import type { ReactNode } from 'react';

export const OX = 0.32;
export const OY = 1;

/** ponto do chão (x, y) na altura z, já na tela */
export const P = (x: number, y: number, z = 0): [number, number] => [x + z * OX, y - z * OY];
const pts = (...ps: [number, number][]) => ps.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');

export interface Faces {
  top: string;
  front: string;
  side: string;
  /** contorno suave (mesma família de cor) */
  line?: string;
}

/** Caixa: base de (x0,y0) a (x1,y1) no chão, de z0 a z1. Desenha lado, frente e topo, nessa ordem. */
export function Box({ x0, y0, x1, y1, z0 = 0, z1, c, children }: { x0: number; y0: number; x1: number; y1: number; z0?: number; z1: number; c: Faces; children?: ReactNode }) {
  const s = c.line ?? '#00000030';
  return (
    <g strokeLinejoin="round" strokeWidth={0.8} stroke={s}>
      <polygon points={pts(P(x1, y1, z0), P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1))} fill={c.side} />
      <polygon points={pts(P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1))} fill={c.front} />
      <polygon points={pts(P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1))} fill={c.top} />
      {children}
    </g>
  );
}

/** Tronco de pirâmide (base maior que o topo): cabine de carro, telhado. */
export function Frustum({ b, t, z0, z1, c }: { b: [number, number, number, number]; t: [number, number, number, number]; z0: number; z1: number; c: Faces & { glass?: string } }) {
  const [bx0, by0, bx1, by1] = b;
  const [tx0, ty0, tx1, ty1] = t;
  const s = c.line ?? '#00000030';
  return (
    <g strokeLinejoin="round" strokeWidth={0.8} stroke={s}>
      <polygon points={pts(P(bx1, by1, z0), P(bx1, by0, z0), P(tx1, ty0, z1), P(tx1, ty1, z1))} fill={c.side} />
      <polygon points={pts(P(bx0, by1, z0), P(bx1, by1, z0), P(tx1, ty1, z1), P(tx0, ty1, z1))} fill={c.front} />
      <polygon points={pts(P(tx0, ty0, z1), P(tx1, ty0, z1), P(tx1, ty1, z1), P(tx0, ty1, z1))} fill={c.top} />
    </g>
  );
}

/** Sombra no chão: a forma da base empurrada para baixo e para a direita. */
export function Shadow({ x0, y0, x1, y1, h, rx = 4 }: { x0: number; y0: number; x1: number; y1: number; h: number; rx?: number }) {
  const d = h * 0.35;
  return <rect x={x0 + d * 0.6} y={y0 + d * 0.5} width={x1 - x0 + d * 0.4} height={y1 - y0 + d * 0.3} rx={rx} fill="#1b2a3a" opacity={0.16} />;
}

export const ROAD = '#5d6872';
export const ROAD_EDGE = '#525c66';
export const WALK = { top: '#ebe5d8', front: '#bdb39f', side: '#a99f8b' };
export const INK = '#22313f';

/** Asfalto com grão fino (padrão leve, sem filtro). `id` precisa ser único por cena na tela. */
export function AsphaltDefs({ id }: { id: string }) {
  return (
    <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill={ROAD} />
      <circle cx="3" cy="4" r=".7" fill="#6c7782" />
      <circle cx="11" cy="3" r=".5" fill="#535d67" />
      <circle cx="8" cy="11" r=".7" fill="#6c7782" />
      <circle cx="14" cy="13" r=".5" fill="#535d67" />
    </pattern>
  );
}

/** Calçada elevada (meio-fio de 2 de altura): topo claro e a face da frente aparecendo. */
export function Sidewalk({ x0, y0, x1, y1, r = 0 }: { x0: number; y0: number; x1: number; y1: number; r?: number }) {
  const z = 2.5;
  const [tx, ty] = P(x0, y0, z);
  return (
    <g>
      {/* face do meio-fio (frente e lado) */}
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={r} fill={WALK.front} />
      <rect x={tx} y={ty} width={x1 - x0} height={y1 - y0} rx={r} fill={WALK.top} stroke="#d8d0bf" strokeWidth={0.8} />
    </g>
  );
}

/** Árvore: tronco curto e copa de três bolas com luz do alto à esquerda. */
export function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const [cx, cy] = P(x, y, 22 * s);
  return (
    <g>
      <ellipse cx={x + 9 * s} cy={y + 3 * s} rx={13 * s} ry={6 * s} fill="#1b2a3a" opacity={0.16} />
      <rect x={x - 1.6 * s} y={y - 14 * s} width={3.2 * s} height={14 * s} rx={1.2} fill="#7a5235" />
      <circle cx={cx + 4 * s} cy={cy + 3 * s} r={10 * s} fill="#3f8f4f" />
      <circle cx={cx - 5 * s} cy={cy + 2 * s} r={9 * s} fill="#4aa35b" />
      <circle cx={cx} cy={cy - 4 * s} r={9.5 * s} fill="#58b768" />
      <circle cx={cx - 3.5 * s} cy={cy - 7 * s} r={4 * s} fill="#7fd08c" opacity={0.7} />
    </g>
  );
}

/** Etiqueta que flutua acima de um ponto (ex.: "Você"). */
export function Tag({ x, y, text, point = 'down' }: { x: number; y: number; text: string; /** para onde a pontinha aponta */ point?: 'down' | 'right' }) {
  const w = text.length * 6.4 + 14;
  if (point === 'right')
    return (
      <g>
        <path d={`M${x + w / 2 - 1} ${y - 4} L${x + w / 2 + 5} ${y} L${x + w / 2 - 1} ${y + 4} Z`} fill="#fff" />
        <rect x={x - w / 2} y={y - 7.5} width={w} height={15} rx={7.5} fill="#fff" stroke="#0002" />
        <text x={x} y={y + 3.6} textAnchor="middle" fontSize="10" fontWeight="800" fill={INK} fontFamily="Nunito, system-ui, sans-serif">
          {text}
        </text>
      </g>
    );
  return (
    <g>
      <path d={`M${x - 4} ${y + 7.5} L${x} ${y + 12} L${x + 4} ${y + 7.5} Z`} fill="#fff" />
      <rect x={x - w / 2} y={y - 7.5} width={w} height={15} rx={7.5} fill="#fff" stroke="#0002" />
      <text x={x} y={y + 3.6} textAnchor="middle" fontSize="10" fontWeight="800" fill={INK} fontFamily="Nunito, system-ui, sans-serif">
        {text}
      </text>
    </g>
  );
}

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('')}`;
};

/**
 * Carro visto por trás e de cima, apontando para o norte (para o fundo da tela).
 * (x, y) é o centro da base. `blink`: seta da direita acesa. `brake`: luz de freio acesa.
 */
export function CarRear({ x, y, color = '#2f80ed', blink = false, brake = false, door = 0 }: { x: number; y: number; color?: string; blink?: boolean; brake?: boolean; /** porta do motorista (esquerda): 0 fechada, 1 aberta */ door?: number }) {
  const w = 15, l = 24;
  const body: Faces = { top: shade(color, 1.08), front: shade(color, 0.82), side: shade(color, 0.66), line: shade(color, 0.5) };
  const glass = { top: shade(color, 1.18), front: '#2c4a63', side: '#36566f', line: '#1e3346' };
  const lamp = (lx: number, on: boolean, cor: string, apagada: string) => {
    const [a, b] = P(x + lx, y + l, 7.5);
    return <rect x={a - 2.6} y={b} width={5.2} height={2.6} rx={1} fill={on ? cor : apagada} />;
  };
  const [px, py] = P(x, y + l, 6);
  const [fx, fy] = P(x + w, y - l + 3, 7.5);
  return (
    <g>
      <Shadow x0={x - w} y0={y - l} x1={x + w} y1={y + l} h={18} rx={7} />
      {/* rodas (aparecem embaixo da carroceria) */}
      {[y - l + 7, y + l - 8].map((wy) => {
        const [a, b] = P(x + w, wy, 3);
        return <ellipse key={wy} cx={a + 0.6} cy={b} rx={2.4} ry={5.2} fill="#16191d" />;
      })}
      <rect x={x - w + 1} y={y + l - 4} width={5} height={4.5} rx={1.5} fill="#16191d" />
      <rect x={x + w - 6} y={y + l - 4} width={5} height={4.5} rx={1.5} fill="#16191d" />
      {/* carroceria */}
      <Box x0={x - w} y0={y - l} x1={x + w} y1={y + l} z0={2.5} z1={10} c={body} />
      {/* cabine: vidro traseiro na frente, janelas no lado, teto em cima */}
      <Frustum b={[x - w + 2.5, y - l + 19, x + w - 2.5, y + l - 6]} t={[x - w + 4.5, y - l + 23, x + w - 4.5, y + l - 10]} z0={10} z1={16} c={glass} />
      {/* brilho do teto */}
      {(() => {
        const [a, b] = P(x - w + 6, y - l + 24, 16.1);
        return <rect x={a} y={b} width={7} height={3} rx={1.5} fill="#ffffff55" />;
      })()}
      {/* retrovisores */}
      {[x - w - 3, x + w].map((mx) => (
        <Box key={mx} x0={mx} y0={y - l + 17} x1={mx + 3} y1={y - l + 19.5} z0={9} z1={12.5} c={body} />
      ))}
      {/* porta do motorista abrindo para a rua (dobradiça na frente) */}
      {door > 0 && (() => {
        const ang = door * 1.0;
        const hx0 = x - w, hy0 = y - l + 19;
        const ex = hx0 - Math.sin(ang) * 17, ey = hy0 + Math.cos(ang) * 17;
        return (
          <g>
            <Panel a={[hx0, hy0]} b={[ex, ey]} z0={3} z1={10} fill={shade(color, 0.9)} edge={shade(color, 0.55)} />
            <Panel a={[hx0, hy0]} b={[ex, ey]} z0={10} z1={15} fill="#36566f" edge={shade(color, 0.55)} />
          </g>
        );
      })()}
      {/* placa e lanternas na traseira */}
      <rect x={px - 5} y={py - 1} width={10} height={3.6} rx={0.8} fill="#f4f4f4" stroke="#0003" strokeWidth={0.5} />
      {lamp(-w + 4.5, brake, '#ff3030', '#9e2323')}
      {lamp(w - 4.5, brake, '#ff3030', '#9e2323')}
      {/* seta da direita: atrás (canto) e na frente (canto do capô) */}
      {(() => {
        const [a, b] = P(x + w, y + l, 6.5);
        return <rect x={a - 2.2} y={b - 0.4} width={2.4} height={3.4} rx={0.8} fill={blink ? '#ffb020' : '#a8742a'} />;
      })()}
      <rect x={fx - 2} y={fy - 1} width={2.6} height={2.6} rx={0.8} fill={blink ? '#ffb020' : '#a8742a'} />
      {blink && (
        <>
          <circle cx={P(x + w, y + l, 6.5)[0] - 1} cy={P(x + w, y + l, 6.5)[1] + 1.3} r={4.5} fill="#ffb020" opacity={0.35} />
          <circle cx={fx - 0.7} cy={fy + 0.3} r={3.8} fill="#ffb020" opacity={0.35} />
        </>
      )}
      {brake && (
        <>
          <circle cx={P(x - w + 4.5, y + l, 7.5)[0]} cy={P(x - w + 4.5, y + l, 7.5)[1] + 1.3} r={4.5} fill="#ff3030" opacity={0.3} />
          <circle cx={P(x + w - 4.5, y + l, 7.5)[0]} cy={P(x + w - 4.5, y + l, 7.5)[1] + 1.3} r={4.5} fill="#ff3030" opacity={0.3} />
        </>
      )}
    </g>
  );
}

export interface Look {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  /** cabelo preso em coque, óculos, bolsa */
  bun?: boolean;
  glasses?: boolean;
  bag?: string;
}

/**
 * Pessoa de frente para a câmera, andando para perto (para o sul).
 * (x, y) é o ponto dos pés no chão. `step` (0..1) é a fase do passo.
 * Altura de cerca de 30, um pouco maior que o carro, para a leitura no celular.
 */
export function Walker({ x, y, step = 0, look }: { x: number; y: number; step?: number; look: Look }) {
  const sw = Math.sin(step * Math.PI * 2);
  const bob = Math.abs(sw) * 0.8;
  const leg = (dx: number, k: number) => {
    const fwd = k * sw * 2.2; // perna que vem para a frente desce um pouco na tela
    return <rect x={x + dx - 1.9} y={y - 12 + bob} width={3.8} height={12 + fwd * 0.5} rx={1.8} fill={look.bottom} />;
  };
  const foot = (dx: number, k: number) => <ellipse cx={x + dx} cy={y + k * sw * 1.1 + 0.3} rx={2.3} ry={1.3} fill="#3a2f2a" />;
  const by = y - 12 - bob;
  return (
    <g>
      <ellipse cx={x + 7} cy={y + 1.5} rx={9} ry={3.2} fill="#1b2a3a" opacity={0.18} />
      {foot(-2.3, 1)}
      {foot(2.3, -1)}
      {leg(-2.3, 1)}
      {leg(2.3, -1)}
      {/* tronco com volume: lado direito mais escuro */}
      <rect x={x - 6} y={by - 12} width={12} height={13.5} rx={4} fill={look.top} />
      <rect x={x + 1.5} y={by - 11.5} width={4.4} height={12.8} rx={2.5} fill="#00000026" />
      <path d={`M${x - 2} ${by - 11.6} L${x} ${by - 8.5} L${x + 2} ${by - 11.6}`} fill="none" stroke="#00000030" strokeWidth={0.9} />
      {/* braços balançando ao contrário das pernas */}
      <rect x={x - 8.2} y={by - 11 - sw * 0.8} width={3.2} height={11} rx={1.6} fill={look.top} />
      <rect x={x + 5} y={by - 11 + sw * 0.8} width={3.2} height={11} rx={1.6} fill={look.top} />
      <rect x={x + 5.6} y={by - 11 + sw * 0.8} width={2.6} height={10.6} rx={1.3} fill="#00000026" />
      <circle cx={x - 6.6} cy={by + 0.4 - sw * 0.8} r={1.7} fill={look.skin} />
      <circle cx={x + 6.6} cy={by + 0.4 + sw * 0.8} r={1.7} fill={look.skin} />
      {/* bolsa no ombro direito */}
      {look.bag && (
        <>
          <path d={`M${x - 3} ${by - 11} L${x + 7} ${by - 2}`} stroke="#4a3322" strokeWidth={1} />
          <rect x={x + 6} y={by - 3.5 + sw * 0.8} width={5.5} height={5} rx={1.4} fill={look.bag} stroke="#00000033" strokeWidth={0.5} />
        </>
      )}
      {/* pescoço e cabeça (um pouco maior, para ler de longe) */}
      <rect x={x - 1.6} y={by - 14.5} width={3.2} height={3.4} fill={look.skin} />
      <circle cx={x} cy={by - 19.5} r={5.4} fill={look.skin} />
      <path d={`M${x + 1.4} ${by - 24.4} A5.4 5.4 0 0 1 ${x + 1.4} ${by - 14.6} A5.4 5.4 0 0 0 ${x + 1.4} ${by - 24.4}`} fill="#00000022" />
      {/* cabelo */}
      <path d={`M${x - 5.6} ${by - 19} Q${x - 6} ${by - 25.6} ${x} ${by - 25.4} Q${x + 6} ${by - 25.6} ${x + 5.6} ${by - 19} Q${x + 3} ${by - 22.4} ${x} ${by - 22.2} Q${x - 3} ${by - 22.4} ${x - 5.6} ${by - 19} Z`} fill={look.hair} />
      {look.bun && <circle cx={x + 1} cy={by - 26.2} r={2.6} fill={look.hair} />}
      {/* rosto: olhos e óculos, sorriso leve */}
      <circle cx={x - 2} cy={by - 19} r={0.6} fill={INK} />
      <circle cx={x + 2} cy={by - 19} r={0.6} fill={INK} />
      {look.glasses && (
        <g fill="none" stroke="#5a4636" strokeWidth={0.55}>
          <circle cx={x - 2} cy={by - 19} r={1.6} />
          <circle cx={x + 2} cy={by - 19} r={1.6} />
          <line x1={x - 0.4} y1={by - 19.2} x2={x + 0.4} y2={by - 19.2} />
        </g>
      )}
      <path d={`M${x - 1.3} ${by - 16.6} Q${x} ${by - 15.8} ${x + 1.3} ${by - 16.6}`} fill="none" stroke="#7a4b3a" strokeWidth={0.6} />
    </g>
  );
}

/** Placa fina em pé entre dois pontos do chão (porta aberta, cerca): só a face, com borda de cima. */
export function Panel({ a, b, z0, z1, fill, edge }: { a: [number, number]; b: [number, number]; z0: number; z1: number; fill: string; edge: string }) {
  return (
    <g strokeLinejoin="round">
      <polygon points={pts(P(a[0], a[1], z0), P(b[0], b[1], z0), P(b[0], b[1], z1), P(a[0], a[1], z1))} fill={fill} stroke={edge} strokeWidth={0.8} />
      <line x1={P(a[0], a[1], z1)[0]} y1={P(a[0], a[1], z1)[1]} x2={P(b[0], b[1], z1)[0]} y2={P(b[0], b[1], z1)[1]} stroke={edge} strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

/**
 * Semáforo de coluna, com a caixa virada para a câmera (para quem vem do sul).
 * (x, y) é o pé da coluna. `luz`: qual lâmpada está acesa.
 */
export function TrafficLight({ x, y, luz }: { x: number; y: number; luz: 'vermelho' | 'amarelo' | 'verde' }) {
  const h = 34;
  // coluna fina fica reta na tela (inclinada parece torta)
  const hx = x, hy = y - h;
  const lamp = (k: number, cor: string, on: boolean) => (
    <g key={k}>
      {on && <circle cx={hx} cy={hy + 4 + k * 6.4} r={5.2} fill={cor} opacity={0.35} />}
      <circle cx={hx} cy={hy + 4 + k * 6.4} r={2.4} fill={on ? cor : '#3b4148'} />
    </g>
  );
  return (
    <g>
      <ellipse cx={x + 8} cy={y + 2} rx={8} ry={2.4} fill="#1b2a3a" opacity={0.16} />
      <rect x={x - 1.2} y={y - h} width={2.4} height={h} fill="#59626c" />
      <rect x={hx - 4.6} y={hy - 1.4} width={9.2} height={21} rx={2} fill="#2a2f35" stroke="#15181c" strokeWidth={0.6} />
      <rect x={hx + 4.6} y={hy - 2.4} width={2.4} height={21} rx={1} fill="#1d2126" />
      {lamp(0, '#ff3b30', luz === 'vermelho')}
      {lamp(1, '#ffb020', luz === 'amarelo')}
      {lamp(2, '#2fd16b', luz === 'verde')}
    </g>
  );
}

/**
 * Ciclista visto por trás e de cima, indo para o norte. (x, y) é o ponto da roda de trás no chão.
 * `pedal` (0..1) é a fase da pedalada.
 */
export function Cyclist({ x, y, pedal = 0, shirt = '#ff8a3d', skin = '#c98a5e', helmet = '#1e96f0' }: { x: number; y: number; pedal?: number; shirt?: string; skin?: string; helmet?: string }) {
  const s = Math.sin(pedal * Math.PI * 2);
  const [fx, fy] = P(x, y - 17, 0);
  const [sx, sy] = P(x, y - 4, 13); // selim
  const [hx, hy] = P(x, y - 13, 15); // guidão
  const [bx, by] = P(x, y - 7, 25); // ombros
  return (
    <g>
      <ellipse cx={x + 6} cy={y - 7} rx={5} ry={12} fill="#1b2a3a" opacity={0.16} />
      {/* roda da frente (parte aparece acima da de trás) */}
      <ellipse cx={fx} cy={fy - 5} rx={1.4} ry={5.6} fill="none" stroke="#1b1f24" strokeWidth={1.8} />
      {/* quadro */}
      <path d={`M${x} ${y - 5} L${sx} ${sy} L${hx} ${hy} M${sx} ${sy + 6} L${hx} ${hy + 2}`} stroke="#3a7bd5" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <rect x={hx - 6} y={hy - 1} width={12} height={1.6} rx={0.8} fill="#22262b" />
      {/* pernas pedalando */}
      <rect x={sx - 3.6} y={sy - 1 + s * 1.6} width={2.8} height={9 - s * 1.6} rx={1.3} fill="#33415c" />
      <rect x={sx + 0.8} y={sy - 1 - s * 1.6} width={2.8} height={9 + s * 1.6} rx={1.3} fill="#33415c" />
      {/* roda de trás */}
      <ellipse cx={x} cy={y - 5.5} rx={1.6} ry={5.8} fill="none" stroke="#1b1f24" strokeWidth={2} />
      <rect x={x - 1.6} y={y - 9} width={3.2} height={2.2} rx={0.6} fill="#ff3b30" />
      {/* costas inclinadas para a frente */}
      <path d={`M${sx - 5} ${sy - 1} L${bx - 6} ${by + 2} Q${bx} ${by - 2} ${bx + 6} ${by + 2} L${sx + 5} ${sy - 1} Z`} fill={shirt} />
      <path d={`M${bx + 1} ${by + 1} L${bx + 6} ${by + 2} L${sx + 5} ${sy - 1} L${sx + 1.5} ${sy - 1} Z`} fill="#00000022" />
      {/* braços até o guidão */}
      <path d={`M${bx - 5} ${by + 2} L${hx - 5} ${hy}`} stroke={shirt} strokeWidth={2.6} strokeLinecap="round" />
      <path d={`M${bx + 5} ${by + 2} L${hx + 5} ${hy}`} stroke={shirt} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={hx - 5} cy={hy} r={1.3} fill={skin} />
      <circle cx={hx + 5} cy={hy} r={1.3} fill={skin} />
      {/* nuca e capacete */}
      <circle cx={bx + 0.5} cy={by - 2.5} r={3.6} fill={skin} />
      <path d={`M${bx - 4.4} ${by - 2.4} Q${bx - 4} ${by - 9} ${bx + 0.5} ${by - 9} Q${bx + 5} ${by - 9} ${bx + 5.4} ${by - 2.4} Z`} fill={helmet} />
      <path d={`M${bx - 1} ${by - 8.6} L${bx - 1} ${by - 4} M${bx + 2} ${by - 8.6} L${bx + 2} ${by - 4}`} stroke="#ffffff88" strokeWidth={0.8} />
    </g>
  );
}
