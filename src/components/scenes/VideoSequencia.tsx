/**
 * Vídeo do cartão c6-sequencia ("A sequência do socorro"), Mundo 6, lote 1 de 18/11/2026.
 * Atendimento inicial e temporário; o tempo até o socorro chegar; os 6 passos; ações que se misturam;
 * o exemplo do carro que bate num muro. Tempos em content/videos/sequencia.json.
 */
import { car, person, wall } from './models';
import { utilitario } from './veiculos';
import { fumaca } from './Mundo3';
import { triangulo, fazerVideo, escuro, relogio, tag, VOCE, type Quadro } from './videoBase';
import { TINTA, chip, surge } from './infracoesUI';
import { alerta } from './defensivaUI';
import {
  ACENA, APONTA, AZ, BATIDO, LARANJA, MOCO, RAPAZ, SENHOR, TEL, VERDE, VERM, XB, YB, MOCA,
  anda, cabeca, faixaTempo, fone, local, passos, respiro,
} from './socorroUI';
import { carroBatido } from './Mundo6';
import tempos from '../../content/videos/sequencia.json';

/** carro de quem passa, parado no acostamento atrás do sinistro, com o pisca-alerta */
const XP = 4.7, YP = 1.5;
const parado = () => car({ x: XP, y: YP, color: VOCE });

/** o local: carro batido, motorista ao lado e o carro de quem passa */
function base(lt: number, yc = -8, s = 11.5, x = 1.6, extra: Parameters<typeof local>[2] = [], over?: Quadro['over']): Quadro {
  return local(yc, s, [...BATIDO(), parado(), ...extra], (pr) => (
    <>
      {alerta(pr, XP, YP, lt, 'p')}
      {over?.(pr)}
    </>
  ), [], x);
}

/** muro na beira da estrada, para o exemplo */
const MURO = wall(7.0, -17, 7.35, -7.5, 1.5, '#c9b79c');
const XM = 5.4, YM = -12.4;

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. primeiras providências: atendimento inicial e temporário
    case 0:
      return local(-11.5, 17, [...BATIDO()], (pr) => {
        const [fx, fy] = pr([XB, YB - 1.4, 1.1]);
        return (
          <>
            <g opacity={0.7}>{fumaca(fx, fy, 0.8)}</g>
            {chip(160, 24, 'Primeiros socorros', VERM, surge(lt, 0.3), 12)}
            {chip(160, 150, 'Atendimento inicial e temporário', AZ, surge(lt, 2.4), 10)}
            {chip(160, 176, 'até chegar o socorro profissional', VERDE, surge(lt, 4.6), 10)}
          </>
        );
      });
    // 1. sempre há um tempo até o socorro chegar: só os envolvidos e quem passa
    case 1:
      return base(lt, -5.2, 14, 2.6, [person(3.4, -8.6, SENHOR, 0, Math.PI * 0.85, 1.25), person(3.4, 0.2, MOCA, 0, 0, 1.25)], (pr) => (
        <>
          {relogio(286, 30, lt * 0.6, surge(lt, 0.2), 16)}
          {chip(150, 184, 'Tempo até o socorro chegar', TINTA, surge(lt, 0.4), 10)}
          {tag(pr, cabeca(3.4, -8.6), 'Envolvidos', surge(lt, 3.0))}
          {tag(pr, cabeca(3.4, 0.2), 'Quem passa', surge(lt, 4.4))}
        </>
      ));
    // 2. cada sinistro é diferente; a ordem é sempre a mesma
    case 2:
      return base(lt, -9, 14, -1.2, [], () => (
        <>
          {escuro(0.25)}
          {passos(lt * 3, [], 1)}
          {chip(222, 26, 'Cada sinistro é diferente', TINTA, surge(lt, 0.2), 10)}
          {chip(222, 178, 'A ordem é sempre a mesma', AZ, surge(lt, 1.8), 10)}
        </>
      ));
    // 3. calma e segurança
    case 3: {
      const pe = anda(lt, MOCA, 3.4, 0.2, 3.6, 5.4, 1.6, 3.2, 1.25);
      return base(lt, 1.5, 17, 0.2, [pe, ...(lt > 3.2 ? [triangulo(3.6, 6.2)] : [])], (pr) => {
        const [hx, hy] = pr(cabeca(3.4, 0.2));
        return (
          <>
            {passos(6, [0, 1])}
            {lt < 1.7 && respiro(hx, hy - 22, lt, 1)}
            {chip(232, 24, '1 Calma', AZ, surge(lt, 0.2), 10)}
            {chip(232, 48, '2 Segurança: sinalizar', LARANJA, surge(lt, 1.8), 10)}
          </>
        );
      });
    }
    // 4. pedir socorro e controlar a situação
    case 4:
      return base(lt, -3.8, 15, -0.6, [person(3.4, -0.6, MOCA, 0, Math.PI * 0.2, 1.25, TEL), person(-0.8, -6.8, RAPAZ, 0, -Math.PI * 0.4, 1.25, APONTA), triangulo(3.6, 6.2)], (pr) => (
        <>
          {fone(pr, 3.4, -0.6)}
          {passos(6, [2, 3])}
          {tag(pr, cabeca(3.4, -0.6), '3 Pedir socorro', surge(lt, 0.2))}
          {tag(pr, cabeca(-0.8, -6.8), '4 Controlar', surge(lt, 1.6))}
        </>
      ));
    // 5. verificar as vítimas e fazer as ações
    case 5:
      return base(lt, -10, 16, -1.4, [person(0.6, -11.2, MOCA, 0, Math.PI * 0.45, 1.25, APONTA), person(-0.8, -6.8, RAPAZ, 0, -Math.PI * 0.4, 1.25), triangulo(3.6, 6.2)], (pr) => (
        <>
          {passos(6, [4, 5])}
          {tag(pr, cabeca(0.6, -11.2), '5 Ver as vítimas', surge(lt, 0.2))}
          {chip(232, 178, '6 Ações com as vítimas', AZ, surge(lt, 2.2), 10)}
        </>
      ));
    // 6. uma ação começa antes de a outra terminar
    case 6: {
      const f = lt / d;
      const arms = f < 0.36 || f > 0.66 ? ACENA(lt) : TEL;
      const y = f < 0.3 ? 0.2 + (5.6 - 0.2) * (f / 0.3) : 5.6;
      const pe = person(3.6, y, MOCA, f < 0.3 ? lt * 9 : 0, f < 0.3 ? Math.PI : Math.PI, 1.25, arms);
      return base(lt, 3.6, 16, 2.6, [pe, ...(f > 0.28 ? [triangulo(3.6, 8.4)] : [])], (pr) => (
        <>
          {f >= 0.36 && f <= 0.66 && fone(pr, 3.6, y)}
          {chip(160, 22, 'Uma ação pode começar antes de a outra terminar', TINTA, surge(lt, 0.2), 9)}
          {faixaTempo(34, 178, 252, [['Sinalizar', LARANJA, 0, 0.36], ['Pedir socorro', AZ, 0.36, 0.66], ['Sinalizar', LARANJA, 0.66, 1]], f)}
        </>
      ));
    }
    // 7. várias pessoas: ações ao mesmo tempo
    case 7: {
      const f = lt / d;
      return base(lt, 2.2, 15, 2.4, [person(3.0, -1.2, MOCO, 0, Math.PI * 0.2, 1.25, TEL), person(3.8, 6.0, MOCA, 0, Math.PI, 1.25, ACENA(lt)), triangulo(3.6, 8.4)], (pr) => (
        <>
          {fone(pr, 3.0, -1.2)}
          {chip(160, 22, 'Várias pessoas: ao mesmo tempo', TINTA, surge(lt, 0.2), 10)}
          {tag(pr, cabeca(3.0, -1.2), 'Telefona', surge(lt, 0.8))}
          {tag(pr, cabeca(3.8, 6.0), 'Sinaliza', surge(lt, 1.6))}
          {faixaTempo(34, 162, 252, [['Telefonar', AZ, 0, 1]], f)}
          {faixaTempo(34, 186, 252, [['Sinalizar', LARANJA, 0, 1]], f)}
        </>
      ));
    }
    // 8. exemplo: um carro bate num muro; quem passa fica calmo e sinaliza
    case 8: {
      const pe = anda(lt, RAPAZ, 3.4, 0.2, 3.6, 5.4, 2.6, 4.4, 1.25);
      return local(-5, 14, [MURO, ...carroBatido(XM, YM, 1.05, '#c94c4c', 6), parado(), pe, ...(lt > 4.4 ? [triangulo(3.6, 6.2)] : [])], (pr) => {
        const [hx, hy] = pr(cabeca(3.4, 0.2));
        return (
          <>
            {alerta(pr, XP, YP, lt, 'p')}
            {chip(88, 22, 'Até a ambulância chegar', TINTA, surge(lt, 0.2), 10)}
            {lt < 2.6 && respiro(hx, hy - 22, lt, surge(lt, 0.6))}
            {tag(pr, [XM, YM, 1.8], 'Bateu no muro', surge(lt, 0.4))}
            {lt > 4.2 && tag(pr, [3.6, 6.2, 1.2], 'Sinaliza a pista', surge(lt, 4.4))}
          </>
        );
      });
    }
    // 9. depois chama o socorro e só então vai até a vítima
    case 9: {
      const f = lt / d;
      const pe = f < 0.4 ? person(3.6, 4.8, RAPAZ, 0, 0, 1.25, TEL) : anda(lt, RAPAZ, 3.6, 4.8, 4.4, -8.6, 0.4 * d, d, 1.25);
      const ya = 18 - 14 * f;
      return local(-2, 13, [MURO, ...carroBatido(XM, YM, 1.05, '#c94c4c', 6), parado(), pe, triangulo(3.6, 6.2), utilitario({ x: 1.75, y: ya, tipo: 'ambulancia', luzes: true, fase: Math.floor(lt * 4) % 2 })], (pr) => (
        <>
          {alerta(pr, XP, YP, lt, 'p')}
          {f < 0.4 && fone(pr, 3.6, 4.8)}
          {chip(80, 22, 'Chama o socorro', AZ, surge(lt, 0.2), 10)}
          {chip(232, 22, 'Depois, a vítima', VERDE, surge(lt, 0.4 * d), 10)}
        </>
      ));
    }
    // 10. para guardar
    default:
      return base(lt, -6.5, 10, 1.6, [], () => (
        <>
          {escuro(0.45)}
          {chip(160, 18, 'Para guardar', TINTA, 1, 11)}
          {passos(1 + lt * 2.4, [0, 1, 2, 3, 4, 5], 1, 88, 34)}
        </>
      ));
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
