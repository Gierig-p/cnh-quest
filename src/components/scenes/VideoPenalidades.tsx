/**
 * Vídeo do cartão c4-penalidades ("Penalidade e medida administrativa"), Mundo 4, lote 1 de 16/11/2026.
 * A penalidade pune; a medida administrativa corrige na hora. As listas, a advertência por escrito,
 * reter e remover o veículo e o exemplo do passageiro sem cinto.
 * Tempos em content/videos/penalidades.json.
 */
import type { ReactNode } from 'react';
import { camLook } from './engine';
import { car, person } from './models';
import { utilitario } from './veiculos';
import { Balao } from './Mundo2';
import { AGENTE, Cabine, cone, zoomCabine } from './Mundo4';
import { NAT, TINTA, calendario, etiqueta, chip, item, papel, quadro, ruaFundo, surge, visto } from './infracoesUI';
import { RA, VOCE, ease, escuro, fazerVideo, lerp, relogio, type Quadro } from './videoBase';
import tempos from '../../content/videos/penalidades.json';

const XV = RA - 1.65;
const YP = 4;
const AZ = '#2f6db5';
const VM = '#d93a35';

/** o seu carro parado na beira da rua, com o agente ao lado e cones atrás */
function parado(extra: Quadro['objs'] = []): Quadro {
  const q = ruaFundo(0, [
    person(RA - 0.35, YP - 0.7, AGENTE, 0, -Math.PI / 2, 1.25, { r: [0.15, 0], l: [0.15, 0] }),
    cone(XV - 0.4, YP + 4), cone(XV + 0.4, YP + 5.2),
    ...extra,
  ], YP);
  return { ...q, cam: camLook(1.2, YP - 2.5, 0, -26, 38, 11) };
}

/** a lista de seis penalidades em duas colunas */
const PENAS = ['Advertência por escrito', 'Multa', 'Suspensão do direito de dirigir', 'Cassação da CNH', 'Cassação da Permissão para Dirigir', 'Curso de reciclagem'];
function listaPenas(vis: (i: number) => number, o = 1): ReactNode {
  return quadro(50, 18, 220, 164, o, (
    <>
      <text x={110} y={21} textAnchor="middle" fontSize={13} fontWeight={800} fill={VM}>Penalidades</text>
      {PENAS.map((t, i) => (
        <g key={t}>{item(14, 46 + i * 21, t, VM, vis(i), 10)}</g>
      ))}
    </>
  ));
}

const MEDIDAS = ['Reter o veículo', 'Remover o veículo', 'Recolher a CNH'];

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. a penalidade é a punição
    case 0: {
      const q = parado();
      return { ...q, over: () => (
        <>
          {papel(232, 28, 1.1, 'MULTA', VM, surge(lt, 1.4))}
          {chip(264, 122, 'Penalidade', VM, surge(lt, 2.6), 10)}
          {chip(264, 140, 'é a punição', TINTA, surge(lt, 3.4))}
        </>
      ) };
    }
    // 1. a medida administrativa: uma providência na hora, para corrigir
    case 1: {
      const q = parado();
      return { ...q, over: () => (
        <>
          {papel(232, 28, 1.1, 'MULTA', VM, 1 - surge(lt, 0.2))}
          {relogio(262, 56, lt / 4, surge(lt, 1.0), 16)}
          {chip(262, 92, 'Na hora', TINTA, surge(lt, 1.4))}
          {chip(250, 122, 'Medida administrativa', AZ, surge(lt, 3.6), 10)}
          {chip(250, 140, 'corrige o problema', TINTA, surge(lt, 4.2))}
        </>
      ) };
    }
    // 2 e 3. as seis penalidades
    case 2:
    case 3: {
      const q = parado();
      const a = k === 2 ? [1.6, 2.6, 3.3] : [];
      const b = k === 3 ? [1.0, 2.4, 4.3] : [];
      const vis = (i: number) => (i < 3 ? (k === 3 ? 1 : surge(lt, a[i])) : k === 2 ? 0 : surge(lt, b[i - 3]));
      return { ...q, over: () => (
        <>
          {escuro(0.45 * (k === 2 ? surge(lt, 0) : 1))}
          {listaPenas(vis, k === 2 ? surge(lt, 0.2) : 1)}
        </>
      ) };
    }
    // 4. leve ou média, sem outra infração em 12 meses: advertência por escrito no lugar da multa
    case 4: {
      const q = parado();
      const troca = surge(lt, 4.6, 0.5);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(52, 70, NAT[0].nome, NAT[0].cor, surge(lt, 0.6), 11)}
          {chip(52, 96, NAT[1].nome, NAT[1].cor, surge(lt, 1.0), 11)}
          {calendario(110, 52, '12 meses', surge(lt, 2.0), 1.2)}
          {visto(170, 56, surge(lt, 3.0), 9)}
          {chip(138, 124, 'nenhuma outra infração', TINTA, surge(lt, 2.6))}
          {papel(222, 40, 1.1, 'MULTA', VM, surge(lt, 3.6) * (1 - troca * 0.85))}
          {troca > 0.01 && (
            <g opacity={troca}>
              <line x1={222} y1={40} x2={286} y2={117} stroke={VM} strokeWidth={4} strokeLinecap="round" opacity={1 - troca * 0.6} />
              <g transform={`translate(${lerp(14, 0, troca)} ${lerp(10, 0, troca)})`}>{papel(232, 52, 1.1, 'ADVERTÊNCIA', AZ, troca)}</g>
            </g>
          )}
          {chip(267, 150, 'por escrito', AZ, surge(lt, 5.2))}
        </>
      ) };
    }
    // 5. as medidas administrativas
    case 5: {
      const q = parado();
      const a = [2.2, 3.6, 4.8];
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(56, 44, 208, 108, surge(lt, 0.1), (
            <>
              <text x={104} y={20} textAnchor="middle" fontSize={12} fontWeight={800} fill={AZ}>Medidas administrativas</text>
              {MEDIDAS.map((t, i) => <g key={t}>{item(36, 48 + i * 24, t, AZ, surge(lt, a[i]), 11)}</g>)}
            </>
          ))}
        </>
      ) };
    }
    // 6. reter: o carro fica parado até resolver
    case 6: {
      const q = parado();
      return { ...q, over: () => (
        <>
          {relogio(262, 44, lt / 2, surge(lt, 0.3), 14)}
          {etiqueta(196, 70, 118, 'Reter', 'Fica parado', AZ, surge(lt, 0.2))}
        </>
      ) };
    }
    // 7. remover: o carro é levado embora (guinchado)
    case 7: {
      const yt = YP - 6 - 3.2 * Math.max(0, lt - 0.4) * ease(lt / 1.2);
      const yc = yt + 6.2;
      const q = ruaFundo(0, [
        person(RA + 0.6, YP - 0.2, AGENTE, 0, Math.PI, 1.25),
        utilitario({ x: XV, y: yt, tipo: 'caminhao' }),
        car({ x: XV, y: yc, color: VOCE }),
      ], YP, 99); // sem o carro do fundo: o seu carro aqui é o que vai rebocado (senão aparecem dois)
      return { ...q, cam: camLook(1.2, YP - 5, 0, -26, 38, 11), over: (pr) => (
        <>
          <line {...linha(pr([XV, yt + 3.8, 0.7]), pr([XV, yc - 2.2, 0.5]))} stroke="#22262c" strokeWidth={2} />
          {etiqueta(196, 70, 118, 'Remover', 'Levado embora', AZ, surge(lt, 0.2))}
        </>
      ) };
    }
    // 8. passageiro sem cinto: infração grave, multa (penalidade)
    case 8: {
      const q = parado();
      return { ...q, over: (pr) => (
        <>
          <Balao at={pr([XV, YP - 0.3, 1.4])} x={12} y={8} w={108} h={96}>
            {zoomCabine('vpen-sem', <Cabine passageiro={{ cinto: false }} />)}
          </Balao>
          {chip(66, 116, 'Passageiro sem cinto', TINTA, surge(lt, 0.6))}
          {chip(246, 30, NAT[2].nome, NAT[2].cor, surge(lt, 2.4), 11)}
          {papel(222, 46, 0.95, 'MULTA', VM, surge(lt, 3.0))}
          {chip(250, 128, 'Penalidade', VM, surge(lt, 4.2), 10)}
        </>
      ) };
    }
    // 9. e o carro fica retido até ele pôr o cinto (medida administrativa)
    case 9: {
      const q = parado();
      const pos = surge(lt, 2.2, 0.5);
      return { ...q, over: (pr) => (
        <>
          <Balao at={pr([XV, YP - 0.3, 1.4])} x={12} y={8} w={108} h={96}>
            <g opacity={1 - pos}>{zoomCabine('vpen-sem2', <Cabine passageiro={{ cinto: false }} />)}</g>
            <g opacity={pos}>{zoomCabine('vpen-com', <Cabine passageiro={{ cinto: true }} />)}</g>
          </Balao>
          {visto(110, 18, pos, 8)}
          {etiqueta(196, 50, 118, 'Reter', 'Até pôr o cinto', AZ, surge(lt, 0.3))}
          {chip(255, 118, 'Medida administrativa', AZ, surge(lt, 3.0), 9.4)}
        </>
      ) };
    }
    // 10. para guardar
    default: {
      const q = parado();
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 34, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {etiqueta(30, 66, 124, 'Penalidade', 'Pune', VM, surge(lt, 0.7))}
          {etiqueta(166, 66, 124, 'Medida administrativa', 'Corrige na hora', AZ, surge(lt, 2.6))}
        </>
      ) };
    }
  }
}

const linha = ([x1, y1]: [number, number], [x2, y2]: [number, number]) => ({ x1, y1, x2, y2 });

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
