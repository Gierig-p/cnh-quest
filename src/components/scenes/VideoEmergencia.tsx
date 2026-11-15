/**
 * Vídeo do cartão c-emergencia ("Sirene tocou"), Mundo 1, lote 2 de 15/11/2026.
 * A avenida de duas faixas da cena parada: você na faixa da esquerda e a ambulância atrás, com luzes e sirene.
 * Tempos em content/videos/emergencia.json.
 */
import { camLook, rect, type Obj, type Part } from './engine';
import { car } from './models';
import { utilitario } from './veiculos';
import { avenida, avenidaObjs, ondas, voce } from './Mundo1';
import { AMARELO, VOCE, certo, ease, escuro, fazerVideo, janela, lerp, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/emergencia.json';

const fixo: Pr = (p) => [p[0], p[1]];
const CHAO = avenida();
const OBJS = avenidaObjs();
const XE = -1.8, XD = 1.8;
const YV = -3.5, YA = 5.6;
const CAM = camLook(-0.4, 0.5, 0, -16, 42, 10.5);

const ambulancia = (y: number, lt: number): Obj => utilitario({ x: XE, y, tipo: 'ambulancia', luzes: true, fase: Math.floor(lt * 4) });
/** as ondas da sirene saindo do teto da ambulância */
const sirene = (pr: Pr, y: number, lt: number, o = 1) => {
  if (o < 0.01 || Math.floor(lt * 3) % 3 === 2) return null;
  const [sx, sy] = pr([XE, y - 1.6, 2.6]);
  return (
    <g opacity={o}>
      {ondas(sx - 10, sy - 2, 200)}
      {ondas(sx + 10, sy - 2, -20)}
    </g>
  );
};
const faixaEsq = (o: number): Part[] => (o > 0.01 ? [rect(-3.3, -40, -0.12, 40, AMARELO, 0.01, 0.4 * o)] : []);

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. ambulância, bombeiros e polícia em urgência
    case 0:
      return {
        cam: CAM,
        ground: CHAO,
        objs: [...OBJS, car({ x: XE, y: YV, color: VOCE }), ambulancia(YA, lt)],
        over: (pr) => (
          <>
            {voce(pr, XE, YV)}
            {sirene(pr, YA, lt)}
            {tag(fixo, [70, 186, 0], 'Ambulância', ease((lt - 0.7) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Bombeiros', ease((lt - 1.6) / 0.3))}
            {tag(fixo, [250, 186, 0], 'Polícia', ease((lt - 2.3) / 0.3))}
          </>
        ),
      };
    // 1. sirene e luzes: o sinal de urgência
    case 1:
      return {
        cam: camLook(-1.6, YA - 1, 0.8, -16, 34, 17),
        ground: CHAO,
        objs: [...OBJS, car({ x: XE, y: YV, color: VOCE }), ambulancia(YA, lt)],
        over: (pr) => (
          <>
            {sirene(pr, YA, lt)}
            {tag(fixo, [95, 186, 0], 'Sirene', ease((lt - 1.0) / 0.3))}
            {tag(fixo, [215, 186, 0], 'Luzes piscando', ease((lt - 1.9) / 0.3))}
          </>
        ),
      };
    // 2. deixe livre a faixa da esquerda
    case 2:
      return {
        cam: CAM,
        ground: [...CHAO, ...faixaEsq(ease((lt - 0.5) / 0.4))],
        objs: [...OBJS, car({ x: XE, y: YV, color: VOCE }), ambulancia(YA, lt)],
        over: (pr) => (
          <>
            {voce(pr, XE, YV)}
            {sirene(pr, YA, lt)}
            {tag(pr, [XE, -11, 0.3], 'Deixe livre', ease((lt - 0.8) / 0.3))}
          </>
        ),
      };
    // 3. vá para a direita e pare, se precisar; a ambulância passa
    case 3: {
      const k1 = Math.min(1, Math.max(0, lt / 1.4));
      const x = lerp(XE, XD, ease(k1));
      const y = lerp(YV, YV - 1.8, ease(lt / 1.8));
      const ya = lerp(YA, -26, ease((lt - 1.1) / 2.0));
      return {
        cam: CAM,
        ground: CHAO,
        objs: [...OBJS, car({ x, y, heading: 0.35 * Math.sin(Math.PI * k1), color: VOCE, brake: lt > 1.5 }), ambulancia(ya, lt)],
        over: (pr) => (
          <>
            {voce(pr, x, y)}
            {sirene(pr, ya, lt, 1 - ease((lt - 2.4) / 0.4))}
            {tag(fixo, [130, 186, 0], 'Direita e pare', ease((lt - 0.6) / 0.3))}
            {certo(fixo, [208, 186, 0], ease((lt - 2.0) / 0.3))}
          </>
        ),
      };
    }
    // 4. para guardar
    default:
      return {
        cam: CAM,
        ground: CHAO,
        objs: [...OBJS, car({ x: XD, y: YV - 1.8, color: VOCE })],
        over: () => (
          <>
            {escuro(0.55 * ease(lt / 0.4))}
            {tag(fixo, [160, 85, 0], 'Sirene tocou:', janela(lt, 0.5, d + 1))}
            {tag(fixo, [160, 125, 0], 'Direita e calma', ease((lt - 1.5) / 0.3))}
          </>
        ),
      };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
