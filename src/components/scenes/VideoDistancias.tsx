/**
 * Vídeo do cartão c2-distancias ("Como ler uma placa de distâncias"), Mundo 2, lote 2 de 15/11/2026.
 * A placa verde na estrada: quilômetros, a mais perto em cima, no máximo três destinos.
 * Tempos em content/videos/distancias.json.
 */
import { camLook, type Obj } from './engine';
import { car } from './models';
import { voce } from './Mundo1';
import { campo, estrada } from './Mundo2';
import { VERDE_OUTRA, arteTela, balaoArte, painel, verdeDistancias } from './paineis';
import { VOCE, ease, escuro, fazerVideo, janela, lerp, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/distancias.json';

const fixo: Pr = (p) => [p[0], p[1]];
const CHAO = estrada('tracejada');
const CAMPO = campo(3);
const CAM = camLook(2.6, -6, 1, 14, 30, 9);
const PLACA = painel(verdeDistancias(), 6.6, 10.2, -9, 2.2);
const OUTRA = painel(VERDE_OUTRA, 6.6, 10.2, -30, 2.2);

const eu = (y: number): Obj => car({ x: 1.75, y, color: VOCE });
const base = (y: number, extra: Obj[] = []): Quadro => ({ cam: CAM, ground: CHAO, objs: [...CAMPO, PLACA.obj, ...extra, eu(y)] });

/** a viagem em linha: você e as três cidades nas distâncias da placa */
function viagem(lt: number): JSX.Element {
  const x0 = 40, x1 = 290, y = 120, km = 92;
  const px = (d: number) => x0 + ((x1 - x0) * d) / km;
  const voceKm = Math.min(12, lerp(0, 12, ease((lt - 1.4) / 2.4)));
  const cidades: [string, number][] = [['Vila Nova', 12], ['Santa Rita', 45], ['Porto Alto', 90]];
  return (
    <g fontFamily="Arial, sans-serif" fontWeight={800}>
      <line x1={x0} y1={y} x2={x1} y2={y} stroke="#c9ced6" strokeWidth={4} strokeLinecap="round" />
      {cidades.map(([c, d], i) => (
        <g key={c}>
          <circle cx={px(d)} cy={y} r={6} fill={i === 0 && voceKm >= 12 ? '#ffd84a' : '#0f7a3d'} stroke="#fff" strokeWidth={2} />
          <text x={px(d)} y={y + 22} textAnchor="middle" fontSize={10} fill="#fff">{c}</text>
          <text x={px(d)} y={y - 12} textAnchor="middle" fontSize={10} fill="#ffd84a">{d} km</text>
        </g>
      ))}
      <g transform={`translate(${px(voceKm)} ${y})`}>
        <rect x={-7} y={-4.5} width={14} height={9} rx={2.5} fill={VOCE} stroke="#1d2430" strokeWidth={1.4} />
      </g>
    </g>
  );
}

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. a placa verde com cidades e números
    case 0: {
      const y = lerp(8, 3, ease(lt / 3.2));
      return {
        ...base(y),
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balaoArte(pr(PLACA.topo), verdeDistancias(), 12, 8, 116, ease((lt - 0.4) / 0.3))}
          </>
        ),
      };
    }
    // 1. os números: quilômetros que faltam
    case 1:
      return {
        ...base(3),
        over: (pr) => (
          <>
            {voce(pr, 1.75, 3)}
            {balaoArte(pr(PLACA.topo), verdeDistancias('km'), 12, 8, 116, 1)}
            {tag(fixo, [160, 186, 0], 'Quilômetros que faltam', ease((lt - 0.3) / 0.3))}
          </>
        ),
      };
    // 2. a mais perto em cima, a mais longe embaixo
    case 2:
      return {
        ...base(3),
        over: (pr) => (
          <>
            {voce(pr, 1.75, 3)}
            {balaoArte(pr(PLACA.topo), verdeDistancias('ordem'), 12, 8, 116, 1)}
            {tag(fixo, [186, 22, 0], 'Mais perto: em cima', ease((lt - 0.6) / 0.3))}
            {tag(fixo, [186, 186, 0], 'Mais longe: embaixo', ease((lt - 1.8) / 0.3))}
          </>
        ),
      };
    // 3. 12, 45, 90: a primeira você alcança antes
    case 3:
      return {
        ...base(3),
        over: () => (
          <>
            {escuro(0.7 * ease(lt / 0.4))}
            {arteTela(verdeDistancias(lt > 3.6 ? 'primeira' : null), 160, 52, 104, 1)}
            {viagem(lt)}
            {tag(fixo, [160, 186, 0], 'Você alcança antes', ease((lt - 3.7) / 0.3))}
          </>
        ),
      };
    // 4. no máximo três destinos; o resto vai para outra placa
    case 4: {
      const y = lerp(3, -2, ease(lt / 4));
      return {
        ...base(y, [OUTRA.obj]),
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {balaoArte(pr(PLACA.topo), verdeDistancias(), 12, 8, 96, 1)}
            {tag(fixo, [64, 98, 0], 'No máximo 3', ease((lt - 0.4) / 0.3))}
            {balaoArte(pr(OUTRA.topo), VERDE_OUTRA, 196, 14, 96, ease((lt - 2.0) / 0.3))}
            {tag(fixo, [244, 78, 0], 'Mais: outra placa', ease((lt - 2.3) / 0.3))}
          </>
        ),
      };
    }
    // 5. para guardar
    default:
      return {
        ...base(3),
        over: () => (
          <>
            {escuro(0.65 * ease(lt / 0.4))}
            {arteTela(verdeDistancias('primeira'), 160, 80, 120, ease((lt - 0.1) / 0.3))}
            {tag(fixo, [160, 160, 0], 'Em cima, a mais perto', janela(lt, 0.4, 99, 0.3))}
          </>
        ),
      };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
