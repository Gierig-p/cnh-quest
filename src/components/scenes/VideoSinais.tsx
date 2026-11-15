/**
 * Vídeo do cartão c-tipos-sinais ("O que é um sinal de trânsito?"), Mundo 1, lote 1 de 15/11/2026.
 * Um cruzamento só, com os seis tipos de sinal; a câmera visita cada um. Tempos em content/videos/sinais.json.
 */
import type { ReactNode } from 'react';
import { T, box, camLook, lathe, rect, seg, tfObj, type Obj, type Part } from './engine';
import { car, person, trafficLight, zebra, manhole, type Look } from './models';
import { signPost, signTop, SignCallout } from './signs';
import { bairro, cruzamento, ondas } from './Mundo1';
import { MOCA } from './Mundo3';
import { VOCE, certo, ease, fazerVideo, janela, lerp, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/sinais.json';

const CY = -8;
const AGENTE: Look = { skin: '#b07a55', hair: '#2b2420', top: '#2c4a7a', bottom: '#1f2c44', shoes: '#1d1d1d', cap: '#2c4a7a', vest: '#c8f03c', gloves: '#ffffff', whistle: true };
const AX = 0, AY = CY + 2.55;
const YV = 2.6; // onde o seu carro para, antes da linha de retenção

const CHAO: Part[] = [
  ...cruzamento(CY),
  ...zebra(-3.5, CY + 4.1, 3.5, CY + 6.9, 'y'),
  rect(0.2, CY + 7.5, 3.3, CY + 7.95, '#ffffff'),
  ...manhole(-1.75, 8),
];

/** cone de sinalização (laranja com faixas brancas) */
function cone(x: number, y: number): Obj {
  const corpo = lathe([[0.21, 0.06], [0.17, 0.3], [0.14, 0.44], [0.11, 0.58], [0.07, 0.76], [0, 0.8]], 8, (i) => (i === 1 || i === 3 ? '#f4f4f4' : '#f06a2a'));
  return tfObj({ parts: [box(-0.27, -0.27, 0, 0.27, 0.27, 0.06, '#d9561f'), corpo], shadow: true }, T(x, y));
}
/** tachão: peça baixa e refletiva colada no chão, ao longo da linha do meio */
const tachao = (x: number, y: number): Part => box(x - 0.16, y - 0.26, 0, x + 0.16, y + 0.26, 0.09, '#f5d142', (k, q) => (k === 's' || k === 'n' ? [{ p: q, c: '#ffffff', flat: true }] : undefined));
const TACHOES: Obj = { parts: [0.2, 2.2, 4.2, 6.2, 8.2, 10.2, 12.2, 14.2].map((y) => tachao(0, y)) };
const CONES: Obj[] = [cone(-1.0, 6.6), cone(-2.5, 6.6), cone(-1.0, 9.4), cone(-2.5, 9.4), cone(-1.75, 11.2)];

const PLACA = { x: 4.6, y: 4.2, code: 'R-19' as const, speed: 40, face: 0 };
const POSTE = signPost(PLACA);
const BAIRRO = bairro(CY, 2);

/** braço esquerdo do motorista para fora da janela (gesto) */
function braco(x: number, y: number, k: number): Obj {
  const ombro: [number, number, number] = [x - 0.78, y - 0.25, 1.22];
  const mao: [number, number, number] = [x - 0.78 - 1.5 * k, y - 0.25, 1.3];
  const meio: [number, number, number] = [lerp(ombro[0], mao[0], 0.45), ombro[1], 1.23];
  return { parts: [seg(ombro, meio, 0.24, '#f2a13a'), seg(meio, mao, 0.2, '#d7a77f')], shadow: true };
}

type Luz = 'vermelho' | 'amarelo' | 'verde';
/** o cenário inteiro, com o que muda: luz do semáforo, braço do agente, braço do motorista, posição do seu carro */
function mundo({ luz = 'vermelho' as Luz, bracoAgente = 0, gestoMotorista = 0, yv = YV, pedestre = null as number | null } = {}): Obj[] {
  const objs: Obj[] = [
    ...BAIRRO,
    POSTE,
    trafficLight(4.4, CY + 3.4, luz),
    { parts: [box(AX - 0.55, AY - 0.55, 0, AX + 0.55, AY + 0.55, 0.14, '#e9e2cf')] },
    person(AX, AY, AGENTE, 0, Math.PI, 1.35, { r: [2.3 + 0.5 * Math.sin(bracoAgente), 0], l: [0.15, 0] }),
    TACHOES,
    ...CONES,
    car({ x: 1.75, y: yv, color: VOCE, brake: yv <= YV + 0.5 }),
  ];
  if (gestoMotorista > 0.01) objs.push(braco(1.75, yv, gestoMotorista));
  if (pedestre !== null) objs.push(person(lerp(4.6, -4.6, pedestre), CY + 5.5, MOCA, pedestre * 18, -Math.PI / 2, 1.3));
  return objs;
}

/** bolinha com número, presa a um ponto da cena */
function num(pr: Pr, p: [number, number, number], n: number, o: number): ReactNode {
  if (o < 0.01) return null;
  const [x, y] = pr(p);
  return (
    <g opacity={o} key={`n${n}`}>
      <circle cx={x} cy={y} r={7} fill="#ffd84a" stroke="#1d2430" strokeWidth={1.2} />
      <text x={x} y={y + 3} textAnchor="middle" fontSize={9} fontWeight={800} fill="#1d2430">{n}</text>
    </g>
  );
}

const TOPO_PLACA = signTop(PLACA);
const TOPO_LUZ: [number, number, number] = [4.4, CY + 3.4, 3.6];
const CABECA: [number, number, number] = [AX, AY, 2.6];
const CONE_TAG: [number, number, number] = [-1.75, 8, 1.4];
const ZEBRA: [number, number, number] = [-1.6, CY + 5.5, 0.2];

const WIDE = camLook(1.0, -0.5, 0.4, 18, 42, 9.5);

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. sinal é tudo o que dá um recado
    case 0: {
      const yv = lerp(15, YV, ease(lt / 2.4));
      return {
        cam: WIDE,
        ground: CHAO,
        objs: mundo({ yv, bracoAgente: lt * 4 }),
        over: (pr) => (
          <>
            {tag(pr, TOPO_LUZ, 'Pare', ease((lt - 1.2) / 0.3))}
            {tag(pr, TOPO_PLACA, 'Vá devagar', ease((lt - 2.0) / 0.3))}
            {tag(pr, CONE_TAG, 'Cuidado', ease((lt - 2.8) / 0.3))}
          </>
        ),
      };
    }
    // 1. só seis tipos
    case 1: {
      const n = (i: number) => ease((lt - 0.3 - i * 0.4) / 0.25);
      return {
        cam: WIDE,
        ground: CHAO,
        objs: mundo({ bracoAgente: lt * 4, gestoMotorista: ease((lt - 1.9) / 0.4) }),
        over: (pr) => (
          <>
            {num(pr, TOPO_PLACA, 1, n(0))}
            {num(pr, ZEBRA, 2, n(1))}
            {num(pr, TOPO_LUZ, 3, n(2))}
            {num(pr, CABECA, 4, n(3))}
            {num(pr, [0.3, YV, 2.4], 5, n(4))}
            {num(pr, CONE_TAG, 6, n(5))}
          </>
        ),
      };
    }
    // 2. placas: sinais verticais
    case 2: {
      const at = (pr: Pr) => pr(TOPO_PLACA);
      return {
        cam: camLook(3.4, 3.0, 1.4, 18, 36, 17),
        ground: CHAO,
        objs: mundo({ bracoAgente: lt * 4 }),
        over: (pr) => (
          <>
            {lt > 0.4 && <g opacity={ease((lt - 0.4) / 0.3)}><SignCallout at={at(pr)} code="R-19" speed={40} dx={-60} dy={-6} size={40} /></g>}
            {tag(pr, [PLACA.x, PLACA.y, 0.4], 'Em pé no poste', janela(lt, 0.9, 2.4, 0.2))}
            {tag(pr, [PLACA.x, PLACA.y, 0.4], 'Sinal vertical', ease((lt - 2.5) / 0.3))}
          </>
        ),
      };
    }
    // 3. pinturas no chão: sinais horizontais
    case 3: {
      const kp = Math.max(0, Math.min(1, (lt - 0.6) / 4.6));
      return {
        cam: camLook(0.2, -1.5, 0, 18, 56, 13),
        ground: CHAO,
        objs: mundo({ bracoAgente: lt * 4, pedestre: kp }),
        over: (pr) => (
          <>
            {tag(pr, [-0.4, CY + 4.0, 0.1], 'Faixa de pedestres', janela(lt, 0.9, 3.4, 0.2))}
            {tag(pr, [0, 5.2, 0.1], 'Linhas da pista', janela(lt, 2.3, 4.4, 0.2))}
            {tag(pr, [0, 2.6, 0.1], 'Sinal horizontal', ease((lt - 4.5) / 0.3))}
          </>
        ),
      };
    }
    // 4. semáforo: sinal luminoso
    case 4: {
      const luz: Luz = lt < 1.0 ? 'verde' : lt < 1.9 ? 'amarelo' : 'vermelho';
      return {
        cam: camLook(3.4, CY + 5.2, 1.6, 18, 34, 19),
        ground: CHAO,
        objs: mundo({ luz, bracoAgente: lt * 4 }),
        over: (pr) => (
          <>
            {tag(pr, TOPO_LUZ, 'Semáforo', janela(lt, 0.3, 1.9, 0.2))}
            {tag(pr, TOPO_LUZ, 'Sinal luminoso', ease((lt - 2.0) / 0.3))}
          </>
        ),
      };
    }
    // 5. apito: sinal sonoro
    case 5: {
      const pulso = Math.floor(lt * 2.5) % 2 === 0 && lt > 0.5;
      return {
        cam: camLook(0.6, AY + 2.2, 1.2, 18, 34, 19),
        ground: CHAO,
        objs: mundo({ bracoAgente: lt * 4 }),
        over: (pr) => {
          const [x, y] = pr([AX, AY - 0.3, 2.0]);
          return (
            <>
              {pulso && ondas(x - 6, y - 2, 200)}
              {pulso && ondas(x + 6, y - 2, -20)}
              {tag(pr, [AX, AY, 2.9], 'Apito', janela(lt, 0.5, 2.0, 0.2))}
              {tag(pr, [AX, AY, 2.9], 'Sinal sonoro', ease((lt - 2.1) / 0.3))}
            </>
          );
        },
      };
    }
    // 6. gestos do agente e do motorista
    case 6: {
      return {
        cam: camLook(1.0, -1.0, 0.6, 18, 40, 12.5),
        ground: CHAO,
        objs: mundo({ bracoAgente: lt * 6, gestoMotorista: ease((lt - 2.7) / 0.5) }),
        over: (pr) => (
          <>
            {tag(pr, [AX, AY, 2.9], 'Gesto do agente', ease((lt - 0.4) / 0.3))}
            {tag(pr, [-0.6, YV + 1.2, 1.9], 'Gesto do motorista', ease((lt - 2.9) / 0.3))}
          </>
        ),
      };
    }
    // 7. dispositivos auxiliares: cones e tachões
    case 7: {
      return {
        cam: camLook(-0.6, 7.0, 0, 18, 48, 17),
        ground: CHAO,
        objs: mundo({ bracoAgente: lt * 4 }),
        over: (pr) => (
          <>
            {tag(pr, [-1.75, 9.4, 1.3], 'Cones', janela(lt, 0.9, 4.3, 0.2))}
            {tag(pr, [0.9, 13.2, 0.3], 'Tachões', janela(lt, 1.8, 4.3, 0.2))}
            {tag(pr, [-1.75, 9.4, 1.3], 'Dispositivos auxiliares', ease((lt - 3.4) / 0.3))}
          </>
        ),
      };
    }
    // 8. para guardar: placa, pintura, luz, som, gesto e auxiliar
    default: {
      const n = (i: number) => ease((lt - 0.6 - i * 0.55) / 0.3);
      const pulso = Math.floor(lt * 2.5) % 2 === 0 && lt > 2.2;
      return {
        cam: WIDE,
        ground: CHAO,
        objs: mundo({ bracoAgente: lt * 4, gestoMotorista: ease((lt - 3.2) / 0.4) }),
        over: (pr) => {
          const [x, y] = pr([AX, AY - 0.3, 2.0]);
          return (
            <>
              {pulso && ondas(x + 6, y - 2, -20)}
              {tag(pr, TOPO_PLACA, 'Placa', n(0))}
              {tag(pr, ZEBRA, 'Pintura', n(1))}
              {tag(pr, TOPO_LUZ, 'Luz', n(2))}
              {tag(pr, CABECA, 'Som', n(3))}
              {tag(pr, [-0.6, YV + 1.2, 1.9], 'Gesto', n(4))}
              {tag(pr, CONE_TAG, 'Auxiliar', n(5))}
              {certo(pr, [-3.2, CY + 9.5, 0.4], ease((lt - d + 1.6) / 0.3))}
            </>
          );
        },
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
