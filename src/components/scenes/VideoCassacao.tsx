/**
 * Vídeo do cartão c4-cassacao ("Cassação: perder a habilitação"), Mundo 4, lote 2 de 16/11/2026.
 * Mais séria que a suspensão; quando acontece (dirigir suspenso, repetir certas gravíssimas em 12 meses,
 * condenação por crime de trânsito); reabilitação depois de 2 anos; quem faz o curso de reciclagem.
 * Tempos em content/videos/cassacao.json.
 */
import { NAT, TINTA, calendario, chip, cnh, etiqueta, item, martelo, quadro, ruaFundo, surge, visto } from './infracoesUI';
import { escuro, fazerVideo, type Quadro } from './videoBase';
import tempos from '../../content/videos/cassacao.json';

const VM = NAT[3].cor;
const AZ = '#2f6db5';
const ROXO = '#7a3fb0';
const SUSP = (k: number) => ({ text: 'SUSPENSA', cor: '#ea7b2c', k });
const CASS = (k: number) => ({ text: 'CASSADA', cor: VM, k });

const REPETIR = ['Dirigir veículo de outra categoria', 'Entregar o carro a quem não pode dirigir', 'Dirigir sob efeito de álcool', 'Racha', 'Manobras perigosas'];
const RECICLA = ['Quem foi suspenso', 'Quem contribuiu para um sinistro grave', 'Quem foi condenado por crime de trânsito'];

function trecho(k: number, lt: number): Quadro {
  const q = ruaFundo(lt);
  switch (k) {
    // 0. mais séria que a suspensão: perde a habilitação
    case 0:
      return { ...q, over: () => (
        <>
          {escuro(0.4 * surge(lt, 0))}
          {cnh(34, 62, 1.05, null, surge(lt, 0.5), SUSP(surge(lt, 0.9)))}
          {chip(74, 134, 'Suspensão', '#ea7b2c', surge(lt, 0.9), 10)}
          {chip(160, 86, '<', '#fff', surge(lt, 1.8), 14, TINTA)}
          {cnh(198, 54, 1.2, null, surge(lt, 1.6), CASS(surge(lt, 2.0)))}
          {chip(244, 134, 'Cassação: mais séria', VM, surge(lt, 2.0), 10)}
          {chip(244, 154, 'perde a habilitação', TINTA, surge(lt, 3.4))}
        </>
      ) };
    // 1. para voltar: esperar e começar de novo
    case 1:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {calendario(54, 60, 'Esperar', surge(lt, 0.7), 1.4)}
          {chip(160, 90, '→', '#fff', surge(lt, 1.6), 14, TINTA)}
          {quadro(196, 60, 84, 60, surge(lt, 1.9), (
            <>
              <path d="M42 14 a16 16 0 1 1 -14 8" fill="none" stroke={AZ} strokeWidth={4} strokeLinecap="round" />
              <path d="M22 12 l7 11 l5 -10 z" fill={AZ} />
            </>
          ))}
          {chip(238, 138, 'Começar de novo', AZ, surge(lt, 2.2), 10)}
        </>
      ) };
    // 2. dirigir com o direito de dirigir suspenso: cassada
    case 2:
      return { ...q, over: () => (
        <>
          {cnh(212, 22, 1.1, null, surge(lt, 0.4), surge(lt, 2.6) > 0.5 ? CASS(surge(lt, 2.6)) : SUSP(1))}
          {chip(254, 100, 'Dirigindo suspenso', TINTA, surge(lt, 1.0))}
        </>
      ) };
    // 3. repetir, em 12 meses, certas gravíssimas
    case 3:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {calendario(40, 58, '12 meses', surge(lt, 0.6), 1.3)}
          {chip(170, 72, 'Gravíssima: 1ª vez', VM, surge(lt, 1.5), 10)}
          {chip(170, 102, 'A mesma: 2ª vez', VM, surge(lt, 2.4), 10)}
          {cnh(222, 116, 0.8, null, surge(lt, 3.2), CASS(surge(lt, 3.5)))}
        </>
      ) };
    // 4 e 5. quais gravíssimas
    case 4:
    case 5: {
      const a = k === 4 ? [0.6, 2.2, 99, 99, 99] : [-1, -1, 0.5, 2.0, 2.8];
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(30, 26, 260, 148, k === 4 ? surge(lt, 0) : 1, (
            <>
              <text x={130} y={22} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={VM}>Repetir em 12 meses</text>
              {REPETIR.map((t, i) => <g key={t}>{item(16, 48 + i * 22, t, VM, a[i] < 0 ? 1 : surge(lt, a[i]), 10)}</g>)}
            </>
          ))}
        </>
      ) };
    }
    // 6. condenação pela Justiça por crime de trânsito
    case 6:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(40, 50, 96, 90, surge(lt, 0.3), martelo(48, 42))}
          {chip(88, 156, 'Crime de trânsito', TINTA, surge(lt, 1.6))}
          {cnh(186, 66, 1.1, null, surge(lt, 2.0), CASS(surge(lt, 2.4)))}
        </>
      ) };
    // 7. depois de 2 anos, reabilitação refazendo todos os exames
    case 7:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {calendario(40, 58, '2 anos', surge(lt, 0.6), 1.4)}
          {etiqueta(140, 54, 150, 'Reabilitação', 'Refazer todos os exames', AZ, surge(lt, 2.0))}
          {visto(286, 56, surge(lt, 3.4), 8)}
        </>
      ) };
    // 8 e 9. quem faz o curso de reciclagem
    case 8:
    case 9: {
      const a = k === 8 ? [1.6, 3.2, 99] : [-1, -1, 0.4];
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(24, 40, 272, 116, k === 8 ? surge(lt, 0) : 1, (
            <>
              <text x={136} y={22} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={ROXO}>Curso de reciclagem: obrigatório</text>
              {RECICLA.map((t, i) => <g key={t}>{item(18, 52 + i * 24, t, ROXO, a[i] < 0 ? 1 : surge(lt, a[i]), 10.5)}</g>)}
            </>
          ))}
        </>
      ) };
    }
    // 10. para guardar
    default:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 30, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {cnh(44, 70, 1.0, null, surge(lt, 0.6), SUSP(1))}
          {chip(160, 92, '+ dirigir =', '#fff', surge(lt, 1.4), 12, TINTA)}
          {cnh(200, 70, 1.0, null, surge(lt, 2.0), CASS(surge(lt, 2.3)))}
        </>
      ) };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
