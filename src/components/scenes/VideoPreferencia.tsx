/**
 * Vídeo do cartão c-preferencia ("Quem passa primeiro?"), Mundo 1, lote 2 de 15/11/2026.
 * As três perguntas na ordem, cada uma com a sua cena parada do Mundo 1: rodovia, rotatória e carro pela direita.
 * Tempos em content/videos/preferencia.json.
 */
import { camLook, type Obj } from './engine';
import { car, trafficLight } from './models';
import { utilitario } from './veiculos';
import { signPost, signTop } from './signs';
import { ROD_YM, bairro, carroRotatoria, cruzamento, rodoviaChao, rodoviaObjs, rotatoriaChao, rotatoriaObjs, voce } from './Mundo1';
import { VOCE, certo, ease, escuro, fazerVideo, janela, lerp, proibido, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/preferencia.json';

const fixo: Pr = (p) => [p[0], p[1]];
const CY = -7;
const CRUZ = cruzamento(CY);
const BAIRRO = bairro(CY, 4);
const CAM_CRUZ = camLook(2.5, -3.5, 0, -14, 42, 11);
const ROD = rodoviaChao();
const ROD_OBJS = rodoviaObjs();
const ROT = rotatoriaChao();
const ROT_OBJS = rotatoriaObjs();
const PLACA = { x: 4.3, y: CY + 4.4, code: 'R-1' as const, face: 0 };

const eu = (y = 1.4, brake = true): Obj => car({ x: 1.75, y, color: VOCE, brake });
/** a pergunta da vez, no canto de cima */
const pergunta = (txt: string, o = 1) => tag(fixo, [70, 30, 0], txt, o);

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. preferência: o direito de passar primeiro
    case 0:
      return {
        cam: CAM_CRUZ,
        ground: CRUZ,
        objs: [...BAIRRO, car({ x: 9.5, y: CY - 1.75, heading: -Math.PI / 2, color: '#e0412f' }), eu(lerp(7, 1.4, ease(lt / 1.6)), lt > 1.2)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, lerp(7, 1.4, ease(lt / 1.6)))}
            {tag(fixo, [160, 186, 0], 'Quem passa primeiro?', ease((lt - 1.0) / 0.3))}
          </>
        ),
      };
    // 1. placa ou semáforo: obedeça
    case 1: {
      const semaforo = lt > 2.4;
      return {
        cam: CAM_CRUZ,
        ground: CRUZ,
        objs: [...BAIRRO, semaforo ? trafficLight(4.3, CY + 4.0, 'vermelho') : signPost(PLACA), eu()],
        over: (pr) => (
          <>
            {voce(pr, 1.75, 1.4)}
            {tag(pr, signTop(PLACA), 'Placa', janela(lt, 0.8, 2.2, 0.2))}
            {tag(pr, [4.3, CY + 4.0, 4.8], 'Semáforo', ease((lt - 2.5) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Obedeça', ease((lt - 3.0) / 0.3))}
          </>
        ),
      };
    }
    // 2. sem nada: três perguntas, nesta ordem
    case 2:
      return {
        cam: CAM_CRUZ,
        ground: CRUZ,
        objs: [...BAIRRO, eu()],
        over: () => (
          <>
            {escuro(0.55 * ease(lt / 0.4))}
            {tag(fixo, [160, 60, 0], '1. Rodovia?', ease((lt - 1.4) / 0.3))}
            {tag(fixo, [160, 100, 0], '2. Rotatória?', ease((lt - 2.0) / 0.3))}
            {tag(fixo, [160, 140, 0], '3. Direita?', ease((lt - 2.6) / 0.3))}
          </>
        ),
      };
    // 3. rodovia: passa quem está nela
    case 3: {
      const x = lerp(-18, 18, ease((lt - 0.4) / 3.6));
      return {
        cam: camLook(0.5, -4, 0, 16, 42, 9),
        ground: ROD,
        objs: [...ROD_OBJS, car({ x, y: ROD_YM + 2.1, heading: Math.PI / 2, color: '#e0412f' }), car({ x: 1.2, y: 1.2, color: VOCE, brake: true })],
        over: (pr) => (
          <>
            {voce(pr, 1.2, 1.2)}
            {pergunta('1. Rodovia?')}
            {tag(fixo, [150, 186, 0], 'Passa quem está na rodovia', ease((lt - 1.4) / 0.3))}
            {certo(fixo, [276, 186, 0], ease((lt - 2.4) / 0.3))}
          </>
        ),
      };
    }
    // 4. rotatória: passa quem já gira; quem entra espera
    case 4: {
      const a = ((200 - 170 * ease((lt - 0.4) / 4.6)) * Math.PI) / 180;
      const r = 7.8;
      return {
        cam: camLook(0, -5.5, 0, 12, 50, 9),
        ground: ROT,
        objs: [...ROT_OBJS, carroRotatoria(a, '#1e96f0', r), car({ x: 1.75, y: 3.6, color: VOCE, brake: true })],
        over: (pr) => (
          <>
            {voce(pr, 1.75, 3.6)}
            {pergunta('2. Rotatória?')}
            {tag(fixo, [160, 186, 0], 'Quem já gira passa', janela(lt, 1.0, 3.0, 0.2))}
            {tag(fixo, [160, 186, 0], 'Quem vai entrar espera', ease((lt - 3.1) / 0.3))}
          </>
        ),
      };
    }
    // 5. nenhum dos dois: passa quem vem pela direita
    case 5: {
      const x = lerp(12, -16, ease((lt - 0.4) / 3.2));
      return {
        cam: CAM_CRUZ,
        ground: CRUZ,
        objs: [...BAIRRO, car({ x, y: CY - 1.75, heading: -Math.PI / 2, color: '#e0412f' }), eu()],
        over: (pr) => (
          <>
            {voce(pr, 1.75, 1.4)}
            {pergunta('3. Direita?')}
            {tag(fixo, [150, 186, 0], 'Passa quem vem pela direita', ease((lt - 1.0) / 0.3))}
            {certo(fixo, [278, 186, 0], ease((lt - 2.2) / 0.3))}
          </>
        ),
      };
    }
    // 6. tamanho, velocidade e quem chegou primeiro não contam
    case 6:
      return {
        cam: camLook(-1.5, -3.5, 0, 20, 42, 10.5),
        ground: CRUZ,
        objs: [...bairro(CY, 3), utilitario({ x: -11.5, y: CY + 1.75, tipo: 'caminhao', heading: Math.PI / 2 }), eu()],
        over: (pr) => (
          <>
            {voce(pr, 1.75, 1.4)}
            {tag(fixo, [62, 186, 0], 'Tamanho', ease((lt - 0.6) / 0.3))}
            {proibido(fixo, [62, 158, 0], ease((lt - 0.8) / 0.3))}
            {tag(fixo, [152, 186, 0], 'Velocidade', ease((lt - 1.4) / 0.3))}
            {proibido(fixo, [152, 158, 0], ease((lt - 1.6) / 0.3))}
            {tag(fixo, [258, 186, 0], 'Chegou antes', ease((lt - 2.2) / 0.3))}
            {proibido(fixo, [258, 158, 0], ease((lt - 2.4) / 0.3))}
          </>
        ),
      };
    // 7. chegue devagar, pronto para parar
    case 7: {
      const y = lerp(9, 1.4, ease(lt / 4.2));
      return {
        cam: CAM_CRUZ,
        ground: CRUZ,
        objs: [...BAIRRO, eu(y, lt > 0.8)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {tag(fixo, [110, 30, 0], 'Devagar', ease((lt - 0.8) / 0.3))}
            {tag(fixo, [215, 30, 0], 'Pronto para parar', ease((lt - 2.2) / 0.3))}
          </>
        ),
      };
    }
    // 8. para guardar
    default:
      return {
        cam: CAM_CRUZ,
        ground: CRUZ,
        objs: [...BAIRRO, eu()],
        over: () => (
          <>
            {escuro(0.55 * ease(lt / 0.4))}
            {tag(fixo, [160, 60, 0], '1. Rodovia', ease((lt - 0.8) / 0.3))}
            {tag(fixo, [160, 100, 0], '2. Rotatória', ease((lt - 1.5) / 0.3))}
            {tag(fixo, [160, 140, 0], '3. Direita', ease((lt - d + 2.4) / 0.3))}
          </>
        ),
      };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
