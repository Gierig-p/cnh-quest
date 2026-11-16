/**
 * Vídeo do cartão c4-celular-cinto ("Celular, fone, cinto e capacete"), Mundo 4, lote 2 de 16/11/2026.
 * Celular na mão (gravíssima), fones (média), uma mão só (média) e as exceções; sem cinto (grave);
 * criança sem as regras (gravíssima); moto sem capacete (gravíssima + suspensão); o exemplo do mapa.
 * Tempos em content/videos/celular-cinto.json.
 */
import type { ReactNode } from 'react';
import { Balao } from './Mundo2';
import { Cabine, zoomCabine } from './Mundo4';
import { NAT, TINTA, chip, etiqueta, item, quadro, ruaFundo, surge, visto } from './infracoesUI';
import { RA, escuro, fazerVideo, moto, relogio, type Quadro } from './videoBase';
import tempos from '../../content/videos/celular-cinto.json';

const XV = RA - 1.65;
const VM = NAT[3].cor;
const AZ = '#2f6db5';

/** o seu carro andando, com o balão mostrando o carro por dentro */
function comBalao(lt: number, id: string, dentro: ReactNode, extra: (pr: Parameters<NonNullable<Quadro['over']>>[0]) => ReactNode): Quadro {
  const q = ruaFundo(lt);
  const yv = 4 - 2.2 * lt;
  return { ...q, over: (pr) => (
    <>
      <Balao at={pr([XV, yv, 1.4])} x={204} y={8} w={108} h={96}>
        {zoomCabine(id, dentro)}
      </Balao>
      {extra(pr)}
    </>
  ) };
}

const PODE = ['Fazer sinal de braço', 'Trocar a marcha', 'Usar os comandos do carro'];

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. distração e falta de proteção
    case 0: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.35 * surge(lt, 0.4))}
          {chip(100, 80, 'Distração', NAT[2].cor, surge(lt, 0.6), 12)}
          {chip(220, 80, 'Falta de proteção', NAT[2].cor, surge(lt, 1.8), 12)}
          {chip(160, 120, 'Também são infração', TINTA, surge(lt, 2.6), 10)}
        </>
      ) };
    }
    // 1. um segundo olhando o celular
    case 1:
      return comBalao(lt, 'vcc-mao1', <Cabine celular="mao" />, () => (
        <>
          {relogio(250, 136, lt / 4, surge(lt, 0.8), 14)}
          {chip(250, 166, '1 segundo já basta', VM, surge(lt, 1.6), 10)}
        </>
      ));
    // 2. celular na mão: gravíssima
    case 2:
      return comBalao(lt, 'vcc-mao2', <Cabine celular="mao" />, () => (
        <>
          {chip(258, 116, 'Celular na mão', TINTA, surge(lt, 0.4))}
          {chip(258, 140, NAT[3].nome, NAT[3].cor, surge(lt, 2.0), 12)}
        </>
      ));
    // 3. fones ligados ao som ou ao celular: média
    case 3:
      return comBalao(lt, 'vcc-fone', <Cabine fones />, () => (
        <>
          {chip(258, 116, 'Fones de ouvido', TINTA, surge(lt, 0.4))}
          {chip(258, 140, NAT[1].nome, NAT[1].cor, surge(lt, 2.0), 12)}
        </>
      ));
    // 4. uma mão só: média
    case 4:
      return comBalao(lt, 'vcc-uma', <Cabine umaMao />, () => (
        <>
          {chip(258, 116, 'Uma mão só', TINTA, surge(lt, 0.3))}
          {chip(258, 140, NAT[1].nome, NAT[1].cor, surge(lt, 1.4), 12)}
        </>
      ));
    // 5. quando pode tirar a mão
    case 5: {
      const q = ruaFundo(lt);
      const a = [1.4, 2.6, 3.6];
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(50, 44, 220, 108, surge(lt, 0.1), (
            <>
              <text x={110} y={22} textAnchor="middle" fontSize={11.5} fontWeight={800} fill="#2fa36b">Pode tirar a mão para</text>
              {PODE.map((t, i) => (
                <g key={t}>
                  {item(16, 48 + i * 22, t, '#2fa36b', surge(lt, a[i]), 10.5)}
                  {visto(196, 44 + i * 22, surge(lt, a[i] + 0.4), 6)}
                </g>
              ))}
            </>
          ))}
        </>
      ) };
    }
    // 6. sem cinto: grave
    case 6:
      return comBalao(lt, 'vcc-cinto', <Cabine passageiro={{ cinto: false }} />, () => (
        <>
          {chip(258, 116, 'Sem cinto', TINTA, surge(lt, 0.3))}
          {chip(258, 140, NAT[2].nome, NAT[2].cor, surge(lt, 1.4), 12)}
        </>
      ));
    // 7. criança sem as regras de segurança: gravíssima
    case 7: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.4)}
          {quadro(46, 36, 76, 112, surge(lt, 0.2), <g transform="translate(-2 4)"><Cabine crianca /></g>)}
          {chip(220, 76, 'Criança sem as regras', TINTA, surge(lt, 1.0), 10)}
          {chip(220, 96, 'de segurança', TINTA, surge(lt, 1.0), 10)}
          {chip(220, 128, NAT[3].nome, NAT[3].cor, surge(lt, 2.4), 12)}
        </>
      ) };
    }
    // 8. moto sem capacete: gravíssima + suspensão
    case 8: {
      const yv = 4 - 2.2 * lt;
      const q = ruaFundo(lt, [moto(XV, yv - 6, 0, '#e05a5a', { capacete: false })]);
      return { ...q, over: () => (
        <>
          {chip(160, 24, 'Moto sem capacete', TINTA, surge(lt, 0.5), 10)}
          {chip(110, 48, NAT[3].nome, NAT[3].cor, surge(lt, 2.4), 11)}
          {chip(210, 48, '+ suspensão', VM, surge(lt, 3.6), 11)}
        </>
      ) };
    }
    // 9. exemplo do mapa
    case 9: {
      const fim = surge(lt, 5.4, 0.5);
      const base = comBalao(lt, 'vcc-mapa', <Cabine celular="mao" />, () => (
        <>
          <g opacity={1 - fim}>
            {chip(258, 116, 'Ver o mapa andando', TINTA, surge(lt, 0.8))}
            {chip(258, 140, NAT[3].nome, NAT[3].cor, surge(lt, 3.2), 12)}
          </g>
          {escuro(0.45 * fim)}
          {etiqueta(70, 66, 180, 'Programe o mapa', 'Antes de sair, com o carro parado', AZ, fim)}
        </>
      ));
      return base;
    }
    // 10. para guardar
    default: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 34, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {etiqueta(30, 66, 124, 'Celular na mão', NAT[3].nome, NAT[3].cor, surge(lt, 0.7))}
          {etiqueta(166, 66, 124, 'Fone', NAT[1].nome, NAT[1].cor, surge(lt, 2.8))}
        </>
      ) };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
