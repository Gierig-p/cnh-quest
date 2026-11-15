/**
 * Cena "pare-esquina" (lote do Mundo 1, 15/11/2026): de madrugada, rua vazia, placa PARE na esquina.
 * Na resposta certa, o carro chega devagar e para por completo ANTES da linha de retenção, com a luz de freio acesa,
 * mesmo sem ninguém por perto. `t` vai de 0 (parado, antes da resposta) a 1 (fim da ação certa).
 */
import { Scene3D, camLook, lines, rect, type Part, type V2, type V3 } from './engine';
import { asphalt, bush, car, grassPatches, house, lampPost, sidewalk, tree } from './models';
import { SignCallout, signPost, signTop } from './signs';
import { Tag } from './iso';

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (v: number) => 1 - (1 - clamp(v)) ** 3;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const CY = -9; // centro da rua que cruza
const PLACA = { x: 4.1, y: -4.9, code: 'R-1' as const, face: 0 };
const POSTES: V3[] = [[5.6, CY + 5.2, 4.3], [-5.6, CY - 6, 4.3]];
const CAM = camLook(1.4, -3.2, 0, 18, 42, 11.5);

function chao(): Part[] {
  const a = 3.5, c = 6.5;
  return [
    ...grassPatches(-40, -40, 40, 40, 6),
    ...asphalt(-a, -40, a, 40, 3),
    ...asphalt(-40, CY - a, 40, CY + a, 9),
    lines([
      { p: [[0, -40, 0], [0, CY - a - 0.8, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' },
      { p: [[0, -4.6, 0], [0, 40, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' },
      { p: [[-40, CY, 0], [-a - 0.8, CY, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' },
      { p: [[a + 0.8, CY, 0], [40, CY, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' },
    ]),
    // linha de retenção na sua mão, logo antes da esquina
    rect(0.2, -5.0, 3.3, -4.6, '#ffffff'),
    ...sidewalk(a, CY + a, c, 40),
    ...sidewalk(c, CY + a, 40, CY + c, 'x'),
    ...sidewalk(-c, CY + a, -a, 40),
    ...sidewalk(-40, CY + a, -c, CY + c, 'x'),
    ...sidewalk(a, -40, c, CY - a),
    ...sidewalk(c, CY - c, 40, CY - a, 'x'),
    ...sidewalk(-c, -40, -a, CY - a),
    ...sidewalk(-40, CY - c, -c, CY - a, 'x'),
  ];
}

export function PareEsquina({ t = 0, id = 'pare' }: { t?: number; id?: string }) {
  // centro do carro: de 6 até −1,95 (a frente para em −4,1, antes da linha em −4,6)
  const cy = lerp(6, -1.95, easeOut(t / 0.85));
  const freio = t > 0.1;
  const objs = [
    house(8, CY + 8, 15, CY + 14, '#f3e3b8', '#c8553d', 'w'),
    house(8, CY + 17, 15, CY + 23, '#cfe7c4', '#a8483a', 'w'),
    house(-15, CY + 8, -8, CY + 14, '#f1d0b0', '#b5603f', 'e'),
    house(-15, CY + 17, -8, CY + 23, '#d9e3f0', '#c8553d', 'e'),
    house(8, CY - 15, 15, CY - 8, '#f6d2d2', '#a8483a', 's'),
    house(-15, CY - 15, -8, CY - 8, '#cfe7c4', '#c8553d', 's'),
    house(18, CY - 15, 26, CY - 8, '#f3e3b8', '#b5603f', 's'),
    tree(5.4, CY + 13, 0.9, 1),
    tree(-5.4, CY + 16, 0.95, 2),
    tree(-12, CY - 5.3, 0.85, 3),
    bush(7.6, CY + 7.4, 0.7, 1),
    lampPost(5.6, CY + 5.2, -1),
    lampPost(-5.6, CY - 6, 1),
    signPost(PLACA),
    car({ x: 1.75, y: cy, color: '#e9eef3', brake: freio }),
  ];
  return (
    <Scene3D
      id={id}
      cam={CAM}
      ground={chao()}
      objs={objs}
      label="De madrugada, rua vazia: placa PARE na esquina e a linha de retenção antes do cruzamento."
      overlay={(pr) => {
        const pt = (p: V3) => pr(p);
        const path = (ps: V3[]) => 'M' + ps.map((p) => pt(p).map((v) => v.toFixed(1)).join(' ')).join('L') + 'Z';
        // farol: cone no chão à frente do carro
        const yf = cy - 2.1;
        const cone = path([[1.05, yf, 0], [2.45, yf, 0], [3.6, yf - 7, 0], [-0.1, yf - 7, 0]]);
        const lanterna = (x: number): V2 => pt([x, cy + 2.15, 0.85]);
        const [tx, ty] = pr([1.75, cy + 0.4, 2.2]);
        return (
          <>
            <defs>
              <radialGradient id={`${id}-luz`}>
                <stop offset="0" stopColor="#ffe7a8" stopOpacity="0.85" />
                <stop offset="1" stopColor="#ffe7a8" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`${id}-red`}>
                <stop offset="0" stopColor="#ff3b30" stopOpacity="0.95" />
                <stop offset="1" stopColor="#ff3b30" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* noite */}
            <rect x={0} y={0} width={320} height={200} fill="#0a1430" opacity={0.58} />
            {/* postes acesos e o chão claro debaixo deles */}
            {POSTES.map((p, i) => {
              const [x, y] = pr(p);
              const [gx, gy] = pr([p[0], p[1], 0]);
              return (
                <g key={i}>
                  <ellipse cx={gx} cy={gy} rx={30} ry={14} fill={`url(#${id}-luz)`} opacity={0.5} />
                  <circle cx={x} cy={y} r={9} fill={`url(#${id}-luz)`} />
                </g>
              );
            })}
            <path d={cone} fill="#fff4c8" opacity={0.26} />
            {[1.15, 2.35].map((x) => {
              const [lx, ly] = lanterna(x);
              return <circle key={x} cx={lx} cy={ly} r={freio ? 6 : 3.5} fill={`url(#${id}-red)`} />;
            })}
            <SignCallout at={pr(signTop(PLACA))} code="R-1" dx={30} dy={-30} />
            <Tag x={tx - 22} y={ty + 6} text="Você" point="right" />
          </>
        );
      }}
    />
  );
}
