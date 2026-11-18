/**
 * Vídeo do cartão c6-telefones ("Telefones de emergência"), Mundo 6, lote 1 de 18/11/2026.
 * Pedir socorro cedo; 193, 192 e 190; o número de cada rodovia; telefones no acostamento; anotar o número.
 * Tempos em content/videos/telefones.json.
 */
import { Ry, T, chain, flat, tfObj, Rz } from './engine';
import { car, person } from './models';
import { utilitario } from './veiculos';
import { fazerVideo, escuro, relogio, tag, VOCE, type Quadro } from './videoBase';
import { TINTA, chip, item, quadro, surge, visto } from './infracoesUI';
import {
  AZ, BATIDO, LARANJA, MOCA, TEL, VERDE, VERM,
  celular, faceTelefone, fone, local, numero, placaEstrada, telefonePoste,
} from './socorroUI';
import tempos from '../../content/videos/telefones.json';

const PIDE = () => [person(4.4, -6.6, MOCA, 0, Math.PI * 0.2, 1.25, TEL)];
const fase = (lt: number) => Math.floor(lt * 4) % 2;

/** placa do telefone da rodovia, na beira da pista */
const XPL = 7.4, YPL = -12;

/** barranco de terra na beira da pista, onde o carro caiu */
const BARRANCO = [
  flat([[6.2, -14], [9.8, -14.6], [10.2, -3.8], [6.3, -4.4]], '#a07d52', 0.01, 1),
  flat([[7.2, -12.6], [9.6, -13], [9.8, -5.4], [7.3, -5.8]], '#86663f', 0.012, 1),
];

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. quanto mais cedo o socorro chega, melhor
    case 0: {
      const ya = 40 - 6 * lt;
      return local(-6, 9.5, [...BATIDO(), utilitario({ x: 1.75, y: ya, tipo: 'ambulancia', luzes: true, fase: fase(lt) })], () => (
        <>
          {relogio(286, 30, lt * 0.5, 1, 16)}
          {chip(150, 24, 'Quanto mais cedo, melhor', VERDE, surge(lt, 0.3), 11)}
          {chip(160, 180, 'Peça socorro o mais rápido possível', AZ, surge(lt, 3.6), 10)}
        </>
      ));
    }
    // 1. os serviços são gratuitos
    case 1:
      return local(-7.6, 16, [...BATIDO(), ...PIDE()], (pr) => (
        <>
          {fone(pr, 4.4, -6.6)}
          {celular(262, 100, 'Ligação', 'Grátis', surge(lt, 0.3))}
          {chip(110, 24, 'Serviços gratuitos', VERDE, surge(lt, 0.6), 11)}
        </>
      ));
    // 2. 193 Bombeiros: ferragens, fogo, fumaça, vazamento
    case 2:
      return local(-6, 10, [...BATIDO(), utilitario({ x: -1.75, y: -4, tipo: 'bombeiros', heading: Math.PI, luzes: true, fase: fase(lt) })], () => (
        <>
          {numero(62, 40, '193', 'Corpo de Bombeiros', VERM, surge(lt, 0.2))}
          {quadro(198, 76, 116, 104, 1, (
            <>
              {item(8, 22, 'Presos nas ferragens', VERM, surge(lt, 2.4), 9)}
              {item(8, 44, 'Fogo', VERM, surge(lt, 3.6), 9)}
              {item(8, 66, 'Fumaça', VERM, surge(lt, 4.2), 9)}
              {item(8, 88, 'Combustível ou gás', VERM, surge(lt, 5.0), 9)}
            </>
          ))}
        </>
      ));
    // 3. o 193 atende também lugares instáveis, como ribanceiras
    case 3: {
      const caido = tfObj(car({ x: 0, y: 0, color: '#4f7fc4' }), chain(T(7.4, -9), Rz(1.9), Ry(0.42), T(0, 0, -0.3)));
      return local(-8, 15, [caido], (pr) => (
        <>
          {numero(62, 40, '193', 'Corpo de Bombeiros', VERM, 1, 0.85)}
          {tag(pr, [7.4, -9, 1.8], 'Ribanceira', surge(lt, 0.4))}
          {chip(160, 180, 'Lugares instáveis', LARANJA, surge(lt, 1.6), 10)}
        </>
      ), BARRANCO);
    }
    // 4. 192 SAMU: qualquer sinistro e mal súbito
    case 4:
      return local(-6, 10, [...BATIDO(), utilitario({ x: -1.75, y: -6, tipo: 'ambulancia', heading: Math.PI, luzes: true, fase: fase(lt) })], () => (
        <>
          {numero(62, 40, '192', 'SAMU', VERM, surge(lt, 0.2))}
          {chip(240, 150, 'Qualquer sinistro', AZ, surge(lt, 2.4), 10)}
          {chip(240, 176, 'Mal súbito na via', AZ, surge(lt, 3.6), 10)}
        </>
      ));
    // 5. 190 Polícia Militar: quando não há serviço próprio
    case 5:
      return local(-7.6, 16, [...BATIDO(), ...PIDE()], (pr) => (
        <>
          {fone(pr, 4.4, -6.6)}
          {numero(62, 40, '190', 'Polícia Militar', AZ, surge(lt, 0.2))}
          {chip(196, 180, 'Sem serviço próprio de socorro', TINTA, surge(lt, 2.4), 10)}
        </>
      ));
    // 6. nas rodovias o número muda
    case 6: {
      const y = 6 - 5 * lt;
      return local(y - 8, 9, [car({ x: 1.75, y, color: VOCE })], () => (
        <>
          {chip(160, 24, 'Nas rodovias, o número muda', TINTA, surge(lt, 0.3), 10)}
          {quadro(96, 120, 128, 74, 1, (
            <>
              {item(8, 20, 'Polícia Rodoviária', AZ, surge(lt, 3.0), 9.5)}
              {item(8, 42, 'Concessionária', LARANJA, surge(lt, 4.2), 9.5)}
              {item(8, 64, 'Outro serviço', VERDE, surge(lt, 5.4), 9.5)}
            </>
          ))}
        </>
      ));
    }
    // 7. telefones de emergência no acostamento
    case 7:
      return local(-8.8, 24, [telefonePoste(5.6, -9), person(5.0, -8.4, MOCA, 0, Math.PI * 0.55, 1.25, TEL)], (pr) => (
        <>
          {tag(pr, [5.6, -9, 2.2], 'Telefone de emergência', surge(lt, 0.4))}
          {chip(160, 180, 'No acostamento', LARANJA, surge(lt, 1.6), 10)}
        </>
      ), [], 4.6);
    // 8. anote o número assim que entrar; não confie na memória
    case 8:
      return local(YPL - 2.5, 24, [placaEstrada(XPL, YPL)], (pr) => (
        <>
          {faceTelefone(pr, XPL, YPL)}
          {chip(100, 24, 'Anote o número', VERDE, surge(lt, 0.4), 11)}
          {chip(100, 180, 'Não confie na memória', VERM, surge(lt, 3.0), 10)}
        </>
      ), [], 6.4);
    // 9. Bruno vê a placa e salva o número no celular
    case 9: {
      const f = lt / d;
      const y = 4 - 14 * Math.min(1, f / 0.5);
      return local(Math.min(y, -2) - 6, 13, [placaEstrada(XPL, YPL), car({ x: 1.75, y, color: VOCE })], (pr) => (
        <>
          {faceTelefone(pr, XPL, YPL)}
          {tag(pr, [1.75, y, 1.8], 'Bruno', surge(lt, 0.3))}
          {celular(52, 100, 'Contatos', 'Rodovia', surge(lt, 0.55 * d))}
          {visto(78, 52, surge(lt, 0.7 * d), 9)}
          {chip(64, 180, 'Número salvo', VERDE, surge(lt, 0.7 * d), 10)}
        </>
      ), [], 4.6);
    }
    // 10. para guardar
    default:
      return local(-6, 10, [...BATIDO()], () => (
        <>
          {escuro(0.45)}
          {chip(160, 24, 'Para guardar', TINTA, 1, 11)}
          {numero(58, 104, '193', 'Bombeiros', VERM, surge(lt, 0.3), 0.85)}
          {numero(160, 104, '192', 'SAMU', VERM, surge(lt, 1.6), 0.85)}
          {numero(262, 104, '190', 'Polícia', AZ, surge(lt, 2.9), 0.85)}
        </>
      ));
  }
}


export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
