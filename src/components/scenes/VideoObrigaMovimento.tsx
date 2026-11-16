/**
 * Vídeo do cartão c2-obriga-movimento ("Placas que mandam fazer um movimento"), Mundo 2, lote 1 de 15/11/2026.
 * Siga em frente (R-26) no cruzamento e o sentido da rotatória (R-33), anti-horário com a ilha à esquerda.
 * Tempos em content/videos/obriga-movimento.json.
 */
import { camLook, type Obj, type V2 } from './engine';
import { car } from './models';
import { signPost, signTop, SignCallout } from './signs';
import { ROT_C, bairro, cruzamento, rotatoriaChao, rotatoriaObjs, voce } from './Mundo1';
import { VERDE, VERMELHO, VOCE, arco, caminho, certo, ease, escuro, fazerVideo, janela, lerp, placa, proibido, rastro, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/obriga-movimento.json';

const fixo: Pr = (p) => [p[0], p[1]];
const CY = -7;
const CRUZ = cruzamento(CY);
const BAIRRO = bairro(CY, 3);
const CAM = camLook(1.5, -4, 0, -14, 44, 11);
const R26 = { x: 4.3, y: CY + 4.4, code: 'R-26' as const, face: 0 };
const R33 = { x: 4.4, y: 0.6, code: 'R-33' as const, face: 0 };
type Poste = typeof R26 | typeof R33;
const YP = 2.0;

const RETO: V2[] = [[1.75, 2], [1.75, -18]];
const ESQ: V2[] = [[1.75, 2], [1.75, CY + 4.5], [1.0, CY + 3.2], [1.0, CY + 1], ...arco(1.0 - 2.75, CY + 1, 2.75, 0, -Math.PI / 2), [-14, CY - 1.75]];
const DIR: V2[] = [[1.75, 2], [1.75, CY + 4.2], ...arco(1.75 + 2.45, CY + 4.2, 2.45, Math.PI, 1.5 * Math.PI), [14, CY + 1.75]];
const SEGUE = caminho([[1.75, YP], [1.75, -24]]);

/* rotatória: entra pela direita e gira no sentido anti-horário */
const ROT = rotatoriaChao();
const ROT_OBJS = rotatoriaObjs();
const CAM_ROT = camLook(0, -5.5, 0, 12, 50, 9);
const GIRO: V2[] = [[1.75, 4], [1.75, -1.6], ...arco(ROT_C[0], ROT_C[1], 7.8, 1.35, -3.6, 28)];
const ROTA = caminho(GIRO);

const balao = (pr: Pr, p: Poste, o: number, dx = 46, dy = -8) =>
  o > 0.01 ? <g opacity={o}><SignCallout at={pr(signTop(p))} code={p.code} dx={dx} dy={dy} size={36} /></g> : null;
const eu = (y = YP, brake = true): Obj => car({ x: 1.75, y, color: VOCE, brake });
const fundo = (lt: number) => ({ cam: CAM, ground: CRUZ, objs: [...BAIRRO, signPost(R26), eu()] as Obj[], esc: escuro(0.6 * ease(lt / 0.4)) });

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. outras placas redondas mandam fazer um movimento
    case 0: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {placa('R-26', 110, 92, 62, ease((lt - 0.3) / 0.3))}
            {placa('R-33', 210, 92, 62, ease((lt - 0.6) / 0.3))}
            {tag(fixo, [160, 160, 0], 'Mandam fazer', ease((lt - 1.6) / 0.3))}
          </>
        ),
      };
    }
    // 1. sem a faixa vermelha: a seta é uma ordem
    case 1: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {placa('R-26', 160, 88, 78, 1)}
            {tag(fixo, [160, 160, 0], 'Sem faixa vermelha', janela(lt, 0.4, 2.0, 0.2))}
            {tag(fixo, [160, 160, 0], 'A seta é uma ordem', ease((lt - 2.2) / 0.3))}
          </>
        ),
      };
    }
    // 2. seta reta: siga em frente
    case 2: {
      const p = SEGUE.em(Math.max(0, lt - 1.6) * 7);
      const y = lt < 1.6 ? lerp(8, YP, ease(lt / 1.4)) : p.y;
      return {
        cam: CAM,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(R26), eu(y, lt > 0.9 && lt < 1.6)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balao(pr, R26, ease((lt - 0.2) / 0.3), 44, -10)}
            {rastro(pr, RETO, VERDE, ease((lt - 0.6) / 0.4))}
            {tag(fixo, [150, 186, 0], 'Siga em frente', ease((lt - 0.8) / 0.3))}
            {certo(fixo, [232, 186, 0], ease((lt - 1.4) / 0.3))}
          </>
        ),
      };
    }
    // 3. fala só do movimento no cruzamento, não da mão da rua
    case 3:
      return {
        cam: CAM,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(R26), eu()],
        over: (pr) => (
          <>
            {voce(pr, 1.75, YP)}
            {balao(pr, R26, 1 - janela(lt, 0.2, 2.1, 0.3), 44, -10)}
            {rastro(pr, ESQ, VERMELHO, janela(lt, 0.3, 2.0, 0.3))}
            {rastro(pr, DIR, VERMELHO, janela(lt, 0.3, 2.0, 0.3))}
            {proibido(pr, [-3.2, CY - 1.75, 0.3], janela(lt, 0.5, 2.0, 0.3))}
            {proibido(pr, [5.4, CY + 1.75, 0.3], janela(lt, 0.5, 2.0, 0.3))}
            {tag(fixo, [160, 186, 0], 'Só no cruzamento', janela(lt, 0.4, 2.2, 0.2))}
            {tag(fixo, [160, 186, 0], 'Mão única ou dupla? Não diz', ease((lt - 2.4) / 0.3))}
          </>
        ),
      };
    // 4. setas em círculo: a placa da rotatória
    case 4: {
      const y = lerp(7, 4, ease(lt / 1.6));
      return {
        cam: CAM_ROT,
        ground: ROT,
        objs: [...ROT_OBJS, signPost(R33), eu(y, lt > 1.0)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balao(pr, R33, ease((lt - 0.3) / 0.3), 44, -10)}
            {tag(fixo, [80, 24, 0], 'Rotatória', ease((lt - 0.8) / 0.3))}
          </>
        ),
      };
    }
    // 5. anti-horário, com a ilha do seu lado esquerdo
    case 5: {
      const p = ROTA.em(ROTA.total * Math.min(1, Math.max(0, (lt - 0.6) / 4.8)));
      return {
        cam: CAM_ROT,
        ground: ROT,
        objs: [...ROT_OBJS, signPost(R33), car({ x: p.x, y: p.y, heading: p.heading, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, p.x, p.y)}
            {rastro(pr, GIRO, VERDE, ease((lt - 0.2) / 0.4))}
            {tag(fixo, [160, 186, 0], 'Anti-horário', janela(lt, 0.8, 3.0, 0.2))}
            {tag(pr, [ROT_C[0], ROT_C[1] + 1.5, 0.3], 'Ilha à esquerda', ease((lt - 3.2) / 0.3))}
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
            {placa('R-26', 110, 82, 58, ease((lt - 0.3) / 0.3))}
            {placa('R-33', 210, 82, 58, ease((lt - 0.6) / 0.3))}
            {tag(fixo, [160, 150, 0], 'Sem risco vermelho:', ease((lt - 0.8) / 0.3))}
            {tag(fixo, [160, 178, 0], 'faça o que a seta mostra', ease((lt - 1.2) / 0.3))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
