/**
 * Cena "porta-bicicleta" (piloto de 14/11/2026, motor 3D em SVG), para a w3-rua-5.
 * Você acabou de estacionar junto à calçada da direita. Uma bicicleta vem por trás, pela rua, perto da sua porta.
 * Na resposta certa: a bicicleta passa, e só depois a porta do motorista abre devagar.
 * A câmera fica do lado esquerdo do carro (o lado da porta e da bicicleta).
 * `t` de 0 (parado, antes da resposta) a 1 (fim da ação certa).
 */
import { Scene3D, camLook, lines, rect, type Part } from './engine';
import { asphalt, bench, building, bush, car, cyclist, gate, grassPatches, house, lampPost, manhole, sidewalk, tree, wall } from './models';
import { Tag } from './iso';

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => {
  const k = clamp(v);
  return k * k * (3 - 2 * k);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const CAM = camLook(-1.6, -1.5, 0, -26, 46, 14, 160, 104);
const CARRO = { x: -1.1, y: 0 };

function chao(): Part[] {
  return [
    ...grassPatches(3, -40, 30, 40, 3),
    ...grassPatches(-30, -40, -10, 40, 6),
    ...asphalt(-7, -40, 0, 40, 5),
    lines([{ p: [[-3.5, -40, 0], [-3.5, 40, 0]], c: '#eeeeea', w: 0.9, dash: '6 5' }]),
    // vagas pintadas junto à calçada
    rect(-2.3, -3.3, 0, -3.18, '#eeeeea'),
    rect(-2.3, 3.2, 0, 3.32, '#eeeeea'),
    rect(-2.3, 9.7, 0, 9.82, '#eeeeea'),
    rect(-2.3, -9.8, 0, -9.68, '#eeeeea'),
    ...manhole(-4.6, -5.5),
    ...sidewalk(0, -40, 3, 40),
    ...sidewalk(-10, -40, -7, 40),
  ];
}

export function PortaBicicleta({ t = 0, id = 'pb' }: { t?: number; id?: string }) {
  // bicicleta: começa atrás do carro, perto da porta, e segue até sair pelo fundo
  const kb = clamp(t / 0.6);
  const by = lerp(5.5, -15, kb);
  // porta: só abre depois que a bicicleta passou
  const door = ease((t - 0.68) / 0.32);

  const objs = [
    // lado da calçada: muros, portões e casas
    wall(3, -14, 3.25, -9, 1.4, '#e7dcc4'),
    gate(3.12, -9, -6.5, 1.4),
    wall(3, -6.5, 3.25, 1.5, 1.4, '#e7dcc4'),
    gate(3.12, 1.5, 4.2, 1.4),
    wall(3, 4.2, 3.25, 14, 1.4, '#d9b8a0'),
    house(5, -12, 12, -4.5, '#f3e3b8', '#c8553d', 'w'),
    house(5, -2, 12, 6, '#cfe7c4', '#a8483a', 'w'),
    house(5, 8, 12, 15, '#f1d0b0', '#c8553d', 'w'),
    tree(1.9, -7.5, 0.85, 3),
    tree(1.9, 6.5, 0.8, 6),
    bush(4.1, 2.5, 0.7, 1),
    lampPost(1.8, -9.5, -1),
    // lado de lá da rua
    building({ x0: -24, y0: -30, x1: -12, y1: -16, h: 9, color: '#9fc3e6', shop: 'e', seed: 4 }),
    tree(-8.6, 3, 0.9, 2),
    tree(-11.5, -6, 1, 5),
    tree(-8.6, -13, 0.85, 4),
    bush(-11, 7, 0.9, 1),
    bench(-8.6, -3.5, Math.PI / 2),
    lampPost(-8.2, 9, 1),
    // atores
    car({ x: CARRO.x, y: CARRO.y, color: '#e9eef3', door }),
    cyclist(-2.75, by, kb * 14),
  ];
  return (
    <Scene3D
      id={id}
      cam={CAM}
      ground={chao()}
      objs={objs}
      overlay={(pr) => {
        const [x, y] = pr([CARRO.x, CARRO.y + 0.4, 2.2]);
        return <Tag x={x} y={y - 8} text="Você" />;
      }}
    />
  );
}
