/**
 * Cena "linha-retencao" (piloto de 14/11/2026, motor 3D em SVG).
 * O semáforo à frente está vermelho. Antes da faixa de pedestres, uma linha branca larga atravessa a sua faixa.
 * Na resposta certa: o carro freia e para ANTES da linha (com folga visível), luz de freio acesa,
 * enquanto um carro passa na rua que cruza (o sinal está aberto para ela).
 * `t` de 0 (parado, antes da resposta) a 1 (fim da ação certa).
 */
import { Scene3D, camLook, lines, rect, type Part } from './engine';
import { asphalt, bin, building, bush, car, grassPatches, house, hydrant, lampPost, manhole, sidewalk, trafficLight, tree, zebra } from './models';
import { Tag } from './iso';

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (v: number) => 1 - (1 - clamp(v)) ** 3;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const CAM = camLook(-1.5, -1.0, 0, 22, 46, 11.5, 160, 100);

function chao(): Part[] {
  return [
    ...grassPatches(3, -4, 30, 30, 4),
    ...grassPatches(-30, -4, -10, 30, 8),
    ...asphalt(-7, -40, 0, 30, 2),
    ...asphalt(-30, -14, 30, -7, 6),
    // faixa amarela dupla (não entra no cruzamento)
    rect(-3.62, -1.9, -3.48, 30, '#f2c21b'),
    rect(-3.36, -1.9, -3.22, 30, '#f2c21b'),
    rect(-3.62, -40, -3.48, -17, '#f2c21b'),
    rect(-3.36, -40, -3.22, -17, '#f2c21b'),
    rect(-0.35, -1.9, -0.22, 30, '#eeeeea'),
    rect(-6.78, -1.9, -6.65, 30, '#eeeeea'),
    lines([{ p: [[-30, -10.5, 0], [-9, -10.5, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }, { p: [[2, -10.5, 0], [30, -10.5, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
    // faixa de pedestres e a linha de retenção (só na sua mão, larga)
    ...zebra(-7, -6.6, 0, -3.4, 'y'),
    ...zebra(-7, -17.6, 0, -14.4, 'y'),
    rect(-3.2, -2.45, -0.2, -1.9, '#ffffff'),
    ...manhole(-5.2, 4.5),
    // calçadas (quarteirões de cá e de lá)
    ...sidewalk(-10, -7, -7, 30),
    ...sidewalk(-30, -7, -10, -4, 'x'),
    ...sidewalk(0, -7, 3, 30),
    ...sidewalk(3, -7, 30, -4, 'x'),
    ...sidewalk(-10, -40, -7, -14),
    ...sidewalk(-30, -17, -10, -14, 'x'),
    ...sidewalk(0, -40, 3, -14),
    ...sidewalk(3, -17, 30, -14, 'x'),
    rect(-6.6, -7.5, -6.0, -6.9, '#cbbfa6', 0.16),
  ];
}

export function LinhaRetencao({ t = 0, id = 'lr' }: { t?: number; id?: string }) {
  const k = easeOut(t / 0.8);
  // frente do carro: de 5,8 até −0,6 (a linha começa em −1,9: folga clara)
  const cy = lerp(8, 1.55, k);
  // carro da rua que cruza (sinal verde para ele)
  const ox = lerp(-16, 9, clamp(t));

  const objs = [
    building({ x0: 4, y0: -27, x1: 12, y1: -18.4, h: 10, color: '#9fc3e6', shop: 's', seed: 2 }),
    building({ x0: 12.5, y0: -26, x1: 20, y1: -18.4, h: 6.5, color: '#f1dca6', shop: 's', seed: 3 }),
    building({ x0: -19, y0: -27, x1: -10.6, y1: -18.4, h: 8, color: '#e9a47c', shop: 's', seed: 5 }),
    building({ x0: -21, y0: -2, x1: -11, y1: 9, h: 11, color: '#f1dca6', shop: 'e', seed: 9 }),
    house(6.5, -1.5, 13, 4.5, '#f3e3b8', '#c8553d', 'w'),
    house(6.5, 7.5, 13, 13.5, '#cfe7c4', '#a8483a', 'w'),
    tree(4.6, 6, 0.95, 2),
    tree(-8.6, 6, 0.95, 5),
    tree(1.7, 14, 0.9, 1),
    bush(4.2, 1, 0.8, 3),
    bin(-8.2, -2.8),
    hydrant(2.2, 3.8),
    lampPost(-8.3, -18.6, 1),
    lampPost(1.7, 8.5, -1),
    trafficLight(1.2, -3, 'vermelho'),
    car({ x: ox, y: -12.2, heading: Math.PI / 2, color: '#1e96f0' }),
    car({ x: -1.75, y: cy, color: '#e9eef3', brake: t > 0.08 }),
  ];
  return (
    <Scene3D
      id={id}
      cam={CAM}
      ground={chao()}
      objs={objs}
      overlay={(pr) => {
        // etiqueta à esquerda do carro, para não tapar a linha
        const [x, y] = pr([-3.3, cy + 0.6, 1.0]);
        return <Tag x={x - 22} y={y} text="Você" point="right" />;
      }}
    />
  );
}
