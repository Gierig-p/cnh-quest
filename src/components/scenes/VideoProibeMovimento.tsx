/**
 * Vídeo do cartão c2-proibe-movimento ("Placas que proíbem um movimento"), Mundo 2, lote 1 de 15/11/2026.
 * Cruzamento de bairro: proibido virar à esquerda (R-4a) e proibido o retorno (R-5a); uma não vale pela outra.
 * Tempos em content/videos/proibe-movimento.json.
 */
import { camLook, type Obj, type V2 } from './engine';
import { car } from './models';
import { signPost, signTop, SignCallout } from './signs';
import { bairro, cruzamento, voce } from './Mundo1';
import { VERDE, VERMELHO, VOCE, arco, caminho, certo, ease, escuro, fazerVideo, janela, lerp, placa, proibido, rastro, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/proibe-movimento.json';

const fixo: Pr = (p) => [p[0], p[1]];
const CY = -7;
const CRUZ = cruzamento(CY);
const BAIRRO = bairro(CY, 2);
const CAM = camLook(1.5, -4, 0, -14, 44, 11);
const R4 = { x: 4.3, y: CY + 4.4, code: 'R-4a' as const, face: 0 };
const R5 = { x: 4.3, y: CY + 6.4, code: 'R-5a' as const, face: 0 };
type Poste = typeof R4 | typeof R5;

/** virar à esquerda, saindo de perto do meio */
const ESQ: V2[] = [[1.75, 2], [1.75, CY + 4.5], [1.0, CY + 3.2], [1.0, CY + 1], ...arco(1.0 - 2.75, CY + 1, 2.75, 0, -Math.PI / 2), [-14, CY - 1.75]];
/** retorno: a volta em U para seguir no sentido contrário */
const U: V2[] = [[1.75, 2], [1.75, CY + 1], ...arco(0, CY + 1, 1.75, 0, -Math.PI), [-1.75, 8]];
/** o retorno feito de verdade, parando já na faixa de volta, ainda na tela */
const VOLTA = caminho([...U.slice(0, -1), [-1.75, 0.5]]);
const YP = 2.0;

const balao = (pr: Pr, p: Poste, o: number, dx = 46, dy = -8) =>
  o > 0.01 ? <g opacity={o}><SignCallout at={pr(signTop(p))} code={p.code} dx={dx} dy={dy} size={36} /></g> : null;
const eu = (y = YP, brake = true): Obj => car({ x: 1.75, y, color: VOCE, brake });
const fundo = (lt: number) => ({ cam: CAM, ground: CRUZ, objs: [...BAIRRO, signPost(R4), eu()] as Obj[], esc: escuro(0.6 * ease(lt / 0.4)) });

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. algumas placas redondas proíbem um movimento
    case 0: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {placa('R-4a', 110, 92, 62, ease((lt - 0.3) / 0.3))}
            {placa('R-5a', 210, 92, 62, ease((lt - 0.6) / 0.3))}
            {tag(fixo, [160, 160, 0], 'Proíbem um movimento', ease((lt - 1.0) / 0.3))}
          </>
        ),
      };
    }
    // 1. o movimento desenhado e a faixa vermelha por cima
    case 1: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {placa('R-4a', 160, 88, 78, 1)}
            {tag(fixo, [160, 160, 0], 'O movimento', janela(lt, 0.6, 2.2, 0.2))}
            {tag(fixo, [160, 160, 0], 'Faixa vermelha por cima', ease((lt - 2.4) / 0.3))}
          </>
        ),
      };
    }
    // 2. seta virando à esquerda, riscada: proibido virar à esquerda
    case 2: {
      const y = lerp(8, YP, ease(lt / 1.4));
      return {
        cam: CAM,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(R4), eu(y, lt > 1.0)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balao(pr, R4, ease((lt - 0.2) / 0.3), 44, -10)}
            {rastro(pr, ESQ, VERMELHO, ease((lt - 1.0) / 0.4))}
            {proibido(pr, [-3.2, CY - 1.75, 0.3], ease((lt - 1.4) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Não vire à esquerda', ease((lt - 1.6) / 0.3))}
          </>
        ),
      };
    }
    // 3. seta em U, riscada: proibido o retorno
    case 3:
      return {
        cam: CAM,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(R5), eu()],
        over: (pr) => (
          <>
            {voce(pr, 1.75, YP)}
            {balao(pr, R5, ease((lt - 0.2) / 0.3), 44, -6)}
            {rastro(pr, U, VERMELHO, ease((lt - 1.0) / 0.4))}
            {proibido(pr, [0, CY - 0.75, 0.3], ease((lt - 1.6) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Retorno', janela(lt, 1.2, 2.8, 0.2))}
            {tag(fixo, [160, 186, 0], 'Volta no sentido contrário', ease((lt - 3.0) / 0.3))}
          </>
        ),
      };
    // 4. uma não vale pela outra: a de não virar não proíbe o retorno
    case 4: {
      const p = VOLTA.em(VOLTA.total * ease((lt - 1.2) / 2.6));
      return {
        cam: CAM,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(R4), car({ x: p.x, y: p.y, heading: p.heading, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, p.x, p.y)}
            {balao(pr, R4, 1, 44, -10)}
            {rastro(pr, U, VERDE, ease((lt - 0.6) / 0.4))}
            {tag(fixo, [150, 186, 0], 'Não proíbe o retorno', ease((lt - 0.8) / 0.3))}
            {certo(fixo, [268, 186, 0], ease((lt - 1.6) / 0.3))}
          </>
        ),
      };
    }
    // 5. para proibir os dois, as duas placas
    case 5:
      return {
        cam: CAM,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(R4), signPost(R5), eu()],
        over: (pr) => (
          <>
            {voce(pr, 1.75, YP)}
            {balao(pr, R4, ease((lt - 0.2) / 0.3), 44, -24)}
            {balao(pr, R5, ease((lt - 0.5) / 0.3), 44, 14)}
            {rastro(pr, ESQ, VERMELHO, ease((lt - 0.8) / 0.4))}
            {rastro(pr, U, VERMELHO, ease((lt - 1.1) / 0.4))}
            {tag(fixo, [160, 186, 0], 'As duas placas', ease((lt - 1.2) / 0.3))}
          </>
        ),
      };
    // 6. para guardar
    default: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {placa('R-4a', 95, 78, 58, ease((lt - 0.4) / 0.3))}
            {tag(fixo, [95, 128, 0], 'Conversão', ease((lt - 0.8) / 0.3))}
            {placa('R-5a', 225, 78, 58, ease((lt - 1.6) / 0.3))}
            {tag(fixo, [225, 128, 0], 'Retorno', ease((lt - 2.0) / 0.3))}
            {tag(fixo, [160, 172, 0], 'Riscada: proibido', ease((lt - 2.6) / 0.3))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
