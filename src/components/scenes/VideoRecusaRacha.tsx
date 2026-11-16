/**
 * Vídeo do cartão c4-recusa-racha ("Recusar o teste e fazer racha"), Mundo 4, lote 3 de 16/11/2026.
 * Quem pode passar pelo teste; recusar tem as mesmas penalidades do álcool; racha, competição sem permissão e
 * manobras perigosas são gravíssimas × 10 com suspensão; recolher a CNH e remover o veículo.
 * Tempos em content/videos/recusa-racha.json.
 */
import { camLook } from './engine';
import { car } from './models';
import { Bafometro, Lata, agenteBafometro, cone } from './Mundo4';
import { NAT, TINTA, calendario, chip, etiqueta, item, nao, quadro, ruaFundo, surge } from './infracoesUI';
import { RA, escuro, fazerVideo, type Quadro } from './videoBase';
import tempos from '../../content/videos/recusa-racha.json';

const VM = NAT[3].cor;
const AZ = '#2f6db5';
const XV = RA - 1.65;
const YP = 4;

/** o seu carro parado, com o agente segurando o bafômetro */
function blitz(): Quadro {
  const q = ruaFundo(0, [...agenteBafometro(RA - 0.35, YP - 0.7, -Math.PI / 2), cone(XV - 0.4, YP + 4), cone(XV + 0.4, YP + 5.2)], YP);
  return { ...q, cam: camLook(1.2, YP - 2.5, 0, -26, 38, 11) };
}

/** dois carros arrancando lado a lado na sua frente; você fica parado atrás */
function racha(lt: number, a0 = 0.6): Quadro {
  const d = (t: number) => Math.min(5, 1.6 * Math.max(0, t) ** 2);
  return ruaFundo(0, [
    car({ x: -XV, y: -2 - d(lt - a0), color: '#f2c21b' }),
    car({ x: XV, y: -2.4 - d(lt - a0 - 0.15), color: '#e0412f' }),
  ], YP);
}

const bafo = (x: number, y: number, o: number, s = 1.6) => quadro(x, y, 34 * s + 18, 58 * s + 8, o, <g transform={`translate(9 0) scale(${s})`}><Bafometro /></g>);
const MANOBRAS = ['Arrancada brusca', 'Derrapagem', 'Freada com os pneus arrastando'];

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. recusar não livra da punição
    case 0: {
      const q = blitz();
      return { ...q, over: () => (
        <>
          {bafo(206, 20, surge(lt, 0.2), 1.3)}
          {nao(238, 60, 30, surge(lt, 1.0))}
          {chip(246, 128, 'Recusar', TINTA, surge(lt, 1.0), 11)}
          {chip(246, 152, 'Não livra da punição', VM, surge(lt, 2.0), 10)}
        </>
      ) };
    }
    // 1. fiscalização ou sinistro: bafômetro, exame ou perícia
    case 1: {
      const q = blitz();
      const a = [3.4, 4.6, 5.8];
      return { ...q, over: () => (
        <>
          {chip(80, 24, 'Fiscalização', AZ, surge(lt, 0.6), 10)}
          {chip(80, 46, 'ou sinistro', AZ, surge(lt, 2.0), 10)}
          {quadro(184, 40, 124, 100, surge(lt, 3.0), (
            <>
              <text x={62} y={22} textAnchor="middle" fontSize={11} fontWeight={800} fill={TINTA}>Pode passar por</text>
              {['Bafômetro', 'Exame', 'Perícia'].map((t, i) => <g key={t}>{item(14, 46 + i * 20, t, AZ, surge(lt, a[i]), 10.5)}</g>)}
            </>
          ))}
        </>
      ) };
    }
    // 2. recusar = as mesmas penalidades de dirigir sob efeito de álcool
    case 2: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {bafo(40, 40, surge(lt, 0.2), 1.3)}
          {nao(72, 80, 30, surge(lt, 0.8))}
          {chip(72, 152, 'Recusar o teste', TINTA, surge(lt, 0.8), 10)}
          {chip(160, 90, '=', '#fff', surge(lt, 2.0), 16, TINTA)}
          {quadro(206, 40, 72, 92, surge(lt, 2.4), <g transform="translate(13 4) scale(1.6)"><Lata /></g>)}
          {chip(242, 152, 'Álcool', TINTA, surge(lt, 2.8), 10)}
        </>
      ) };
    }
    // 3. gravíssima, × 10 e suspensão por 12 meses
    case 3: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 34, NAT[3].nome, NAT[3].cor, surge(lt, 0.3), 13)}
          {chip(100, 90, 'multa × 10', '#fff', surge(lt, 1.4), 14, VM)}
          {calendario(186, 66, '12 meses', surge(lt, 2.6), 1.2)}
          {chip(222, 160, 'suspensão', VM, surge(lt, 2.8), 11)}
        </>
      ) };
    }
    // 4. a rua não é pista de corrida
    case 4: {
      const q = racha(lt);
      return { ...q, over: () => (
        <>
          {chip(160, 168, 'A rua não é pista de corrida', TINTA, surge(lt, 1.6), 10.5)}
        </>
      ) };
    }
    // 5. racha e competição sem permissão: gravíssimas
    case 5: {
      const q = racha(lt, 0.2);
      return { ...q, over: () => (
        <>
          {chip(110, 144, 'Racha', TINTA, surge(lt, 0.2), 11)}
          {chip(210, 144, 'Competição sem permissão', TINTA, surge(lt, 1.0), 9.4)}
          {chip(160, 170, NAT[3].nome, NAT[3].cor, surge(lt, 2.2), 12)}
        </>
      ) };
    }
    // 6. manobras perigosas
    case 6: {
      const q = ruaFundo(lt);
      const a = [2.4, 3.4, 4.4];
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(40, 44, 240, 108, surge(lt, 0.2), (
            <>
              <text x={120} y={22} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={VM}>Manobras perigosas: gravíssimas</text>
              {MANOBRAS.map((t, i) => <g key={t}>{item(18, 50 + i * 22, t, VM, surge(lt, a[i]), 10.5)}</g>)}
            </>
          ))}
        </>
      ) };
    }
    // 7. multa × 10 e suspensão
    case 7: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 46, 'Em todos esses casos', TINTA, surge(lt, 0.2), 11)}
          {chip(110, 100, 'multa × 10', '#fff', surge(lt, 1.6), 14, VM)}
          {chip(218, 100, 'suspensão', VM, surge(lt, 3.0), 13)}
        </>
      ) };
    }
    // 8. o agente recolhe a CNH e remove o veículo
    case 8: {
      const q = blitz();
      return { ...q, over: () => (
        <>
          {etiqueta(186, 26, 124, 'Recolher', 'A CNH', AZ, surge(lt, 0.3))}
          {etiqueta(186, 84, 124, 'Remover', 'O veículo', AZ, surge(lt, 1.4))}
        </>
      ) };
    }
    // 9. exemplo: no semáforo, dois carros arrancam lado a lado
    case 9: {
      const q = racha(lt, 1.6);
      return { ...q, over: () => (
        <>
          {chip(160, 144, 'Arrancar lado a lado para ver quem chega primeiro', TINTA, surge(lt, 0.6), 9)}
          {chip(160, 170, 'Isso é racha', VM, surge(lt, 4.4), 12)}
        </>
      ) };
    }
    // 10. para guardar
    default: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 34, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {etiqueta(60, 66, 200, 'Recusar o bafômetro', 'Custa o mesmo que beber', VM, surge(lt, 0.7))}
        </>
      ) };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
