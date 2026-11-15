/**
 * Vídeo do cartão c3-lado-direito ("Pela direita, com espaço"), aprovado em 15/11/2026.
 * Animação do motor 3D em SVG; cada trecho acompanha uma fala da narração (tempos em content/videos/faixas.json).
 * `t` é o tempo em segundos (0 = quadro de capa, antes do play).
 */
import { camLook, rect } from './engine';
import { car } from './models';
import { utilitario } from './veiculos';
import { avenida, avenidaObjs } from './Mundo1';
import { onibus } from './Mundo3';
import { A, AMARELO, AV, AV_OBJS, AZUL, FX, VERDE, VOCE, chuva, clamp, ease, faixa, fazerVideo, lerp, tag, type Quadro } from './videoBase';
import tempos from '../../content/videos/faixas.json';

const RUA = avenida('tracejada');
const RUA_OBJS = avenidaObjs(1);

function trecho(k: number, lt: number, d: number): Quadro {
  const u = clamp(lt / d);
  switch (k) {
    // 0. o trânsito anda pela direita (rua de mão dupla)
    case 0: {
      const yv = 10 - 3.5 * lt, yo = -30 + 6 * lt;
      const o = 0.3 * ease(lt / 0.8);
      return {
        cam: camLook(0.8, yv - 5, 0, 16, 46, 9.5),
        ground: [...RUA, rect(0.12, -40, 3.32, 40, VERDE, 0.01, o)],
        objs: [...RUA_OBJS, car({ x: 1.8, y: yv, color: VOCE }), car({ x: -1.8, y: yo, heading: Math.PI, color: '#e0412f' })],
        over: (pr) => (
          <>
            {tag(pr, [1.8, yv, 2.2], 'Você')}
            {tag(pr, [1.8, yv - 9, 0.2], 'Lado direito', ease((lt - 0.6) / 0.5))}
          </>
        ),
      };
    }
    // 1. várias faixas no mesmo sentido, cada uma com um uso
    case 1: {
      const tint = (i: number) => 0.4 * ease((lt - 0.5 - i * 0.9) / 0.4) * (1 - ease((lt - 1.5 - i * 0.9) / 0.4)) + 0.12 * ease((lt - 3.2) / 0.5);
      return {
        cam: camLook(0, -16 - 2 * lt, 0, 18, 50, 7.2),
        ground: [...AV, ...faixa(0, AMARELO, tint(0)), ...faixa(1, AMARELO, tint(1)), ...faixa(2, AMARELO, tint(2))],
        objs: [
          ...AV_OBJS,
          car({ x: FX[0], y: 4 - 8 * lt, color: '#4f7fc4' }),
          car({ x: FX[1], y: -12 - 6 * lt, color: '#8f98a3' }),
          utilitario({ x: FX[2], y: -6 - 3 * lt, tipo: 'caminhao' }),
        ],
        over: (pr) => (
          <>
            {tag(pr, [FX[0], -30 - 2 * lt, 0.2], 'Faixa', ease((lt - 0.5) / 0.3) * (1 - ease((lt - 1.5) / 0.3)))}
            {tag(pr, [FX[1], -30 - 2 * lt, 0.2], 'Faixa', ease((lt - 1.4) / 0.3) * (1 - ease((lt - 2.4) / 0.3)))}
            {tag(pr, [FX[2], -30 - 2 * lt, 0.2], 'Faixa', ease((lt - 2.3) / 0.3) * (1 - ease((lt - 3.3) / 0.3)))}
          </>
        ),
      };
    }
    // 2. direita: mais lentos e maiores
    case 2: {
      const yt = -2 - 2.5 * lt;
      return {
        cam: camLook(1.6, yt + 3, 0, 18, 46, 8.6),
        ground: [...AV, ...faixa(2, VERDE, 0.32 * ease(lt / 0.6))],
        objs: [
          ...AV_OBJS,
          utilitario({ x: FX[2], y: yt, tipo: 'caminhao' }),
          onibus(FX[2], yt + 11),
          car({ x: FX[0], y: 14 - 9 * lt, color: '#4f7fc4' }),
        ],
        over: (pr) => tag(pr, [FX[2], yt - 4, 3.6], 'Mais lentos e maiores', ease((lt - 0.8) / 0.5)),
      };
    }
    // 3. esquerda: ultrapassar e andar mais rápido
    case 3: {
      const yc = 16 - 10 * lt, yt = -4 - 2.5 * lt;
      return {
        cam: camLook(-0.6, -6 - 4 * lt, 0, 18, 46, 8.4),
        ground: [...AV, ...faixa(0, AZUL, 0.32 * ease(lt / 0.6))],
        objs: [...AV_OBJS, utilitario({ x: FX[2], y: yt, tipo: 'caminhao' }), car({ x: FX[0], y: yc, color: '#e0412f' }), car({ x: FX[1], y: 6 - 5 * lt, color: '#8f98a3' })],
        over: (pr) => tag(pr, [FX[0], yc, 2.2], 'Ultrapassar e mais rápido', ease((lt - 0.5) / 0.5)),
      };
    }
    // 4. a ultrapassagem: sai para a faixa à esquerda do caminhão, passa e volta
    case 4: {
      const yt = 2 - 3 * lt;
      let rel: number, x: number, head = 0;
      let blink: 'l' | 'r' | null = null;
      if (u < 0.16) {
        rel = 10;
        x = FX[2];
        blink = u > 0.04 ? 'l' : null;
      } else if (u < 0.36) {
        const k = ease((u - 0.16) / 0.2);
        rel = lerp(10, 6.5, k);
        x = lerp(FX[2], FX[1], k);
        head = -0.2 * Math.sin(Math.PI * k);
        blink = 'l';
      } else if (u < 0.7) {
        rel = lerp(6.5, -10.5, ease((u - 0.36) / 0.34));
        x = FX[1];
        blink = u > 0.62 ? 'r' : null;
      } else if (u < 0.9) {
        const k = ease((u - 0.7) / 0.2);
        rel = lerp(-10.5, -12.5, k);
        x = lerp(FX[1], FX[2], k);
        head = 0.2 * Math.sin(Math.PI * k);
        blink = 'r';
      } else {
        rel = lerp(-12.5, -13.5, (u - 0.9) / 0.1);
        x = FX[2];
      }
      const yv = yt + rel;
      const ym = (yt + yv) / 2;
      return {
        cam: camLook(1.6, ym - 1, 0, 18, 46, 8.2),
        ground: AV,
        objs: [...AV_OBJS, utilitario({ x: FX[2], y: yt, tipo: 'caminhao' }), car({ x, y: yv, heading: head, color: VOCE, blink: blink && Math.floor(lt * 3) % 2 === 0 ? blink : null })],
        over: (pr) => tag(pr, [x, yv, 2.2], 'Você'),
      };
    }
    // 5. distância: para a frente, para os lados e da beirada
    // 6. com velocidade, chuva ou movimento, mais espaço
    case 5:
    case 6: {
      const yv = -2.5 * lt + (k === 6 ? -2 : 0);
      const gap = k === 6 ? lerp(5, 12, ease((lt - 0.8) / 2)) : 5;
      const ya = yv - 4.3 - gap;
      const o1 = k === 6 ? 0.42 : 0.42 * ease((lt - 0.2) / 0.4);
      const o2 = k === 6 ? 0 : 0.42 * ease((lt - 1.2) / 0.4);
      const o3 = k === 6 ? 0 : 0.42 * ease((lt - 2.0) / 0.4);
      return {
        cam: camLook(2.2, yv - 4 - (k === 6 ? 2 : 0), 0, 22, 50, k === 6 ? 8.6 : 10.5),
        ground: [
          ...AV,
          ...(o1 > 0.01 ? [rect(FX[2] - 0.85, ya + 2.25, FX[2] + 0.85, yv - 2.25, AMARELO, 0.01, o1)] : []),
          ...(o2 > 0.01 ? [rect(FX[1] + 1.0, yv - 2.1, FX[2] - 0.95, yv + 2.1, AMARELO, 0.01, o2)] : []),
          ...(o3 > 0.01 ? [rect(FX[2] + 0.95, yv - 2.1, A - 0.3, yv + 2.1, AMARELO, 0.01, o3)] : []),
        ],
        objs: [...AV_OBJS, car({ x: FX[2], y: yv, color: VOCE }), car({ x: FX[2], y: ya, color: '#4f7fc4' }), car({ x: FX[1], y: yv + 1.2 + (k === 6 ? 6 : 0), color: '#8f98a3' })],
        over: (pr) => (
          <>
            {tag(pr, [FX[2], yv, 2.2], 'Você', k === 5 ? 1 - ease((lt - 1.0) / 0.3) : 1)}
            {k === 5 && tag(pr, [FX[2], (ya + yv) / 2, 0.2], 'Frente', ease((lt - 0.3) / 0.4))}
            {k === 5 && tag(pr, [FX[1] + 1.8, yv - 1.2, 0.2], 'Lados', ease((lt - 1.3) / 0.4))}
            {k === 5 && tag(pr, [A - 0.6, yv + 2.4, 0.2], 'Beirada', ease((lt - 2.1) / 0.4))}
            {k === 6 && tag(pr, [FX[2], (ya + yv) / 2, 0.2], 'Mais espaço', ease((lt - 1.6) / 0.4))}
            {k === 6 && chuva(lt, ease(lt / 0.6))}
          </>
        ),
      };
    }
    // 7. atenção, com o carro sob controle
    case 7: {
      const yv = -5 * lt;
      return {
        cam: camLook(3.2, yv - 6, 0, 10, 34, 13),
        ground: AV,
        objs: [...AV_OBJS, car({ x: FX[2], y: yv, color: VOCE }), car({ x: FX[2], y: yv - 16, color: '#4f7fc4' }), car({ x: FX[1], y: yv - 4 - 1.5 * lt, color: '#8f98a3' })],
        over: (pr) => tag(pr, [FX[2], yv, 2.2], 'Você'),
      };
    }
    // 8. para guardar: direita devagar, esquerda para passar
    default: {
      const yt = -4 - 2.5 * lt, yc = 10 - 9 * lt;
      const o = 0.32 * ease(lt / 0.6);
      return {
        cam: camLook(0, -10 - 2 * lt, 0, 18, 50, 7.6),
        ground: [...AV, ...faixa(0, AZUL, o), ...faixa(2, VERDE, o)],
        objs: [...AV_OBJS, utilitario({ x: FX[2], y: yt, tipo: 'caminhao' }), car({ x: FX[0], y: yc, color: '#e0412f' })],
        over: (pr) => (
          <>
            {tag(pr, [FX[0], -15 - 2 * lt, 0.2], 'Esquerda: passar', ease((lt - 0.4) / 0.4))}
            {tag(pr, [FX[2], -11 - 2 * lt, 0.2], 'Direita: devagar', ease((lt - 1.2) / 0.4))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
