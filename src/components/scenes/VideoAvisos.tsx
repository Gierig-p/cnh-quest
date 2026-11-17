/**
 * Vídeo do cartão c2-advertencia-exemplos ("Avisos de antes"), Mundo 2, lote 1 de 15/11/2026.
 * Placas amarelas que avisam o que vem depois: semáforo (A-14), PARE (A-15), rotatória (A-12), o X do trilho (A-41)
 * e a altura limitada (A-37) antes da altura máxima permitida (R-15), trecho incluído em 16/11/2026.
 * Tempos em content/videos/avisos.json.
 */
import { camLook, rect, type Obj, type Part } from './engine';
import { asphalt, car, grassPatches, trafficLight } from './models';
import { signPost, signTop, SignCallout } from './signs';
import { bairro, cruzamento, rotatoriaChao, rotatoriaObjs, voce } from './Mundo1';
import { VOCE, ease, escuro, fazerVideo, janela, lerp, placa, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/avisos.json';

const fixo: Pr = (p) => [p[0], p[1]];

/* rua com o cruzamento lá na frente */
const CY = -22;
const CRUZ = cruzamento(CY);
const BAIRRO = bairro(CY, 1);
const CAM = camLook(1.8, -9, 0, -14, 40, 14);
const A14 = { x: 4.3, y: -3, code: 'A-14' as const, face: 0 };
const A15 = { x: 4.3, y: -3, code: 'A-15' as const, face: 0 };
const R1 = { x: 4.3, y: CY + 4.4, code: 'R-1' as const, face: 0 };
const LUZ = trafficLight(4.3, CY + 4.0, 'vermelho');

/* rotatória adiante */
const ROT = rotatoriaChao();
const ROT_OBJS = rotatoriaObjs();
const A12 = { x: 4.4, y: 5, code: 'A-12' as const, face: 0 };

/* estrada que cruza o trilho do trem */
const YT = -14;
const TRILHO: Part[] = [
  ...grassPatches(-40, -40, 40, 40, 6),
  ...asphalt(-3.5, -40, 3.5, 40, 2),
  rect(-50, YT - 1.6, 50, YT + 1.6, '#9c8f7e', 0.02),
  ...Array.from({ length: 50 }, (_, i) => rect(-49 + i * 2, YT - 1.3, -48.4 + i * 2, YT + 1.3, '#6b4f36', 0.03)),
  rect(-50, YT - 0.8, 50, YT - 0.68, '#b8bec6', 0.06),
  rect(-50, YT + 0.68, 50, YT + 0.8, '#b8bec6', 0.06),
];
const A41 = { x: 4.3, y: YT + 3.2, code: 'A-41' as const, face: 0 };
const R1T = { x: -4.3, y: YT + 3.2, code: 'R-1' as const, face: 0 };
/* altura limitada: o aviso (A-37) e, lá na frente, a ordem (R-15) */
const A37 = { x: 4.3, y: -3, code: 'A-37' as const, face: 0 };
const R15 = { x: 4.3, y: CY + 4.4, code: 'R-15' as const, face: 0 };
type Poste = typeof A14 | typeof A15 | typeof R1 | typeof A12 | typeof A41 | typeof R1T | typeof A37 | typeof R15;

const balao = (pr: Pr, p: Poste, o: number, dx = 46, dy = -8) =>
  o > 0.01 ? <g opacity={o}><SignCallout at={pr(signTop(p))} code={p.code} dx={dx} dy={dy} size={36} /></g> : null;
const eu = (y: number, brake = false): Obj => car({ x: 1.75, y, color: VOCE, brake });
const fundo = (lt: number) => ({ cam: CAM, ground: CRUZ, objs: [...BAIRRO, signPost(A14), LUZ, eu(4)] as Obj[], esc: escuro(0.6 * ease(lt / 0.4)) });

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. avisos que preparam para o que vem depois
    case 0: {
      const f = fundo(lt);
      return {
        ...f,
        over: () => (
          <>
            {f.esc}
            {placa('A-14', 52, 90, 50, ease((lt - 0.3) / 0.3))}
            {placa('A-15', 124, 90, 50, ease((lt - 0.5) / 0.3))}
            {placa('A-12', 196, 90, 50, ease((lt - 0.7) / 0.3))}
            {placa('A-41', 268, 90, 50, ease((lt - 0.9) / 0.3))}
            {tag(fixo, [160, 160, 0], 'Preparam você', ease((lt - 1.6) / 0.3))}
          </>
        ),
      };
    }
    // 1. semáforo adiante
    case 1: {
      const y = lerp(1.5, 0, lt / 2.8);
      return {
        cam: CAM,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(A14), LUZ, eu(y)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balao(pr, A14, ease((lt - 0.2) / 0.3), 44, -10)}
            {tag(fixo, [90, 24, 0], 'Semáforo adiante', ease((lt - 0.8) / 0.3))}
          </>
        ),
      };
    }
    // 2. você ainda não vê, mas já reduz e se prepara
    case 2: {
      const y = lerp(0, -7, 1 - (1 - Math.min(1, lt / 3.4)) ** 2);
      return {
        cam: CAM,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(A14), LUZ, eu(y, lt > 0.4)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {tag(pr, [4.3, CY + 4.0, 4.8], 'Lá na frente', janela(lt, 0.3, 3.4, 0.2))}
            {tag(fixo, [100, 186, 0], 'Reduza', ease((lt - 0.8) / 0.3))}
            {tag(fixo, [216, 186, 0], 'Prepare-se', ease((lt - 1.8) / 0.3))}
          </>
        ),
      };
    }
    // 3. PARE no losango: só avisa; quem manda parar é a placa PARE
    case 3: {
      const y = lerp(5, CY + 6.2, 1 - (1 - Math.min(1, lt / 5.2)) ** 2);
      return {
        cam: CAM,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(A15), signPost(R1), eu(y, lt > 2.4)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balao(pr, A15, ease((lt - 0.2) / 0.3), 44, -10)}
            {tag(fixo, [160, 186, 0], 'PARE adiante', janela(lt, 0.6, 2.4, 0.2))}
            {tag(fixo, [160, 186, 0], 'Só avisa', janela(lt, 2.6, 4.0, 0.2))}
            {balao(pr, R1, ease((lt - 3.8) / 0.3), 44, -6)}
            {tag(fixo, [160, 186, 0], 'Quem manda: a PARE', ease((lt - 4.2) / 0.3))}
          </>
        ),
      };
    }
    // 4. setas em círculo no losango: rotatória adiante
    case 4: {
      const y = lerp(8, 5, lt / 3.6);
      return {
        cam: camLook(0.5, -3, 0, 12, 46, 11),
        ground: ROT,
        objs: [...ROT_OBJS, signPost(A12), eu(y)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balao(pr, A12, ease((lt - 0.2) / 0.3), 44, -10)}
            {tag(fixo, [90, 24, 0], 'Rotatória adiante', ease((lt - 0.8) / 0.3))}
          </>
        ),
      };
    }
    // 5. o X: a rua cruza o trilho; vem com PARE ou semáforo
    case 5: {
      const y = lerp(8, YT + 4.6, 1 - (1 - Math.min(1, lt / 3.0)) ** 2);
      return {
        cam: camLook(1.0, YT + 6, 0, -14, 42, 11),
        ground: TRILHO,
        objs: [signPost(A41), signPost(R1T), eu(y, lt > 1.2)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balao(pr, A41, ease((lt - 0.2) / 0.3), 44, -10)}
            {tag(pr, [-7, YT, 0.2], 'Trilho do trem', janela(lt, 0.8, 3.0, 0.2))}
            {balao(pr, R1T, ease((lt - 3.2) / 0.3), -48, -8)}
            {tag(fixo, [160, 186, 0], 'Com PARE ou semáforo', ease((lt - 3.4) / 0.3))}
          </>
        ),
      };
    }
    // 6. A-37 avisa a altura limitada; adiante, a R-15 com a altura máxima permitida
    case 6: {
      const y = lerp(5, CY + 7, 1 - (1 - Math.min(1, lt / 6.4)) ** 2);
      return {
        cam: CAM,
        ground: CRUZ,
        objs: [...BAIRRO, signPost(A37), signPost(R15), eu(y)],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balao(pr, A37, ease((lt - 0.2) / 0.3), 44, -10)}
            {tag(fixo, [160, 186, 0], 'Altura limitada adiante', janela(lt, 0.6, 3.0, 0.2))}
            {balao(pr, R15, ease((lt - 3.0) / 0.3), 44, -6)}
            {tag(fixo, [160, 186, 0], 'Altura máxima permitida', ease((lt - 3.2) / 0.3))}
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
            {f.esc}
            {placa('A-14', 52, 84, 50, ease((lt - 0.2) / 0.3))}
            {placa('A-15', 124, 84, 50, ease((lt - 0.3) / 0.3))}
            {placa('A-12', 196, 84, 50, ease((lt - 0.4) / 0.3))}
            {placa('A-41', 268, 84, 50, ease((lt - 0.5) / 0.3))}
            {tag(fixo, [160, 150, 0], 'Amarela conta antes', ease((lt - 0.8) / 0.3))}
            {tag(fixo, [160, 176, 0], 'o que vem pela frente', ease((lt - 1.2) / 0.3))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
