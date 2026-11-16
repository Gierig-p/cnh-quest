/**
 * Vídeo do cartão c-r1-r2 ("PARE × Dê a preferência"), Mundo 1, lote 3 de 15/11/2026.
 * O PARE no cruzamento de bairro e o Dê a preferência na saída para a rodovia, as duas cenas do Mundo 1.
 * Tempos em content/videos/r1-r2.json.
 */
import { camLook, type Obj } from './engine';
import { car } from './models';
import { signPost, signTop, SignCallout } from './signs';
import { ROD_YM, bairro, cruzamento, rodoviaChao, rodoviaObjs, voce } from './Mundo1';
import { VOCE, certo, ease, escuro, fazerVideo, janela, lerp, placa, proibido, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/r1-r2.json';

const fixo: Pr = (p) => [p[0], p[1]];
const CY = -7;
const CRUZ = cruzamento(CY);
const BAIRRO = bairro(CY, 6);
const CAM_CRUZ = camLook(2.5, -3.5, 0, -14, 42, 11);
const PARE = { x: 4.3, y: CY + 4.4, code: 'R-1' as const, face: 0 };
/** o PARE da rua da direita, virado para quem vem do leste */
const PARE_DIR = { x: 4.4, y: CY - 4.3, code: 'R-1' as const, face: -Math.PI / 2 };
const ROD = rodoviaChao();
const ROD_OBJS = rodoviaObjs();
const DP = { x: 3.0, y: -2.4, code: 'R-2' as const, face: 0, chao: 0 };
const CAM_ROD = camLook(0.5, -4, 0, 16, 42, 9);

const eu = (y: number, brake = false): Obj => car({ x: 1.75, y, color: VOCE, brake });
const balao = (pr: Pr, p: typeof PARE | typeof DP, o: number, dx = 46, dy = -8) =>
  o > 0.01 ? <g opacity={o}><SignCallout at={pr(signTop(p))} code={p.code} dx={dx} dy={dy} size={36} /></g> : null;

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. duas placas parecidas, pedidos diferentes
    case 0:
      return {
        cam: CAM_CRUZ,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(PARE), eu(6)],
        over: () => (
          <>
            {escuro(0.6 * ease(lt / 0.4))}
            {placa('R-1', 100, 92, 64, ease((lt - 2.0) / 0.3))}
            {tag(fixo, [100, 152, 0], 'PARE', ease((lt - 2.2) / 0.3))}
            {placa('R-2', 220, 90, 68, ease((lt - 3.0) / 0.3))}
            {tag(fixo, [220, 152, 0], 'Dê a preferência', ease((lt - 3.2) / 0.3))}
          </>
        ),
      };
    // 1. oito lados: pare sempre, mesmo sem ninguém vindo
    case 1: {
      const y = lerp(9, 1.4, ease(lt / 2.0));
      return {
        cam: CAM_CRUZ,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(PARE), eu(y, lt > 1.2)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balao(pr, PARE, ease((lt - 0.4) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Pare sempre', ease((lt - 1.4) / 0.3))}
            {tag(pr, [-2, CY, 0.2], 'Ninguém vindo', ease((lt - 2.4) / 0.3))}
          </>
        ),
      };
    }
    // 2. olhe e só siga quando for seguro
    case 2: {
      const y = lerp(1.4, -22, ease((lt - 2.2) / 1.8));
      return {
        cam: CAM_CRUZ,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(PARE), eu(y, lt < 2.2)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {tag(fixo, [110, 186, 0], 'Olhe', janela(lt, 0.4, 2.0, 0.2))}
            {tag(fixo, [160, 186, 0], 'Seguro? Siga', ease((lt - 2.1) / 0.3))}
          </>
        ),
      };
    }
    // 3. passar direto pelo PARE: infração gravíssima
    case 3: {
      const y = lerp(9, -22, ease((lt - 0.3) / 2.8));
      return {
        cam: CAM_CRUZ,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(PARE), eu(y)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {tag(fixo, [160, 186, 0], 'Infração gravíssima', ease((lt - 1.8) / 0.3))}
            {proibido(fixo, [246, 186, 0], ease((lt - 2.2) / 0.3))}
          </>
        ),
      };
    }
    // 4. Dê a preferência: triângulo de ponta para baixo
    case 4: {
      const y = lerp(7, 2.2, ease(lt / 2.2));
      return {
        cam: CAM_ROD,
        ground: ROD,
        objs: [...ROD_OBJS, signPost(DP), car({ x: 1.2, y, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, 1.2, y)}
            {balao(pr, DP, ease((lt - 0.4) / 0.3), 50, -4)}
            {tag(fixo, [160, 186, 0], 'Ponta para baixo', ease((lt - 1.4) / 0.3))}
          </>
        ),
      };
    }
    // 5. reduza e deixe passar quem já está na via; pare só se precisar
    case 5: {
      const x = lerp(-18, 18, ease((lt - 0.4) / 3.0));
      const y = lt < 3.4 ? lerp(2.2, 1.2, ease(lt / 1.2)) : lerp(1.2, -22, ease((lt - 3.4) / 1.6));
      return {
        cam: CAM_ROD,
        ground: ROD,
        objs: [...ROD_OBJS, signPost(DP), car({ x, y: ROD_YM + 2.1, heading: Math.PI / 2, color: '#e0412f' }), car({ x: 1.2, y, color: VOCE, brake: lt > 0.6 && lt < 3.4 })],
        over: (pr) => (
          <>
            {voce(pr, 1.2, y)}
            {tag(fixo, [70, 30, 0], 'Reduza', ease((lt - 0.4) / 0.3))}
            {tag(fixo, [175, 30, 0], 'Deixe passar', ease((lt - 1.2) / 0.3))}
            {certo(fixo, [240, 30, 0], ease((lt - 2.4) / 0.3))}
          </>
        ),
      };
    }
    // 6. as duas placas valem mais que a regra da direita
    case 6: {
      const y = lerp(1.4, -22, ease((lt - 0.8) / 2.6));
      const xd = lerp(12, 6.4, ease(lt / 1.2));
      return {
        cam: CAM_CRUZ,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(PARE_DIR), car({ x: xd, y: CY - 1.75, heading: -Math.PI / 2, color: '#e0412f', brake: lt > 0.8 }), eu(y)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balao(pr, PARE_DIR, ease((lt - 0.3) / 0.3), 78, 72)}
            {tag(pr, [xd, CY - 1.75, 1.6], 'PARE para ele', ease((lt - 0.8) / 0.3))}
            {tag(fixo, [150, 186, 0], 'Vale mais que a direita', ease((lt - 1.6) / 0.3))}
            {certo(fixo, [266, 186, 0], ease((lt - 2.4) / 0.3))}
          </>
        ),
      };
    }
    // 7. para guardar
    default:
      return {
        cam: CAM_CRUZ,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(PARE), eu(1.4, true)],
        over: () => (
          <>
            {escuro(0.6 * ease(lt / 0.4))}
            {placa('R-1', 100, 88, 62, ease((lt - 0.5) / 0.3))}
            {tag(fixo, [100, 146, 0], 'Pare sempre', ease((lt - 1.0) / 0.3))}
            {placa('R-2', 220, 86, 66, ease((lt - 2.2) / 0.3))}
            {tag(fixo, [220, 146, 0], 'Eu cedo', ease((lt - d + 1.6) / 0.3))}
          </>
        ),
      };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
