/**
 * Vídeo do cartão c6-calma ("Calma e liderança"), Mundo 6, lote 1 de 18/11/2026.
 * Pare e pense, respire, confira você; quem organiza a ajuda; o exemplo de Lia e o filho no banco de trás.
 * Tempos em content/videos/calma.json.
 */
import type { ReactNode } from 'react';
import { person } from './models';
import { triangulo, fazerVideo, escuro, tag, type Quadro } from './videoBase';
import { TINTA, chip, item, nao, quadro, seta, surge, visto } from './infracoesUI';
import { naCabine } from './defensivaUI';
import {
  ACENA, APONTA, AZ, BATIDO, LARANJA, MOCA, MOCO, RAPAZ, SENHOR, SENHORA, TEL, VERDE, VERM, XB, YB,
  anda, cabeca, fone, local, pergunta, respiro,
} from './socorroUI';
import tempos from '../../content/videos/calma.json';

/** cabeça do motorista na cabine (dobra = 1) */
const HX = 158.5, HY = 70;

/** cabelo comprido preso, por cima do motorista da cabine: é a Lia */
function lia(): ReactNode {
  return (
    <g>
      <path d={`M${HX - 10} ${HY - 9} Q${HX - 18} ${HY - 2} ${HX - 16} ${HY + 10} Q${HX - 15} ${HY + 22} ${HX - 20} ${HY + 30} Q${HX - 10} ${HY + 26} ${HX - 9} ${HY + 12} Q${HX - 8} ${HY + 4} ${HX - 5} ${HY + 2} Z`} fill="#3a2a1f" />
      <circle cx={HX - 12} cy={HY - 4} r={3.2} fill="#d93a35" />
    </g>
  );
}

/** o filho sentado no banco de trás, de perfil, com o cinto */
function filho(lt: number, calmo: number): ReactNode {
  const x = 70, y = 104;
  const tremor = (1 - calmo) * Math.sin(lt * 30) * 0.8;
  return (
    <g transform={`translate(${tremor} 0)`}>
      <path d={`M${x - 12} 140 Q${x - 14} 122 ${x - 10} 116 Q${x - 4} 112 ${x + 4} 114 Q${x + 9} 120 ${x + 9} 140 Z`} fill="#f2c21b" />
      <rect x={x - 3} y={y + 7} width={7} height={6} rx={2} fill="#d7a77f" />
      <circle cx={x} cy={y} r={9} fill="#d7a77f" />
      <path d={`M${x + 7} ${y - 5} Q${x + 2} ${y - 12} ${x - 5} ${y - 10} Q${x - 11} ${y - 7} ${x - 10} ${y + 2} L${x - 6} ${y + 1} Q${x - 2} ${y - 4} ${x + 7} ${y - 5} Z`} fill="#7a4a25" />
      <circle cx={x + 5} cy={y - 1} r={1} fill={TINTA} />
      <path d={calmo > 0.5 ? `M${x + 4} ${y + 4.5} Q${x + 6} ${y + 6} ${x + 8} ${y + 4.5}` : `M${x + 4} ${y + 6} Q${x + 6} ${y + 4.5} ${x + 8} ${y + 6}`} fill="none" stroke="#9b5f45" strokeWidth={1} strokeLinecap="round" />
      <path d={`M${x - 8} 114 L${x + 7} 138`} stroke="#3a414a" strokeWidth={3.4} strokeLinecap="round" />
    </g>
  );
}

/** cabine parada com a Lia ao volante */
const cabineLia = (lt: number, over: () => ReactNode, extra: Parameters<typeof naCabine>[2] = {}) =>
  naCabine(lt, () => (
    <>
      {lia()}
      {over()}
    </>
  ), { parado: true, ...extra });

/** o local do sinistro com várias pessoas em volta */
const GRUPO = (lt: number) => [person(-1.2, -6.4, SENHOR, 0, Math.PI * 0.8, 1.25), person(-0.2, -4.6, SENHORA, 0, Math.PI, 1.25), person(4.4, -6.0, MOCO, 0, -Math.PI * 0.6, 1.25), anda(lt, MOCA, 4.6, 1.5, 3.8, -3.2, 0.2, 2.2, 1.25)];

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. susto e medo: atitudes desesperadas pioram tudo
    case 0: {
      const corre = Math.sin(lt * 5);
      const pe = person(1.0 + corre * 0.8, -7.6, RAPAZ, lt * 12, corre > 0 ? Math.PI / 2 : -Math.PI / 2, 1.25, { l: [1.4, 2.8], r: [1.4, 2.8] });
      return local(-8.6, 19, [...BATIDO(), pe], (pr) => {
        const [x, y] = pr(cabeca(1.0 + corre * 0.8, -7.6));
        return (
          <>
            {chip(160, 24, 'Susto e medo', VERM, surge(lt, 0.3), 11)}
            {chip(160, 176, 'Atitudes desesperadas pioram tudo', TINTA, surge(lt, 2.6), 10)}
            {nao(x, y - 16, 12, surge(lt, 3.4))}
          </>
        );
      });
    }
    // 1. pare e pense; respire fundo
    case 1:
      return cabineLia(lt, () => (
        <>
          {respiro(HX + 2, HY - 40, lt, surge(lt, 3.2))}
          {chip(250, 30, 'Pare e pense', AZ, surge(lt, 0.3), 11)}
          {chip(250, 56, 'Sem agir por impulso', TINTA, surge(lt, 1.6), 9)}
          {chip(250, 82, 'Respire fundo', VERDE, surge(lt, 3.4), 10)}
        </>
      ), { olho: lt > 3.2 ? 0.75 : 0 });
    // 2. veja se se feriu, avalie a gravidade, conforte quem está no carro
    case 2:
      return cabineLia(lt, () => (
        <>
          {filho(lt, 0.3)}
          {quadro(184, 14, 130, 74, 1, (
            <>
              {item(8, 20, 'Você se feriu?', AZ, surge(lt, 0.3), 9.5)}
              {item(8, 42, 'Gravidade', LARANJA, surge(lt, 1.6), 9.5)}
              {item(8, 64, 'Conforte quem está', VERDE, surge(lt, 3.0), 9.5)}
            </>
          ))}
          {chip(249, 98, 'no seu veículo', VERDE, surge(lt, 3.0), 9)}
        </>
      ));
    // 3. alguém precisa organizar; se alguém já tomou a frente, ofereça ajuda
    case 3:
      return local(-5.5, 16, [...BATIDO(), person(0.6, -6.8, SENHOR, 0, Math.PI * 0.9, 1.25, APONTA), anda(lt, MOCA, 4.6, 1.5, 1.4, -3.6, 0.2, 2.6, 1.25)], (pr) => (
        <>
          {chip(160, 22, 'Alguém precisa organizar a ajuda', TINTA, surge(lt, 0.2), 10)}
          {tag(pr, cabeca(0.6, -6.8), 'Já tomou a frente', surge(lt, 1.8))}
          {lt > 2.4 && tag(pr, cabeca(1.4, -3.6), 'Ofereça ajuda', surge(lt, 2.8))}
        </>
      ));
    // 4. ninguém tomou: procure um médico, bombeiro, policial
    case 4:
      return local(-4.4, 16, [...BATIDO(), ...GRUPO(lt)], (pr) => (
        <>
          {chip(160, 22, 'Alguém mais preparado?', TINTA, surge(lt, 0.2), 10)}
          {pergunta(pr, cabeca(-1.2, -6.4), 'Médico?', surge(lt, 1.6))}
          {pergunta(pr, cabeca(-0.2, -4.6), 'Bombeiro?', surge(lt, 2.4))}
          {pergunta(pr, cabeca(4.4, -6.0), 'Policial?', surge(lt, 3.2))}
        </>
      ));
    // 5. ninguém mais preparado: assuma, distribua tarefas, sem discutir
    case 5:
      return local(-2.5, 14.5, [...BATIDO(), person(-1.2, -6.4, SENHOR, 0, Math.PI, 1.25, TEL), anda(lt, MOCO, 4.4, -6.0, 3.6, 4.6, 2.4, 5.2, 1.25), person(-0.2, -3.2, SENHORA, 0, Math.PI, 1.25), person(2.4, -3.0, MOCA, 0, -Math.PI * 0.5, 1.25, APONTA)], (pr) => (
        <>
          {lt > 1.4 && fone(pr, -1.2, -6.4)}
          {tag(pr, cabeca(2.4, -3.0), 'Assume', surge(lt, 0.3))}
          {pergunta(pr, cabeca(-1.2, -6.4), 'Telefonar', surge(lt, 1.4))}
          {pergunta(pr, cabeca(4.4 + (3.6 - 4.4) * Math.min(1, Math.max(0, (lt - 2.4) / 2.8)), -6 + 10.6 * Math.min(1, Math.max(0, (lt - 2.4) / 2.8))), 'Sinalizar', surge(lt, 2.2))}
          {chip(160, 182, 'Firmeza, sem discutir', TINTA, surge(lt, 3.8), 10)}
        </>
      ));
    // 6. quem lidera também trabalha; agradeça e elogie
    case 6:
      return local(-2, 14.5, [...BATIDO(), person(-1.2, -6.4, SENHOR, 0, Math.PI, 1.25, TEL), person(3.6, 4.6, MOCO, 0, Math.PI, 1.25, ACENA(lt)), triangulo(3.6, 6.4), anda(lt, MOCA, 2.4, -3.0, 0.4, -8.6, 0.3, 2.2, 1.25)], (pr) => (
        <>
          {fone(pr, -1.2, -6.4)}
          {chip(160, 22, 'Quem lidera também trabalha', AZ, surge(lt, 0.2), 10)}
          {chip(160, 182, 'Agradeça e elogie', VERDE, surge(lt, 3.2), 10)}
          {visto(...(pr(cabeca(3.6, 4.6)).map((v, i) => v - (i ? 14 : 0)) as [number, number]), surge(lt, 3.6))}
        </>
      ));
    // 7. exemplo: Lia para, respira e vê que não se machucou
    case 7:
      return cabineLia(lt, () => (
        <>
          {filho(lt, 0)}
          {chip(HX, 18, 'Lia', VERM, surge(lt, 0.2), 11)}
          {respiro(250, 44, lt, surge(lt, 1.6))}
          {chip(250, 92, 'Não se machucou', VERDE, surge(lt, 3.4), 10)}
          {visto(250, 114, surge(lt, 3.6), 9)}
        </>
      ), { olho: lt > 1.6 && lt < 3.2 ? 0.75 : 0 });
    // 8. ela acalma o filho no banco de trás
    case 8:
      return cabineLia(lt, () => (
        <>
          {filho(lt, Math.min(1, lt / 2))}
          {seta(HX - 22, HY + 4, 90, 98, surge(lt, 0.4), '#ffd84a')}
          {chip(70, 70, 'Acalma o filho', VERDE, surge(lt, 0.6), 10)}
        </>
      ));
    // 9. só então sai do carro para ajudar
    case 9:
      return local(-9, 17, [...BATIDO(), anda(lt, MOCA, XB - 1.4, YB + 0.6, -0.6, -6.0, 0.4, 2.6, 1.25)], (pr) => (
        <>
          {chip(160, 22, 'Só então sai para ajudar', VERDE, surge(lt, 0.3), 10)}
          {tag(pr, cabeca(-0.6, -6.0), 'Lia', surge(lt, 2.2))}
        </>
      ));
    // 10. para guardar
    default: {
      const P: [string, string][] = [['Pare', AZ], ['Respire', VERDE], ['Confira você', LARANJA], ['Aja', VERM]];
      return local(-9, 12, [...BATIDO()], () => (
        <>
          {escuro(0.45)}
          {chip(160, 30, 'Para guardar', TINTA, 1, 11)}
          {P.map(([t, c], i) => (
            <g key={t}>
              {chip(160, 66 + i * 32, t, c, surge(lt, 0.3 + i * 0.7), 12)}
              {i < 3 && surge(lt, 0.6 + i * 0.7) > 0.01 && <path d={`M160 ${78 + i * 32} l0 8 m-4 -4 l4 4 l4 -4`} stroke="#fff" strokeWidth={2} fill="none" opacity={surge(lt, 0.6 + i * 0.7)} />}
            </g>
          ))}
        </>
      ));
    }
  }
}


export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
