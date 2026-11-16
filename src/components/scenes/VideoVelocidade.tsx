/**
 * Vídeo do cartão c-velocidade ("Limite de velocidade"), Mundo 1, lote 3 de 15/11/2026.
 * A placa R-19 na rua e, sem placa, os quatro tipos de via da cidade com o limite da lei.
 * Tempos em content/videos/velocidade.json.
 */
import type { ReactNode } from 'react';
import { camLook } from './engine';
import { car, trafficLight } from './models';
import { signPost, signTop, SignCallout } from './signs';
import { avenida, avenidaObjs, ruaLocalChao, ruaLocalObjs, voce } from './Mundo1';
import { AV, AV_OBJS, FX, RA, VOCE, certo, ease, escuro, fazerVideo, janela, lerp, proibido, ruaChao, ruaObjs, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/velocidade.json';

const fixo: Pr = (p) => [p[0], p[1]];
const RUA = ruaChao();
const RUA_OBJS = ruaObjs(2, true);
const camRua = (y: number) => camLook(2.2, y, 0, -24, 50, 11);
const R19 = { x: RA + 0.6, y: -7, code: 'R-19' as const, speed: 40, face: 0 };
const LOCAL = ruaLocalChao();
const LOCAL_OBJS = ruaLocalObjs();
const CAM_LOCAL = camLook(0.8, -5, 0, 20, 40, 10.5);
const R19_LOCAL = { x: 4.4, y: -6.5, code: 'R-19' as const, speed: 20, face: 0 };
const AVN = avenida();
const AVN_OBJS = avenidaObjs();

/** o número do limite da lei, num quadro escuro (não é placa: é a regra quando não há placa) */
function limite(cx: number, cy: number, n: number, o = 1, s = 1): ReactNode {
  if (o <= 0.01) return null;
  const w = 64 * s, h = 46 * s;
  return (
    <g opacity={o}>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={7 * s} fill="#10182b" stroke="#ffd84a" strokeWidth={2} />
      <text x={cx} y={cy + 6 * s} textAnchor="middle" fontSize={26 * s} fontWeight={900} fill="#ffd84a">{n}</text>
      <text x={cx} y={cy + 18 * s} textAnchor="middle" fontSize={8 * s} fontWeight={700} fill="#fff">km/h</text>
    </g>
  );
}

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. limite: o máximo que você pode andar
    case 0: {
      const y = lerp(10, -8, ease(lt / 3.4));
      return {
        cam: camRua(-4),
        ground: RUA,
        objs: [...RUA_OBJS, car({ x: 1.75, y, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {tag(fixo, [160, 186, 0], 'Limite = o máximo', ease((lt - 1.2) / 0.3))}
          </>
        ),
      };
    }
    // 1. a placa redonda com um número, a partir dali
    case 1: {
      const y = lerp(8, -2, ease(lt / 3.4));
      return {
        cam: camRua(-4),
        ground: RUA,
        objs: [...RUA_OBJS, signPost(R19), car({ x: 1.75, y, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {lt > 0.6 && <g opacity={ease((lt - 0.6) / 0.3)}><SignCallout at={pr(signTop(R19))} code="R-19" speed={40} dx={-58} dy={-10} size={38} /></g>}
            {tag(fixo, [160, 186, 0], 'A partir daqui', ease((lt - 2.0) / 0.3))}
          </>
        ),
      };
    }
    // 2. sem placa: vale a lei, pelo tipo de via
    case 2: {
      const y = lerp(8, -2, ease(lt / 3.6));
      return {
        cam: CAM_LOCAL,
        ground: LOCAL,
        objs: [...LOCAL_OBJS, car({ x: 1.6, y, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, 1.6, y)}
            {tag(fixo, [160, 186, 0], 'Sem placa?', janela(lt, 0.5, 2.2, 0.2))}
            {tag(fixo, [160, 186, 0], 'Vale o tipo de via', ease((lt - 2.3) / 0.3))}
          </>
        ),
      };
    }
    // 3. via de trânsito rápido: 80
    case 3: {
      const y = lerp(10, -40, lt / 5.0);
      return {
        cam: camLook(0.5, y - 5, 0, 18, 46, 11),
        ground: AV,
        objs: [...AV_OBJS, car({ x: FX[0], y: y - 6 - lt * 2, color: '#e0412f' }), car({ x: FX[2], y: y + 3 + lt * 1.5, color: '#2f80ed' }), car({ x: FX[1], y, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, FX[1], y)}
            {tag(fixo, [160, 30, 0], 'Trânsito rápido', ease((lt - 0.6) / 0.3))}
            {limite(160, 168, 80, ease((lt - 2.6) / 0.3))}
          </>
        ),
      };
    }
    // 4. via arterial, a avenida com semáforos: 60
    case 4: {
      const y = lerp(10, -2, ease(lt / 3.6));
      return {
        cam: camLook(-0.4, -4, 0, -16, 42, 11),
        ground: AVN,
        objs: [...AVN_OBJS, trafficLight(4.3, -12, 'verde'), car({ x: -1.8, y: y - 7, color: '#f2c21b' }), car({ x: 1.8, y, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, 1.8, y)}
            {tag(fixo, [160, 30, 0], 'Arterial', ease((lt - 0.5) / 0.3))}
            {limite(160, 168, 60, ease((lt - 2.2) / 0.3))}
          </>
        ),
      };
    }
    // 5. via coletora, que liga o bairro às avenidas: 40
    case 5: {
      const y = lerp(8, -8, ease(lt / 3.6));
      return {
        cam: camRua(-4),
        ground: RUA,
        objs: [...RUA_OBJS, car({ x: -1.75, y: lerp(-16, 10, ease(lt / 3.6)), heading: Math.PI, color: '#5fb04a' }), car({ x: 1.75, y, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {tag(fixo, [160, 30, 0], 'Coletora', ease((lt - 0.5) / 0.3))}
            {limite(160, 168, 40, ease((lt - 2.3) / 0.3))}
          </>
        ),
      };
    }
    // 6. via local, a rua do bairro: 30
    case 6: {
      const y = lerp(6, -2, ease(lt / 2.6));
      return {
        cam: CAM_LOCAL,
        ground: LOCAL,
        objs: [...LOCAL_OBJS, car({ x: 1.6, y, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, 1.6, y)}
            {tag(fixo, [160, 30, 0], 'Local', ease((lt - 0.4) / 0.3))}
            {limite(160, 168, 30, ease((lt - 1.4) / 0.3))}
          </>
        ),
      };
    }
    // 7. com placa, vale a placa, mesmo com outro número
    case 7: {
      const y = lerp(8, -1, ease(lt / 3.4));
      return {
        cam: CAM_LOCAL,
        ground: LOCAL,
        objs: [...LOCAL_OBJS, signPost(R19_LOCAL), car({ x: 1.6, y, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, 1.6, y)}
            {limite(70, 168, 30, ease((lt - 0.3) / 0.3), 0.8)}
            {proibido(fixo, [92, 152, 0], ease((lt - 1.4) / 0.3))}
            {lt > 1.2 && <g opacity={ease((lt - 1.2) / 0.3)}><SignCallout at={pr(signTop(R19_LOCAL))} code="R-19" speed={20} dx={52} dy={-6} size={38} /></g>}
            {tag(fixo, [210, 186, 0], 'Vale a placa', ease((lt - 1.8) / 0.3))}
            {certo(fixo, [266, 186, 0], ease((lt - 2.3) / 0.3))}
          </>
        ),
      };
    }
    // 8. para guardar: 80, 60, 40, 30
    default:
      return {
        cam: CAM_LOCAL,
        ground: LOCAL,
        objs: [...LOCAL_OBJS, car({ x: 1.6, y: 1.5, color: VOCE })],
        over: () => (
          <>
            {escuro(0.6 * ease(lt / 0.4))}
            {limite(55, 70, 80, ease((lt - 0.4) / 0.3), 0.9)}
            {limite(125, 95, 60, ease((lt - 1.0) / 0.3), 0.9)}
            {limite(195, 120, 40, ease((lt - 1.6) / 0.3), 0.9)}
            {limite(265, 145, 30, ease((lt - 2.2) / 0.3), 0.9)}
            {tag(fixo, [92, 160, 0], 'Mais rápido', ease((lt - 2.8) / 0.3))}
            {tag(fixo, [235, 186, 0], 'Rua do bairro', ease((lt - d + 1.6) / 0.3))}
          </>
        ),
      };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
