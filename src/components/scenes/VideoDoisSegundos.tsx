/**
 * Vídeo do cartão c5-dois-segundos ("Regra dos dois segundos"), Mundo 5, lote 3 de 17/11/2026.
 * O ponto fixo (poste), a contagem "cinquenta e um, cinquenta e dois", passar depois (seguro) ou antes (reduza),
 * contar até três na chuva ou com veículo de mais de 6 m, a distância na frente e dos lados (CTB art. 29, II)
 * e o exemplo da Ana passando pela placa. Tempos em content/videos/dois-segundos.json.
 * Tempo fiel: os dois carros andam na mesma velocidade V, então a distância em segundos é a distância / V.
 */
import type { ReactNode } from 'react';
import { box, camLook, rect, type Obj, type Part } from './engine';
import { car, lampPost } from './models';
import { utilitario } from './veiculos';
import { campo, estrada } from './Mundo2';
import { TINTA, chip, nao, surge, visto } from './infracoesUI';
import { VOCE, chuva, clamp, ease, escuro, fazerVideo, relogio, tag, type Quadro } from './videoBase';
import tempos from '../../content/videos/dois-segundos.json';

const AZ = '#2f6db5';
const VERDE = '#2fa36b';
const LARANJA = '#ea7b2c';
const VERM = '#d93a35';
const AMAR = '#ffd84a';
const FRENTE = '#4f7fc4';

const ESTRADA = estrada('tracejada');
const CAMPO = campo(5);
const XV = 1.75;
/** velocidade de desenho (m/s) */
const V = 5;
/** o ponto fixo fica em y = 0 */
const XP = 4.4;

/** placa verde na beira da pista (ponto fixo do exemplo) */
function placa(x: number, y: number): Obj {
  return {
    parts: [box(x - 0.08, y - 0.08, 0, x + 0.08, y + 0.08, 2.2, '#d9dde2'), box(x - 0.1, y - 0.7, 1.6, x + 0.1, y + 0.7, 2.6, '#1f7a4d')],
    shadow: true,
  };
}

/** faixa amarela no chão, na altura do ponto fixo */
const linhaPonto = (o: number): Part[] => (o > 0.01 ? [rect(0.1, -0.15, 3.4, 0.15, AMAR, 0.02, 0.85 * o)] : []);

interface Seguir {
  /** quando o carro da frente passa pelo ponto */
  tp: number;
  /** distância em segundos */
  g: number;
  /** reduzir: a distância cresce até `+extra` segundos a partir de `tr` */
  tr?: number;
  extra?: number;
  /** o ponto é a placa em vez do poste */
  ponto?: 'poste' | 'placa' | 'nenhum';
  voce?: 'carro' | 'caminhao';
  /** destaque do ponto (faixa no chão) */
  linha?: number;
}

/** os dois veículos na estrada, com a câmera atrás de você */
function seguir(lt: number, s: Seguir, over: (pr: Parameters<NonNullable<Quadro['over']>>[0], yv: number, yf: number) => ReactNode): Quadro {
  const extra = s.extra && s.tr !== undefined ? s.extra * ease(clamp((lt - s.tr) / 1.6)) : 0;
  const yf = -V * (lt - s.tp);
  const yv = -V * (lt - s.tp - s.g - extra);
  const voce = s.voce === 'caminhao' ? utilitario({ x: XV, y: yv, tipo: 'caminhao' }) : car({ x: XV, y: yv, color: VOCE });
  const ponto: Obj[] = s.ponto === 'nenhum' ? [] : [s.ponto === 'placa' ? placa(XP, 0) : lampPost(XP, 0, -1)];
  return {
    cam: camLook(1.2, yv - 9, 0, 12, 36, 7.4),
    ground: [...ESTRADA, ...linhaPonto(s.linha ?? 0)],
    objs: [...CAMPO, ...ponto, car({ x: XV, y: yf, color: FRENTE }), voce],
    over: (pr) => over(pr, yv, yf),
  };
}

/** números da contagem, um ao lado do outro, cada um quando é falado */
function contagem(lt: number, inis: number[], y = 30): ReactNode {
  const nums = ['51', '52', '53'].slice(0, inis.length);
  const x0 = 160 - ((nums.length - 1) * 54) / 2;
  return nums.map((n, i) => (
    <g key={n}>
      {chip(x0 + i * 54, y, n, TINTA, surge(lt, inis[i], 0.2), 16)}
    </g>
  ));
}

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. distância dá tempo para reagir e para parar antes de bater
    case 0:
      return seguir(lt, { tp: 2, g: 2.4, ponto: 'nenhum' }, (pr, yv, yf) => (
        <>
          {tag(pr, [XV, yf, 1.6], 'Veículo da frente', surge(lt, 0.5))}
          {chip(90, 26, 'Tempo para reagir', AZ, surge(lt, 1.6), 10)}
          {chip(230, 26, 'Tempo para parar', VERDE, surge(lt, 2.8), 10)}
          {tag(pr, [XV, yv, 1.6], 'Você', surge(lt, 0.9))}
        </>
      ));
    // 1. escolha um ponto fixo, como um poste
    case 1:
      return seguir(lt, { tp: 4.0, g: 2.4, linha: surge(lt, 1.4) }, (pr) => (
        <>
          {chip(160, 186, 'Escolha um ponto fixo', AZ, surge(lt, 0.3), 11)}
          {tag(pr, [XP, 0, 4.9], 'Poste', surge(lt, 1.2))}
        </>
      ));
    // 2. o da frente passa pelo poste: conte devagar
    case 2:
      return seguir(lt, { tp: 2.6, g: 2.4, linha: 1 }, (pr) => (
        <>
          {tag(pr, [XP, 0, 4.9], 'Poste', 1)}
          {chip(160, 186, 'O da frente passou: conte devagar', AZ, surge(lt, 2.6), 10)}
          {contagem(lt, [2.8, 3.8])}
        </>
      ));
    // 3. passou depois de terminar a contagem: distância segura
    case 3:
      return seguir(lt, { tp: 0.3, g: 2.6, linha: 1 }, () => (
        <>
          {contagem(lt, [0.4, 1.4])}
          {chip(160, 186, 'Você passou depois da contagem', VERDE, surge(lt, 2.9), 10)}
          {visto(286, 30, surge(lt, 3.1), 12)}
          {chip(240, 60, 'Distância segura', VERDE, surge(lt, 3.1), 10)}
        </>
      ));
    // 4. passou antes de terminar: reduza e conte de novo
    case 4:
      return seguir(lt, { tp: 0.2, g: 1.1, tr: 1.6, extra: 1.5, linha: 1 }, () => (
        <>
          {contagem(lt, [0.3, 1.3])}
          {nao(286, 30, 13, surge(lt, 1.3))}
          {chip(150, 186, 'Passou antes de terminar', VERM, surge(lt, 1.3), 10)}
          {chip(240, 64, 'Reduza e conte de novo', LARANJA, surge(lt, 2.0), 10)}
        </>
      ));
    // 5. na chuva ou com veículo de mais de 6 m: conte até três
    case 5: {
      const grande = lt >= 3.4;
      return seguir(lt, { tp: grande ? 4.2 : 1.0, g: 3.2, voce: grande ? 'caminhao' : 'carro', linha: 1 }, (pr, yv) => (
        <>
          {chuva(lt, grande ? 0 : 0.85)}
          {escuro(0.9 * Math.max(0, 1 - Math.abs(lt - 3.4) / 0.2))}
          {chip(160, 186, 'Na chuva', AZ, surge(lt, 0.3) * (1 - surge(lt, 3.2)), 11)}
          {chip(160, 186, 'Veículo com mais de 6 metros', LARANJA, surge(lt, 3.4), 10)}
          {grande && tag(pr, [XV, yv, 4.0], 'Mais de 6 m', surge(lt, 3.6))}
          {chip(160, 62, 'Conte até 3', TINTA, surge(lt, 1.6), 11)}
          {contagem(lt, [4.6, 5.3, 6.0])}
        </>
      ));
    }
    // 6. a lei: distância de segurança na frente e dos lados
    case 6: {
      const yv = 2 - 2 * lt;
      const o = surge(lt, 0.8);
      const zona: Part[] =
        o > 0.01
          ? [
              rect(0.2, yv - 2.3 - 9, 3.3, yv - 2.3, VERDE, 0.02, 0.45 * o),
              rect(-0.15, yv - 2.2, 0.55, yv + 2.2, AMAR, 0.02, 0.6 * surge(lt, 2.0)),
              rect(2.95, yv - 2.2, 3.6, yv + 2.2, AMAR, 0.02, 0.6 * surge(lt, 2.0)),
            ]
          : [];
      return {
        cam: camLook(1.2, yv - 4, 0, 0, 66, 7.5, 160, 112),
        ground: [...ESTRADA, ...zona],
        objs: [...CAMPO, car({ x: XV, y: yv - 15, color: FRENTE }), car({ x: -XV, y: -20 + 3 * lt, heading: Math.PI, color: '#c0563f' }), car({ x: XV, y: yv, color: VOCE })],
        over: (pr) => {
          const [fx, fy] = pr([XV, yv - 7, 0]);
          const [lx, ly] = pr([3.9, yv, 0]);
          return (
            <>
              {chip(160, 22, 'A lei manda: distância de segurança', TINTA, surge(lt, 0.2), 10)}
              {chip(fx, fy, 'Na frente', VERDE, o, 10)}
              {chip(lx + 30, ly, 'Dos lados', '#b08a12', surge(lt, 2.0), 10)}
            </>
          );
        },
      };
    }
    // 7. Ana na rodovia: o carro da frente passa por uma placa
    case 7:
      return seguir(lt, { tp: 2.6, g: 2.6, ponto: 'placa', linha: surge(lt, 2.6) }, (pr, yv) => (
        <>
          {tag(pr, [XV, yv, 1.6], 'Ana', surge(lt, 0.3))}
          {tag(pr, [XP, 0, 3.2], 'Placa', surge(lt, 1.2))}
          {chip(160, 186, 'O da frente passa pela placa', AZ, surge(lt, 2.6), 10)}
        </>
      ));
    // 8. Ana conta e só depois passa pela placa: distância boa
    case 8:
      return seguir(lt, { tp: 0.8, g: 2.6, ponto: 'placa', linha: 1 }, (pr, yv) => (
        <>
          {tag(pr, [XV, yv, 1.6], 'Ana', 1)}
          {contagem(lt, [0.9, 1.9])}
          {chip(160, 186, 'Só depois ela passa pela placa', VERDE, surge(lt, 3.4), 10)}
          {visto(286, 30, surge(lt, 3.6), 12)}
          {chip(240, 60, 'Distância boa', VERDE, surge(lt, 3.6), 10)}
        </>
      ));
    // 9. para guardar
    default:
      return seguir(lt, { tp: 2, g: 2.4, ponto: 'nenhum' }, () => (
        <>
          {escuro(0.5)}
          {chip(160, 52, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {relogio(80, 96, 2 * Math.min(lt / 2, 1), surge(lt, 0.6), 12)}
          {chip(184, 96, 'Pista seca: 2 segundos', VERDE, surge(lt, 0.6), 11)}
          {relogio(56, 136, 3 * Math.min(Math.max(lt - 2, 0) / 3, 1), surge(lt, 2.0), 12)}
          {chip(184, 136, 'Chuva ou veículo grande: 3', LARANJA, surge(lt, 2.0), 11)}
        </>
      ));
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
