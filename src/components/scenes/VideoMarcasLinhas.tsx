/**
 * Vídeo do cartão c2-marcas-linhas ("Linha cheia ou linha tracejada?"), Mundo 2, lote 3 de 15/11/2026.
 * Linha cheia é um muro pintado; tracejada é uma porta usada com cuidado. Amarela e branca, cheia e tracejada.
 * Tempos em content/videos/marcas-linhas.json.
 */
import { camLook, rect, type Obj, type Part, type V2 } from './engine';
import { car, house } from './models';
import { utilitario } from './veiculos';
import { avenida, avenidaObjs, voce } from './Mundo1';
import { ACOST, campo, estrada } from './Mundo2';
import { VOCE, arco, caminho, certo, clamp, ease, escuro, fazerVideo, janela, lerp, pisca, proibido, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/marcas-linhas.json';

const fixo: Pr = (p) => [p[0], p[1]];
const DIR = 1.75, ESQ = -1.75;
const CONT = estrada('continua');
const DUPLA: Part[] = [...CONT.slice(0, -1), rect(-0.3, -70, -0.14, 40, '#f2c21b'), rect(0.14, -70, 0.3, 40, '#f2c21b')];
const TRAC = estrada('tracejada');
const CAMPO = campo(4);

/* a entrada do sítio, à esquerda: a cerca abre e um caminho de terra leva à casa */
const EY0 = -12, EY1 = -8.4, EYM = (EY0 + EY1) / 2;
const SITIO_CHAO: Part[] = [...CONT, rect(-17, EY0, -ACOST - 0.7, EY1, '#b49a72')];
const SITIO: Obj[] = [...campo(4, [EY0 - 0.2, EY1 + 0.2]), house(-23, EY0 - 2, -17, EY1 + 2, '#f3e3b8', '#c8553d', 'e')];
const ENTRAR = caminho([[DIR, 8], [DIR, EYM + 3.5], ...arco(DIR - 3.5, EYM + 3.5, 3.5, 0, -Math.PI / 2), [-15, EYM]] as V2[]);

/** ultrapassagem em `u` (0..1): sai para a esquerda, passa e volta; `rel` é a distância para o veículo da frente */
function passar(u: number) {
  let rel: number, x: number, head = 0;
  let seta: 'l' | 'r' | null = null;
  if (u < 0.16) [rel, x, seta] = [10.5, DIR, u > 0.04 ? 'l' : null];
  else if (u < 0.36) {
    const k = ease((u - 0.16) / 0.2);
    [rel, x, head, seta] = [lerp(10.5, 7, k), lerp(DIR, ESQ, k), -0.2 * Math.sin(Math.PI * k), 'l'];
  } else if (u < 0.7) [rel, x, seta] = [lerp(7, -9.5, ease((u - 0.36) / 0.34)), ESQ, u > 0.62 ? 'r' : null];
  else if (u < 0.9) {
    const k = ease((u - 0.7) / 0.2);
    [rel, x, head, seta] = [lerp(-9.5, -11.5, k), lerp(ESQ, DIR, k), 0.2 * Math.sin(Math.PI * k), 'r'];
  } else [rel, x] = [lerp(-11.5, -12.5, (u - 0.9) / 0.1), DIR];
  return { rel, x, head, seta };
}

/** pedaço de pista desenhado na tela, com a linha no meio; um muro (cheia) ou uma porta (tracejada) em cima */
function pista(cx: number, tipo: 'cheia' | 'tracejada', o: number) {
  if (o <= 0.01) return null;
  const top = 34, h = 104;
  return (
    <g opacity={o}>
      <rect x={cx - 36} y={top} width={72} height={h} rx={6} fill="#4a525c" stroke="#fff" strokeWidth={1.4} />
      {tipo === 'cheia' ? (
        <rect x={cx - 2.5} y={top + 4} width={5} height={h - 8} fill="#f2c21b" />
      ) : (
        Array.from({ length: 6 }, (_, i) => <rect key={i} x={cx - 2.5} y={top + 6 + i * 17} width={5} height={9} fill="#f2c21b" />)
      )}
      {tipo === 'cheia' ? (
        <g transform={`translate(${cx - 18} ${top + h / 2 - 12})`}>
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={c * 12 + (r % 2 ? -6 : 0) + (r % 2 && c === 0 ? 6 : 0)} y={r * 8} width={r % 2 && c === 0 ? 6 : 11} height={7} fill="#b5603f" stroke="#7a3a24" strokeWidth={0.8} />),
          )}
        </g>
      ) : (
        <g transform={`translate(${cx - 9} ${top + h / 2 - 15})`}>
          <rect x={0} y={0} width={18} height={30} rx={1.5} fill="#8a5a36" stroke="#5a3a20" strokeWidth={1} />
          <rect x={3} y={3} width={12} height={10} fill="#a8724a" />
          <rect x={3} y={16} width={12} height={11} fill="#a8724a" />
          <circle cx={14.5} cy={16} r={1.4} fill="#ffd84a" />
        </g>
      )}
    </g>
  );
}

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. linha cheia é um muro pintado; tracejada é uma porta
    case 0:
      return {
        cam: camLook(1.2, -7, 0, 12, 36, 8.5),
        ground: CONT,
        objs: [...CAMPO, car({ x: DIR, y: 1.5, color: VOCE })],
        over: () => (
          <>
            {escuro(0.68 * ease(lt / 0.4))}
            {pista(90, 'cheia', ease((lt - 0.8) / 0.3))}
            {tag(fixo, [90, 166, 0], 'Cheia: um muro', ease((lt - 1.4) / 0.3))}
            {pista(230, 'tracejada', ease((lt - 3.2) / 0.3))}
            {tag(fixo, [230, 166, 0], 'Tracejada: uma porta', ease((lt - 3.6) / 0.3))}
          </>
        ),
      };
    // 1. amarela contínua, simples ou dupla: não ultrapassa e não muda de lado
    case 1: {
      const dupla = lt > d * 0.6;
      const yt = -4 - 1.5 * lt, yv = yt + 10;
      return {
        cam: camLook(1.2, yv - 8.5, 0, 12, 36, 8.5),
        ground: dupla ? DUPLA : CONT,
        objs: [...CAMPO, utilitario({ x: DIR, y: yt, tipo: 'caminhao' }), car({ x: DIR, y: yv, color: VOCE, blink: pisca(lt, lt > 1.2 && lt < 3 ? 'l' : null) })],
        over: (pr) => (
          <>
            {lt < 1.6 && voce(pr, DIR, yv)}
            {tag(fixo, [100, 24, 0], 'Amarela contínua', ease((lt - 0.3) / 0.3))}
            {proibido(pr, [0, yv - 3, 0.3], ease((lt - 1.6) / 0.3), 12)}
            {tag(fixo, [150, 186, 0], 'Não ultrapassa, não muda de lado', janela(lt, 1.8, d * 0.6 - 0.2, 0.3))}
            {tag(fixo, [150, 186, 0], 'Simples ou dupla', ease((lt - d * 0.6) / 0.3))}
          </>
        ),
      };
    }
    // 2. só cruza para entrar ou sair de um imóvel à beira da via
    case 2: {
      const p = ENTRAR.em(ENTRAR.total * ease(clamp((lt - 0.4) / (d - 0.8))));
      return {
        cam: camLook(-2.5, -5, 0, 22, 40, 12),
        ground: SITIO_CHAO,
        objs: [...SITIO, car({ x: p.x, y: p.y, heading: p.heading, color: VOCE, blink: pisca(lt, p.y > EYM + 1 ? 'l' : null) })],
        over: (pr) => (
          <>
            {p.y > EYM + 3 && voce(pr, p.x, p.y)}
            {tag(fixo, [110, 24, 0], 'Exceção', ease((lt - 0.3) / 0.3))}
            {tag(pr, [-20, EYM, 3.6], 'Imóvel', ease((lt - 0.6) / 0.3))}
            {certo(pr, [0, EYM, 0.3], ease((lt - 2.2) / 0.3))}
            {tag(fixo, [150, 186, 0], 'Entrar ou sair de um imóvel', ease((lt - 1.2) / 0.3))}
          </>
        ),
      };
    }
    // 3. amarela tracejada: pode ultrapassar e mudar de lado, com segurança
    case 3: {
      const yt = 2 - 2.6 * lt;
      const p = passar(clamp((lt - 0.4) / (d - 0.6)));
      const yv = yt + p.rel;
      return {
        cam: camLook(0.8, (yt + yv) / 2 - 2, 0, 14, 40, 8.6),
        ground: TRAC,
        objs: [...CAMPO, utilitario({ x: DIR, y: yt, tipo: 'caminhao' }), car({ x: p.x, y: yv, heading: p.head, color: VOCE, blink: pisca(lt, p.seta) })],
        over: (pr) => (
          <>
            {voce(pr, p.x, yv)}
            {tag(fixo, [100, 24, 0], 'Amarela tracejada', ease((lt - 0.3) / 0.3))}
            {tag(fixo, [150, 186, 0], 'Pode, com segurança', ease((lt - 1.6) / 0.3))}
          </>
        ),
      };
    }
    // 4. branca contínua entre faixas do mesmo sentido: não troca de faixa
    case 4: {
      const yv = 6 - 2 * lt, yo = yv - 7;
      return {
        cam: camLook(0.2, yv - 6.5, 0, 14, 40, 10),
        ground: avenida('continua'),
        objs: [...avenidaObjs(), car({ x: -1.8, y: yo, color: '#4f7fc4' }), car({ x: 1.8, y: yv, color: VOCE, blink: pisca(lt, lt > 1.2 && lt < 3.4 ? 'l' : null) })],
        over: (pr) => (
          <>
            {lt < 2.4 && voce(pr, 1.8, yv)}
            {tag(fixo, [100, 24, 0], 'Branca contínua', ease((lt - 0.3) / 0.3))}
            {tag(pr, [-1.8, yo, 2.2], 'Mesmo sentido', janela(lt, 0.8, 2.6, 0.3))}
            {proibido(pr, [0, yv - 3, 0.3], ease((lt - 2.4) / 0.3), 12)}
            {tag(fixo, [150, 186, 0], 'Não troca de faixa', ease((lt - 2.6) / 0.3))}
          </>
        ),
      };
    }
    // 5. branca tracejada: troca de faixa com cuidado e dando seta
    case 5: {
      const yv = 8 - 2.6 * lt;
      const kk = ease((lt - 2.0) / 1.8);
      const x = lerp(1.8, -1.8, kk);
      return {
        cam: camLook(0.2, yv - 6.5, 0, 14, 40, 10),
        ground: avenida('tracejada'),
        objs: [...avenidaObjs(), car({ x: -1.8, y: yv + 11, color: '#4f7fc4' }), car({ x, y: yv, heading: -0.22 * Math.sin(Math.PI * kk), color: VOCE, blink: pisca(lt, lt > 0.8 && lt < 3.8 ? 'l' : null) })],
        over: (pr) => (
          <>
            {lt < 3.9 && voce(pr, x, yv)}
            {tag(fixo, [100, 24, 0], 'Branca tracejada', ease((lt - 0.3) / 0.3))}
            {tag(fixo, [150, 186, 0], 'Só organiza as faixas', janela(lt, 0.8, 2.6, 0.3))}
            {tag(fixo, [150, 186, 0], 'Troque com cuidado e seta', ease((lt - 2.6) / 0.3))}
            {certo(pr, [x - 1.6, yv - 3, 0.3], ease((lt - 3.9) / 0.3))}
          </>
        ),
      };
    }
    // 6. exemplo: caminhão devagar, amarela contínua: não ultrapassa
    case 6: {
      const yt = -4 - 1.0 * lt, yv = yt + 9.5;
      return {
        cam: camLook(1.2, yv - 8.5, 0, 12, 36, 8.5),
        ground: CONT,
        objs: [...CAMPO, utilitario({ x: DIR, y: yt, tipo: 'caminhao' }), car({ x: DIR, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {lt < 2.4 && voce(pr, DIR, yv)}
            {tag(pr, [DIR, yt - 3.8, 3.6], 'Devagar', ease((lt - 0.6) / 0.3))}
            {tag(fixo, [100, 24, 0], 'Amarela contínua', ease((lt - 0.3) / 0.3))}
            {proibido(pr, [ESQ, yv - 5, 0.3], ease((lt - 2.4) / 0.3), 12)}
            {tag(fixo, [150, 186, 0], 'Não ultrapasse', ease((lt - 2.6) / 0.3))}
          </>
        ),
      };
    }
    // 7. para guardar
    default:
      return {
        cam: camLook(1.2, -7, 0, 12, 36, 8.5),
        ground: CONT,
        objs: [...CAMPO, car({ x: DIR, y: 1.5, color: VOCE })],
        over: () => (
          <>
            {escuro(0.68 * ease(lt / 0.4))}
            {pista(90, 'cheia', ease((lt - 0.2) / 0.3))}
            {tag(fixo, [90, 166, 0], 'Cheia: não cruza', ease((lt - 0.5) / 0.3))}
            {pista(230, 'tracejada', ease((lt - 1.6) / 0.3))}
            {tag(fixo, [230, 166, 0], 'Tracejada: com cuidado', ease((lt - 1.9) / 0.3))}
          </>
        ),
      };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
