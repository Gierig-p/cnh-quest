/**
 * Vídeo do cartão c2-semaforo-pisca ("Quando a luz pisca"), Mundo 2, lote 3 de 15/11/2026.
 * Amarelo piscando de madrugada (perigo; devagar, olhe e siga a preferência) e o vermelho piscando do pedestre.
 * Tempos em content/videos/semaforo-pisca.json.
 */
import { car, person, type Look } from './models';
import { voce } from './Mundo1';
import { Balao, FocoPedestreDesenho, PED_R0, PED_R1, noite, raios, ruaPedestre } from './Mundo2';
import { CAM, CY, balaoLuz, chaoSemaforo, eu, objsSemaforo, piscando } from './cruzSemaforo';
import { ease, escuro, fazerVideo, janela, lerp, proibido, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/semaforo-pisca.json';

const fixo: Pr = (p) => [p[0], p[1]];
const CHAO = chaoSemaforo();
const POSTES: [number, number, number][] = [[5.6, CY + 5.2, 4.3], [-5.6, CY - 6, 4.3]];
const OUTRA: Look = { skin: '#8d5a3b', hair: '#1d1d1d', top: '#2f80ed', bottom: '#3b3b3b' };

/** madrugada no cruzamento, com o amarelo piscando */
function madrugada(id: string, lt: number, extra: ReturnType<typeof eu>[], over: (pr: Pr) => JSX.Element | null): Quadro {
  const luz = piscando(lt);
  return {
    cam: CAM,
    ground: CHAO,
    objs: objsSemaforo(luz, extra),
    over: (pr) => (
      <>
        {noite(id, pr, POSTES)}
        {balaoLuz(pr, luz, true)}
        {over(pr)}
      </>
    ),
  };
}

/** a rua da faixa de pedestres, com o foco do outro lado */
function pedestres(foco: 'vermelho' | 'verde' | 'apagado', extra: ReturnType<typeof eu>[], over: (pr: Pr) => JSX.Element) {
  const r = ruaPedestre(foco);
  return {
    cam: r.cam,
    ground: r.ground,
    objs: [...r.objs, ...extra],
    over: (pr: Pr) => {
      const [fx, fy] = pr([2.3, PED_R0 - 0.45, 2.62]);
      return (
        <>
          {foco === 'vermelho' && raios(fx, fy, 4, 3, '#ffd76a', 6)}
          <Balao at={[fx + 2, fy]} x={262} y={10} w={48} h={80}>
            <g transform="translate(9 10)">
              <FocoPedestreDesenho luz={foco} pisca />
            </g>
          </Balao>
          {over(pr)}
        </>
      );
    },
  };
}

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. a luz piscando também é um recado
    case 0:
      return madrugada('sp0', lt, [eu(3)], (pr) => (
        <>
          {voce(pr, 1.75, 3)}
          {tag(fixo, [110, 24, 0], 'Luz piscando', ease((lt - 0.4) / 0.3))}
          {tag(fixo, [150, 186, 0], 'Também é um recado', ease((lt - 2.0) / 0.3))}
        </>
      ));
    // 1. amarelo piscando: perigo ou obstáculo; reduza
    case 1: {
      const y = lerp(8, 2, ease(lt / (d * 0.9)));
      return madrugada('sp1', lt, [eu(y, lt > 2.4)], (pr) => (
        <>
          {voce(pr, 1.75, y)}
          {tag(fixo, [110, 24, 0], 'Perigo ou obstáculo', ease((lt - 0.8) / 0.3))}
          {tag(fixo, [150, 186, 0], 'Reduza a velocidade', ease((lt - 2.6) / 0.3))}
        </>
      ));
    }
    // 2. de madrugada: ninguém tem o verde
    case 2: {
      const ox = lerp(-20, -9, ease(lt / (d * 0.8)));
      return madrugada('sp2', lt, [car({ x: ox, y: CY + 1.75, heading: Math.PI / 2, color: '#4f7fc4', brake: lt > 2 }), eu(2, true)], (pr) => (
        <>
          {voce(pr, 1.75, 2)}
          {tag(fixo, [110, 24, 0], 'De madrugada', ease((lt - 0.3) / 0.3))}
          {tag(fixo, [150, 186, 0], 'Ninguém tem o verde', ease((lt - 1.8) / 0.3))}
        </>
      ));
    }
    // 3. chegue devagar, olhe para os lados e siga a preferência
    case 3: {
      const y = lerp(2, -26, ease((lt - 3.2) / Math.max(0.5, d - 3.2)));
      const ox = lerp(-9, 22, ease((lt - 0.4) / 2.4));
      return madrugada('sp3', lt, [car({ x: ox, y: CY + 1.75, heading: Math.PI / 2, color: '#4f7fc4' }), eu(y, lt < 3.2)], (pr) => (
        <>
          {y > -6 && voce(pr, 1.75, y)}
          {tag(fixo, [70, 24, 0], 'Olhe à esquerda', janela(lt, 0.3, 1.8, 0.2))}
          {tag(fixo, [170, 24, 0], 'Olhe à direita', janela(lt, 1.4, 3.0, 0.2))}
          {tag(fixo, [150, 186, 0], 'Siga a preferência', ease((lt - 2.8) / 0.3))}
        </>
      ));
    }
    // 4. pedestre: o vermelho piscando avisa para não começar a atravessar
    case 4: {
      const foco = piscando(lt, 'vermelho') as 'vermelho' | 'apagado';
      return pedestres(foco, [], (pr) => (
        <>
          {voce(pr, -0.3, 1.2, 2.25)}
          {tag(fixo, [110, 24, 0], 'Vermelho piscando', ease((lt - 0.4) / 0.3))}
          {proibido(pr, [0.9, (PED_R0 + PED_R1) / 2, 0.3], ease((lt - 2.0) / 0.3))}
          {tag(fixo, [150, 186, 0], 'Não comece a atravessar', ease((lt - 2.0) / 0.3))}
        </>
      ));
    }
    // 5. quem já está atravessando termina
    case 5: {
      const foco = piscando(lt, 'vermelho') as 'vermelho' | 'apagado';
      const y = lerp(PED_R1 - 0.6, PED_R0 - 1.4, ease(lt / (d * 0.9)));
      return pedestres(foco, [person(0.9, y, OUTRA, lt * 7, 0, 1.25)], (pr) => (
        <>
          {voce(pr, -0.3, 1.2, 2.25)}
          {tag(pr, [0.9, y, 2.3], 'Já atravessando', ease((lt - 0.3) / 0.3))}
          {tag(fixo, [150, 186, 0], 'Termina a travessia', ease((lt - 1.0) / 0.3))}
        </>
      ));
    }
    // 6. a sequência do semáforo de pedestres
    case 6: {
      const passo = Math.min(3, Math.max(0, Math.floor((lt - 0.6) / ((d - 1.0) / 4))));
      const nomes: [string, string][] = [['Verde', '#22d36b'], ['Vermelho piscando', '#ff4d4f'], ['Vermelho', '#ff4d4f'], ['Verde', '#22d36b']];
      const foco = passo === 0 || passo === 3 ? 'verde' : passo === 1 ? piscando(lt, 'vermelho') : 'vermelho';
      const r = ruaPedestre('vermelho');
      return {
        ...r,
        objs: r.objs,
        over: () => (
          <>
            {escuro(0.68 * ease(lt / 0.4))}
            <g opacity={ease((lt - 0.2) / 0.3)} transform="translate(46 34) scale(1.9)">
              <FocoPedestreDesenho luz={foco as 'vermelho' | 'verde' | 'apagado'} pisca={passo === 1} />
            </g>
            <g fontFamily="Arial, sans-serif" fontWeight={800} opacity={ease((lt - 0.4) / 0.3)}>
              {nomes.map(([n, c], i) => (
                <g key={i}>
                  <rect x={150} y={38 + i * 30} width={130} height={22} rx={6} fill={i === passo ? c : '#ffffff22'} stroke={c} strokeWidth={1.6} />
                  <text x={215} y={53 + i * 30} textAnchor="middle" fontSize={10} fill={i === passo ? '#1d2430' : '#fff'}>{n}</text>
                </g>
              ))}
            </g>
            {tag(fixo, [160, 186, 0], 'Semáforo de pedestres', ease((lt - 0.4) / 0.3))}
          </>
        ),
      };
    }
    // 7. para guardar
    default:
      return madrugada('sp7', lt, [eu(2, true)], () => (
        <>
          {tag(fixo, [110, 24, 0], 'Pisca-pisca amarelo', ease((lt - 0.3) / 0.3))}
          {tag(fixo, [150, 186, 0], 'Devagar e atenção', ease((lt - 1.4) / 0.3))}
        </>
      ));
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
