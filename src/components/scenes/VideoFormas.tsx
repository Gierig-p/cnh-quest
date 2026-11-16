/**
 * Vídeo do cartão c-formas ("A forma da placa já diz muito"), Mundo 1, lote 3 de 15/11/2026.
 * A rua de mão dupla com placas no poste e, por cima da cena escurecida, as placas grandes de cada forma.
 * Tempos em content/videos/formas.json.
 */
import { rect, camLook, type Obj, type Part } from './engine';
import { car, person, zebra } from './models';
import { signPost, signTop, SignCallout } from './signs';
import { MOCA } from './Mundo3';
import { RA, VOCE, ease, escuro, fazerVideo, janela, lerp, placa, ruaChao, ruaObjs, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/formas.json';

const fixo: Pr = (p) => [p[0], p[1]];
const OBJS = ruaObjs(5, true);
const camRua = (y: number) => camLook(2.2, y, 0, -24, 50, 11);
const XP = RA + 0.6;

/** lombada pintada de amarelo e preto, atravessando a rua */
const LOMBADA: Part[] = [rect(-RA, -16.4, RA, -15.4, '#2b2b2b', 0.02), ...Array.from({ length: 8 }, (_, i) => rect(-RA + i * 0.85, -16.4, -RA + i * 0.85 + 0.42, -15.4, '#f2c21b', 0.03))];
const CHAO = ruaChao();
const CHAO_LOMBADA = ruaChao(LOMBADA);
const CHAO_FAIXA = ruaChao(zebra(-3.3, -17, 3.3, -14.2, 'y'));

const P_LOMBADA = { x: XP, y: -7, code: 'A-18' as const, face: 0 };
const P_FAIXA = { x: XP, y: -7, code: 'A-32b' as const, face: 0 };
const P_ORDEM = { x: XP, y: -7, code: 'R-6a' as const, face: 0 };

const eu = (y: number): Obj => car({ x: 1.75, y, color: VOCE });
/** a rua com uma placa no poste, escurecida para as placas grandes */
const fundo = (lt: number) => ({ cam: camRua(-4), ground: CHAO, objs: [...OBJS, signPost(P_ORDEM), eu(3)] as Obj[], escurece: escuro(0.6 * ease(lt / 0.4)) });

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. olhe a forma e a cor antes do desenho
    case 0: {
      const y = lerp(8, 0, ease(lt / 3.2));
      return {
        cam: camRua(-4),
        ground: CHAO,
        objs: [...OBJS, signPost(P_ORDEM), eu(y)],
        over: (pr) => (
          <>
            {tag(fixo, [110, 186, 0], 'Forma', ease((lt - 1.2) / 0.3))}
            {tag(fixo, [210, 186, 0], 'Cor', ease((lt - 1.8) / 0.3))}
            {lt > 1.2 && <g opacity={ease((lt - 1.2) / 0.3)}><SignCallout at={pr(signTop(P_ORDEM))} code="R-6a" dx={-60} dy={-10} size={38} /></g>}
          </>
        ),
      };
    }
    // 1. redonda, vermelha, preta e branca: regulamentação, dá uma ordem
    case 1: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.escurece}
            {placa('R-6a', 80, 95, 54, ease((lt - 0.6) / 0.3))}
            {placa('R-3', 160, 95, 54, ease((lt - 0.9) / 0.3))}
            {placa('R-26', 240, 95, 54, ease((lt - 1.2) / 0.3))}
            {tag(fixo, [160, 42, 0], 'Regulamentação', ease((lt - 1.6) / 0.3))}
            {tag(fixo, [160, 166, 0], 'Dá uma ordem', ease((lt - 3.2) / 0.3))}
          </>
        ),
      };
    }
    // 2. ordem: obrigado ou proibido
    case 2: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.escurece}
            {placa('R-26', 100, 95, 60, ease((lt - 0.4) / 0.3))}
            {tag(fixo, [100, 152, 0], 'Obrigado', ease((lt - 1.0) / 0.3))}
            {placa('R-6a', 220, 95, 60, ease((lt - 1.8) / 0.3))}
            {tag(fixo, [220, 152, 0], 'Proibido', ease((lt - 2.2) / 0.3))}
          </>
        ),
      };
    }
    // 3. as duas exceções: oito lados e triângulo
    case 3: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.escurece}
            {tag(fixo, [160, 34, 0], 'Exceções', ease((lt - 0.5) / 0.3))}
            {placa('R-1', 100, 98, 62, ease((lt - 1.4) / 0.3))}
            {tag(fixo, [100, 156, 0], '8 lados', ease((lt - 1.8) / 0.3))}
            {placa('R-2', 220, 96, 66, ease((lt - 2.8) / 0.3))}
            {tag(fixo, [220, 156, 0], 'Triângulo', ease((lt - 3.2) / 0.3))}
          </>
        ),
      };
    }
    // 4. losango amarelo: advertência, dá um aviso
    case 4: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.escurece}
            {placa('A-18', 80, 95, 58, ease((lt - 0.6) / 0.3))}
            {placa('A-32b', 160, 95, 58, ease((lt - 0.9) / 0.3))}
            {placa('A-14', 240, 95, 58, ease((lt - 1.2) / 0.3))}
            {tag(fixo, [160, 38, 0], 'Advertência', ease((lt - 1.8) / 0.3))}
            {tag(fixo, [160, 168, 0], 'Dá um aviso', ease((lt - 3.0) / 0.3))}
          </>
        ),
      };
    }
    // 5. exemplo: a lombada desenhada avisa da lombada à frente
    case 5: {
      const y = lerp(8, -1, ease(lt / 3.6));
      return {
        cam: camRua(-8),
        ground: CHAO_LOMBADA,
        objs: [...OBJS, signPost(P_LOMBADA), eu(y)],
        over: (pr) => (
          <>
            {lt > 0.6 && <g opacity={ease((lt - 0.6) / 0.3)}><SignCallout at={pr(signTop(P_LOMBADA))} code="A-18" dx={50} dy={-6} size={38} /></g>}
            {tag(pr, [0, -15.9, 0.1], 'Lombada à frente', ease((lt - 1.8) / 0.3))}
          </>
        ),
      };
    }
    // 6. exemplo: a pessoa na faixa avisa da faixa de pedestres adiante
    case 6: {
      const y = lerp(8, -1, ease(lt / 3.2));
      const kp = Math.min(1, Math.max(0, lt / 3.4));
      return {
        cam: camRua(-8),
        ground: CHAO_FAIXA,
        objs: [...OBJS, signPost(P_FAIXA), person(lerp(-4.5, 4.5, kp), -15.6, MOCA, kp * 18, Math.PI / 2, 1.3), eu(y)],
        over: (pr) => (
          <>
            {lt > 0.4 && <g opacity={ease((lt - 0.4) / 0.3)}><SignCallout at={pr(signTop(P_FAIXA))} code="A-32b" dx={50} dy={-6} size={38} /></g>}
            {tag(fixo, [160, 186, 0], 'Faixa adiante', ease((lt - 1.6) / 0.3))}
          </>
        ),
      };
    }
    // 7. para guardar
    default: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.escurece}
            {placa('R-6a', 90, 88, 58, ease((lt - 0.4) / 0.3))}
            {tag(fixo, [90, 146, 0], 'Redonda manda', ease((lt - 0.8) / 0.3))}
            {placa('A-18', 230, 88, 62, janela(lt, 1.6, d + 1, 0.3))}
            {tag(fixo, [230, 146, 0], 'Losango avisa', ease((lt - 2.0) / 0.3))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
