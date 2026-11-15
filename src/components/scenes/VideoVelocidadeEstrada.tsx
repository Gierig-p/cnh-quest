/**
 * Vídeo do cartão c3-velocidade-estrada ("Velocidade fora da cidade"), lote 5 de 15/11/2026.
 * Um trecho por fala (tempos em content/videos/velocidade-estrada.json).
 */
import type { ReactNode } from 'react';
import { camLook, type Obj, type V3 } from './engine';
import { bush, car, tree } from './models';
import { utilitario } from './veiculos';
import { SignCallout, signPost, signTop } from './signs';
import { campo, estrada } from './Mundo2';
import { DUPLA_CHAO, TERRA_CHAO, defensaY, onibus } from './Mundo3';
import { VOCE, certo, ease, fazerVideo, janela, moto, proibido, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/velocidade-estrada.json';

const SIMPLES = estrada('tracejada');
const CAMPO = campo(4);
const CAMPO_T = campo(9);
const DUPLA_OBJS: Obj[] = [
  defensaY(0),
  ...[-58, -38, -18, 2, 22].flatMap((y, i) => [tree(-14, y, 1.1, i + 1), tree(15, y + 9, 1.1, i + 2)]),
  bush(12.5, -14, 0.9, 1),
  bush(12, -44, 0.9, 2),
];
/** pistas da rodovia dupla: faixa da esquerda e da direita da sua pista */
const FE = 2.75, FD = 6.2;
const camDupla = (y: number) => camLook(3.5, y, 0, 12, 34, 10);
const camSimples = (y: number) => camLook(1.2, y, 0, 12, 36, 8.5);

/** placa de velocidade (R-19) em pixels: anel vermelho e o número */
function placaV(x: number, y: number, n: number | string, o = 1, r = 12): ReactNode {
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill="#fff" stroke="#d93a35" strokeWidth={r * 0.26} />
      <text x={x} y={y + r * 0.32} textAnchor="middle" fontSize={r * (String(n).length > 2 ? 0.78 : 0.95)} fontWeight={800} fill="#111" fontFamily="system-ui, sans-serif">
        {n}
      </text>
    </g>
  );
}
/** placa de velocidade presa ao lado de um ponto da cena */
const velo = (pr: Pr, p: V3, n: number | string, o = 1, dx = 24): ReactNode => {
  const [x, y] = pr(p);
  return placaV(x + dx, y, n, o);
};
const fixo: Pr = (p) => [p[0], p[1]];

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. fora da cidade, o limite depende do tipo de via e do veículo
    case 0: {
      const y = 2 - 3 * lt;
      const yc = -30 + 5 * lt;
      return {
        cam: camSimples(y - 8),
        ground: SIMPLES,
        objs: [...CAMPO, car({ x: 1.75, y, color: VOCE }), utilitario({ x: -1.75, y: yc, tipo: 'caminhao', heading: Math.PI })],
        over: (pr) => (
          <>
            {tag(pr, [4.75, y - 6, 0.2], 'Tipo de via', janela(lt, 0.6, 2.2, 0.2))}
            {tag(pr, [-1.75, yc, 3.6], 'Tipo de veículo', ease((lt - 2.4) / 0.3))}
          </>
        ),
      };
    }
    // 1. rodovia: via rural com asfalto; estrada: via rural de terra
    case 1: {
      const terra = lt > 2.4;
      const y = 2 - 3 * (terra ? lt - 2.4 : lt);
      return terra
        ? {
            cam: camSimples(y - 8),
            ground: TERRA_CHAO,
            objs: [...CAMPO_T, bush(-5.5, -12, 0.8, 3), bush(5.8, -26, 0.8, 4), car({ x: 1.6, y, color: VOCE })],
            over: (pr) => tag(pr, [1.6, y - 5, 0.2], 'Estrada = terra', ease((lt - 2.6) / 0.3)),
          }
        : {
            cam: camSimples(y - 8),
            ground: SIMPLES,
            objs: [...CAMPO, car({ x: 1.75, y, color: VOCE })],
            over: (pr) => tag(pr, [1.75, y - 5, 0.2], 'Rodovia = asfalto', ease((lt - 0.4) / 0.3)),
          };
    }
    // 2. pista dupla, sem placa: carros, caminhonetes e motos até 110
    case 2: {
      const v = 4 * lt;
      const yc = 1 - v, ym = -9 - v;
      return {
        cam: camDupla(-7 - v),
        ground: DUPLA_CHAO,
        objs: [...DUPLA_OBJS, car({ x: FE, y: yc, color: VOCE }), moto(FD, ym, 0, '#e0412f'), car({ x: -2.75, y: -26 + 6 * lt, heading: Math.PI, color: '#8f98a3' })],
        over: (pr) => (
          <>
            {tag(pr, [0, -18 - v, 0.6], 'Pista dupla', janela(lt, 0.3, 2.4, 0.2))}
            {tag(pr, [0, -18 - v, 0.6], 'Sem placa', ease((lt - 2.5) / 0.3))}
            {tag(pr, [FE, yc, 2.0], 'Carro', ease((lt - 3.4) / 0.3))}
            {tag(pr, [FD, ym, 2.4], 'Moto', ease((lt - 3.8) / 0.3))}
            {velo(pr, [FE, yc, 1.0], 110, ease((lt - 4.3) / 0.3), -26)}
            {velo(pr, [FD, ym, 1.2], 110, ease((lt - 4.5) / 0.3))}
          </>
        ),
      };
    }
    // 3. os outros veículos, como caminhões e ônibus, até 90
    case 3: {
      const v = 3 * lt;
      const yt = -11 - v, yb = 0 - v;
      return {
        cam: camDupla(-7 - v),
        ground: DUPLA_CHAO,
        objs: [...DUPLA_OBJS, utilitario({ x: FD, y: yt, tipo: 'caminhao' }), onibus(FE, yb)],
        over: (pr) => (
          <>
            {tag(pr, [FD, yt, 3.8], 'Caminhão', ease((lt - 0.3) / 0.3))}
            {tag(pr, [FE, yb - 3, 3.6], 'Ônibus', ease((lt - 1.0) / 0.3))}
            {velo(pr, [FD, yt, 2.0], 90, ease((lt - 1.9) / 0.3), 28)}
            {velo(pr, [FE, yb - 3, 2.0], 90, ease((lt - 2.2) / 0.3), -28)}
          </>
        ),
      };
    }
    // 4. pista simples, sem placa: carros, caminhonetes e motos até 100; os outros até 90
    case 4: {
      const v = 3 * lt;
      const yc = 2 - v, yt = -12 - v;
      return {
        cam: camSimples(-8 - v),
        ground: SIMPLES,
        objs: [...CAMPO, car({ x: 1.75, y: yc, color: VOCE }), utilitario({ x: 1.75, y: yt, tipo: 'caminhao' }), car({ x: -1.75, y: -40 + 7 * lt, heading: Math.PI, color: '#4f7fc4' })],
        over: (pr) => (
          <>
            {tag(pr, [4.75, yc - 5, 0.2], 'Pista simples', janela(lt, 0.3, 1.7, 0.2))}
            {tag(pr, [1.75, yc, 2.0], 'Carro', ease((lt - 1.9) / 0.3))}
            {velo(pr, [1.75, yc, 1.0], 100, ease((lt - 2.3) / 0.3), 28)}
            {tag(pr, [1.75, yt, 3.8], 'Caminhão', ease((lt - 4.4) / 0.3))}
            {velo(pr, [1.75, yt, 2.0], 90, ease((lt - 4.9) / 0.3), 30)}
          </>
        ),
      };
    }
    // 5. estrada de terra, sem placa: 60
    case 5: {
      const y = 2 - 2.2 * lt;
      return {
        cam: camSimples(y - 8),
        ground: TERRA_CHAO,
        objs: [...CAMPO_T, bush(-5.5, -12, 0.8, 3), bush(5.8, -26, 0.8, 4), car({ x: 1.6, y, color: VOCE })],
        over: (pr) => (
          <>
            {tag(pr, [1.6, y - 6, 0.2], 'Estrada de terra', ease((lt - 0.3) / 0.3))}
            {velo(pr, [1.6, y, 1.0], 60, ease((lt - 1.4) / 0.3), 28)}
          </>
        ),
      };
    }
    // 6. a placa vem primeiro: 80 vale para todos
    case 6: {
      const placa = { x: 10.6, y: -9, code: 'R-19' as const, speed: 80, face: 0 };
      const yc = 3 - 1.6 * lt, yt = -3 - 1.6 * lt;
      return {
        cam: camDupla(-7),
        ground: DUPLA_CHAO,
        objs: [...DUPLA_OBJS, signPost(placa), car({ x: FE, y: yc, color: VOCE }), utilitario({ x: FD, y: yt, tipo: 'caminhao' })],
        over: (pr) => (
          <>
            <g opacity={ease((lt - 0.4) / 0.3)}>
              <SignCallout at={pr(signTop(placa))} code="R-19" speed={80} dx={34} dy={-24} />
            </g>
            {tag(pr, [FE, yc, 2.0], 'Carro: 80', ease((lt - 2.2) / 0.3))}
            {tag(pr, [FD, yt, 3.8], 'Caminhão: 80', ease((lt - 2.7) / 0.3))}
            {tag(pr, [0, -24, 0.6], 'Vale para todos', ease((lt - 3.4) / 0.3))}
          </>
        ),
      };
    }
    // 7. a mínima é a metade da máxima; devagar demais sem motivo atrapalha
    case 7: {
      const ys = -4 - 1.2 * lt;
      const fila = [5.2, 10.4].map((dy, i) => car({ x: FD, y: ys + dy, color: i ? '#8f98a3' : '#4f7fc4', brake: lt > 2.4 }));
      return {
        cam: camDupla(-9),
        ground: DUPLA_CHAO,
        objs: [...DUPLA_OBJS, car({ x: FD, y: ys, color: '#e0412f' }), ...fila],
        over: (pr) => (
          <>
            {placaV(118, 30, 110, janela(lt, 0.4, 2.6, 0.2))}
            {tag(fixo, [160, 38, 0], '÷ 2 =', janela(lt, 0.9, 2.6, 0.2))}
            {placaV(202, 30, 55, janela(lt, 1.3, 2.6, 0.2))}
            {tag(fixo, [160, 64, 0], 'Mínima: metade', janela(lt, 1.3, 2.6, 0.2))}
            {tag(pr, [FD, ys, 2.0], 'Devagar demais', ease((lt - 2.8) / 0.3))}
            {proibido(pr, [FD + 2.6, ys, 1.0], ease((lt - 3.2) / 0.3))}
            {tag(pr, [FD, ys + 10.4, 2.0], 'Atrapalha', ease((lt - 3.8) / 0.3))}
          </>
        ),
      };
    }
    // 8. para guardar: pista dupla 110, simples 100, terra 60; mínima: metade
    default: {
      const v = 4 * lt;
      return {
        cam: camDupla(-7 - v),
        ground: DUPLA_CHAO,
        objs: [...DUPLA_OBJS, car({ x: FE, y: 1 - v, color: VOCE }), utilitario({ x: FD, y: -10 - v * 0.95, tipo: 'caminhao' })],
        over: () => {
          const o = ease((lt - 0.6) / 0.3);
          return (
            <>
              <rect x={30} y={10} width={260} height={92} rx={10} fill="#0b1220" opacity={0.55 * o} />
              {placaV(80, 38, 110, ease((lt - 1.2) / 0.3), 15)}
              {tag(fixo, [80, 74, 0], 'Dupla', ease((lt - 1.2) / 0.3))}
              {placaV(160, 38, 100, ease((lt - 2.1) / 0.3), 15)}
              {tag(fixo, [160, 74, 0], 'Simples', ease((lt - 2.1) / 0.3))}
              {placaV(240, 38, 60, ease((lt - 3.0) / 0.3), 15)}
              {tag(fixo, [240, 74, 0], 'Terra', ease((lt - 3.0) / 0.3))}
              {tag(fixo, [160, 98, 0], 'Mínima: metade', ease((lt - 4.0) / 0.3))}
              {certo(fixo, [272, 18, 0], ease((lt - Math.min(4.6, d - 0.6)) / 0.3))}
            </>
          );
        },
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
