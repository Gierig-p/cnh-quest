/**
 * Vídeo do cartão c2-marcas-transversais ("Faixas que cruzam a pista"), Mundo 2, lote 3 de 15/11/2026.
 * Linha de retenção (onde parar), faixa de pedestres (prioridade de quem atravessa) e a vaga de pessoa idosa.
 * Tempos em content/videos/marcas-transversais.json.
 */
import { car, person, type Look } from './models';
import { voce } from './Mundo1';
import { MARCA_IDOSO, vagaIdoso } from './Mundo2';
import { balaoArte } from './paineis';
import { CAM, LY1, PARA, ZY0, ZY1, balaoLuz, chaoSemaforo, eu, objsSemaforo } from './cruzSemaforo';
import { VOCE, certo, ease, escuro, fazerVideo, janela, lerp, placa, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/marcas-transversais.json';

const fixo: Pr = (p) => [p[0], p[1]];
const PESSOA: Look = { skin: '#c98a5e', hair: '#3a2a20', top: '#e05a7a', bottom: '#33415a', bag: '#2f80ed' };
const IDOSO = { node: MARCA_IDOSO, h: 140 };

/** pedestre atravessando a sua rua na faixa, de leste para oeste, de `a` a `b` (0..1 do trecho) */
function quemAtravessa(u: number) {
  const x = lerp(5, -5, u);
  return person(x, (ZY0 + ZY1) / 2, PESSOA, u * 30, -Math.PI / 2, 1.25);
}

/** os dois desenhos de faixa de pedestres: zebrada e com duas linhas paralelas */
function tiposDeFaixa(o: number) {
  if (o <= 0.01) return null;
  const caixa = (x: number, titulo: string, zebrada: boolean) => (
    <g transform={`translate(${x} 116)`}>
      <rect x={0} y={0} width={86} height={48} rx={7} fill="#fff" />
      <rect x={8} y={8} width={70} height={24} fill="#4a525c" />
      {zebrada
        ? Array.from({ length: 7 }, (_, i) => <rect key={i} x={11 + i * 9.6} y={10} width={5} height={20} fill="#eeeeea" />)
        : [<rect key="a" x={8} y={10} width={70} height={2.4} fill="#eeeeea" />, <rect key="b" x={8} y={27.6} width={70} height={2.4} fill="#eeeeea" />]}
      <text x={43} y={43} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={800} fontSize={8.5} fill="#1d2430">{titulo}</text>
    </g>
  );
  return (
    <g opacity={o}>
      {caixa(56, 'Zebrada', true)}
      {caixa(178, 'Duas linhas', false)}
    </g>
  );
}

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. pinturas que atravessam a pista: onde parar e por onde as pessoas passam
    case 0: {
      const y = lerp(6, 4, ease(lt / 3));
      const linha = janela(lt, 1.6, 3.6, 0.3), faixa = ease((lt - 3.6) / 0.3);
      return {
        cam: CAM,
        ground: chaoSemaforo(linha, faixa),
        objs: objsSemaforo('vermelho', [eu(y), quemAtravessa(ease((lt - 3.4) / (d - 3.4)))]),
        over: (pr) => (
          <>
            {lt < 1.6 && voce(pr, 1.75, y)}
            {tag(fixo, [110, 24, 0], 'De um lado ao outro', ease((lt - 0.4) / 0.3))}
            {tag(fixo, [150, 186, 0], 'Onde parar', linha)}
            {tag(fixo, [150, 186, 0], 'Por onde as pessoas passam', faixa)}
          </>
        ),
      };
    }
    // 1. linha de retenção: o limite onde você para (semáforo vermelho, placa PARE)
    case 1: {
      const y = lerp(7, PARA, ease(lt / 3));
      return {
        cam: CAM,
        ground: chaoSemaforo(ease((lt - 0.4) / 0.3)),
        objs: objsSemaforo('vermelho', [eu(y, lt > 0.6)]),
        over: (pr) => (
          <>
            {lt < 2.3 && voce(pr, 1.75, y)}
            {tag(fixo, [110, 24, 0], 'Linha de retenção', ease((lt - 0.4) / 0.3))}
            {tag(pr, [-0.4, LY1, 0.1], 'Pare aqui', ease((lt - 2.4) / 0.3))}
            {balaoLuz(pr, 'vermelho', false, ease((lt - 3.6) / 0.3))}
            {placa('R-1', 40, 150, 34, ease((lt - 4.6) / 0.3))}
            {tag(fixo, [150, 186, 0], 'No vermelho ou na placa PARE', ease((lt - 4.0) / 0.3))}
          </>
        ),
      };
    }
    // 2. faixa de pedestres: zebrada ou com duas linhas; prioridade de quem atravessa
    case 2: {
      return {
        cam: CAM,
        ground: chaoSemaforo(0, ease((lt - 0.3) / 0.3)),
        objs: objsSemaforo('vermelho', [eu(PARA, true), quemAtravessa(ease(lt / d))]),
        over: (pr) => (
          <>
            {voce(pr, 1.75, PARA)}
            {tag(fixo, [110, 24, 0], 'Faixa de pedestres', ease((lt - 0.3) / 0.3))}
            {tiposDeFaixa(janela(lt, 1.2, 4.6, 0.3))}
            {tag(fixo, [150, 186, 0], 'Prioridade do pedestre', ease((lt - 4.8) / 0.3))}
          </>
        ),
      };
    }
    // 3. no vermelho: antes da linha, sem ficar em cima da faixa
    case 3: {
      const y = lerp(9, PARA, ease(lt / 3.2));
      return {
        cam: CAM,
        ground: chaoSemaforo(ease((lt - 3.2) / 0.3), ease((lt - 3.2) / 0.3)),
        objs: objsSemaforo('vermelho', [eu(y, lt > 0.8), quemAtravessa(ease((lt - 3.4) / (d - 3.4)))]),
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balaoLuz(pr, 'vermelho')}
            {certo(pr, [-0.5, PARA - 1.5, 0.3], ease((lt - 3.2) / 0.3))}
            {tag(fixo, [110, 24, 0], 'Antes da linha', ease((lt - 3.3) / 0.3))}
            {tag(fixo, [150, 186, 0], 'A faixa fica livre', ease((lt - 4.2) / 0.3))}
          </>
        ),
      };
    }
    // 4. a vaga com o símbolo de pessoa idosa: 60 anos ou mais
    case 4: {
      const v = vagaIdoso();
      const y = lerp(4.2, -3.3, ease((lt - 2.6) / 2.6));
      return {
        cam: v.cam,
        ground: v.ground,
        objs: [...v.objs.slice(0, -1), car({ x: 0, y, color: VOCE })],
        over: (pr) => (
          <>
            {lt < 2.6 && voce(pr, 0, y)}
            {balaoArte(pr([0, -4.4, 0.05]), IDOSO, 236, 14, 50, ease((lt - 0.4) / 0.3))}
            {tag(fixo, [110, 24, 0], 'Vaga de pessoa idosa', ease((lt - 0.4) / 0.3))}
            {tag(fixo, [150, 186, 0], '60 anos ou mais', ease((lt - 2.0) / 0.3))}
          </>
        ),
      };
    }
    // 5. para guardar
    default:
      return {
        cam: CAM,
        ground: chaoSemaforo(ease((lt - 0.3) / 0.3), ease((lt - 1.6) / 0.3)),
        objs: objsSemaforo('vermelho', [eu(PARA, true), quemAtravessa(ease((lt - 1.6) / (d - 1.6)))]),
        over: () => (
          <>
            {escuro(0.25 * ease(lt / 0.4))}
            {tag(fixo, [110, 24, 0], 'Pare antes da linha', ease((lt - 0.3) / 0.3))}
            {tag(fixo, [150, 186, 0], 'A faixa é do pedestre', ease((lt - 1.6) / 0.3))}
          </>
        ),
      };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
