/**
 * Cena "pedestre-faixa" (piloto de 14/11/2026, motor 3D em SVG).
 * Você vem pela pista da direita da avenida, com a seta para a direita ligada, para entrar na rua lateral.
 * Uma senhora atravessa a faixa da rua lateral. Na resposta certa: o carro chega devagar, para antes da esquina
 * (luz de freio) e ela termina de atravessar até a calçada. O carro nunca passa perto dela.
 *
 * `t` vai de 0 (cena parada, antes da resposta) a 1 (fim da ação certa). Tudo é função de `t`.
 */
import { Scene3D, camLook, lines, rect, type Part } from './engine';
import { asphalt, bench, bin, building, bush, car, grassPatches, hydrant, lampPost, manhole, person, sidewalk, tree, zebra, type Look } from './models';
import { Tag } from './iso';

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => {
  const k = clamp(v);
  return k * k * (3 - 2 * k);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const SENHORA: Look = { skin: '#9a6748', hair: '#c4c0b8', top: '#c0504d', bottom: '#4b5a78', bun: true, glasses: true, bag: '#e0a43a', skirt: true };
const CAM = camLook(2.2, -2.2, 0, 24, 47, 11.5, 160, 100);

function chao(): Part[] {
  return [
    ...grassPatches(3, 3, 26, 26, 5),
    ...asphalt(-7, -30, 0, 30, 3),
    ...asphalt(0, -7, 26, 0, 9),
    // avenida: faixa amarela dupla e bordas
    rect(-3.62, -30, -3.48, 30, '#f2c21b'),
    rect(-3.36, -30, -3.22, 30, '#f2c21b'),
    rect(-0.35, -30, -0.22, -7, '#eeeeea'),
    rect(-0.35, 0, -0.22, 30, '#eeeeea'),
    rect(-6.78, -30, -6.65, 30, '#eeeeea'),
    // rua lateral: linha do meio tracejada
    lines([{ p: [[9, -3.5, 0], [26, -3.5, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
    ...zebra(4.5, -7, 7.5, 0, 'x'),
    ...manhole(-1.6, -9.5),
    // calçadas
    ...sidewalk(-10, -30, -7, 30),
    ...sidewalk(0, -30, 3, -7),
    ...sidewalk(3, -10, 26, -7, 'x'),
    ...sidewalk(0, 0, 3, 30),
    ...sidewalk(3, 0, 26, 3, 'x'),
    // rampas da faixa
    rect(4.8, -7.6, 7.2, -7, '#cbbfa6', 0.16),
    rect(4.8, 0, 7.2, 0.6, '#cbbfa6', 0.16),
    // o caminho que você quer fazer (a intenção, não a resposta)
    lines([{ p: [[-1.75, 1.5, 0], [-1.7, -1.5, 0], [-0.8, -3.0, 0], [1.2, -4.6, 0], [3.5, -5.0, 0], [11, -5.0, 0]], c: '#ffffff', w: 1.6, dash: '3.5 3.5', o: 0.6 }]),
  ];
}

export function PedestreFaixa({ t = 0, id = 'pf' }: { t?: number; id?: string }) {
  // senhora: do meio da faixa até a calçada de perto (anda para o sul)
  const kp = ease(t / 0.85);
  const py = lerp(-3.6, 1.6, kp);
  const step = kp * 9;
  // carro: chega devagar e para antes da esquina
  const kc = ease(t / 0.6);
  const cy = lerp(8.2, 3.4, kc);
  const brake = t > 0.25;
  const blink = t === 0 || Math.floor(t * 8) % 2 === 0;

  const objs = [
    // quarteirão do outro lado da rua lateral
    building({ x0: 3.6, y0: -19, x1: 10.5, y1: -10.6, h: 9.5, color: '#e9a47c', shop: 's', seed: 4 }),
    building({ x0: 11, y0: -18, x1: 19, y1: -10.6, h: 6.4, color: '#f1dca6', shop: 's', seed: 8 }),
    building({ x0: 19.5, y0: -19, x1: 27, y1: -10.6, h: 12, color: '#9fc3e6', seed: 6 }),
    // lado de lá da avenida
    building({ x0: -19, y0: -16, x1: -10.6, y1: -4, h: 12.5, color: '#f1dca6', shop: 'e', seed: 2 }),
    building({ x0: -19, y0: -3.4, x1: -10.6, y1: 6, h: 7, color: '#e9a47c', seed: 5 }),
    tree(-8.6, 8, 0.95, 3),
    tree(-8.6, -18, 0.9, 6),
    lampPost(-8.2, 1.5, 1),
    // praça na esquina de cá
    tree(10.5, 7.5, 1.05, 1),
    tree(17, 5.2, 0.9, 2),
    bush(4.6, 4.6, 1, 1),
    bush(13.5, 4.3, 0.8, 2),
    bench(8, 4.2),
    bin(11.6, 3.7),
    lampPost(14, -8.4, -1),
    hydrant(2.3, -8.2),
    tree(1.6, -14, 0.85, 4),
    // atores
    person(6, py, SENHORA, step, Math.PI, 1.45),
    car({ x: -1.75, y: cy, color: '#e9eef3', brake, blink: blink ? 'r' : null }),
  ];

  return (
    <Scene3D
      id={id}
      cam={CAM}
      ground={chao()}
      objs={objs}
      overlay={(pr) => {
        const [x, y] = pr([-1.75, cy + 0.4, 2.2]);
        return <Tag x={x} y={y - 8} text="Você" />;
      }}
    />
  );
}
