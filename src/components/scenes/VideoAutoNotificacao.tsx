/**
 * Vídeo do cartão c4-auto-notificacao ("Do auto à notificação"), Mundo 4, lote 4 de 16/11/2026.
 * O auto de infração (mesmo sem parar o veículo); a notificação da autuação e a da penalidade; 30 dias para expedir;
 * indicar o condutor em 30 dias; quem responde pelo quê; o órgão da via aplica a multa.
 * Tempos em content/videos/auto-notificacao.json.
 */
import { camLook } from './engine';
import { person } from './models';
import { AGENTE } from './Mundo4';
import { NAT, TINTA, calendario, carimbo, chip, cnh, envelope, etiqueta, item, papel, quadro, ruaFundo, seta, surge } from './infracoesUI';
import { RA, escuro, fazerVideo, type Quadro } from './videoBase';
import tempos from '../../content/videos/auto-notificacao.json';

const VM = NAT[3].cor;
const AZ = '#2f6db5';
const VD = '#2fa36b';
const LJ = '#ea7b2c';
const YP = 4;

/** o agente parado na calçada, olhando a rua; com `passa`, o seu carro anda e passa por ele sem parar */
function agenteNaCalcada(lt: number, passa = false): Quadro {
  const agente = person(RA - 0.35, YP - 3, AGENTE, 0, -Math.PI / 2, 1.25, { r: [0, 1.1], l: [0, 1.1] });
  const q = ruaFundo(passa ? lt : 0, [agente], YP);
  return { ...q, cam: camLook(1.2, YP - 3, 0, -26, 38, 11) };
}

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. o agente registra no auto de infração
    case 0: {
      const q = agenteNaCalcada(lt);
      return { ...q, over: () => (
        <>
          {papel(40, 26, 1.4, 'AUTO', AZ, surge(lt, 0.6))}
          {chip(80, 136, 'Auto de infração', AZ, surge(lt, 0.8), 10.5)}
          {chip(80, 162, 'O agente registra', TINTA, surge(lt, 1.4), 10)}
        </>
      ) };
    }
    // 1. mesmo sem parar o veículo
    case 1: {
      const q = agenteNaCalcada(lt, true);
      return { ...q, over: () => (
        <>
          {chip(90, 30, 'Sem parar o veículo', TINTA, surge(lt, 0.3), 11)}
          {chip(90, 56, 'Registra mesmo assim', AZ, surge(lt, 1.4), 11)}
        </>
      ) };
    }
    // 2. o dono recebe a notificação
    case 2: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {envelope(110, 40, 1.6, AZ, surge(lt, 0.3))}
          {chip(160, 130, 'Notificação', AZ, surge(lt, 1.8), 13)}
          {chip(160, 156, 'Aviso oficial ao dono do veículo', TINTA, surge(lt, 2.4), 10)}
        </>
      ) };
    }
    // 3. primeiro a da autuação; se a multa for aplicada, a da penalidade
    case 3: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(76, 36, '1º', AZ, surge(lt, 0.3), 12)}
          {envelope(44, 52, 1.0, AZ, surge(lt, 0.3), 'Da autuação')}
          {seta(124, 74, 186, 74, surge(lt, 1.8))}
          {chip(155, 56, 'Multa aplicada', TINTA, surge(lt, 2.2), 8.6)}
          {chip(244, 36, '2º', VM, surge(lt, 2.8), 12)}
          {envelope(212, 52, 1.0, VM, surge(lt, 2.8), 'Da penalidade')}
        </>
      ) };
    }
    // 4. 30 dias para expedir; se passar, o auto é arquivado
    case 4: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {calendario(40, 40, '30 dias', surge(lt, 0.3), 1.4)}
          {chip(86, 120, 'Para expedir', TINTA, surge(lt, 0.8), 10)}
          {papel(190, 34, 1.2, 'AUTO', AZ, surge(lt, 3.0))}
          {carimbo(225, 78, 'ARQUIVADO', LJ, surge(lt, 4.2), 10)}
          {chip(225, 136, 'Passou do prazo', TINTA, surge(lt, 3.4), 10)}
        </>
      ) };
    }
    // 5. indicar o condutor em 30 dias
    case 5: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 36, 'Quem dirigia não era o dono?', TINTA, surge(lt, 0.3), 11)}
          {etiqueta(40, 66, 160, 'Indique o condutor', 'Até 30 dias', AZ, surge(lt, 2.0))}
          {calendario(226, 66, '30 dias', surge(lt, 3.2), 1.1)}
        </>
      ) };
    }
    // 6. sem indicação
    case 6: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(40, 44, 240, 96, surge(lt, 0.2), (
            <>
              <text x={120} y={22} textAnchor="middle" fontSize={11} fontWeight={800} fill={TINTA}>Sem indicação, a infração fica com</text>
              {item(18, 50, 'O principal condutor cadastrado', AZ, surge(lt, 1.8), 10.5)}
              {item(18, 76, 'Se não houver: o proprietário', AZ, surge(lt, 4.0), 10.5)}
            </>
          ))}
        </>
      ) };
    }
    // 7 e 8. quem responde pelo quê
    case 7:
    case 8: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {etiqueta(20, 60, 136, 'Proprietário', 'Documentos e conservação', AZ, k === 7 ? surge(lt, 0.3) : 1)}
          {etiqueta(164, 60, 136, 'Quem dirige', 'O que faz ao volante', LJ, k === 8 ? surge(lt, 0.2) : 0)}
        </>
      ) };
    }
    // 9. o órgão responsável pela via aplica a multa
    case 9: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.35)}
          {chip(160, 40, 'Quem aplica a multa', TINTA, surge(lt, 0.3), 11)}
          {etiqueta(50, 64, 220, 'O órgão responsável pela via', 'Onde a infração aconteceu', AZ, surge(lt, 1.4))}
        </>
      ) };
    }
    // 10. exemplo: o irmão avançou o sinal
    case 10: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 28, 'Seu irmão avançou o vermelho com o seu carro', TINTA, surge(lt, 0.4), 9.4)}
          {envelope(30, 58, 1.0, VM, surge(lt, 3.4), 'Notificação')}
          {seta(104, 80, 136, 80, surge(lt, 4.4))}
          {chip(190, 66, 'Condutor: seu irmão', AZ, surge(lt, 4.6), 10)}
          {chip(190, 94, 'Dentro do prazo', VD, surge(lt, 5.6), 10)}
          {cnh(140, 118, 0.9, null, surge(lt, 7.0))}
          {chip(250, 140, 'Pontos na CNH dele', TINTA, surge(lt, 7.4), 9.6)}
        </>
      ) };
    }
    // 11. para guardar
    default: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 34, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {etiqueta(60, 66, 200, 'Não era você?', 'Indique o condutor em 30 dias', AZ, surge(lt, 0.5))}
        </>
      ) };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
