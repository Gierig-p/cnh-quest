/**
 * Vídeo do cartão c5-neblina ("Neblina, vento e ofuscamento"), Mundo 5, lote 4 de 17/11/2026.
 * Ver e ser visto; neblina (luz baixa, farol de neblina, distância, reduzir; nunca luz alta); parar num posto,
 * acostamento só em último caso com pisca-alerta; vento forte; fumaça de queimada; farol de frente (olhe a faixa
 * da direita); sol baixo (quebra-sol, óculos) e o exemplo do Rui na serra. Tempos em content/videos/neblina.json.
 */
import type { ReactNode } from 'react';
import { camLook } from './engine';
import { car } from './models';
import { utilitario } from './veiculos';
import { fumaca } from './Mundo3';
import { chipFarol, paisagem, posto, PR, SERRA } from './EscolhaNeblina';
import { TINTA, chip, nao, surge, visto } from './infracoesUI';
import { ease, escuro, farolPar, facho, fazerVideo, relogio, tag, type Pr, type Quadro } from './videoBase';
import { cabine } from './VideoPosicao';
import { AZ, LARANJA, VERDE, VERM, XV, OLHO, alerta, lanternas, regua, rodovia, serra, velocimetro, voce } from './defensivaUI';
import tempos from '../../content/videos/neblina.json';

const FRENTE = '#4f7fc4';

/** na serra com neblina: o seu carro e um carro à frente a `D` metros, com as lanternas acesas */
function comFrente(sC: number, D: number, nev: number, over: (pr: Pr) => ReactNode, alta = 0): Quadro {
  return serra(sC, [voce(XV, 0), car({ x: XV, y: -D, color: FRENTE })], (pr) => (
    <>
      {lanternas(pr, XV, -D, false, 'f')}
      {lanternas(pr, XV, 0)}
      {over(pr)}
    </>
  ), { nev, alta });
}

/** parado debaixo da cobertura do posto, com neblina */
function noPosto(nev: number, over: (pr: Pr) => ReactNode): Quadro {
  const sC = PR + 12;
  const y = (s: number) => -(s - sC);
  const p = posto(y);
  return {
    cam: camLook(8.5, 1, 0, 8, 36, 8.4, 160, 112),
    ground: [...SERRA, ...p.chao],
    objs: [...paisagem(sC, [PR + 0.5, PR + 16.5]).objs, ...p.objs, car({ x: 10.4, y: 0, heading: Math.PI / 2, color: '#e9eef3' })],
    over: (pr) => (
      <>
        <rect x={0} y={0} width={320} height={200} fill="#dde2e6" opacity={nev * 0.55} />
        {over(pr)}
      </>
    ),
  };
}

/** riscos de vento (pixels) cruzando a tela da esquerda para a direita, com folhas */
function vento(t: number, o: number): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} stroke="#ffffff" strokeLinecap="round" fill="none">
      {Array.from({ length: 9 }, (_, i) => {
        const y = 30 + i * 17 + 6 * Math.sin(i * 2.1);
        const x = ((t * 260 + i * 97) % 420) - 60;
        return <path key={i} d={`M${x} ${y} q20 -6 40 0 t40 0`} strokeWidth={1.4} opacity={0.75} />;
      })}
      {Array.from({ length: 7 }, (_, i) => {
        const x = ((t * 190 + i * 61) % 380) - 30;
        const y = 70 + i * 16 + 8 * Math.sin(t * 6 + i);
        return <ellipse key={`f${i}`} cx={x} cy={y} rx={2.6} ry={1.3} fill={i % 2 ? '#6f9a3f' : '#b88a2f'} stroke="none" transform={`rotate(${t * 300 + i * 40} ${x} ${y})`} />;
      })}
    </g>
  );
}

/** óculos de sol (pixels) */
const oculos = (x: number, y: number, o: number) =>
  o > 0.01 ? (
    <g opacity={o}>
      <rect x={x - 32} y={y - 16} width={64} height={32} rx={9} fill="#ffffff" />
      <path d={`M${x - 22} ${y - 4} h17 q0 11 -9 11 q-8 0 -8 -11 Z M${x + 5} ${y - 4} h17 q0 11 -9 11 q-8 0 -8 -11 Z`} fill="#1d2430" />
      <path d={`M${x - 5} ${y - 3} q5 -3 10 0 M${x - 22} ${y - 4} l-6 -3 M${x + 22} ${y - 4} l6 -3`} stroke="#1d2430" strokeWidth={1.6} fill="none" />
    </g>
  ) : null;

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. difícil enxergar: ver e ser visto, menos velocidade e a luz certa
    case 0:
      return comFrente(4 * lt, 12, 0.6, () => (
        <>
          {chip(110, 24, 'Ver e ser visto', TINTA, surge(lt, 1.6), 11)}
          {chip(90, 166, 'Menos velocidade', VERDE, surge(lt, 3.0), 10)}
          {chip(90, 188, 'A luz certa', VERDE, surge(lt, 3.8), 10)}
        </>
      ));
    // 1. neblina: luz baixa, farol de neblina se tiver, mais distância e reduzir
    case 1: {
      const D = 9 + 6 * ease((lt - 3.2) / 1.4);
      return comFrente(4 * lt - 0.5 * Math.max(0, lt - 3.2) ** 2 * 0.3, D, 0.75, (pr) => (
        <>
          {chipFarol(false, surge(lt, 0.8))}
          {chip(200, 24, 'Farol de neblina, se tiver', AZ, surge(lt, 1.8), 10)}
          {regua(pr, -2.3, -D + 2.3, 'Mais distância', surge(lt, 3.2), VERDE, 4.6)}
          {velocimetro(44, 160, 70 - 25 * ease((lt - 4.0) / 1.0), surge(lt, 3.9))}
        </>
      ));
    }
    // 2. na neblina, nunca luz alta: ela reflete nas gotinhas e você enxerga menos
    case 2: {
      const alta = ease((lt - 0.8) / 0.6);
      return comFrente(4 * lt, 12, 0.75, () => (
        <>
          {chipFarol(alta > 0.5, 1)}
          {nao(108, 55, 10, surge(lt, 1.6))}
          {chip(220, 160, 'Reflete nas gotinhas', LARANJA, surge(lt, 2.2), 10)}
          {chip(220, 184, 'Você enxerga menos', VERM, surge(lt, 3.4), 10)}
        </>
      ), alta);
    }
    // 3. difícil seguir: pare num local seguro, como um posto; acostamento só em último caso, com pisca-alerta
    case 3:
      if (lt < 4.3)
        return noPosto(0.7, () => (
          <>
            {chip(110, 24, 'Pare num local seguro', VERDE, surge(lt, 0.6), 11)}
            {chip(110, 48, 'Posto de combustível', AZ, surge(lt, 1.8), 10)}
            {visto(184, 48, surge(lt, 2.4), 9)}
          </>
        ));
      return serra(20, [car({ x: 4.9, y: 0, color: '#e9eef3' })], (pr) => (
        <>
          {escuro(0.9 * Math.max(0, 1 - (lt - 4.3) / 0.25))}
          {alerta(pr, 4.9, 0, lt)}
          {lanternas(pr, 4.9, 0)}
          {chip(160, 24, 'Acostamento: só em último caso', LARANJA, surge(lt, 4.5), 10)}
          {chip(160, 184, 'Com o pisca-alerta', AZ, surge(lt, 5.4), 11)}
        </>
      ), { nev: 0.6, cam: camLook(3.0, -8, 0, 10, 38, 10, 160, 104) });
    // 4. vento forte: observe a vegetação e reduza; caminhões passando e saídas de túnel também
    case 4: {
      const yv = 6 - 4 * lt;
      const yc = yv - 30 + 12 * Math.max(0, lt - 2.0);
      return rodovia(yv, [voce(XV, yv), utilitario({ x: -XV, y: yc, tipo: 'caminhao', heading: Math.PI })], () => (
        <>
          {vento(lt, 0.8)}
          {chip(90, 22, 'Vento forte', TINTA, surge(lt, 0.5), 11)}
          {chip(90, 46, 'Observe a vegetação', VERDE, surge(lt, 1.4), 10)}
          {chip(240, 22, 'Reduza', VERDE, surge(lt, 2.4), 11)}
          {chip(110, 166, 'Caminhões passando', LARANJA, surge(lt, 3.4), 10)}
          {chip(110, 188, 'Saídas de túnel', LARANJA, surge(lt, 4.6), 10)}
        </>
      ));
    }
    // 5. fumaça de queimada: reduza, luz baixa acesa e não pare na pista
    case 5: {
      const yv = 6 - 3 * lt;
      return rodovia(yv, [voce(XV, yv)], (pr) => {
        const focos = [[-12, -20], [-11, -32], [-14, -12], [11, -26]].map(([x, y]) => pr([x, y, 0]));
        return (
          <>
            {focos.map(([x, y], i) => (
              <g key={i}>
                <path d={`M${x - 6} ${y} q3 -8 6 -3 q3 -9 6 3 Z`} fill="#ea7b2c" />
                {fumaca(x, y - 4, 2.2 + i * 0.3)}
              </g>
            ))}
            <rect x={0} y={0} width={320} height={200} fill="#b9b3a8" opacity={0.38} />
            {lanternas(pr, XV, yv)}
            {chip(70, 22, 'Fumaça de queimada', TINTA, surge(lt, 0.4), 10)}
            {chip(250, 22, 'Reduza', VERDE, surge(lt, 1.4), 11)}
            {chipFarol(false, surge(lt, 2.0))}
            {chip(140, 184, 'Não pare na pista', VERM, surge(lt, 2.8), 11)}
            {nao(204, 184, 9, surge(lt, 2.8))}
          </>
        );
      });
    }
    // 6. ofuscado por um farol de frente: olhe para a faixa da direita
    case 6: {
      const yv = 6 - 3 * lt;
      const yo = -34 + 6 * lt;
      return rodovia(yv, [voce(XV, yv), car({ x: -XV, y: yo, heading: Math.PI, color: '#c0563f' })], (pr) => {
        const [gx, gy] = pr([-XV, yo + 2.2, 0.75]);
        const a = pr([3.42, yv - 2, 0]);
        const b = pr([3.42, yv - 30, 0]);
        return (
          <>
            {escuro(0.62)}
            {facho(pr, XV, yv, -1, 1, 0.22)}
            {facho(pr, -XV, yo, 1, 1, 0.25)}
            {lanternas(pr, XV, yv)}
            {farolPar(pr, -XV, yo, 1, 2.4)}
            <circle cx={gx} cy={gy} r={30 + 10 * ease(lt / 2)} fill="#fff8d8" opacity={0.35 * (1 - surge(lt, 2.6) * 0.6)} />
            <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#ffd84a" strokeWidth={4} opacity={0.75 * surge(lt, 1.8)} strokeLinecap="round" />
            {chip(100, 22, 'Farol de frente', TINTA, surge(lt, 0.4), 11)}
            {chip(200, 184, 'Olhe para a faixa da direita', VERDE, surge(lt, 1.8), 10)}
          </>
        );
      });
    }
    // 7. sol baixo no rosto: reduza e use o quebra-sol ou óculos de sol
    case 7: {
      const desce = ease((lt - 2.0) / 0.8);
      const ang = -14 + 76 * desce;
      return {
        ...rodovia(6 - 2 * lt, []),
        over: () => (
          <>
            <rect x={0} y={0} width={320} height={200} fill="#f6c46a" opacity={0.25} />
            {cabine({ dobra: 1, apoio: 1, lt })}
            <circle cx={300} cy={70} r={40} fill="#fff1b8" opacity={0.45 * (1 - 0.5 * desce)} />
            <circle cx={300} cy={70} r={16} fill="#ffe27a" />
            <line x1={284} y1={70} x2={OLHO[0] + 8} y2={OLHO[1]} stroke="#ffe27a" strokeWidth={3} opacity={0.6 * (1 - desce)} strokeDasharray="5 4" />
            <g transform={`rotate(${ang} 196 40)`}>
              <rect x={196} y={38} width={24} height={5} rx={1.5} fill="#5b6169" stroke="#2a2f36" strokeWidth={0.8} />
            </g>
            {chip(100, 22, 'Sol baixo no rosto', LARANJA, surge(lt, 0.4), 11)}
            {chip(250, 132, 'Reduza', VERDE, surge(lt, 1.2), 11)}
            {chip(224, 30, 'Quebra-sol', AZ, surge(lt, 2.0), 10)}
            {oculos(64, 150, surge(lt, 2.8))}
            {chip(64, 182, 'Óculos de sol', AZ, surge(lt, 2.8), 10)}
          </>
        ),
      };
    }
    // 8. Rui, de manhã cedo na serra: luz baixa, mais distância, reduz
    case 8: {
      const nev = 0.25 + 0.5 * ease((lt - 0.5) / 2.5);
      const D = 9 + 6 * ease((lt - 4.0) / 1.4);
      return comFrente(4 * lt, D, nev, (pr) => (
        <>
          {tag(pr, [XV, 0, 1.6], 'Rui', surge(lt, 1.0))}
          {chipFarol(false, surge(lt, 3.0))}
          {regua(pr, -2.3, -D + 2.3, 'Mais distância', surge(lt, 4.0), VERDE, 4.6)}
          {velocimetro(44, 160, 70 - 25 * ease((lt - 4.8) / 1.0), surge(lt, 4.6))}
        </>
      ));
    }
    // 9. quando quase não enxerga, ele para num posto e espera
    case 9:
      return noPosto(0.85, (pr) => (
        <>
          {tag(pr, [10.4, 0, 1.6], 'Rui', surge(lt, 0.3))}
          {chip(110, 24, 'Para num posto', VERDE, surge(lt, 0.6), 11)}
          {relogio(236, 172, lt * 0.5, surge(lt, 1.6), 11)}
          {chip(280, 172, 'Espera', AZ, surge(lt, 1.6), 10)}
        </>
      ));
    // 10. para guardar
    default:
      return comFrente(3 * lt, 12, 0.7, () => (
        <>
          {escuro(0.45)}
          {chip(160, 46, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {chip(160, 84, 'Neblina: luz baixa', VERDE, surge(lt, 0.6), 11)}
          {visto(222, 84, surge(lt, 0.8), 9)}
          {chip(150, 120, 'Nunca alta', VERM, surge(lt, 1.8), 11)}
          {nao(196, 120, 9, surge(lt, 1.8))}
        </>
      ));
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
