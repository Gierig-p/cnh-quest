/**
 * Vídeo do cartão c3-seta ("Avise antes de ir para o lado"), lote 3 de 15/11/2026.
 * Um trecho por fala (tempos em content/videos/seta.json).
 */
import { camLook, lines, rect, seg, type Obj, type Part, type V2 } from './engine';
import { asphalt, building, bush, car, grassPatches, person, sidewalk, tree, wall } from './models';
import { estrada } from './Mundo2';
import { bairro, cruzamento } from './Mundo1';
import { MOCA } from './Mundo3';
import { AMARELO, AV, AV_OBJS, FX, VERDE, VOCE, arco, caminho, certo, clamp, ease, fazerVideo, janela, lerp, pisca, rastro, tag, type Quadro } from './videoBase';
import tempos from '../../content/videos/seta.json';

const CY = -9; // rua que cruza
const CRUZ = cruzamento(CY);
const BAIRRO = bairro(CY, 1);
const ESTRADA = estrada('tracejada');

/** virar à direita da faixa da direita (x 1,75) para a rua que cruza, com raio `r` */
const direita = (y0: number, r = 3): V2[] => [[1.75, y0], [1.75, CY + 1.75 + r], ...arco(1.75 + r, CY + 1.75 + r, r, Math.PI, 1.5 * Math.PI), [30, CY + 1.75]];
const VIRA = caminho(direita(9));

/* garagem (mesmo lugar da questão "SaidaGaragem") */
const R0 = -9, R1 = -2, S1 = 1.2;
const GARAGEM_CHAO: Part[] = [
  ...grassPatches(-40, -40, 40, 40, 2),
  ...asphalt(-40, R0, 40, R1, 5),
  lines([{ p: [[-40, (R0 + R1) / 2, 0], [40, (R0 + R1) / 2, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
  ...sidewalk(-40, R1, 40, S1, 'x'),
  ...sidewalk(-40, R0 - 3, 40, R0, 'x'),
  rect(-1.5, R1 + 0.05, 1.5, S1, '#bdb3a0', 0.17),
  rect(-1.5, S1, 1.5, 9, '#c9c3b6', 0.02),
];
const GARAGEM_OBJS: Obj[] = [
  wall(-12, S1, -1.6, S1 + 0.2, 1.8, '#e8d9b8'),
  wall(1.6, S1, 12, S1 + 0.2, 1.8, '#e8d9b8'),
  bush(-3.2, 3.2, 0.9, 1),
  bush(3.3, 3.4, 0.8, 2),
  tree(4.6, 6, 0.85, 3),
  building({ x0: -14, y0: R0 - 13, x1: -4, y1: R0 - 4, h: 7, color: '#d9e3f0', shop: 's', seed: 6 }),
  building({ x0: -3, y0: R0 - 13, x1: 7, y1: R0 - 4, h: 9, color: '#f1dca6', shop: 's', seed: 5 }),
  building({ x0: 8, y0: R0 - 13, x1: 17, y1: R0 - 4, h: 6.5, color: '#e9a47c', shop: 's', seed: 7 }),
  tree(-6, R1 + 1.4, 0.85, 1),
  tree(6.5, R1 + 1.4, 0.9, 2),
];
const LESTE = (R0 + R1) / 2 + 1.75; // faixa de quem vai para o leste
const SAIDA = caminho([[0, 4.6], [0, LESTE + 2.6], ...arco(2.6, LESTE + 2.6, 2.6, Math.PI, 1.5 * Math.PI), [30, LESTE]]);
/** tempo corrido da cena da garagem (falas 6 e 7) */
const T7 = tempos.falas[7].ini - tempos.falas[6].ini;

/** braço esquerdo para fora da janela, esticado (gesto de virar à esquerda) */
function braco(x: number, y: number, k: number): Obj {
  const ombro: [number, number, number] = [x - 0.78, y - 0.25, 1.22];
  const mao: [number, number, number] = [x - 0.78 - 1.5 * k, y - 0.25, 1.3];
  return { parts: [seg(ombro, [lerp(ombro[0], mao[0], 0.45), ombro[1], 1.23], 0.24, '#2fa36b'), seg([lerp(ombro[0], mao[0], 0.45), ombro[1], 1.23], mao, 0.2, '#d7a77f')], shadow: true };
}

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. antes de ir para o lado, olhe em volta
    case 0: {
      const yv = 5 - 0.9 * lt;
      return {
        cam: camLook(1.4, -2.5, 0, 14, 42, 10.5),
        ground: CRUZ,
        objs: [...BAIRRO, car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Você')}
            {tag(pr, [1.75, yv - 5, 0.2], 'Olhe em volta', ease((lt - 0.5) / 0.4))}
          </>
        ),
      };
    }
    // 1. quem vem atrás, quem vai à frente e quem vai cruzar
    case 1: {
      const yv = 4 - 0.5 * lt, ya = yv - 7.5, yb = yv + 7;
      const xc = lerp(-22, -7.6, ease(lt / 3.2)); // chega à esquina e espera
      return {
        cam: camLook(0.8, -2, 0, 14, 42, 9.2),
        ground: CRUZ,
        objs: [
          ...BAIRRO,
          car({ x: 1.75, y: yv, color: VOCE }),
          car({ x: 1.75, y: ya, color: '#8f98a3' }),
          car({ x: 1.75, y: yb, color: '#4f7fc4' }),
          car({ x: xc, y: CY + 1.75, heading: Math.PI / 2, color: '#e0412f' }),
        ],
        over: (pr) => (
          <>
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Você')}
            {tag(pr, [1.75, yb + 0.4, 2.2], 'Vem atrás', ease((lt - 1.0) / 0.4))}
            {tag(pr, [1.75, ya + 0.4, 2.2], 'Vai à frente', ease((lt - 2.0) / 0.4))}
            {tag(pr, [xc, CY + 1.75, 2.2], 'Vai cruzar', ease((lt - 3.1) / 0.4))}
          </>
        ),
      };
    }
    // 2. mudar de faixa, virar e fazer o retorno: tudo é ir para o lado
    case 2: {
      if (lt < 1.7) {
        const l = lt;
        const kx = ease((l - 0.3) / 1.0);
        const yv = 2 - 3 * l;
        return {
          cam: camLook(-0.5, yv - 3, 0, 16, 44, 9.5),
          ground: AV,
          objs: [...AV_OBJS, car({ x: lerp(FX[1], FX[0], kx), y: yv, heading: -0.2 * Math.sin(Math.PI * kx), color: VOCE, blink: pisca(l, kx < 0.95 ? 'l' : null) })],
          over: (pr) => tag(pr, [FX[0], yv - 6, 0.2], 'Mudar de faixa', ease(l / 0.3)),
        };
      }
      if (lt < 2.9) {
        const l = lt - 1.7;
        const p = VIRA.em(10 + 6.5 * l);
        return {
          cam: camLook(3, -4, 0, 14, 42, 10),
          ground: CRUZ,
          objs: [...BAIRRO, car({ x: p.x, y: p.y, heading: p.heading, color: VOCE, blink: pisca(l + 0.1, 'r') })],
          over: (pr) => tag(pr, [8, CY + 1.75, 0.2], 'Virar', ease(l / 0.3)),
        };
      }
      const l = lt - 2.9;
      const R = caminho([[1.75, 2], [1.75, -6], ...arco(0, -6, 1.75, 0, -Math.PI), [-1.75, 4]]);
      const p = R.em(3 + 7.5 * l);
      return {
        cam: camLook(0, -4, 0, 12, 40, 9.5),
        ground: ESTRADA,
        objs: [car({ x: p.x, y: p.y, heading: p.heading, color: VOCE, blink: pisca(l, 'l') })],
        over: (pr) => (
          <>
            {rastro(pr, R.pts, AMARELO, 0.85 * ease(l / 0.3))}
            {tag(pr, [0, -9, 0.2], 'Fazer o retorno', ease(l / 0.3))}
          </>
        ),
      };
    }
    // 3. avise antes, com a seta
    case 3: {
      const p = VIRA.em(lerp(0, 17, ease(clamp((lt - 0.2) / (d - 0.2)) * 0.85 + 0.0)));
      const seta = lt > 0.5 ? pisca(lt, 'r') : null;
      return {
        cam: camLook(3, -1, 0, 14, 42, 9.5),
        ground: CRUZ,
        objs: [...BAIRRO, car({ x: p.x, y: p.y, heading: p.heading, color: VOCE, blink: seta })],
        over: (pr) => (
          <>
            {tag(pr, [p.x, p.y + 0.4, 2.2], 'Seta antes de virar', ease((lt - 0.7) / 0.4))}
          </>
        ),
      };
    }
    // 4. sem seta, o gesto de braço
    case 4: {
      const yv = -2.8;
      const kb = ease((lt - 1.2) / 0.5);
      return {
        cam: camLook(0.2, -2.6, 0.8, -32, 34, 17),
        ground: CRUZ,
        objs: [...BAIRRO, car({ x: 1.2, y: yv, color: VOCE, brake: true }), ...(kb > 0.01 ? [braco(1.2, yv, kb)] : [])],
        over: (pr) => (
          <>
            {tag(pr, [0.4, yv + 1.6, 2.6], 'Seta quebrada?', janela(lt, 0.2, 1.3))}
            {tag(pr, [0.4, yv + 1.6, 2.6], 'Gesto de braço', ease((lt - 1.6) / 0.4))}
          </>
        ),
      };
    }
    // 5. mudar de faixa: para a esquerda ou para a direita, com os mesmos cuidados
    case 5: {
      const yv = 2 - 3.2 * lt;
      const ke = ease((lt - 0.6) / 1.2), kd = ease((lt - 3.0) / 1.2);
      const x = lerp(lerp(FX[1], FX[0], ke), FX[2], kd);
      const head = -0.2 * Math.sin(Math.PI * ke) + 0.2 * Math.sin(Math.PI * kd);
      const seta = lt > 0.1 && lt < 1.7 ? 'l' : lt > 2.5 && lt < 4.1 ? 'r' : null;
      return {
        cam: camLook(0, yv - 3, 0, 16, 44, 9.2),
        ground: AV,
        objs: [...AV_OBJS, car({ x, y: yv, heading: head, color: VOCE, blink: pisca(lt, seta) }), car({ x: FX[1], y: 24 - 3.2 * lt, color: '#8f98a3' })],
        over: (pr) => (
          <>
            {tag(pr, [x, yv + 0.4, 2.2], 'Para a esquerda', janela(lt, 0.3, 2.2))}
            {tag(pr, [x, yv + 0.4, 2.2], 'Para a direita', janela(lt, 2.7, 4.6))}
            {tag(pr, [x, yv + 0.4, 2.2], 'Mesmos cuidados', ease((lt - 4.8) / 0.4))}
          </>
        ),
      };
    }
    // 6–7. saindo da garagem: quem está na rua passa primeiro
    case 6:
    case 7: {
      const T = k === 6 ? lt : lt + T7;
      const xp = -5 + 1.4 * T;
      const xc = -24 + 4.5 * T;
      const p = SAIDA.em(Math.max(0, T - 7.1) * 3.4);
      const anda = T > 7.1;
      return {
        cam: camLook(0.3, -1.5, 0, 8, 46, 11.5),
        ground: GARAGEM_CHAO,
        objs: [
          ...GARAGEM_OBJS,
          person(xp, R1 + 1.6, MOCA, T * 6, Math.PI / 2, 1.25),
          car({ x: xc, y: LESTE, heading: Math.PI / 2, color: '#e0412f' }),
          car({ x: p.x, y: p.y, heading: p.heading, color: VOCE, brake: !anda, blink: T > 1.5 ? pisca(T, 'r') : null }),
        ],
        over: (pr) => (
          <>
            {tag(pr, [p.x, p.y + 0.4, 2.2], 'Você', k === 6 ? janela(lt, 0, 3.4) : 0)}
            {tag(pr, [xp, R1 + 1.6, 2.4], 'Pedestre', k === 6 ? janela(lt, 0.8, 4.4) : 0)}
            {tag(pr, [xc, LESTE, 2.2], 'Carro na rua', k === 6 ? ease((lt - 2.0) / 0.4) : 1 - ease(lt / 0.4))}
            {tag(pr, [0, 6.5, 1.0], 'Eles passam primeiro', k === 6 ? ease((lt - 3.6) / 0.4) : 1 - ease((lt - 0.6) / 0.4))}
            {certo(pr, [p.x + 0.2, p.y - 0.5, 2.6], k === 7 ? ease((lt - 1.0) / 0.4) : 0)}
          </>
        ),
      };
    }
    // 8. para guardar: olhe, seta, vire
    default: {
      const p = VIRA.em(lerp(3, 18.5, ease(clamp((lt - 1.9) / 1.8))));
      const seta = lt > 1.1 ? pisca(lt, 'r') : null;
      return {
        cam: camLook(3, -3, 0, 14, 42, 10),
        ground: CRUZ,
        objs: [...BAIRRO, car({ x: p.x, y: p.y, heading: p.heading, color: VOCE, blink: seta })],
        over: (pr) => (
          <>
            {tag(pr, [p.x, p.y + 0.4, 2.2], '1. Olhe', janela(lt, 0.3, 1.0, 0.2))}
            {tag(pr, [p.x, p.y + 0.4, 2.2], '2. Seta', janela(lt, 1.1, 1.8, 0.2))}
            {tag(pr, [p.x, p.y + 0.4, 2.2], '3. Vire', janela(lt, 1.9, 3.2, 0.2))}
            {certo(pr, [10, CY + 1.75, 2.6], ease((lt - 3.4) / 0.4))}
            {rastro(pr, direita(3), VERDE, 0.7 * janela(lt, 1.9, 3.3))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
