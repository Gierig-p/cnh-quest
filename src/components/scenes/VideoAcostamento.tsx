/**
 * Vídeo do cartão c3-calcada-acostamento ("Calçada, acostamento e quem cuida de quem"), lote de 15/11/2026.
 * Um trecho por fala (tempos em content/videos/acostamento.json).
 */
import { camLook, lines, rect, type Obj, type Part } from './engine';
import { asphalt, bush, building, car, cyclist, grassPatches, person, sidewalk, tree, wall, zebra } from './models';
import { utilitario } from './veiculos';
import { ACOST, PISTA, campo, estrada } from './Mundo2';
import { MENINO, MOCA, RAPAZ, SENHORA, fumaca } from './Mundo3';
import { A, AMARELO, AV, AV_OBJS, FX, VERDE, VERMELHO, VOCE, certo, ease, fazerVideo, janela, lerp, moto, proibido, tag, type Quadro } from './videoBase';
import tempos from '../../content/videos/acostamento.json';

/* ---------------- cenários ---------------- */

const ESTRADA = estrada('tracejada');
const ACOST_X = (PISTA + ACOST) / 2; // centro do acostamento da direita
const CAMPO = campo(4);

/** rua leste-oeste na frente de uma casa com garagem (a mesma da cena "Saída da garagem") */
const R0 = -9, R1 = -2, S1 = 1.2;
const GARAGEM: Part[] = [
  ...grassPatches(-40, -40, 40, 40, 2),
  ...asphalt(-40, R0, 40, R1, 5),
  lines([{ p: [[-40, (R0 + R1) / 2, 0], [40, (R0 + R1) / 2, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
  ...sidewalk(-40, R1, 40, S1, 'x'),
  ...sidewalk(-40, R0 - 3, 40, R0, 'x'),
  rect(-1.5, R1 + 0.05, 1.5, S1, '#bdb3a0', 0.17),
  rect(-1.5, S1, 1.5, 9, '#c9c3b6', 0.02),
];
const GARAGEM_OBJS: Obj[] = [
  wall(-12, S1, -1.6, S1 + 0.2, 1.8, '#e8d9b8'),
  wall(1.6, S1, 12, S1 + 0.2, 1.8, '#e8d9b8'),
  bush(-3.2, 3.2, 0.9, 1),
  bush(3.3, 3.4, 0.8, 2),
  tree(4.6, 6, 0.85, 3),
  building({ x0: -14, y0: R0 - 13, x1: -4, y1: R0 - 4, h: 7, color: '#d9e3f0', shop: 's', seed: 6 }),
  building({ x0: -3, y0: R0 - 13, x1: 7, y1: R0 - 4, h: 9, color: '#f1dca6', shop: 's', seed: 5 }),
  building({ x0: 8, y0: R0 - 13, x1: 17, y1: R0 - 4, h: 6.5, color: '#e9a47c', shop: 's', seed: 7 }),
  tree(-6, R1 + 1.4, 0.85, 1),
  tree(6.5, R1 + 1.4, 0.9, 2),
];

/** fila parada na pista da direita da estrada (congestionamento) */
const FILA: Obj[] = [-34, -27.5, -21, -14.5, -8, -1.5, 5].map((y, i) =>
  i === 2 ? utilitario({ x: 1.75, y: y - 1.5, tipo: 'caminhao', brake: true }) : car({ x: 1.75, y, color: ['#4f7fc4', '#8f98a3', '#e0412f', '#cfd6dd', '#f2c21b', '#5aa06a', '#8f98a3'][i], brake: true }),
);

/** os veículos parados antes da faixa de pedestres, do maior ao menor */
function travessia(lt: number): Obj[] {
  const out: Obj[] = [
    utilitario({ x: FX[0], y: -11, tipo: 'caminhao', brake: true }),
    car({ x: FX[1], y: -16.6, color: '#4f7fc4', brake: true }),
    moto(FX[2] - 0.7, -15.8),
    cyclist(FX[2] + 1.0, -15.3, 0, 0, '#ff5a5f'),
  ];
  // pessoas atravessando de leste para oeste
  const gente: [number, typeof MOCA, number][] = [
    [4.2, MOCA, -21.2],
    [6.0, SENHORA, -20.2],
    [7.6, MENINO, -21.0],
  ];
  for (const [x0, look, y] of gente) out.push(person(x0 - 1.1 * lt, y, look, lt * 6, -Math.PI / 2, 1.2));
  return out;
}
const FAIXA_PED: Part[] = zebra(-A, -22.2, A, -19.2, 'y');

/* ---------------- trechos ---------------- */

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. a calçada é das pessoas a pé
    case 0: {
      const o = 0.35 * ease(lt / 0.5);
      return {
        cam: camLook(A + 1.2, -6 - 1.0 * lt, 0, -26, 40, 13),
        ground: [...AV, rect(A + 0.05, -130, A + 3, 60, VERDE, 0.17, o)],
        objs: [
          ...AV_OBJS,
          person(A + 1.0, -2 - 1.2 * lt, MOCA, lt * 6, 0, 1.2),
          person(A + 2.1, -9 + 1.1 * lt, RAPAZ, lt * 6 + 1, Math.PI, 1.2),
          person(A + 1.6, -14 - 1.0 * lt, SENHORA, lt * 5, 0, 1.2),
          car({ x: FX[2], y: 4 - 7 * lt, color: '#8f98a3' }),
        ],
        over: (pr) => tag(pr, [A + 1.5, -11 - lt, 0.2], 'Calçada: pessoas a pé', ease((lt - 0.3) / 0.4)),
      };
    }
    // 1. o acostamento, ao lado da pista, é para emergências
    case 1: {
      const o = 0.38 * ease((lt - 0.6) / 0.5);
      const yv = 4 - 6 * lt;
      return {
        cam: camLook(2.2, -8 - 2 * lt, 0, 14, 38, 9.5),
        ground: [...ESTRADA, rect(PISTA, -70, ACOST, 40, AMARELO, 0.01, o)],
        objs: [...CAMPO, car({ x: 1.75, y: yv, color: VOCE }), car({ x: -1.75, y: -40 + 9 * lt, heading: Math.PI, color: '#e0412f' })],
        over: (pr) => (
          <>
            {tag(pr, [ACOST_X, -14 - 2 * lt, 0.2], 'Acostamento', ease((lt - 0.8) / 0.4))}
            {tag(pr, [ACOST_X, -22 - 2 * lt, 0.2], 'Para emergências', ease((lt - 2.6) / 0.4))}
          </>
        ),
      };
    }
    // 2. nenhum dos dois é caminho para carro
    case 2: {
      const yv = 2 - 4 * lt;
      return {
        cam: camLook(3.2, -6 - 2 * lt, 0, 18, 40, 10.5),
        ground: [...ESTRADA, rect(PISTA, -70, ACOST, 40, VERMELHO, 0.01, 0.25 * ease(lt / 0.4))],
        objs: [...CAMPO, car({ x: ACOST_X, y: yv, color: '#8f98a3' }), car({ x: 1.75, y: yv - 12, color: '#4f7fc4' })],
        over: (pr) => (
          <>
            {proibido(pr, [ACOST_X, yv, 2.9], ease((lt - 0.3) / 0.3), 12)}
            {tag(pr, [ACOST_X, yv - 8, 0.2], 'Não é caminho', ease((lt - 0.6) / 0.4))}
          </>
        ),
      };
    }
    // 3. o carro só passa sobre a calçada para entrar ou sair de casa: espera a pessoa e sai devagar
    case 3: {
      const u = lt / d;
      const yv = u < 0.45 ? 4.6 : lerp(4.6, -0.6, ease((u - 0.45) / 0.5));
      const xp = -6 + 2.4 * lt;
      return {
        cam: camLook(-0.3, -0.8, 0, 10, 46, 13),
        ground: [...GARAGEM, rect(-1.5, R1 + 0.05, 1.5, S1, AMARELO, 0.18, 0.35 * ease((lt - 0.5) / 0.4))],
        objs: [...GARAGEM_OBJS, person(xp, R1 + 1.6, MOCA, lt * 6, Math.PI / 2, 1.25), car({ x: 6 - 4 * lt, y: (R0 + R1) / 2 - 1.75, heading: -Math.PI / 2, color: '#e0412f' }), car({ x: 0, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {tag(pr, [0, yv + 0.4, 2.2], 'Você')}
            {tag(pr, [0, 7.5, 0.2], 'Garagem', ease((lt - 0.4) / 0.4))}
            {tag(pr, [-6, R1 + 0.6, 0.2], 'Só para entrar ou sair', ease((lt - 2.4) / 0.4))}
          </>
        ),
      };
    }
    // 4. trânsito parado: andar pelo acostamento para passar à frente é proibido
    case 4: {
      const yv = 10 - 7 * lt;
      return {
        cam: camLook(2.6, -10 - 1.5 * lt, 0, 16, 36, 8.8),
        ground: ESTRADA,
        objs: [...CAMPO, ...FILA, car({ x: ACOST_X, y: yv, color: '#e9eef3' })],
        over: (pr) => (
          <>
            {tag(pr, [-1.75, -20 - 1.5 * lt, 0.2], 'Trânsito parado', ease((lt - 0.3) / 0.4) * (1 - ease((lt - 2.2) / 0.4)))}
            {proibido(pr, [ACOST_X, yv, 3.0], ease((lt - 2.4) / 0.3), 12)}
            {tag(pr, [ACOST_X, yv - 7, 0.2], 'Proibido', ease((lt - 2.6) / 0.4))}
          </>
        ),
      };
    }
    // 5. ele fica livre para quem tem uma emergência
    case 5: {
      const yq = -16;
      return {
        cam: camLook(2.8, -12, 0, 16, 36, 9),
        ground: [...ESTRADA, rect(PISTA, -70, ACOST, 40, VERDE, 0.01, 0.28 * ease(lt / 0.5))],
        objs: [...CAMPO, ...FILA, car({ x: ACOST_X + 0.2, y: yq, color: '#cfd6dd', blink: Math.floor(lt * 3) % 2 === 0 ? 'r' : 'l' })],
        over: (pr) => {
          const [fx, fy] = pr([ACOST_X + 0.2, yq - 1.6, 1.1]);
          return (
            <>
              {fumaca(fx, fy - lt * 2, 1.4)}
              {tag(pr, [ACOST_X, yq + 7, 0.2], 'Emergência', ease((lt - 0.6) / 0.4))}
            </>
          );
        },
      };
    }
    // 6. quem é maior cuida de quem é menor
    // 7. caminhão > carro > moto e bicicleta
    case 6:
    case 7: {
      const s = -2.2 * lt;
      const tt = k === 7 ? (n: number) => janela(lt, 0.3 + n * 0.75) : () => 0;
      return {
        cam: camLook(0.6, -8 + s, 0, 20, 44, 9),
        ground: AV,
        objs: [
          ...AV_OBJS,
          utilitario({ x: FX[0], y: 6 + s, tipo: 'caminhao' }),
          car({ x: FX[1], y: -2 + s, color: '#4f7fc4' }),
          moto(FX[2] - 0.6, -9 + s),
          cyclist(FX[2] + 1.0, -14 + s, lt * 4, 0, '#ff5a5f'),
        ],
        over: (pr) =>
          k === 6 ? (
            tag(pr, [0, -20 + s, 0.2], 'Maior cuida do menor', ease((lt - 0.4) / 0.4))
          ) : (
            <>
              {tag(pr, [FX[0], 6 + s - 3.8, 3.6], 'Caminhão', tt(0))}
              {tag(pr, [FX[1], -2 + s, 2.0], 'Carro', tt(1))}
              {tag(pr, [FX[2] - 0.6, -9 + s, 2.1], 'Moto', tt(2))}
              {tag(pr, [FX[2] + 1.0, -14 + s, 2.0], 'Bicicleta', tt(2.4))}
            </>
          ),
      };
    }
    // 8. e todos juntos cuidam dos pedestres
    case 8:
      return {
        cam: camLook(0.8, -15, 0, 18, 46, 10),
        ground: [...AV, ...FAIXA_PED],
        objs: [...AV_OBJS, ...travessia(lt)],
        over: (pr) => tag(pr, [0, -26, 0.2], 'Todos cuidam dos pedestres', ease((lt - 0.4) / 0.4)),
      };
    // 9. para guardar
    default: {
      const ok = ease((lt - 2.2) / 0.4);
      return {
        cam: camLook(0.6, -15 + 0.4 * lt, 0, 22, 48, 9),
        ground: [...AV, ...FAIXA_PED],
        objs: [...AV_OBJS, ...travessia(2.2 + lt * 0.5)],
        over: (pr) => (
          <>
            {tag(pr, [FX[0], -7, 4.0], 'Maior = mais responsável', ease((lt - 0.4) / 0.4))}
            {tag(pr, [1.5, -26, 0.2], 'Pedestre: de todos', ok)}
            {certo(pr, [1.5, -26, -2.5], ok)}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
