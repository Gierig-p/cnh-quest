/**
 * Vídeo do cartão c-hierarquia ("Quem manda mais?"), Mundo 1, lote 1 de 15/11/2026.
 * A escada de quatro degraus (agente, semáforo, sinais, normas) e os dois exemplos do cartão.
 * Tempos em content/videos/hierarquia.json.
 */
import type { ReactNode } from 'react';
import { camLook, rect, type Obj, type Part } from './engine';
import { car, person, trafficLight, zebra, type Look } from './models';
import { signPost, signTop, SignCallout } from './signs';
import { bairro, cruzamento } from './Mundo1';
import { AMARELO, RA, VOCE, certo, ease, escuro, fazerVideo, janela, lerp, ruaChao, ruaObjs, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/hierarquia.json';

const CY = -8;
const AGENTE: Look = { skin: '#b07a55', hair: '#2b2420', top: '#2c4a7a', bottom: '#1f2c44', shoes: '#1d1d1d', cap: '#2c4a7a', vest: '#c8f03c', gloves: '#ffffff', whistle: true };
const AX = -2.2, AY = CY + 4.6;
const LX = 4.3, LY = CY + 4.0;
const YV = 1.6;
const CHAO: Part[] = [...cruzamento(CY), ...zebra(-3.5, CY + 4.1, 3.5, CY + 6.9, 'y'), rect(0.2, CY + 7.5, 3.3, CY + 7.95, '#ffffff')];
const BAIRRO = bairro(CY, 2);
const fixo: Pr = (p) => [p[0], p[1]];

/** o agente de lado para você, braço levantado e antebraço indo da frente para trás: "siga" (CTB, Anexo II) */
const agenteSiga = (lt: number): Obj => person(AX, AY, AGENTE, 0, Math.PI / 2, 1.35, { r: [0.4, 2.3 + 0.5 * Math.sin(lt * 5)], l: [0.1, 0] });
const cruz = (luz: 'vermelho' | 'verde', lt: number, yv = YV, agente = true): Obj[] => [
  ...BAIRRO,
  trafficLight(LX, LY, luz),
  ...(agente ? [agenteSiga(lt)] : []),
  car({ x: 1.75, y: yv, color: VOCE, brake: yv > YV - 0.2 }),
];
const TOPO_LUZ: [number, number, number] = [LX, LY, 4.8];
const TOPO_AGENTE: [number, number, number] = [AX, AY, 2.8];

/* ---------- a escada ---------- */
const NOMES: Record<number, string> = { 1: 'Agente', 2: 'Semáforo', 3: 'Sinais', 4: 'Normas' };
/**
 * Escada em pixels: o 4º degrau embaixo à esquerda, o 1º no alto à direita.
 * `vis(r)` dá a opacidade de cada degrau; `dest` é o degrau em destaque.
 */
function escada(x0: number, yb: number, s: number, vis: (r: number) => number, dest: number | null, o = 1): ReactNode {
  if (o < 0.01) return null;
  const w = 58 * s, h = 24 * s;
  return (
    <g opacity={o}>
      {[4, 3, 2, 1].map((r) => {
        const a = vis(r);
        if (a < 0.01) return null;
        const col = 4 - r;
        const x = x0 + col * w, top = yb - (col + 1) * h;
        const on = dest === r;
        return (
          <g key={r} opacity={a}>
            <rect x={x} y={top} width={w - 2 * s} height={(col + 1) * h} rx={3 * s} fill={on ? AMARELO : '#f4f6f8'} stroke="#1d2430" strokeWidth={1.2} />
            <text x={x + w / 2 - s} y={top + 10 * s} textAnchor="middle" fontSize={9 * s} fontWeight={800} fill="#1d2430">{r}º</text>
            <text x={x + w / 2 - s} y={top + 20 * s} textAnchor="middle" fontSize={8 * s} fontWeight={700} fill="#1d2430">{NOMES[r]}</text>
          </g>
        );
      })}
    </g>
  );
}
/** escada pequena no canto, com o degrau da cena em destaque */
const canto = (dest: number, o = 1) => escada(6, 56, 0.5, () => 1, dest, o);

/* ---------- rua sem placa e rua com placa ---------- */
const RUA = ruaChao();
const RUA_OBJS = ruaObjs(4, true);
const PLACA = { x: RA + 0.6, y: -7, code: 'R-19' as const, speed: 40, face: 0 };
const POSTE = signPost(PLACA);
const camRua = (y: number) => camLook(2.2, y, 0, -24, 50, 11);

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. dois sinais dizendo coisas diferentes
    case 0:
      return {
        cam: camLook(2.2, -2.8, 0.6, 18, 40, 13),
        ground: CHAO,
        objs: cruz('vermelho', lt),
        over: (pr) => (
          <>
            {tag(pr, TOPO_LUZ, 'Vermelho: pare', ease((lt - 0.8) / 0.3))}
            {tag(pr, TOPO_AGENTE, 'Agente: siga', ease((lt - 2.0) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Quem manda mais?', ease((lt - 3.4) / 0.3))}
          </>
        ),
      };
    // 1. a escada
    case 1:
      return {
        cam: camLook(2.2, -2.8, 0.6, 18, 40, 13),
        ground: CHAO,
        objs: cruz('vermelho', lt),
        over: () => (
          <>
            {escuro(0.6 * ease(lt / 0.4))}
            {escada(44, 170, 1, (r) => ease((lt - 0.5 - (4 - r) * 0.35) / 0.3), lt > 2.6 ? 1 : null)}
            {tag(fixo, [210, 40, 0], 'Quem está em cima manda', ease((lt - 2.6) / 0.3))}
          </>
        ),
      };
    // 2. 1º o agente
    case 2:
      return {
        cam: camLook(-0.2, AY + 1.6, 1.2, 18, 34, 19),
        ground: CHAO,
        objs: cruz('vermelho', lt),
        over: (pr) => (
          <>
            {canto(1)}
            {tag(pr, TOPO_AGENTE, '1º Agente', janela(lt, 0.5, 2.4, 0.2))}
            {tag(pr, TOPO_AGENTE, 'Vale mais que tudo', ease((lt - 2.5) / 0.3))}
          </>
        ),
      };
    // 3. 2º o semáforo, acima das placas e das pinturas
    case 3:
      return {
        cam: camLook(3.2, LY + 2.4, 1.0, 18, 40, 16),
        ground: CHAO,
        objs: cruz('vermelho', lt, YV, false),
        over: (pr) => (
          <>
            {canto(2)}
            {tag(pr, TOPO_LUZ, '2º Semáforo', ease((lt - 0.5) / 0.3))}
            {tag(pr, [0.6, CY + 5.5, 0.1], 'Vale mais que as pinturas', ease((lt - 2.4) / 0.3))}
          </>
        ),
      };
    // 4. 3º placas e marcas no chão
    case 4: {
      const y = lerp(6, -1, ease(lt / 3.0));
      return {
        cam: camRua(-4),
        ground: RUA,
        objs: [...RUA_OBJS, POSTE, car({ x: 1.75, y, color: VOCE })],
        over: (pr) => (
          <>
            {canto(3)}
            {tag(pr, signTop(PLACA), '3º Placas', ease((lt - 0.5) / 0.3))}
            {tag(fixo, [160, 186, 0], 'e marcas no chão', ease((lt - 1.6) / 0.3))}
          </>
        ),
      };
    }
    // 5. 4º as regras gerais da lei (o limite quando não há placa)
    case 5: {
      const y = lerp(8, -6, ease(lt / 4.0));
      return {
        cam: camRua(-3),
        ground: RUA,
        objs: [...RUA_OBJS, car({ x: 1.75, y, color: VOCE })],
        over: (pr) => (
          <>
            {canto(4)}
            {tag(pr, [1.75, y + 0.4, 2.2], 'Sem placa', janela(lt, 0.6, 2.6, 0.2))}
            {tag(pr, [1.75, y + 0.4, 2.2], '4º Limite da lei', ease((lt - 2.7) / 0.3))}
          </>
        ),
      };
    }
    // 6. exemplo: vermelho, mas o agente manda seguir
    case 6: {
      const yv = lerp(YV, -20, ease((lt - 2.4) / 2.6));
      return {
        cam: camLook(2.2, -2.8, 0.6, 18, 40, 13),
        ground: CHAO,
        objs: cruz('vermelho', lt, yv),
        over: (pr) => (
          <>
            {tag(pr, TOPO_LUZ, 'Vermelho', ease((lt - 0.5) / 0.3))}
            {tag(pr, TOPO_AGENTE, 'Agente: siga', ease((lt - 1.4) / 0.3))}
            {certo(fixo, [250, 150, 0], ease((lt - 3.2) / 0.3), 14)}
          </>
        ),
      };
    }
    // 7. exemplo: a lei tem um limite geral, mas a rua tem placa: vale a placa
    case 7: {
      const y = lerp(7, -3, ease(lt / 4.5));
      return {
        cam: camRua(-4),
        ground: RUA,
        objs: [...RUA_OBJS, POSTE, car({ x: 1.75, y, color: VOCE })],
        over: (pr) => (
          <>
            {tag(fixo, [160, 186, 0], 'Limite geral da lei', janela(lt, 0.5, 2.6, 0.2))}
            {lt > 1.6 && <g opacity={ease((lt - 1.6) / 0.3)}><SignCallout at={pr(signTop(PLACA))} code="R-19" speed={40} dx={-56} dy={-14} size={38} /></g>}
            {tag(fixo, [160, 186, 0], 'Tem placa: vale a placa', ease((lt - 2.8) / 0.3))}
            {certo(pr, [RA + 0.6, -7, 4.6], ease((lt - 3.3) / 0.3))}
          </>
        ),
      };
    }
    // 8. para guardar
    default:
      return {
        cam: camLook(2.2, -2.8, 0.6, 18, 40, 13),
        ground: CHAO,
        objs: cruz('vermelho', lt),
        over: () => (
          <>
            {escuro(0.6 * ease(lt / 0.4))}
            {escada(44, 160, 1, (r) => ease((lt - 0.4 - (r - 1) * 0.5) / 0.3), null)}
            {tag(fixo, [160, 186, 0], 'Tem placa? Vale a placa', ease((lt - d + 2.4) / 0.3))}
          </>
        ),
      };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
