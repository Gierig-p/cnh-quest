/**
 * Vídeo do cartão c2-advertencia ("Placas de advertência"), Mundo 2, lote 1 de 15/11/2026.
 * A rua com a lombada e a placa amarela antes dela; depois a obra com a placa laranja, e a placa retirada.
 * Tempos em content/videos/advertencia.json.
 */
import { box, camLook, rect, type Obj, type Part } from './engine';
import { car, person, type Look } from './models';
import { signPost, signTop, SignCallout } from './signs';
import { RA, VOCE, ease, escuro, fazerVideo, janela, lerp, placa, ruaChao, ruaObjs, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/advertencia.json';

const fixo: Pr = (p) => [p[0], p[1]];
const XP = RA + 0.6;
const LOMBADA: Part[] = [rect(-RA, -16.4, RA, -15.4, '#2b2b2b', 0.02), ...Array.from({ length: 8 }, (_, i) => rect(-RA + i * 0.85, -16.4, -RA + i * 0.85 + 0.42, -15.4, '#f2c21b', 0.03))];
const CHAO = ruaChao(LOMBADA);
const RUA = ruaChao();
const OBJS = ruaObjs(5, true);
const camRua = (y: number) => camLook(2.2, y, 0, -24, 50, 11);
const CAM_OBRA = camLook(1.6, -11, 0, -24, 46, 8.5);
const A18 = { x: XP, y: -6, code: 'A-18' as const, face: 0 };
const A24 = { x: XP, y: -5, code: 'A-24' as const, face: 0 };
type Poste = typeof A18 | typeof A24;

/* obra na faixa da direita: cones, um trabalhador de colete e uma pequena máquina */
const OPERARIO: Look = { skin: '#c98a5e', hair: '#2b2420', top: '#3a5f8a', bottom: '#2c3a52', shoes: '#1d1d1d', cap: '#f2c21b', vest: '#ff8a1e' };
const cone = (x: number, y: number): Obj => ({
  parts: [box(x - 0.28, y - 0.28, 0, x + 0.28, y + 0.28, 0.08, '#2b2b2b'), box(x - 0.18, y - 0.18, 0.08, x + 0.18, y + 0.18, 0.75, '#ff7a1a'), box(x - 0.15, y - 0.15, 0.36, x + 0.15, y + 0.15, 0.5, '#ffffff')],
  shadow: true,
});
const CONES: Obj[] = [-11, -13, -15, -17, -19, -21, -23].map((y, i) => cone(i === 0 ? 2.6 : 0.4, y));
const maquina = (x: number, y: number): Obj => ({
  parts: [box(x - 0.9, y - 1.3, 0.3, x + 0.9, y + 1.3, 1.2, '#f2b81b'), box(x - 0.7, y - 0.4, 1.2, x + 0.7, y + 0.9, 2.2, '#e8a414'), box(x - 0.6, y - 1.9, 0.1, x + 0.6, y - 1.3, 0.7, '#555b63')],
  shadow: true,
});
const OBRA: Obj[] = [...CONES, maquina(2.0, -19), person(1.6, -15, OPERARIO, 0, -Math.PI / 2, 1.3)];

const balao = (pr: Pr, p: Poste, o: number, dx = 46, dy = -8) =>
  o > 0.01 ? <g opacity={o}><SignCallout at={pr(signTop(p))} code={p.code} dx={dx} dy={dy} size={36} /></g> : null;
const eu = (y: number, brake = false): Obj => car({ x: 1.75, y, color: VOCE, brake });
const fundo = (lt: number) => ({ cam: camRua(-6), ground: CHAO, objs: [...OBJS, signPost(A18), eu(2)] as Obj[], esc: escuro(0.6 * ease(lt / 0.4)) });

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. losango amarelo: a placa de advertência
    case 0:
      return {
        cam: camRua(-6),
        ground: CHAO,
        objs: [...OBJS, signPost(A18), eu(lerp(8, 4, ease(lt / 3)))],
        over: (pr) => (
          <>
            {balao(pr, A18, ease((lt - 0.4) / 0.3), 46, -10)}
            {tag(fixo, [160, 186, 0], 'Advertência = aviso', ease((lt - 1.2) / 0.3))}
          </>
        ),
      };
    // 1. não dá ordem: avisa o que vem à frente
    case 1: {
      const y = lerp(4, 0, lt / 4.5);
      return {
        cam: camRua(-6),
        ground: CHAO,
        objs: [...OBJS, signPost(A18), eu(y)],
        over: (pr) => (
          <>
            {balao(pr, A18, 1, 46, -10)}
            {tag(fixo, [160, 186, 0], 'Não dá ordem', janela(lt, 0.3, 1.9, 0.2))}
            {tag(fixo, [160, 186, 0], 'Avisa o que vem', ease((lt - 2.1) / 0.3))}
            {tag(pr, [0, -15.9, 0.3], 'Lombada', ease((lt - 2.4) / 0.3))}
          </>
        ),
      };
    }
    // 2. usada quando o perigo não é fácil de perceber
    case 2: {
      const y = lerp(0, -2, lt / 2.9);
      return {
        cam: camRua(-6),
        ground: CHAO,
        objs: [...OBJS, signPost(A18), eu(y)],
        over: (pr) => (
          <>
            {balao(pr, A18, 1, 46, -10)}
            {tag(fixo, [160, 186, 0], 'Perigo difícil de ver', ease((lt - 0.3) / 0.3))}
          </>
        ),
      };
    }
    // 3. reduza a velocidade e redobre a atenção
    case 3: {
      const y = lerp(-2, -7.5, 1 - (1 - Math.min(1, lt / 3.4)) ** 2);
      return {
        cam: camRua(-6),
        ground: CHAO,
        objs: [...OBJS, signPost(A18), eu(y, lt > 0.4)],
        over: () => (
          <>
            {tag(fixo, [100, 186, 0], 'Reduza', ease((lt - 0.4) / 0.3))}
            {tag(fixo, [210, 186, 0], 'Atenção', ease((lt - 1.6) / 0.3))}
          </>
        ),
      };
    }
    // 4. a forma e a cor
    case 4: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {placa('A-18', 80, 86, 58, ease((lt - 0.3) / 0.3))}
            {placa('A-14', 160, 86, 58, ease((lt - 0.6) / 0.3))}
            {placa('A-12', 240, 86, 58, ease((lt - 0.9) / 0.3))}
            {tag(fixo, [160, 150, 0], 'Losango', ease((lt - 1.2) / 0.3))}
            {tag(fixo, [160, 176, 0], 'Amarelo e preto', ease((lt - 2.8) / 0.3))}
          </>
        ),
      };
    }
    // 5. a exceção: a placa de obras é laranja
    case 5: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {placa('A-24', 160, 86, 76, ease((lt - 0.2) / 0.3))}
            {tag(fixo, [160, 160, 0], 'Obras: laranja', ease((lt - 0.8) / 0.3))}
          </>
        ),
      };
    }
    // 6. obra: tire o pé, atenção a máquinas e pessoas
    case 6: {
      const y = lerp(6, -5, 1 - (1 - Math.min(1, lt / 3.4)) ** 2);
      return {
        cam: CAM_OBRA,
        ground: RUA,
        objs: [...OBJS, signPost(A24), ...OBRA, eu(y, lt > 0.6)],
        over: (pr) => (
          <>
            {balao(pr, A24, ease((lt - 0.2) / 0.3), 46, -10)}
            {tag(fixo, [160, 186, 0], 'Tire o pé', janela(lt, 0.6, 1.9, 0.2))}
            {tag(fixo, [160, 186, 0], 'Máquinas e pessoas', ease((lt - 2.1) / 0.3))}
          </>
        ),
      };
    }
    // 7. o perigo acabou: a placa é retirada
    case 7: {
      const o = 1 - ease((lt - 0.6) / 0.8);
      return {
        cam: CAM_OBRA,
        ground: RUA,
        objs: [...OBJS, ...(o > 0.5 ? [signPost(A24)] : []), eu(-5)],
        over: (pr) => (
          <>
            {balao(pr, A24, o, 46, -10)}
            {tag(fixo, [160, 186, 0], 'Acabou: placa retirada', ease((lt - 1.2) / 0.3))}
          </>
        ),
      };
    }
    // 8. para guardar
    default: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {placa('A-18', 95, 78, 58, ease((lt - 0.3) / 0.3))}
            {tag(fixo, [95, 132, 0], 'Amarelo avisa', ease((lt - 0.6) / 0.3))}
            {placa('A-24', 225, 78, 58, ease((lt - 1.4) / 0.3))}
            {tag(fixo, [225, 132, 0], 'Laranja: obra', ease((lt - 1.8) / 0.3))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
