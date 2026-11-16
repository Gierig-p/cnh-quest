/**
 * Vídeo do cartão c4-defesa-recurso ("Defesa, recurso e desconto"), Mundo 4, lote 4 de 16/11/2026.
 * Defesa prévia (30 dias ou mais); notificação da penalidade (30 dias ou mais, que é o vencimento); JARI; novo
 * recurso ao CETRAN (no DF, CONTRANDIFE); 20% de desconto pagando em dia; 40% com a notificação eletrônica.
 * Tempos em content/videos/defesa-recurso.json.
 */
import type { ReactNode } from 'react';
import { NAT, TINTA, calendario, chip, etiqueta, item, papel, quadro, ruaFundo, seta, surge, visto } from './infracoesUI';
import { escuro, fazerVideo, type Quadro } from './videoBase';
import tempos from '../../content/videos/defesa-recurso.json';

const VM = NAT[3].cor;
const AZ = '#2f6db5';
const VD = '#2fa36b';

/** o caminho da multa, de cima para baixo; `vis(i)` diz quanto cada passo aparece e `dest` acende um deles */
const PASSOS: { t: string; sub: string; cor: string }[] = [
  { t: 'Notificação da autuação', sub: '', cor: AZ },
  { t: 'Defesa prévia', sub: '30 dias ou mais', cor: VD },
  { t: 'Notificação da penalidade', sub: '', cor: VM },
  { t: '1º recurso: JARI', sub: '30 dias ou mais', cor: VD },
  { t: 'Novo recurso: CETRAN', sub: 'em 30 dias', cor: VD },
];
function caminho(vis: (i: number) => number, dest: number | null, o = 1): ReactNode {
  return quadro(50, 14, 220, 172, o, (
    <>
      {PASSOS.map((p, i) => {
        const a = vis(i);
        if (a < 0.01) return null;
        const y = 22 + i * 32;
        const on = dest === null || dest === i;
        return (
          <g key={p.t} opacity={a * (on ? 1 : 0.4)}>
            {i > 0 && <line x1={22} y1={y - 24} x2={22} y2={y - 8} stroke="#c9ced6" strokeWidth={2.4} />}
            <circle cx={22} cy={y} r={dest === i ? 8 : 6.5} fill={p.cor} />
            <text x={38} y={y + 4} fontSize={dest === i ? 11.5 : 10.5} fontWeight={800} fill={TINTA}>{p.t}</text>
            {p.sub && <text x={38} y={y + 17} fontSize={8.6} fontWeight={800} fill="#55606e">{p.sub}</text>}
          </g>
        );
      })}
    </>
  ));
}

function trecho(k: number, lt: number): Quadro {
  const q = ruaFundo(lt);
  switch (k) {
    // 0. direito de se defender; desconto para quem paga
    case 0:
      return { ...q, over: () => (
        <>
          {escuro(0.4 * surge(lt, 0.2))}
          {chip(160, 74, 'Defender-se', AZ, surge(lt, 0.4), 13)}
          {chip(160, 112, 'ou pagar com desconto', VD, surge(lt, 2.6), 13)}
        </>
      ) };
    // 1. defesa prévia
    case 1:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {caminho((i) => (i === 0 ? surge(lt, 0.2) : i === 1 ? surge(lt, 1.8) : 0), 1)}
        </>
      ) };
    // 2. notificação da penalidade e o prazo para recorrer
    case 2:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {caminho((i) => (i < 2 ? 1 : i === 2 ? surge(lt, 0.4) : i === 3 ? surge(lt, 2.8) : 0), surge(lt, 2.8) > 0.5 ? 3 : 2)}
        </>
      ) };
    // 3. essa data é o vencimento
    case 3:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {calendario(121, 36, '30 dias', surge(lt, 0.1), 1.7)}
          {chip(160, 128, 'Prazo para recorrer', TINTA, surge(lt, 0.3), 10.5)}
          {chip(160, 154, 'É também o vencimento da multa', VM, surge(lt, 0.8), 10.5)}
        </>
      ) };
    // 4. a JARI
    case 4:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 50, '1º recurso', VD, surge(lt, 0.2), 12)}
          {etiqueta(28, 76, 264, 'JARI', 'Junta Administrativa de Recursos de Infrações', AZ, surge(lt, 1.0))}
        </>
      ) };
    // 5. novo recurso: CETRAN (no DF, CONTRANDIFE)
    case 5:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {caminho((i) => (i < 4 ? 1 : surge(lt, 0.6)), 4, 1 - surge(lt, 5.4))}
          {etiqueta(60, 46, 200, 'Em geral', 'CETRAN do seu estado', VD, surge(lt, 5.4))}
          {chip(160, 128, 'No Distrito Federal: CONTRANDIFE', TINTA, surge(lt, 6.4), 10)}
        </>
      ) };
    // 6. pagar até o vencimento: 80%
    case 6:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {papel(40, 36, 1.4, 'MULTA', VM, surge(lt, 0.2), '100%')}
          {chip(234, 40, 'Até o vencimento', AZ, surge(lt, 0.8), 10)}
          {chip(234, 72, 'Paga 80%', TINTA, surge(lt, 2.4), 13, '#fff')}
          {chip(234, 112, '20% de desconto', VD, surge(lt, 3.6), 12)}
        </>
      ) };
    // 7. pagar não impede de recorrer
    case 7:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {visto(110, 90, surge(lt, 0.1), 12)}
          {chip(110, 126, 'Pagou', VD, surge(lt, 0.1), 12)}
          {chip(220, 108, 'Ainda pode recorrer', AZ, surge(lt, 0.8), 11)}
        </>
      ) };
    // 8. notificação eletrônica: 60%
    case 8:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(30, 24, 260, 92, surge(lt, 0.2), (
            <>
              {item(14, 26, 'Aderiu à notificação eletrônica', AZ, surge(lt, 0.4), 10.5)}
              <text x={28} y={42} fontSize={8.6} fontWeight={800} fill="#55606e">antes de receber a notificação</text>
              {item(14, 70, 'Abriu mão da defesa e do recurso', AZ, surge(lt, 3.6), 10.5)}
            </>
          ))}
          {chip(110, 148, 'Paga 60%', TINTA, surge(lt, 5.8), 13, '#fff')}
          {chip(220, 148, '40% de desconto', VD, surge(lt, 7.2), 12)}
        </>
      ) };
    // 9 e 10. exemplo: multa grave de R$ 195,23 paga em dia
    case 9:
    case 10:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {papel(30, 30, 1.4, 'MULTA', NAT[2].cor, k === 9 ? surge(lt, 0.4) : 1, 'R$ 195,23')}
          {chip(70, 146, 'Grave', NAT[2].cor, k === 9 ? surge(lt, 1.2) : 1, 11)}
          {chip(70, 170, 'Sem recurso', TINTA, k === 9 ? surge(lt, 4.4) : 1, 10)}
          {k === 10 && seta(130, 80, 170, 80, surge(lt, 0.4))}
          {k === 10 && chip(234, 56, 'Paga 80%', TINTA, surge(lt, 1.0), 12, '#fff')}
          {k === 10 && chip(234, 96, 'R$ 156,18', VD, surge(lt, 2.6), 16)}
        </>
      ) };
    // 11. para guardar
    default:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 30, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {chip(80, 66, 'Defesa prévia', TINTA, surge(lt, 0.5), 10.5)}
          {chip(160, 66, 'JARI', TINTA, surge(lt, 1.0), 10.5)}
          {chip(232, 66, 'CETRAN', TINTA, surge(lt, 1.5), 10.5)}
          {etiqueta(70, 98, 180, 'Pagou em dia', '20% de desconto', VD, surge(lt, 2.6))}
        </>
      ) };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
