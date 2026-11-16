/**
 * Vídeo do cartão c-proibicoes ("Placas de proibição"), Mundo 1, lote 3 de 15/11/2026.
 * As quatro placas do cartão, cada uma com a sua situação: rua de sentido contrário, meio-fio e caminhão lento.
 * Tempos em content/videos/proibicoes.json.
 */
import { camLook, rect, type Obj } from './engine';
import { car, person } from './models';
import { utilitario } from './veiculos';
import { signPost, signTop, SignCallout } from './signs';
import { cruzamento, bairro, voce } from './Mundo1';
import { MOCA } from './Mundo3';
import { RA, VERMELHO, VOCE, XM, certo, ease, escuro, fazerVideo, janela, lerp, placa, proibido, ruaChao, ruaObjs, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/proibicoes.json';

const fixo: Pr = (p) => [p[0], p[1]];
const RUA = ruaChao();
const OBJS = ruaObjs(7, true);
const camRua = (y: number) => camLook(2.2, y, 0, -24, 50, 11);
const XP = RA + 0.6;
const CY = -7;
const CRUZ = cruzamento(CY, { linhaMeio: false });
const BAIRRO = bairro(CY, 7);
/** o sentido proibido na entrada da rua da frente, virado para você */
const R3 = { x: 4.3, y: CY - 4.4, code: 'R-3' as const, face: 0 };
const R6A = { x: XP, y: -5, code: 'R-6a' as const, face: 0 };
const R6C = { x: XP, y: -5, code: 'R-6c' as const, face: 0 };
const R7 = { x: XP, y: -2, code: 'R-7' as const, face: 0 };
type Poste = typeof R3 | typeof R6A | typeof R6C | typeof R7;

const balao = (pr: Pr, p: Poste, o: number, dx = 46, dy = -8) =>
  o > 0.01 ? <g opacity={o}><SignCallout at={pr(signTop(p))} code={p.code} dx={dx} dy={dy} size={36} /></g> : null;
const k01 = (v: number) => Math.min(1, Math.max(0, v));
const fundo = (lt: number) => ({ cam: camRua(-4), ground: RUA, objs: [...OBJS, signPost(R6A), car({ x: 1.75, y: 3, color: VOCE })] as Obj[], esc: escuro(0.6 * ease(lt / 0.4)) });

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. desenho cortado por uma barra vermelha
    case 0: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {placa('R-6a', 80, 95, 56, ease((lt - 0.5) / 0.3))}
            {placa('R-7', 160, 95, 56, ease((lt - 0.8) / 0.3))}
            {placa('R-4a', 240, 95, 56, ease((lt - 1.1) / 0.3))}
            {tag(fixo, [160, 160, 0], 'Barra vermelha', ease((lt - 2.2) / 0.3))}
          </>
        ),
      };
    }
    // 1. a barra quer dizer "não pode"
    case 1: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {placa('R-6a', 160, 88, 74, 1)}
            {tag(fixo, [160, 160, 0], 'Barra = não pode', ease((lt - 0.8) / 0.3))}
          </>
        ),
      };
    }
    // 2. sentido proibido: não entre por ali
    case 2: {
      const y = lerp(8, 1.6, ease(lt / 1.8));
      const yc = lerp(-30, CY - 4.6, ease((lt - 0.4) / 3.2));
      return {
        cam: camLook(1.8, -6.5, 0, -14, 42, 12),
        ground: CRUZ,
        objs: [...BAIRRO, signPost(R3), car({ x: -1.75, y: yc, heading: Math.PI, color: '#2f80ed', brake: lt > 3.2 }), car({ x: 1.75, y, color: VOCE, brake: lt > 1.4 })],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balao(pr, R3, ease((lt - 0.6) / 0.3), 44, -6)}
            {tag(fixo, [110, 186, 0], 'Sentido proibido', ease((lt - 1.4) / 0.3))}
            {tag(fixo, [232, 186, 0], 'Não entre', ease((lt - 2.6) / 0.3))}
            {proibido(fixo, [286, 186, 0], ease((lt - 3.0) / 0.3))}
          </>
        ),
      };
    }
    // 3. E com uma barra: proibido estacionar; parar para alguém descer pode
    case 3: {
      const kp = k01((lt - 2.6) / 1.2);
      const yc = lerp(-8, -30, ease((lt - 4.2) / 1.4));
      return {
        cam: camRua(-6),
        ground: RUA,
        objs: [
          ...OBJS,
          signPost(R6A),
          car({ x: XM, y: yc, color: '#f2c21b', brake: lt < 4.2 }),
          ...(lt > 2.4 && lt < 5.2 ? [person(lerp(XM + 1.1, XM + 2.6, kp), -8.2, MOCA, kp * 10, -Math.PI / 2, 1.25)] : []),
        ],
        over: (pr) => (
          <>
            {balao(pr, R6A, ease((lt - 0.3) / 0.3), 46, -40)}
            {tag(fixo, [130, 186, 0], 'Estacionar', janela(lt, 0.8, 2.5, 0.2))}
            {proibido(fixo, [196, 186, 0], janela(lt, 1.0, 2.5, 0.2))}
            {tag(fixo, [140, 186, 0], 'Parar para descer', ease((lt - 2.7) / 0.3))}
            {certo(fixo, [228, 186, 0], ease((lt - 3.2) / 0.3))}
          </>
        ),
      };
    }
    // 4. E com duas barras em X: proibido parar e estacionar
    case 4: {
      const yc = lerp(8, -30, ease((lt - 0.2) / 3.6));
      return {
        cam: camRua(-6),
        ground: RUA,
        objs: [...OBJS, signPost(R6C), car({ x: 1.75, y: yc, color: '#f2c21b' })],
        over: (pr) => (
          <>
            {balao(pr, R6C, ease((lt - 0.3) / 0.3), -52, -6)}
            {tag(fixo, [150, 186, 0], 'Nem parar', ease((lt - 1.6) / 0.3))}
            {proibido(fixo, [208, 186, 0], ease((lt - 1.9) / 0.3))}
          </>
        ),
      };
    }
    // 5. dois carros cortados: proibido ultrapassar
    case 5: {
      const yt = lerp(-4, -12, lt / 4.2);
      return {
        cam: camRua(-6),
        ground: [...RUA, rect(-RA, -60, -0.12, 40, VERMELHO, 0.01, 0.28 * ease((lt - 1.6) / 0.4))],
        objs: [...OBJS, signPost(R7), utilitario({ x: 1.75, y: yt, tipo: 'caminhao' }), car({ x: 1.75, y: yt + 7.2, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, 1.75, yt + 7.2)}
            {balao(pr, R7, ease((lt - 0.3) / 0.3), 48, -4)}
            {tag(fixo, [150, 186, 0], 'Proibido ultrapassar', ease((lt - 1.6) / 0.3))}
            {proibido(pr, [-1.75, yt + 2, 0.2], ease((lt - 2.0) / 0.3))}
          </>
        ),
      };
    }
    // 6. para guardar
    default: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {placa('R-6a', 90, 86, 58, ease((lt - 0.5) / 0.3))}
            {tag(fixo, [90, 146, 0], 'Não estaciona', ease((lt - 1.0) / 0.3))}
            {placa('R-6c', 230, 86, 58, ease((lt - 1.9) / 0.3))}
            {tag(fixo, [230, 146, 0], 'Nem para', ease((lt - d + 1.4) / 0.3))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
