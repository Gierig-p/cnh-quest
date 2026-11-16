/**
 * Vídeo do cartão c2-semaforo ("As três luzes do semáforo"), Mundo 2, lote 3 de 15/11/2026.
 * Verde segue, amarelo para se der, vermelho para; a ordem das luzes e a sequência; o amarelo longe e perto.
 * Tempos em content/videos/semaforo.json.
 */
import { camLook } from './engine';
import { car } from './models';
import { voce } from './Mundo1';
import { SemaforoDesenho } from './Mundo2';
import { CAM, CY, PARA, balaoLuz, chaoSemaforo, eu, objsSemaforo, semaforoTres, type Luz } from './cruzSemaforo';
import { certo, clamp, ease, escuro, fazerVideo, janela, lerp, proibido, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/semaforo.json';

const fixo: Pr = (p) => [p[0], p[1]];
const CHAO = chaoSemaforo();
const CAM_LONGE = camLook(1.8, -1, 0.6, 16, 38, 16);

/** a sequência verde, amarelo, vermelho, verde; `i` é o passo aceso */
function sequencia(i: number, o: number) {
  const passos: [string, string][] = [['Verde', '#22d36b'], ['Amarelo', '#ffc83d'], ['Vermelho', '#ff3b30'], ['Verde', '#22d36b']];
  return (
    <g opacity={o} fontFamily="Arial, sans-serif" fontWeight={800}>
      {passos.map(([n, c], k) => {
        const y = 52 + k * 30, ativo = k === i;
        return (
          <g key={k}>
            <rect x={160} y={y} width={110} height={22} rx={6} fill={ativo ? c : '#ffffff22'} stroke={c} strokeWidth={1.6} />
            <text x={215} y={y + 15} textAnchor="middle" fontSize={10} fill={ativo ? '#1d2430' : '#fff'}>{n}</text>
            {k < 3 && <path d={`M215 ${y + 23} v5 m-2.5 -2.5 l2.5 2.5 l2.5 -2.5`} stroke="#fff" strokeWidth={1.4} fill="none" />}
          </g>
        );
      })}
    </g>
  );
}

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. o semáforo conversa por cores
    case 0: {
      const y = lerp(8, 3, ease(lt / 3.5));
      const luz: Luz = (['verde', 'amarelo', 'vermelho'] as const)[Math.floor(lt / 1.2) % 3];
      return {
        cam: CAM,
        ground: CHAO,
        objs: objsSemaforo(luz, [eu(y)]),
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balaoLuz(pr, luz, false, ease((lt - 0.3) / 0.3))}
            {tag(fixo, [110, 24, 0], 'Semáforo', ease((lt - 0.5) / 0.3))}
            {tag(fixo, [150, 186, 0], 'Cada cor, uma atitude', ease((lt - 2.2) / 0.3))}
          </>
        ),
      };
    }
    // 1. verde: pode seguir, respeitando as regras
    case 1: {
      const y = lerp(5, -26, ease(clamp((lt - 0.6) / (d - 0.6))));
      return {
        cam: CAM,
        ground: CHAO,
        objs: objsSemaforo('verde', [eu(y)]),
        over: (pr) => (
          <>
            {y > -6 && voce(pr, 1.75, y)}
            {balaoLuz(pr, 'verde')}
            {tag(fixo, [110, 24, 0], 'Verde: pode seguir', ease((lt - 0.3) / 0.3))}
            {tag(fixo, [150, 186, 0], 'Respeitando as regras', ease((lt - 1.6) / 0.3))}
          </>
        ),
      };
    }
    // 2. amarelo: pare, a não ser que não dê com segurança
    case 2: {
      const kk = ease(lt / 3.4);
      const y = lerp(9, PARA, kk);
      return {
        cam: CAM,
        ground: CHAO,
        objs: objsSemaforo('amarelo', [eu(y, lt > 0.8)]),
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balaoLuz(pr, 'amarelo')}
            {tag(fixo, [110, 24, 0], 'Amarelo: está acabando', ease((lt - 0.3) / 0.3))}
            {tag(fixo, [150, 186, 0], 'Pare, se der com segurança', ease((lt - 2.6) / 0.3))}
          </>
        ),
      };
    }
    // 3. vermelho: proibido passar, obrigado a parar
    case 3: {
      const ox = lerp(-22, 22, clamp((lt - 0.4) / (d - 0.4)));
      return {
        cam: CAM,
        ground: CHAO,
        objs: objsSemaforo('vermelho', [car({ x: ox, y: CY + 1.75, heading: Math.PI / 2, color: '#4f7fc4' }), eu(PARA, true)]),
        over: (pr) => (
          <>
            {voce(pr, 1.75, PARA)}
            {balaoLuz(pr, 'vermelho')}
            {tag(fixo, [110, 24, 0], 'Vermelho: pare', ease((lt - 0.3) / 0.3))}
            {proibido(pr, [1.75, CY + 1.75, 0.3], ease((lt - 1.2) / 0.3), 13)}
            {tag(fixo, [160, 186, 0], 'Proibido passar', ease((lt - 1.2) / 0.3))}
          </>
        ),
      };
    }
    // 4. a ordem das luzes: de cima para baixo; deitado, da esquerda para a direita
    case 4: {
      const deitado = ease((lt - 4.0) / 0.3);
      return {
        cam: CAM,
        ground: CHAO,
        objs: objsSemaforo('vermelho', [eu(PARA, true)]),
        over: () => (
          <>
            {escuro(0.68 * ease(lt / 0.4))}
            {semaforoTres(lerp(130, 80, deitado), 92, 1.5, false, ease((lt - 0.3) / 0.3))}
            {tag(fixo, [160, 186, 0], 'De cima para baixo', janela(lt, 0.6, 3.9, 0.3))}
            {semaforoTres(236, 86, 1.5, true, deitado)}
            {tag(fixo, [236, 150, 0], 'Deitado', deitado)}
            {tag(fixo, [160, 186, 0], 'Da esquerda para a direita', ease((lt - 4.2) / 0.3))}
          </>
        ),
      };
    }
    // 5. a sequência: verde, amarelo, vermelho e de volta ao verde
    case 5: {
      const i = Math.min(3, Math.max(0, Math.floor((lt - 0.8) / ((d - 1.2) / 4))));
      const luz: Luz = (['verde', 'amarelo', 'vermelho', 'verde'] as const)[i];
      return {
        cam: CAM,
        ground: CHAO,
        objs: objsSemaforo(luz, [eu(PARA, true)]),
        over: () => (
          <>
            {escuro(0.68 * ease(lt / 0.4))}
            <g opacity={ease((lt - 0.2) / 0.3)} transform="translate(56 40) scale(1.9)">
              <SemaforoDesenho luz={luz} />
            </g>
            {sequencia(i, ease((lt - 0.4) / 0.3))}
            {tag(fixo, [215, 34, 0], 'A sequência', ease((lt - 0.4) / 0.3))}
          </>
        ),
      };
    }
    // 6. amarelo com você ainda longe: freie com calma e pare
    case 6: {
      const y = lerp(10, PARA, ease(clamp((lt - 0.3) / 3.6)));
      return {
        cam: CAM_LONGE,
        ground: CHAO,
        objs: objsSemaforo('amarelo', [eu(y, lt > 0.9)]),
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balaoLuz(pr, 'amarelo')}
            {tag(fixo, [110, 24, 0], 'Ainda longe', ease((lt - 0.3) / 0.3))}
            {tag(fixo, [150, 186, 0], 'Freie com calma e pare', ease((lt - 1.4) / 0.3))}
            {certo(pr, [-0.6, PARA - 1, 0.3], ease((lt - 3.6) / 0.3))}
          </>
        ),
      };
    }
    // 7. já quase na linha e frear seria perigoso: siga com atenção
    case 7: {
      const y = lerp(0.6, -26, ease(clamp((lt - 1.4) / (d - 1.4))));
      return {
        cam: CAM,
        ground: CHAO,
        objs: objsSemaforo('amarelo', [eu(y)]),
        over: (pr) => (
          <>
            {y > -6 && voce(pr, 1.75, y)}
            {balaoLuz(pr, 'amarelo')}
            {tag(fixo, [110, 24, 0], 'Quase na linha', ease((lt - 0.3) / 0.3))}
            {tag(fixo, [150, 186, 0], 'Siga com atenção', ease((lt - 1.8) / 0.3))}
          </>
        ),
      };
    }
    // 8. para guardar
    default:
      return {
        cam: CAM,
        ground: CHAO,
        objs: objsSemaforo('amarelo', [eu(PARA, true)]),
        over: () => (
          <>
            {escuro(0.68 * ease(lt / 0.4))}
            <g opacity={ease((lt - 0.1) / 0.3)} transform="translate(60 40) scale(1.9)">
              <SemaforoDesenho luz="amarelo" />
            </g>
            <g opacity={ease((lt - 0.6) / 0.3)}>
              <text x={210} y={76} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={800} fontSize={14} fill="#fff">Não é</text>
              <text x={210} y={98} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={800} fontSize={18} fill="#fff">acelera</text>
              <line x1={174} y1={92} x2={246} y2={92} stroke="#ff5a5f" strokeWidth={3} strokeLinecap="round" />
            </g>
            {tag(fixo, [160, 186, 0], 'Pare, se der com segurança', ease((lt - 2.2) / 0.3))}
          </>
        ),
      };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
