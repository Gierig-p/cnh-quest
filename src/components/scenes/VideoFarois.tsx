/**
 * Vídeo do cartão c3-farois ("Faróis: ver e ser visto"), lote 3 de 15/11/2026.
 * Um trecho por fala (tempos em content/videos/farois.json).
 */
import type { ReactNode } from 'react';
import { box, camLook, rect, type Obj, type Part, type V3 } from './engine';
import { car } from './models';
import { campo, estrada } from './Mundo2';
import { bairro, cruzamento } from './Mundo1';
import { onibus } from './Mundo3';
import { AV, AV_OBJS, FX, VOCE, certo, chuva, ease, faixa, fazerVideo, janela, lerp, moto, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/farois.json';

const ESTRADA = estrada('tracejada');
const CAMPO = campo(6);
const CY = -9;
const CRUZ = cruzamento(CY);
const BAIRRO = bairro(CY, 4);
const AMARELADA = '#fff6c8';

/** escuridão da noite (ou do fim de tarde, com `o` menor) */
const escuro = (o: number, cor = '#070d22'): ReactNode => <rect x={0} y={0} width={320} height={200} fill={cor} opacity={o} />;

/** luzinha redonda em pixels */
function luz(pr: Pr, p: V3, r: number, cor: string, k: string): ReactNode {
  const [x, y] = pr(p);
  return (
    <g key={k}>
      <circle cx={x} cy={y} r={r * 2.2} fill={cor} opacity={0.25} />
      <circle cx={x} cy={y} r={r} fill={cor} />
    </g>
  );
}

/** os dois faróis acesos de um carro; `dir` -1 = indo para o norte, 1 = indo para o sul */
const farois = (pr: Pr, x: number, y: number, dir: 1 | -1, r = 1.6) => [-0.6, 0.6].map((dx) => luz(pr, [x + dx, y + dir * 2.15, 0.75], r, AMARELADA, `f${dx}`));
const lanternas = (pr: Pr, x: number, y: number, dir: 1 | -1) => [-0.6, 0.6].map((dx) => luz(pr, [x + dx, y - dir * 2.15, 0.85], 1.3, '#ff3b30', `l${dx}`));

/** cone de luz no chão, à frente do carro */
function cone(pr: Pr, x: number, y: number, dir: 1 | -1, alcance: number, abre: number, o: number): ReactNode {
  if (o <= 0.01) return null;
  const yf = y + dir * 2.1;
  const pts: V3[] = [[x - 0.7, yf, 0], [x + 0.7, yf, 0], [x + abre, yf + dir * alcance, 0], [x - abre, yf + dir * alcance, 0]];
  const d = 'M' + pts.map((p) => pr(p).map((v) => v.toFixed(1)).join(' ')).join('L') + 'Z';
  return <path d={d} fill="#fff4c8" opacity={o} />;
}

/** luz baixa (k = 0) até luz alta (k = 1) */
const facho = (pr: Pr, x: number, y: number, dir: 1 | -1, k: number, o = 0.3) => cone(pr, x, y, dir, lerp(8, 28, k), lerp(2.2, 4.4, k), o);
const camEstrada = (y: number) => camLook(1.2, y - 8.5, 0, 12, 36, 8.5);

/* túnel: paredes e teto de concreto; por dentro, chão escuro */
const TY = -10;
const TUNEL_CHAO: Part[] = [...ESTRADA, rect(-6.7, TY - 40, 6.7, TY, '#1b2027', 0.02)];
const TUNEL: Obj[] = [
  { parts: [box(-8.5, TY - 40, 0, -6.7, TY, 4.6, '#a7aaa6'), box(6.7, TY - 40, 0, 8.5, TY, 4.6, '#a7aaa6'), box(-8.5, TY - 40, 4.6, 8.5, TY, 5.4, '#8f938e')], shadow: true },
];

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. o farol serve para ver e, principalmente, para ser visto
    case 0: {
      const yv = 3 - 3 * lt, yo = -34 + 4 * lt;
      return {
        cam: camEstrada(yv),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: -1.75, y: yo, heading: Math.PI, color: '#4f7fc4' }), car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {escuro(0.42, '#2a1d3a')}
            {facho(pr, 1.75, yv, -1, 0, 0.26)}
            {farois(pr, 1.75, yv, -1)}
            {farois(pr, -1.75, yo, 1)}
            {tag(pr, [1.75, yv - 8, 0.6], 'Ver', janela(lt, 0.3, d))}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Ser visto', ease((lt - 1.8) / 0.4))}
          </>
        ),
      };
    }
    // 1. à noite, luz baixa
    case 1: {
      const yv = 5 - 3 * lt;
      return {
        cam: camLook(1.2, yv - 6, 0, 14, 42, 10),
        ground: CRUZ,
        objs: [...BAIRRO, car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {escuro(0.6)}
            {facho(pr, 1.75, yv, -1, 0, 0.3)}
            {farois(pr, 1.75, yv, -1)}
            {lanternas(pr, 1.75, yv, -1)}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'À noite: luz baixa', janela(lt, 0.2, d))}
          </>
        ),
      };
    }
    // 2. de dia também: túnel, chuva, neblina ou cerração
    case 2: {
      if (lt < 1.5) {
        const yv = 3 - 3 * lt;
        return {
          cam: camEstrada(yv),
          ground: ESTRADA,
          objs: [...CAMPO, car({ x: 1.75, y: yv, color: VOCE })],
          over: (pr) => (
            <>
              {farois(pr, 1.75, yv, -1, 1.8)}
              {tag(pr, [1.75, yv + 0.4, 2.2], 'De dia também', janela(lt, 0.2, 1.5, 0.2))}
            </>
          ),
        };
      }
      if (lt < 2.7) {
        const u = lt - 1.5, yv = TY + 9 - 4 * u;
        return {
          cam: camLook(1.2, TY + 3, 0, 14, 38, 9),
          ground: TUNEL_CHAO,
          objs: [...CAMPO, ...TUNEL, car({ x: 1.75, y: yv, color: VOCE })],
          over: (pr) => (
            <>
              {farois(pr, 1.75, yv, -1, 1.8)}
              {tag(pr, [0, TY, 6.2], 'No túnel', janela(u, 0.1, 1.2, 0.2))}
            </>
          ),
        };
      }
      const nevoa = lt >= 3.8;
      const u = nevoa ? lt - 3.8 : lt - 2.7, yv = 3 - 3 * u;
      return {
        cam: camEstrada(yv),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: -1.75, y: yv - 14 + 6 * u, heading: Math.PI, color: '#8f98a3' }), car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {nevoa ? <rect x={0} y={0} width={320} height={200} fill="#dfe3e8" opacity={0.62} /> : chuva(lt, 1)}
            {farois(pr, 1.75, yv, -1, 1.8)}
            {farois(pr, -1.75, yv - 14 + 6 * u, 1, 1.6)}
            {tag(pr, [1.75, yv + 0.4, 2.2], nevoa ? 'Neblina ou cerração' : 'Com chuva', janela(u, 0.1, nevoa ? d : 1.1, 0.2))}
          </>
        ),
      };
    }
    // 3. estrada sem iluminação: luz alta
    case 3: {
      const yv = 3 - 3 * lt;
      return {
        cam: camEstrada(yv),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {escuro(0.7)}
            {facho(pr, 1.75, yv, -1, ease((lt - 0.3) / 0.5), 0.28)}
            {farois(pr, 1.75, yv, -1, 1.8)}
            {lanternas(pr, 1.75, yv, -1)}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Sem iluminação: luz alta', janela(lt, 0.5, d))}
          </>
        ),
      };
    }
    // 4. carro vindo de frente: troque pela baixa
    case 4: {
      const yv = 3 - 3 * lt, yo = yv - 30 + 7 * lt;
      const alta = 1 - ease((lt - 1.5) / 0.4);
      return {
        cam: camEstrada(yv),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: -1.75, y: yo, heading: Math.PI, color: '#4f7fc4' }), car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {escuro(0.68)}
            {facho(pr, 1.75, yv, -1, alta, 0.28)}
            {facho(pr, -1.75, yo, 1, 0, 0.22)}
            {farois(pr, -1.75, yo, 1, 2)}
            {farois(pr, 1.75, yv, -1, 1.8)}
            {lanternas(pr, 1.75, yv, -1)}
            {tag(pr, [-1.75, yo + 0.4, 2.2], 'Carro de frente', janela(lt, 0.4, 1.9))}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Luz baixa', ease((lt - 1.9) / 0.4))}
          </>
        ),
      };
    }
    // 5. logo atrás de outro carro: luz baixa
    case 5: {
      const yv = 3 - 3 * lt, yf = yv - 9 + 0.6 * lt;
      const alta = 1 - ease((lt - 1.2) / 0.4);
      return {
        cam: camEstrada(yv),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: 1.75, y: yf, color: '#e0a43a' }), car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {escuro(0.68)}
            {facho(pr, 1.75, yv, -1, alta * 0.7, 0.26)}
            {lanternas(pr, 1.75, yf, -1)}
            {farois(pr, 1.75, yv, -1, 1.8)}
            {lanternas(pr, 1.75, yv, -1)}
            {tag(pr, [1.75, yf + 0.4, 2.2], 'Carro logo à frente', janela(lt, 0.3, 1.7))}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Luz baixa', ease((lt - 1.7) / 0.4))}
          </>
        ),
      };
    }
    // 6. motos: farol baixo de dia e de noite; ônibus nas faixas só deles também
    case 6: {
      if (lt < 2.7) {
        const ym = 3 - 5 * lt;
        return {
          cam: camLook(1.5, ym - 3, 0, 16, 44, 9.2),
          ground: AV,
          objs: [...AV_OBJS, moto(FX[2], ym), car({ x: FX[0], y: ym + 5, color: '#8f98a3' })],
          over: (pr) => (
            <>
              {luz(pr, [FX[2], ym - 0.85, 1.0], 1.8, AMARELADA, 'm')}
              {tag(pr, [FX[2], ym, 2.4], 'Moto: farol sempre aceso', janela(lt, 0.2, 2.6, 0.2))}
            </>
          ),
        };
      }
      const u = lt - 2.7, yb = 4 - 4 * u;
      return {
        cam: camLook(1.5, yb - 4, 0, 16, 44, 10),
        ground: [...AV, ...faixa(2, '#d9534f', 0.3)],
        objs: [...AV_OBJS, onibus(FX[2], yb)],
        over: (pr) => (
          <>
            {[-0.8, 0.8].map((dx) => luz(pr, [FX[2] + dx, yb - 5.65, 0.9], 1.8, AMARELADA, `o${dx}`))}
            {tag(pr, [FX[2], yb, 3.8], 'Faixa só de ônibus', janela(u, 0.2, 1.4))}
            {tag(pr, [FX[2], yb, 3.8], 'Farol aceso', ease((u - 1.5) / 0.4))}
          </>
        ),
      };
    }
    // 7. carro sem luz própria para o dia: farol aceso na rodovia de pista simples, fora da cidade
    case 7: {
      const yv = 3 - 3 * lt, yo = yv - 36 + 5 * lt;
      return {
        cam: camEstrada(yv),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: -1.75, y: yo, heading: Math.PI, color: '#e0412f' }), car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {farois(pr, 1.75, yv, -1, 1.8)}
            {farois(pr, -1.75, yo, 1, 1.6)}
            {tag(pr, [0, yv - 6, 0.4], 'Pista simples', janela(lt, 0.2, 2.3))}
            {tag(pr, [-9, yv - 9, 1.2], 'Fora da cidade', janela(lt, 2.2, 4.0))}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Farol aceso de dia', ease((lt - 3.9) / 0.4))}
          </>
        ),
      };
    }
    // 8. para guardar: alguém de frente ou logo à frente? luz baixa
    default: {
      const yv = 3 - 3 * lt, yf = yv - 10 + 0.5 * lt, yo = yv - 30 + 6 * lt;
      const alta = 1 - ease((lt - 1.6) / 0.4);
      return {
        cam: camEstrada(yv),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: -1.75, y: yo, heading: Math.PI, color: '#4f7fc4' }), car({ x: 1.75, y: yf, color: '#e0a43a' }), car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {escuro(0.66)}
            {facho(pr, 1.75, yv, -1, alta * 0.7, 0.26)}
            {farois(pr, -1.75, yo, 1, 2)}
            {lanternas(pr, 1.75, yf, -1)}
            {farois(pr, 1.75, yv, -1, 1.8)}
            {tag(pr, [-1.75, yo + 0.4, 2.2], 'De frente', janela(lt, 0.3, 1.8))}
            {tag(pr, [1.75, yf + 0.4, 2.2], 'Logo à frente', janela(lt, 0.8, 1.8))}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Luz baixa', janela(lt, 2.0, 3.0))}
            {certo(pr, [1.75, yv - 0.6, 3.0], ease((lt - 3.1) / 0.4))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
