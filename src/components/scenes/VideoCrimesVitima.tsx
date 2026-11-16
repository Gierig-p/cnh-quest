/**
 * Vídeo do cartão c4-crimes-vitima ("Quando há vítima"), Mundo 4, lote 3 de 16/11/2026.
 * Infração × crime; homicídio culposo (2 a 4 anos), com álcool ou droga (5 a 8 anos); lesão corporal culposa
 * (6 meses a 2 anos); omissão de socorro e fuga do local; quem socorre não é preso em flagrante nem paga fiança.
 * Tempos em content/videos/crimes-vitima.json.
 */
import { camLook } from './engine';
import { car, person, type Look } from './models';
import { Lata, motociclistaNoChao } from './Mundo4';
import { NAT, TINTA, chip, etiqueta, grade, item, martelo, pilula, quadro, ruaFundo, surge, visto } from './infracoesUI';
import { RA, VOCE, escuro, fazerVideo, triangulo, type Quadro } from './videoBase';
import tempos from '../../content/videos/crimes-vitima.json';

const VM = NAT[3].cor;
const AZ = '#2f6db5';
const VD = '#2fa36b';
const XV = RA - 1.65;
const YP = 4;
const MOTORISTA: Look = { skin: '#d7a77f', hair: '#2b2420', top: '#2fa36b', bottom: '#33415a' };

/** a vítima no chão na frente do seu carro parado; `ajuda` põe você ao lado dela e o triângulo atrás */
function sinistro(ajuda: number): Quadro {
  const objs = [
    motociclistaNoChao(0.2, YP - 6.5, 0.9),
    car({ x: XV, y: YP, color: VOCE, brake: true }),
    ...(ajuda > 0.5 ? [person(0.9, YP - 5.6, MOTORISTA, 0, Math.PI * 0.8, 1.15), triangulo(XV, YP + 6)] : []),
  ];
  const q = ruaFundo(0, [], YP, 99);
  return { ...q, objs: [...q.objs, ...objs], cam: camLook(1.0, YP - 3.5, 0, -20, 40, 12) };
}

/** tribunal: martelo num quadrinho */
const juiz = (x: number, y: number, o: number) => quadro(x, y, 96, 90, o, martelo(48, 42));

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. não é só infração: é crime
    case 0: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.4 * surge(lt, 0.2))}
          {chip(100, 90, 'Infração', NAT[2].cor, surge(lt, 0.5), 13)}
          {chip(160, 90, '→', '#fff', surge(lt, 1.6), 14, TINTA)}
          {chip(220, 90, 'Crime', VM, surge(lt, 2.2), 15)}
        </>
      ) };
    }
    // 1. a Justiça julga; a pena pode ser de prisão
    case 1: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {juiz(40, 46, surge(lt, 0.2))}
          {chip(88, 152, 'Quem julga: a Justiça', TINTA, surge(lt, 0.8))}
          {quadro(196, 46, 72, 90, surge(lt, 2.2), grade(14, 18))}
          {chip(232, 152, 'Pode ser prisão', VM, surge(lt, 2.6))}
        </>
      ) };
    }
    // 2. matar sem querer, dirigindo: homicídio culposo
    case 2: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 56, 'Matar alguém sem querer, dirigindo', TINTA, surge(lt, 0.3), 10)}
          {etiqueta(80, 84, 160, 'Crime', 'Homicídio culposo', VM, surge(lt, 1.6))}
        </>
      ) };
    }
    // 3. detenção de 2 a 4 anos e suspensão ou proibição de dirigir
    case 3: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 30, 'Homicídio culposo', VM, 1, 11)}
          {etiqueta(70, 52, 180, 'Detenção', '2 a 4 anos', TINTA, surge(lt, 0.4))}
          {etiqueta(50, 110, 220, 'E também', 'Suspensão ou proibição de dirigir', AZ, surge(lt, 2.2))}
        </>
      ) };
    }
    // 4. com álcool ou droga: reclusão de 5 a 8 anos
    case 4: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(30, 40, 60, 84, surge(lt, 0.6), <g transform="translate(6 2) scale(1.6)"><Lata /></g>)}
          {quadro(98, 56, 60, 52, surge(lt, 1.0), pilula(30, 26, 1, 1.0))}
          {chip(94, 146, 'Álcool ou droga', TINTA, surge(lt, 1.2), 10)}
          {chip(196, 70, 'A pena sobe', VM, surge(lt, 2.6), 11)}
          {etiqueta(176, 96, 124, 'Reclusão', '5 a 8 anos', VM, surge(lt, 3.4))}
        </>
      ) };
    }
    // 5. ferir sem querer: lesão corporal culposa, 6 meses a 2 anos
    case 5: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 40, 'Ferir alguém sem querer', TINTA, surge(lt, 0.3), 11)}
          {etiqueta(70, 64, 180, 'Crime', 'Lesão corporal culposa', VM, surge(lt, 1.4))}
          {etiqueta(70, 124, 180, 'Detenção', '6 meses a 2 anos', TINTA, surge(lt, 3.2))}
        </>
      ) };
    }
    // 6. deixar de socorrer é crime, mesmo que outro tenha socorrido
    case 6: {
      const q = sinistro(0);
      return { ...q, over: () => (
        <>
          {chip(238, 30, 'Deixar de socorrer', TINTA, surge(lt, 0.3), 10.5)}
          {chip(238, 54, 'Crime', VM, surge(lt, 1.4), 12)}
          {chip(238, 160, 'Mesmo que outro tenha socorrido', TINTA, surge(lt, 2.6), 9)}
        </>
      ) };
    }
    // 7. fugir do local também é crime
    case 7: {
      const q = ruaFundo(lt, [motociclistaNoChao(0.2, YP + 3.5, 0.9)]);
      return { ...q, over: () => (
        <>
          {chip(160, 26, 'Fugir do local para não ser responsabilizado', TINTA, surge(lt, 0.3), 9.4)}
          {chip(160, 50, 'Também é crime', VM, surge(lt, 1.6), 12)}
        </>
      ) };
    }
    // 8. quem socorre: sem flagrante e sem fiança
    case 8: {
      const q = sinistro(1);
      return { ...q, over: () => (
        <>
          {chip(226, 24, 'Socorro pronto e completo', VD, surge(lt, 0.4), 10)}
          {quadro(150, 40, 154, 66, surge(lt, 1.8), (
            <>
              {item(10, 26, 'Sem prisão em flagrante', VD, 1, 9.6)}
              {item(10, 50, 'Sem fiança', VD, surge(lt, 3.4), 9.6)}
            </>
          ))}
          {visto(298, 44, surge(lt, 2.4), 7)}
        </>
      ) };
    }
    // 9. exemplo: o motorista para, sinaliza e chama o socorro
    case 9: {
      const q = sinistro(surge(lt, 1.2) > 0.5 ? 1 : 0);
      const a = [1.0, 2.0, 3.0];
      return { ...q, over: () => (
        <>
          {quadro(170, 30, 140, 92, surge(lt, 0.6), (
            <>
              {['Para', 'Sinaliza o local', 'Chama o socorro'].map((t, i) => (
                <g key={t}>
                  {item(10, 26 + i * 24, t, VD, surge(lt, a[i]), 10)}
                  {visto(126, 22 + i * 24, surge(lt, a[i] + 0.3), 6)}
                </g>
              ))}
            </>
          ))}
          {chip(248, 140, 'Agiu certo', VD, surge(lt, 4.8), 12)}
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
          {etiqueta(70, 66, 180, 'Socorrer a vítima', 'É dever e protege você', VD, surge(lt, 0.7))}
        </>
      ) };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
