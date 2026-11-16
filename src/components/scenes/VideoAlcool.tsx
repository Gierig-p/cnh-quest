/**
 * Vídeo do cartão c4-alcool ("Álcool: tolerância zero"), Mundo 4, lote 3 de 16/11/2026.
 * Qualquer quantidade já é infração; gravíssima × 10 (R$ 2.934,70) e suspensão por 12 meses; recolher a CNH e
 * reter o veículo; repetir em 12 meses dobra a multa e cassa; a margem do aparelho não é permissão para beber.
 * Tempos em content/videos/alcool.json.
 */
import { camLook } from './engine';
import { Bafometro, Lata, agenteBafometro, cone } from './Mundo4';
import { NAT, TINTA, calendario, chip, cnh, etiqueta, item, nao, papel, pilula, quadro, ruaFundo, surge, taca, visto } from './infracoesUI';
import { RA, escuro, fazerVideo, type Quadro } from './videoBase';
import tempos from '../../content/videos/alcool.json';

const VM = NAT[3].cor;
const AZ = '#2f6db5';
const XV = RA - 1.65;
const YP = 4;
const SUSP = (k: number) => ({ text: 'SUSPENSA', cor: '#ea7b2c', k });
const CASS = (k: number) => ({ text: 'CASSADA', cor: VM, k });

/** o seu carro parado na beira da rua, com o agente segurando o bafômetro */
function blitz(): Quadro {
  const q = ruaFundo(0, [...agenteBafometro(RA - 0.35, YP - 0.7, -Math.PI / 2), cone(XV - 0.4, YP + 4), cone(XV + 0.4, YP + 5.2)], YP);
  return { ...q, cam: camLook(1.2, YP - 2.5, 0, -26, 38, 11) };
}

/** a lata dentro de um quadrinho */
const lata = (x: number, y: number, o: number, s = 1.5) => quadro(x, y, 30 * s + 18, 50 * s + 8, o, <g transform={`translate(9 2) scale(${s})`}><Lata /></g>);
/** o bafômetro dentro de um quadrinho */
const bafo = (x: number, y: number, o: number, s = 1.6) => quadro(x, y, 34 * s + 18, 58 * s + 8, o, <g transform={`translate(9 0) scale(${s})`}><Bafometro /></g>);

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. qualquer quantidade de álcool
    case 0: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.4 * surge(lt, 0.2))}
          {lata(126, 30, surge(lt, 0.5))}
          {chip(160, 156, 'Qualquer quantidade de álcool', VM, surge(lt, 1.8), 10)}
        </>
      ) };
    }
    // 1. não existe "só um copo": no sangue ou no ar dos pulmões
    case 1: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 28, '"Só um copo"?', TINTA, surge(lt, 0.2), 12)}
          {nao(160, 28, 20, surge(lt, 1.2))}
          {bafo(40, 56, surge(lt, 2.0))}
          {quadro(134, 70, 150, 58, surge(lt, 3.0), (
            <>
              {item(12, 24, 'No sangue', VM, 1, 11)}
              {item(12, 46, 'No ar dos pulmões', VM, surge(lt, 3.6), 11)}
            </>
          ))}
          {chip(200, 150, 'Já é infração', VM, surge(lt, 4.4), 11)}
        </>
      ) };
    }
    // 2. álcool ou outra substância psicoativa: gravíssima
    case 2: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {lata(56, 36, surge(lt, 0.4))}
          {chip(130, 80, 'ou', '#fff', surge(lt, 1.6), 12, TINTA)}
          {quadro(156, 46, 76, 68, surge(lt, 1.8), pilula(38, 34, 1, 1.3))}
          {chip(194, 128, 'Substância psicoativa', TINTA, surge(lt, 2.2))}
          {chip(160, 166, NAT[3].nome, NAT[3].cor, surge(lt, 3.8), 13)}
        </>
      ) };
    }
    // 3. multa dez vezes maior
    case 3: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {papel(70, 40, 1.25, 'MULTA', VM, surge(lt, 0.4), 'R$')}
          {chip(214, 70, '× 10', '#fff', surge(lt, 1.2), 18, VM)}
          {chip(214, 120, 'R$ 2.934,70', VM, surge(lt, 2.6), 14)}
        </>
      ) };
    }
    // 4. suspensão por 12 meses
    case 4: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {calendario(46, 58, '12 meses', surge(lt, 0.4), 1.4)}
          {cnh(174, 62, 1.1, null, surge(lt, 0.8), SUSP(surge(lt, 1.6)))}
          {chip(160, 166, 'Suspensão do direito de dirigir', TINTA, surge(lt, 1.8), 10)}
        </>
      ) };
    }
    // 5. o agente recolhe a CNH e retém o veículo
    case 5: {
      const q = blitz();
      return { ...q, over: () => (
        <>
          {etiqueta(186, 26, 124, 'Recolher', 'A CNH', AZ, surge(lt, 0.4))}
          {etiqueta(186, 84, 124, 'Reter', 'O veículo', AZ, surge(lt, 1.8))}
        </>
      ) };
    }
    // 6. repetiu em 12 meses: a multa dobra e cassa
    case 6: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {calendario(30, 50, '12 meses', surge(lt, 0.3), 1.2)}
          {chip(140, 64, '2ª vez', VM, surge(lt, 0.9), 12)}
          {chip(110, 140, 'Multa × 2', '#fff', surge(lt, 2.0), 14, VM)}
          {cnh(196, 62, 1.1, null, surge(lt, 2.8), CASS(surge(lt, 3.3)))}
        </>
      ) };
    }
    // 7. a margem de erro do aparelho, definida pelo Contran
    case 7: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {bafo(56, 44, surge(lt, 0.3))}
          {etiqueta(160, 70, 140, 'Margem de erro', 'Definida pelo Contran', AZ, surge(lt, 1.4))}
        </>
      ) };
    }
    // 8. existe por causa do aparelho; não é permissão para beber
    case 8: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {bafo(40, 44, 1)}
          {chip(80, 170, 'Por causa do aparelho', AZ, surge(lt, 0.2), 9.6)}
          {lata(190, 36, surge(lt, 1.4), 1.3)}
          {nao(222, 72, 34, surge(lt, 2.0))}
          {chip(222, 150, 'Não é permissão para beber', VM, surge(lt, 2.2), 9.6)}
        </>
      ) };
    }
    // 9. exemplo: uma taça de vinho no jantar; não dirija
    case 9: {
      const q = ruaFundo(lt);
      const a = [3.6, 4.4, 5.2];
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(24, 40, 80, 84, surge(lt, 0.4), taca(40, 46, 1, 1.3))}
          {chip(64, 140, 'Uma taça', TINTA, surge(lt, 0.8), 10)}
          {chip(64, 162, 'Não dirija', VM, surge(lt, 2.0), 11)}
          {quadro(122, 46, 176, 100, surge(lt, 3.2), (
            <>
              <text x={88} y={22} textAnchor="middle" fontSize={11} fontWeight={800} fill={AZ}>Chame</text>
              {['Um táxi', 'Um carro de aplicativo', 'Alguém que não bebeu'].map((t, i) => (
                <g key={t}>
                  {item(12, 46 + i * 20, t, AZ, surge(lt, a[i]), 10)}
                  {visto(160, 42 + i * 20, surge(lt, a[i] + 0.3), 6)}
                </g>
              ))}
            </>
          ))}
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
          {etiqueta(80, 66, 160, 'Se beber', 'Não dirija. Nem um copo.', VM, surge(lt, 0.7))}
        </>
      ) };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
