/**
 * Vídeo do cartão c-pedestre ("Pé na faixa, pé no freio"), Mundo 1, lote 2 de 15/11/2026.
 * Cruzamento de bairro com faixa de pedestres na sua frente; depois a faixa da rua da direita, ao virar.
 * Tempos em content/videos/pedestre.json.
 */
import { camLook, rect, type Obj, type Part } from './engine';
import { car, person, trafficLight, zebra } from './models';
import { bairro, cruzamento, voce } from './Mundo1';
import { MOCA, RAPAZ, SENHORA } from './Mundo3';
import { VOCE, certo, ease, escuro, fazerVideo, lerp, pisca, proibido, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/pedestre.json';

const fixo: Pr = (p) => [p[0], p[1]];
const CY = -8;
const YZ = CY + 5.5; // meio da faixa de pedestres
const YV = 2.0; // seu carro parado antes da linha de retenção
const LX = 4.3, LY = CY + 4.0;
const TOPO_LUZ: [number, number, number] = [LX, LY, 4.8];
const CHAO: Part[] = [...cruzamento(CY), ...zebra(-3.5, CY + 4.1, 3.5, CY + 6.9, 'y'), rect(0.2, CY + 7.5, 3.3, CY + 7.95, '#ffffff')];
const CHAO_DIR: Part[] = [...CHAO, ...zebra(4.5, CY - 3.5, 7.5, CY + 3.5, 'x')];
const BAIRRO = bairro(CY, 1);
const CAM = camLook(1.2, -1.2, 0.6, 18, 40, 13);

/** quem atravessa a faixa da frente, de oeste para leste, com `k` de 0 a 1 */
const atravessa = (k: number, look = MOCA, s = 1.3): Obj => person(lerp(-4.6, 4.6, k), YZ, look, k * 22, Math.PI / 2, s);
const k01 = (v: number) => Math.min(1, Math.max(0, v));

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. pedestre: quem está a pé, a parte mais frágil
    case 0:
      return {
        cam: camLook(-2.6, YZ + 1.0, 0.8, 18, 36, 19),
        ground: CHAO,
        objs: [...BAIRRO, person(-4.6, YZ, MOCA, 0, Math.PI / 2, 1.3), car({ x: 1.75, y: YV + 3, color: VOCE })],
        over: (pr) => (
          <>
            {tag(pr, [-4.6, YZ, 2.6], 'Pedestre', ease((lt - 0.6) / 0.3))}
            {tag(fixo, [160, 186, 0], 'A parte mais frágil', ease((lt - 2.6) / 0.3))}
          </>
        ),
      };
    // 1. faixa sem semáforo: quem atravessa passa primeiro
    case 1: {
      const y = lerp(9, YV, ease(lt / 2.0));
      return {
        cam: CAM,
        ground: CHAO,
        objs: [...BAIRRO, atravessa(k01((lt - 0.4) / 4.4)), car({ x: 1.75, y, color: VOCE, brake: lt > 1.2 })],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {tag(fixo, [160, 186, 0], 'Sem semáforo', ease((lt - 0.6) / 0.3) * (1 - ease((lt - 2.4) / 0.3)))}
            {tag(fixo, [160, 186, 0], 'Pedestre passa primeiro', ease((lt - 2.5) / 0.3))}
            {certo(fixo, [258, 186, 0], ease((lt - 3.6) / 0.3))}
          </>
        ),
      };
    }
    // 2. faixa com semáforo: vale o semáforo
    case 2:
      return {
        cam: CAM,
        ground: CHAO,
        objs: [...BAIRRO, trafficLight(LX, LY, 'vermelho'), atravessa(k01((lt + 0.5) / 4.0), RAPAZ, 1.4), car({ x: 1.75, y: YV, color: VOCE, brake: true })],
        over: (pr) => (
          <>
            {voce(pr, 1.75, YV)}
            {tag(pr, TOPO_LUZ, 'Vale o semáforo', ease((lt - 0.7) / 0.3))}
          </>
        ),
      };
    // 3. abriu para você, mas ainda tem gente na faixa: ela termina primeiro
    case 3: {
      const verde = lt > 0.9;
      const ks = k01(lt / 4.6);
      const y = lerp(YV, -8, ease((lt - 5.0) / 1.4));
      return {
        cam: CAM,
        ground: CHAO,
        objs: [...BAIRRO, trafficLight(LX, LY, verde ? 'verde' : 'vermelho'), person(lerp(-1.2, 4.6, ks), YZ, SENHORA, ks * 16, Math.PI / 2, 1.2), car({ x: 1.75, y, color: VOCE, brake: lt < 5.0 })],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {tag(pr, TOPO_LUZ, 'Abriu', ease((lt - 1.0) / 0.3) * (1 - ease((lt - 2.6) / 0.3)))}
            {tag(fixo, [160, 186, 0], 'Ela termina primeiro', ease((lt - 2.8) / 0.3))}
          </>
        ),
      };
    }
    // 4. virando à direita, o pedestre já está na faixa da outra rua: pare e espere
    case 4: {
      const R = 3.25, cx = 1.75 + R, cyy = CY + 5;
      // reta em velocidade constante e depois a curva freando até parar antes da faixa
      const v = k01((lt - 1.4) / 1.3);
      const th = Math.PI + 0.7 * (1 - (1 - v) * (1 - v));
      const reto = lt < 1.4;
      const x = reto ? 1.75 : cx + Math.cos(th) * R;
      const y = reto ? lerp(CY + 12, cyy, lt / 1.4) : cyy + Math.sin(th) * R;
      const kp = k01((lt - 0.6) / 4.6);
      return {
        cam: camLook(3.8, CY + 2.2, 0.6, 22, 42, 13),
        ground: CHAO_DIR,
        objs: [...BAIRRO, person(6, lerp(CY + 4.6, CY - 4.6, kp), MOCA, kp * 22, 0, 1.3), car({ x, y, heading: th - Math.PI, color: VOCE, blink: pisca(lt, 'r'), brake: lt > 2.6 })],
        over: (pr) => (
          <>
            {voce(pr, x, y)}
            {tag(fixo, [160, 186, 0], 'Já está na faixa', ease((lt - 1.0) / 0.3) * (1 - ease((lt - 2.8) / 0.3)))}
            {tag(fixo, [160, 186, 0], 'Pare e espere', ease((lt - 2.9) / 0.3))}
            {certo(fixo, [225, 186, 0], ease((lt - 3.6) / 0.3))}
          </>
        ),
      };
    }
    // 5. não dar a preferência na faixa: infração gravíssima
    case 5: {
      const y = lerp(10, -22, ease((lt - 0.3) / 2.6));
      return {
        cam: CAM,
        ground: CHAO,
        objs: [...BAIRRO, person(-2.2, YZ, MOCA, 0, Math.PI / 2, 1.3), car({ x: 1.75, y, color: VOCE })],
        over: () => (
          <>
            {proibido(fixo, [246, 186, 0], ease((lt - 2.2) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Infração gravíssima', ease((lt - 1.8) / 0.3))}
          </>
        ),
      };
    }
    // 6. para guardar
    default:
      return {
        cam: CAM,
        ground: CHAO,
        objs: [...BAIRRO, atravessa(0.5), car({ x: 1.75, y: YV, color: VOCE, brake: true })],
        over: () => (
          <>
            {escuro(0.55 * ease(lt / 0.4))}
            {tag(fixo, [160, 85, 0], 'Pé na faixa,', ease((lt - 0.5) / 0.3))}
            {tag(fixo, [160, 125, 0], 'pé no freio', ease((lt - d + 2.6) / 0.3))}
          </>
        ),
      };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
