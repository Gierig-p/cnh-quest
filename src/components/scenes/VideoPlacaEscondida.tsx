/**
 * Vídeo do cartão c-sinalizacao-falha ("Placa escondida"), Mundo 1, lote 1 de 15/11/2026.
 * A mesma rua da cena parada: a placa de proibido estacionar some dentro da copa da árvore.
 * Tempos em content/videos/placa-escondida.json.
 */
import { camLook, lines, type Obj } from './engine';
import { asphalt, bin, car, gate, grassPatches, house, lampPost, person, sidewalk, tree, wall, type Look } from './models';
import { signPost, signTop, SignCallout } from './signs';
import { voce } from './Mundo1';
import { VOCE, certo, ease, escuro, fazerVideo, janela, lerp, proibido, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/placa-escondida.json';

const DONO: Look = { skin: '#c99a74', hair: '#6b6b6b', top: '#7a5ea8', bottom: '#3a3f4f' };
const fixo: Pr = (p) => [p[0], p[1]];

const CHAO = [
  ...grassPatches(-40, -40, 40, 40, 6),
  ...asphalt(-3.5, -40, 3.5, 40, 5),
  lines([{ p: [[0, -40, 0], [0, 40, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
  ...sidewalk(3.5, -40, 6.5, 40),
  ...sidewalk(-6.5, -40, -3.5, 40),
];
const PLACA = { x: 4.2, y: -2.75, code: 'R-6a' as const, face: 0 };
const ARV = tree(4.55, -3.1, 1.3, 2);
// a copa vai por último dentro do objeto: cobre a placa de qualquer ângulo
const ESCONDIDA: Obj = { parts: [...signPost(PLACA).parts, ARV.parts[0], { ...ARV.parts[1], bias: 100 }], shadow: true };
const FIXOS: Obj[] = [
  wall(6.6, -16, 6.85, 12, 1.4, '#e7dcc4'),
  gate(6.7, -2, 1.2, 1.4),
  house(8, -14, 15, -6, '#f3e3b8', '#c8553d', 'w'),
  house(8, -4, 15, 4, '#cfe7c4', '#a8483a', 'w'),
  house(8, 6, 15, 13, '#f1d0b0', '#c8553d', 'w'),
  house(-15, -12, -8, -4, '#d9e3f0', '#b5603f', 'e'),
  house(-15, -1, -8, 7, '#f6d2d2', '#c8553d', 'e'),
  tree(-5.0, 3, 0.9, 4),
  lampPost(5.4, 7, -1),
  bin(4.0, 3.5),
  car({ x: 2.45, y: -9.5, color: '#4f7fc4' }),
];
const YP = 0.2;
const COPA: [number, number, number] = [4.55, -3.1, 4.2];
const DONO_P: [number, number, number] = [6.0, -0.6, 2.1];
const CAM = camLook(2.6, -2.5, 0.8, 22, 36, 14);

/** a rua; `y` é onde está o seu carro, `dono` põe o morador no portão */
const mundo = (y = YP, dono = false): Obj[] => [
  ESCONDIDA,
  ...FIXOS,
  ...(dono ? [person(6.0, -0.6, DONO, 0, Math.PI, 1.3)] : []),
  car({ x: 2.45, y, color: VOCE, brake: y > YP + 0.05 }),
];

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. escondida, apagada ou no lugar errado
    case 0: {
      const y = lerp(9, YP, ease(lt / 3.2));
      return {
        cam: CAM,
        ground: CHAO,
        objs: mundo(y),
        over: (pr) => (
          <>
            {voce(pr, 2.45, y)}
            {tag(pr, COPA, 'Escondida', ease((lt - 1.2) / 0.3))}
            {tag(fixo, [80, 186, 0], 'Apagada', ease((lt - 2.4) / 0.3))}
            {tag(fixo, [230, 186, 0], 'No lugar errado', ease((lt - 3.4) / 0.3))}
          </>
        ),
      };
    }
    // 1. sinal falho: não pode ser punido
    case 1:
      return {
        cam: camLook(3.2, -1.6, 0.8, 22, 36, 18),
        ground: CHAO,
        objs: mundo(),
        over: (pr) => (
          <>
            {voce(pr, 2.45, YP)}
            {lt > 0.5 && (
              <g opacity={0.45 * ease((lt - 0.5) / 0.4)}>
                <SignCallout at={pr(signTop(PLACA))} code="R-6a" dx={-70} dy={-30} size={36} />
              </g>
            )}
            {tag(pr, COPA, 'Ninguém consegue ver', janela(lt, 0.8, 2.8, 0.2))}
            {tag(fixo, [160, 186, 0], 'Não pode ser punido', ease((lt - 3.0) / 0.3))}
            {certo(fixo, [232, 186, 0], ease((lt - 3.4) / 0.3))}
          </>
        ),
      };
    // 2. quem responde: o órgão de trânsito
    case 2:
      return {
        cam: CAM,
        ground: CHAO,
        objs: mundo(),
        over: (pr) => (
          <>
            {tag(pr, COPA, 'Quem responde?', janela(lt, 0.5, 1.9, 0.2))}
            {tag(pr, COPA, 'Órgão de trânsito da via', ease((lt - 2.0) / 0.3))}
          </>
        ),
      };
    // 3. não é o motorista nem o dono da casa
    case 3:
      return {
        cam: CAM,
        ground: CHAO,
        objs: mundo(YP, true),
        over: (pr) => (
          <>
            {tag(pr, [2.45, YP + 2.8, 0], 'Motorista', ease((lt - 0.5) / 0.3))}
            {proibido(pr, [2.45, YP, 1.0], ease((lt - 0.9) / 0.3))}
            {tag(pr, DONO_P, 'Dono da casa', ease((lt - 1.6) / 0.3))}
            {proibido(pr, [6.0, -0.6, 0.9], ease((lt - 2.0) / 0.3))}
          </>
        ),
      };
    // 4. as regras gerais continuam
    case 4:
      return {
        cam: CAM,
        ground: CHAO,
        objs: mundo(),
        over: (pr) => (
          <>
            {voce(pr, 2.45, YP)}
            {tag(fixo, [160, 186, 0], 'Regras gerais valem', ease((lt - 0.6) / 0.3))}
          </>
        ),
      };
    // 5. não está tudo liberado
    case 5:
      return {
        cam: CAM,
        ground: CHAO,
        objs: mundo(),
        over: (pr) => (
          <>
            {voce(pr, 2.45, YP)}
            {tag(fixo, [160, 186, 0], 'Tudo liberado?', ease((lt - 0.6) / 0.3))}
            {proibido(fixo, [218, 186, 0], ease((lt - 1.6) / 0.3))}
          </>
        ),
      };
    // 6. para guardar
    default:
      return {
        cam: CAM,
        ground: CHAO,
        objs: mundo(),
        over: () => (
          <>
            {escuro(0.55 * ease(lt / 0.4))}
            {tag(fixo, [160, 80, 0], 'Não se vê: não pune', ease((lt - 0.5) / 0.3))}
            {tag(fixo, [160, 130, 0], 'A regra geral continua', ease((lt - d + 2.6) / 0.3))}
          </>
        ),
      };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
