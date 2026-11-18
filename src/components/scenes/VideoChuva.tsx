/**
 * Vídeo do cartão c5-chuva ("Chuva e aquaplanagem"), Mundo 5, lote 4 de 17/11/2026.
 * A chuva tira visão e aderência (o pneu pode perder o contato com o chão), o começo da chuva com óleo e areia,
 * luz baixa + distância + velocidade menor, freada brusca (rodas travam; com ABS, pedal pressionado),
 * a poça (freie antes; em cima, não freie e segure o volante), granizo, pneus com sulcos e o exemplo da Carla.
 * Tempos em content/videos/chuva.json.
 */
import type { ReactNode } from 'react';
import { camLook, lines, type Obj, type Part } from './engine';
import { car } from './models';
import { chipFarol, posto, paisagem, PR, SERRA } from './EscolhaNeblina';
import { volanteFirme } from './EscolhaPoca';
import { TINTA, chip, nao, surge, visto } from './infracoesUI';
import { chuva, ease, escuro, fazerVideo, relogio, tag, type Pr, type Quadro } from './videoBase';
import {
  AZ, LARANJA, VERDE, VERM, XV, PE, anel, granizo, lanternas, mancha, naCabine, pneu, poca, regua, rodovia, velocimetro, voce,
} from './defensivaUI';
import tempos from '../../content/videos/chuva.json';

/** posição de quem anda a v0 e reduz para v1 entre a e b (metros andados) */
function anda(t: number, v0: number, v1: number, a: number, b: number): number {
  if (t <= a) return v0 * t;
  const u = Math.min(t, b) - a;
  const s = v0 * a + v0 * u + ((v1 - v0) * u * u) / (2 * (b - a));
  return t <= b ? s : s + v1 * (t - b);
}

/** poça grande na sua faixa, de YP - 2.6 a YP + 2.6 */
const YP = -10;
const POCA = poca(XV, YP, 1.9, 2.6, 5);

/** respingos (pixels) saindo das rodas quando o carro está na poça */
function respingos(pr: Pr, x: number, y: number, t: number): ReactNode {
  if (Math.abs(y - YP) > 3.6) return null;
  return (
    <g stroke="#e9f3fb" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.9}>
      {[-1, 1].flatMap((s) =>
        [-1.3, 1.3].map((a) => {
          const [px, py] = pr([x + s * 1.0, y + a, 0.1]);
          const b = 3 + 1.6 * Math.sin(t * 22 + s + a);
          return <path key={`${s}${a}`} d={`M${px} ${py} q${s * 5} ${-b * 2} ${s * 10} ${-b}`} />;
        }),
      )}
    </g>
  );
}

/** pneu de lado sobre a lâmina d'água (pixels): `k` = quanto ele sobe e perde o contato */
function aquaplana(x: number, y: number, k: number, o: number, t: number): ReactNode {
  if (o < 0.01) return null;
  const lev = 5 * k;
  return (
    <g opacity={o}>
      <rect x={x - 54} y={y - 46} width={108} height={84} rx={12} fill="#ffffff" opacity={0.95} />
      <rect x={x - 46} y={y + 18} width={92} height={10} fill="#5b6169" />
      <path d={`M${x - 46} ${y + 18} L${x + 46} ${y + 18} L${x + 46} ${y + 18 - 3 - lev * 0.4} Q${x + 18} ${y + 18 - 3 - lev} ${x} ${y + 18 - lev} L${x - 46} ${y + 15} Z`} fill="#6fb6ff" opacity={0.85} />
      <g transform={`translate(0 ${-lev})`}>
        <circle cx={x} cy={y - 4} r={22} fill="#25292f" />
        <circle cx={x} cy={y - 4} r={12} fill="#aab1b8" />
        <circle cx={x} cy={y - 4} r={3} fill="#5b6169" />
        <g transform={`rotate(${t * 400} ${x} ${y - 4})`}>
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={x + 7 * Math.cos((a * Math.PI) / 180)} cy={y - 4 + 7 * Math.sin((a * Math.PI) / 180)} r={1.4} fill="#5b6169" />)}
        </g>
      </g>
      {k > 0.5 && <path d={`M${x + 24} ${y + 12} q8 -8 16 -4`} stroke="#6fb6ff" strokeWidth={2} fill="none" />}
    </g>
  );
}

/** carro parado debaixo da cobertura do posto (granizo) */
function noPosto(over: Quadro['over'], nev = 0): Quadro {
  const sC = PR + 12;
  const y = (s: number) => -(s - sC);
  const p = posto(y);
  const pais = paisagem(sC, [PR + 0.5, PR + 16.5]);
  return {
    cam: camLook(8.5, 1, 0, 8, 36, 8.4, 160, 112),
    ground: [...SERRA, ...p.chao],
    objs: [...pais.objs, ...p.objs, car({ x: 10.4, y: 0, heading: Math.PI / 2, color: '#e9eef3' })],
    over: (pr) => (
      <>
        {nev > 0 && escuro(nev)}
        {over?.(pr)}
      </>
    ),
  };
}

/** marcas de pneu travado no chão (de y0 até o carro) */
const marcas = (x: number, y0: number, y1: number, o: number): Part[] =>
  o > 0.01 ? [lines([-0.8, 0.8].map((b) => ({ p: [[x + b, y0, 0.01], [x + b * 1.1, y1, 0.01]], c: '#22252a', w: 2.2 })))] : [];

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. a chuva diminui a visão e deixa a pista escorregadia; o pneu pode perder o contato
    case 0: {
      const yv = 6 - 4 * lt;
      return rodovia(yv, [voce(XV, yv), car({ x: -XV, y: -34 + 5 * lt, heading: Math.PI, color: '#c0563f' })], (pr) => (
        <>
          {chuva(lt, 0.9)}
          {lanternas(pr, XV, yv)}
          {respingos(pr, XV, yv, lt)}
          {chip(80, 22, 'Visão menor', AZ, surge(lt, 0.9), 11)}
          {chip(80, 46, 'Pista escorregadia', LARANJA, surge(lt, 2.0), 10)}
          {aquaplana(258, 118, ease((lt - 4.0) / 1.2), surge(lt, 3.6), lt)}
          {chip(258, 178, 'Perde o contato', VERM, surge(lt, 4.6), 9)}
        </>
      ), POCA);
    }
    // 1. o começo da chuva: água com óleo e areia, pista mais escorregadia
    case 1: {
      const yv = 6 - 3 * lt;
      return rodovia(yv, [voce(XV, yv)], (pr) => (
        <>
          {chuva(lt, 0.25 + 0.35 * ease(lt / 4))}
          {chip(160, 22, 'Começo da chuva', AZ, surge(lt, 0.5), 11)}
          {tag(pr, [XV, -8, 0.2], 'Óleo', surge(lt, 2.2))}
          {tag(pr, [XV, -17, 0.2], 'Areia', surge(lt, 2.6))}
          {chip(160, 184, 'A pista fica mais escorregadia', LARANJA, surge(lt, 3.6), 10)}
        </>
      ), [...mancha('oleo', XV, -8), ...mancha('areia', XV, -17)]);
    }
    // 2. luz baixa acesa, mais distância e velocidade menor
    case 2: {
      const yv = 6 - 3.4 * lt;
      const dist = 10 + 5 * ease((lt - 2.2) / 1.4);
      const yf = yv - dist;
      return rodovia(yv, [voce(XV, yv), car({ x: XV, y: yf, color: '#4f7fc4' })], (pr) => (
        <>
          {chuva(lt, 0.8)}
          {lanternas(pr, XV, yf, false, 'f')}
          {chipFarol(false, surge(lt, 0.8))}
          {regua(pr, yv - 2.3, yf + 2.3, 'Mais distância', surge(lt, 2.0), VERDE)}
          {velocimetro(282, 150, 80 - 20 * ease((lt - 3.2) / 1.0), surge(lt, 3.0))}
          {chip(264, 188, 'Velocidade menor', VERDE, surge(lt, 3.4), 9)}
        </>
      ));
    }
    // 3. não freie de forma brusca: rodas travam e o carro derrapa; com ABS, pise e mantenha
    case 3: {
      if (lt >= 3.6)
        return naCabine(lt, () => (
          <>
            {escuro(0.9 * Math.max(0, 1 - (lt - 3.6) / 0.25))}
            {chip(110, 24, 'Com ABS:', TINTA, surge(lt, 3.8), 11)}
            {chip(160, 48, 'pise e mantenha o pedal pressionado', VERDE, surge(lt, 4.2), 10)}
            {anel(PE[0], PE[1], 14, surge(lt, 4.2))}
          </>
        ), { vidro: 1 });
      const tr = Math.max(0, lt - 1.0);
      const yv = 4 - 6 * Math.min(lt, 1.0) - (6 * tr - 1.6 * tr * tr);
      const gira = 0.35 * Math.sin(Math.min(tr, 2.0) * 2.2) * Math.min(1, tr);
      return rodovia(yv, [car({ x: XV + 0.4 * Math.sin(tr * 1.4), y: yv, heading: gira, color: '#e9eef3', brake: lt > 1 })], (pr) => (
        <>
          {chuva(lt, 0.8)}
          {chip(100, 22, 'Freada brusca', VERM, surge(lt, 0.6), 11)}
          {nao(160, 22, 10, surge(lt, 0.6))}
          {chip(100, 46, 'As rodas travam', LARANJA, surge(lt, 1.4), 10)}
          {tag(pr, [XV, yv, 1.8], 'Derrapa', surge(lt, 2.0))}
        </>
      ), marcas(XV, -2, yv + 1.4, surge(lt, 1.1)));
    }
    // 4. viu uma poça? reduza antes de chegar nela, usando o freio
    case 4: {
      const yv = 10 - anda(lt, 6, 2.6, 1.0, 2.8);
      const freia = lt > 1.0 && lt < 2.8;
      return rodovia(yv, [voce(XV, yv, freia)], (pr) => (
        <>
          {chuva(lt, 0.7)}
          {lanternas(pr, XV, yv, freia)}
          {tag(pr, [XV, YP, 0.3], 'Poça', surge(lt, 0.5))}
          {chip(160, 184, 'Reduza antes, com o freio', VERDE, surge(lt, 1.2), 11)}
          {visto(262, 184, surge(lt, 2.6), 9)}
        </>
      ), POCA);
    }
    // 5. em cima da poça: não freie e segure firme o volante
    case 5: {
      const yv = YP + 4.5 - 2.6 * lt;
      return rodovia(yv, [voce(XV, yv)], (pr) => (
        <>
          {chuva(lt, 0.7)}
          {lanternas(pr, XV, yv)}
          {respingos(pr, XV, yv, lt)}
          {chip(90, 24, 'Em cima: não freie', VERM, surge(lt, 0.5), 11)}
          {nao(160, 24, 10, surge(lt, 0.5))}
          {volanteFirme(surge(lt, 1.5))}
        </>
      ), POCA);
    }
    // 6. granizo: pare em local seguro e espere passar
    case 6:
      return noPosto(() => (
        <>
          {granizo(lt, 0.9)}
          {chip(100, 22, 'Granizo', TINTA, surge(lt, 0.3), 11)}
          {chip(100, 46, 'Pare em local seguro', VERDE, surge(lt, 1.0), 10)}
          {relogio(236, 172, lt * 0.5, surge(lt, 2.2), 11)}
          {chip(280, 172, 'Espere', AZ, surge(lt, 2.2), 10)}
        </>
      ));
    // 7. pneus em bom estado e com sulcos fundos ajudam a não perder aderência
    case 7: {
      const yv = 6 - 3 * lt;
      return rodovia(yv, [voce(XV, yv)], () => (
        <>
          {chuva(lt, 0.6)}
          {escuro(0.55)}
          {pneu(110, 96, 0, surge(lt, 0.4), 1, surge(lt, 1.2), lt)}
          {chip(110, 160, 'Sulcos fundos', VERDE, surge(lt, 0.8), 11)}
          {visto(146, 52, surge(lt, 2.0), 10)}
          {pneu(214, 96, 1, surge(lt, 1.6))}
          {chip(214, 160, 'Gasto', VERM, surge(lt, 1.6), 11)}
          {nao(250, 52, 10, surge(lt, 2.0))}
          {chip(160, 188, 'Ajudam a não perder aderência', TINTA, surge(lt, 2.6), 10)}
        </>
      ));
    }
    // 8. Carla, na rodovia, debaixo de chuva, vê uma poça grande na faixa
    case 8: {
      const yv = 22 - 5.4 * lt;
      return rodovia(yv, [voce(XV, yv)], (pr) => (
        <>
          {chuva(lt, 0.85)}
          {lanternas(pr, XV, yv)}
          {tag(pr, [XV, yv, 1.6], 'Carla', surge(lt, 0.5))}
          {chip(160, 24, 'Poça grande na faixa', AZ, surge(lt, 2.4), 11)}
        </>
      ), POCA);
    }
    // 9. ela reduz com o freio antes e passa segurando firme o volante
    case 9: {
      const yv = 3 - anda(lt, 5.4, 2.6, 0.4, 1.8);
      const freia = lt > 0.4 && lt < 1.8;
      return rodovia(yv, [voce(XV, yv, freia)], (pr) => (
        <>
          {chuva(lt, 0.85)}
          {lanternas(pr, XV, yv, freia)}
          {respingos(pr, XV, yv, lt)}
          {tag(pr, [XV, yv, 1.6], 'Carla', 1)}
          {chip(80, 24, 'Freia antes', VERDE, surge(lt, 0.5), 11)}
          {volanteFirme(surge(lt, 2.2))}
        </>
      ), POCA);
    }
    // 10. para guardar
    default: {
      const yv = 6 - 2 * lt;
      return rodovia(yv, [voce(XV, yv)] as Obj[], () => (
        <>
          {chuva(lt, 0.6)}
          {escuro(0.5)}
          {chip(110, 40, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {chip(110, 84, 'Poça à frente: freie antes', VERDE, surge(lt, 0.6), 11)}
          {chip(110, 124, 'Em cima: segure firme', AZ, surge(lt, 2.0), 11)}
          {volanteFirme(surge(lt, 2.0))}
        </>
      ), POCA);
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
