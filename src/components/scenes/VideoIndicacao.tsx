/**
 * Vídeo do cartão c2-indicacao ("Placas que mostram o caminho"), Mundo 2, lote 2 de 15/11/2026.
 * As placas de indicação: verde (destino), azul (identificação e serviços), marrom (turismo) e branca (educativa).
 * Tempos em content/videos/indicacao.json.
 */
import { camLook, type Obj, type V2 } from './engine';
import { car } from './models';
import { bairro, cruzamento, voce } from './Mundo1';
import { campo, estrada } from './Mundo2';
import { AZUL_CIDADE, AZUL_KM, AZUL_PEDAGIO, AZUL_POSTO, BRANCA_EDUCATIVA, MARROM_PARQUE, VERDE_DESTINO, arteTela, balaoArte, painel } from './paineis';
import { VERDE, VOCE, arco, caminho, ease, escuro, fazerVideo, janela, lerp, rastro, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/indicacao.json';

const fixo: Pr = (p) => [p[0], p[1]];

/* cidade: a placa verde antes do cruzamento */
const CY = -7;
const CRUZ = cruzamento(CY);
const BAIRRO = bairro(CY, 4);
const CAM = camLook(1.5, -4, 0, -14, 44, 11);
const DEST = painel(VERDE_DESTINO, 3.9, 6.5, CY + 5.6, 2.0);
const RETO: V2[] = [[1.75, 2], [1.75, -18]];
const DIR: V2[] = [[1.75, 2], [1.75, CY + 4.2], ...arco(1.75 + 2.45, CY + 4.2, 2.45, Math.PI, 1.5 * Math.PI), [14, CY + 1.75]];
const PRAIA = caminho(DIR);
const YP = 2.0;

/* estrada: as placas azuis, a marrom e a branca */
const ESTRADA = estrada('tracejada');
const CAMPO = campo(2);
const CAM_EST = camLook(2.6, -6, 1, 14, 30, 9);
const CIDADE = painel(AZUL_CIDADE, 6.6, 10.2, -9, 2.0);
const KM = painel(AZUL_KM, 6.9, 7.7, -2.5, 0.9, 1);
const PARQUE = painel(MARROM_PARQUE, 6.6, 10.2, -9, 2.0);
const EDUCA = painel(BRANCA_EDUCATIVA, 6.6, 10.2, -9, 2.0);

const eu = (y = YP, brake = false): Obj => car({ x: 1.75, y, color: VOCE, brake });
const fundo = (lt: number) => ({ cam: CAM, ground: CRUZ, objs: [...BAIRRO, DEST.obj, eu()] as Obj[], esc: escuro(0.62 * ease(lt / 0.4)) });
const naEstrada = (placas: Obj[], y: number): Quadro => ({ cam: CAM_EST, ground: ESTRADA, objs: [...CAMPO, ...placas, eu(y)] });

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. o terceiro tipo: não manda e não avisa de perigo
    case 0: {
      const y = lerp(9, 4, ease(lt / 3));
      return {
        cam: CAM,
        ground: CRUZ,
        objs: [...BAIRRO, DEST.obj, eu(y)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balaoArte(pr(DEST.topo), VERDE_DESTINO, 186, 26, 84, ease((lt - 0.4) / 0.3))}
            {tag(fixo, [90, 24, 0], 'Indicação', ease((lt - 0.6) / 0.3))}
            {tag(fixo, [100, 186, 0], 'Não manda', ease((lt - 2.2) / 0.3))}
            {tag(fixo, [222, 186, 0], 'Não avisa perigo', ease((lt - 3.4) / 0.3))}
          </>
        ),
      };
    }
    // 1. informa; quase todas são retangulares
    case 1: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {arteTela(VERDE_DESTINO, 70, 62, 84, ease((lt - 0.3) / 0.3))}
            {arteTela(AZUL_CIDADE, 250, 52, 84, ease((lt - 0.8) / 0.3))}
            {arteTela(MARROM_PARQUE, 70, 128, 84, ease((lt - 1.3) / 0.3))}
            {arteTela(BRANCA_EDUCATIVA, 250, 118, 84, ease((lt - 1.8) / 0.3))}
            {tag(fixo, [160, 98, 0], 'Informam', janela(lt, 0.6, 3.6, 0.2))}
            {tag(fixo, [160, 186, 0], 'Retangulares', ease((lt - 3.9) / 0.3))}
          </>
        ),
      };
    }
    // 2. verde: destino
    case 2: {
      const { esc: _, ...f } = fundo(lt);
      return {
        ...f,
        over: (pr) => (
          <>
            {voce(pr, 1.75, YP)}
            {balaoArte(pr(DEST.topo), VERDE_DESTINO, 160, 22, 120, 1)}
            {tag(fixo, [90, 24, 0], 'Verde: destino', ease((lt - 0.3) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Cidades, setas, distâncias', ease((lt - 1.4) / 0.3))}
          </>
        ),
      };
    }
    // 3. Centro em frente, Praia à direita: siga a seta de onde você quer ir
    case 3: {
      const p = PRAIA.em(PRAIA.total * ease((lt - 3.0) / 2.4));
      return {
        cam: CAM,
        ground: CRUZ,
        objs: [...BAIRRO, DEST.obj, car({ x: p.x, y: p.y, heading: p.heading, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, p.x, p.y)}
            {balaoArte(pr(DEST.topo), VERDE_DESTINO, 14, 40, 84, 1 - ease((lt - 2.8) / 0.3))}
            {rastro(pr, RETO, VERDE, janela(lt, 0.3, 2.8, 0.3))}
            {tag(pr, [1.75, -12, 0.3], 'Centro', janela(lt, 0.5, 2.8, 0.3))}
            {rastro(pr, DIR, VERDE, ease((lt - 1.0) / 0.4))}
            {tag(pr, [11, CY + 1.75, 0.3], 'Praia', ease((lt - 1.2) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Siga a seta do seu destino', ease((lt - 3.0) / 0.3))}
          </>
        ),
      };
    }
    // 4. azul: identificação, serviços e fiscalização
    case 4: {
      const y = lerp(6, 2, ease(lt / 3));
      const q = naEstrada([CIDADE.obj, KM.obj], y);
      return {
        ...q,
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balaoArte(pr(CIDADE.topo), AZUL_CIDADE, 14, 10, 96, ease((lt - 0.2) / 0.3))}
            {balaoArte(pr(KM.topo), AZUL_KM, 250, 70, 40, ease((lt - 1.4) / 0.3))}
            {arteTela(AZUL_PEDAGIO, 64, 104, 84, ease((lt - 2.3) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Azul: identifica', janela(lt, 0.4, 3.6, 0.2))}
            {arteTela(AZUL_POSTO, 64, 150, 34, ease((lt - 3.6) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Serviços e fiscalização', ease((lt - 3.9) / 0.3))}
          </>
        ),
      };
    }
    // 5. marrom: atrativos turísticos
    case 5: {
      const y = lerp(6, 2, ease(lt / 3));
      return {
        ...naEstrada([PARQUE.obj], y),
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balaoArte(pr(PARQUE.topo), MARROM_PARQUE, 14, 10, 110, ease((lt - 0.2) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Marrom: passeio', ease((lt - 0.6) / 0.3))}
          </>
        ),
      };
    }
    // 6. branca com letras pretas: educativa
    case 6: {
      const y = lerp(6, 2, ease(lt / 3));
      return {
        ...naEstrada([EDUCA.obj], y),
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balaoArte(pr(EDUCA.topo), BRANCA_EDUCATIVA, 14, 10, 110, ease((lt - 0.2) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Branca: educa', ease((lt - 0.6) / 0.3))}
          </>
        ),
      };
    }
    // 7. para guardar
    default: {
      const f = fundo(lt);
      const it: [typeof VERDE_DESTINO, number, number, string][] = [
        [VERDE_DESTINO, 70, 52, 'Verde leva'],
        [AZUL_CIDADE, 250, 46, 'Azul serve'],
        [MARROM_PARQUE, 70, 132, 'Marrom passeia'],
        [BRANCA_EDUCATIVA, 250, 128, 'Branco educa'],
      ];
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {it.map(([a, x, y, t], i) => (
              <g key={t}>
                {arteTela(a, x, y, 76, ease((lt - 0.2 - i * 0.7) / 0.3))}
                {tag(fixo, [x, y + (a.h * 0.76) / 2 + 18, 0], t, ease((lt - 0.4 - i * 0.7) / 0.3))}
              </g>
            ))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
