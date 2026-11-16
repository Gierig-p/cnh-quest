/**
 * Vídeo do cartão c2-marcas-cores ("As cores pintadas no chão"), Mundo 2, lote 2 de 15/11/2026.
 * Amarela (fluxos opostos e proibido parar), branca (mesmo sentido, borda, faixa, retenção, setas),
 * vermelha (ciclofaixa) e azul (vaga especial).
 * Tempos em content/videos/marcas-cores.json.
 */
import type { ReactNode } from 'react';
import { camLook, flat, rect, type Obj, type Part } from './engine';
import { building, car, cyclist, lampPost, sidewalk, tree, zebra, asphalt, grassPatches } from './models';
import { avenida, avenidaObjs, bairro, cruzamento, voce } from './Mundo1';
import { CAM_ESTRADA, campo, estrada } from './Mundo2';
import { RA, VOCE, ease, escuro, fazerVideo, janela, lerp, proibido, ruaChao, ruaObjs, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/marcas-cores.json';

const fixo: Pr = (p) => [p[0], p[1]];
const AMAR = '#f2c21b', BRANCO = '#eeeeea', VERM = '#c8402f', AZULV = '#1f5fbf';

/* estrada de mão dupla: linha amarela no meio */
const ESTRADA = estrada('tracejada');
const CAMPO = campo(1);

/* rua com o meio-fio da direita pintado de amarelo */
const CHAO_AMAR = ruaChao([rect(RA - 0.24, -34, RA - 0.08, 4, AMAR, 0.02)]);
const RUA_OBJS = ruaObjs(2, true);
const CAM_RUA = camLook(2.2, -8, 0, -24, 50, 11);

/* avenida de mão única com faixas brancas */
const AV = avenida('tracejada');
const AV_OBJS = avenidaObjs();
const CAM_AV = camLook(0.2, -5, 0, 14, 40, 10);

/* cruzamento com as marcas brancas: borda, faixa de pedestres, retenção e seta */
const CY = -7;
const SETA: Part = flat([[1.75, CY + 9.6], [2.45, CY + 10.6], [2.0, CY + 10.6], [2.0, CY + 12.6], [1.5, CY + 12.6], [1.5, CY + 10.6], [1.05, CY + 10.6]], BRANCO, 0.02);
const CHAO_BRANCO: Part[] = [
  ...cruzamento(CY),
  ...zebra(-3.5, CY + 4.1, 3.5, CY + 6.9, 'y'),
  rect(0.2, CY + 7.4, 3.3, CY + 7.9, '#ffffff', 0.02),
  rect(3.1, CY + 8.3, 3.25, 40, BRANCO, 0.02),
  rect(-3.25, CY + 8.3, -3.1, 40, BRANCO, 0.02),
  SETA,
];
const BAIRRO = bairro(CY, 2);
const CAM_CRUZ = camLook(1.2, -3, 0, -14, 46, 10.5);

/* ciclofaixa vermelha junto ao meio-fio da direita */
const CHAO_CICLO = ruaChao([rect(RA - 1.5, -60, RA - 0.05, 40, VERM, 0.01), rect(RA - 1.68, -60, RA - 1.5, 40, BRANCO, 0.02)]);

/* estacionamento: vaga especial com o fundo azul */
const cadeirante: ReactNode = (
  <g>
    <rect x={0} y={0} width={100} height={100} fill={AZULV} />
    <g fill="#fff" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={46} cy={18} r={8} stroke="none" />
      <path d="M44 30 L42 58 L64 58 L72 80" fill="none" strokeWidth={8} />
      <path d="M43 42 L60 42" fill="none" strokeWidth={6} />
      <path d="M34 48 A22 22 0 1 0 64 74" fill="none" strokeWidth={6} />
    </g>
  </g>
);
const FUNDO = -6, FRENTE = -0.6, LARG = 2.6;
const VAGAS = [-2, -1, 0, 1, 2].map((i) => i * LARG);
const CHAO_VAGA: Part[] = (() => {
  const g: Part[] = [
    ...grassPatches(-40, -40, 40, 40, 5),
    ...asphalt(-14, FUNDO, 14, 12, 3),
    ...sidewalk(-30, FUNDO - 3, 30, FUNDO, 'x'),
    ...[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((i) => rect(i * LARG - 0.06, FUNDO, i * LARG + 0.06, FRENTE, BRANCO, 0.01)),
  ];
  const m = rect(-0.95, FUNDO + 0.6, 0.95, FUNDO + 2.5, AZULV, 0.015);
  m.faces = [{ ...m.faces[0], art: { o: [-0.95, FUNDO + 0.6, 0.015], u: [0.95, FUNDO + 0.6, 0.015], v: [-0.95, FUNDO + 2.5, 0.015], node: cadeirante } }];
  g.push(m);
  return g;
})();
const VAGA_OBJS: Obj[] = [
  building({ x0: -16, y0: -20, x1: 0, y1: -10, h: 7, color: '#f1dca6', shop: 's', seed: 5 }),
  building({ x0: 1, y0: -20, x1: 15, y1: -10, h: 9, color: '#cfe7c4', shop: 's', seed: 3 }),
  tree(-9, FUNDO - 1.5, 0.9, 1),
  tree(9, FUNDO - 1.5, 0.9, 2),
  lampPost(4, FUNDO - 1.6, -1),
  car({ x: VAGAS[0], y: (FUNDO + FRENTE) / 2, color: '#8f98a3' }),
  car({ x: VAGAS[1], y: (FUNDO + FRENTE) / 2, color: '#e0412f' }),
  car({ x: VAGAS[3], y: (FUNDO + FRENTE) / 2, color: '#4f7fc4' }),
  car({ x: VAGAS[4], y: (FUNDO + FRENTE) / 2, color: '#f2c21b' }),
];
const CAM_VAGA = camLook(0, -2.5, 0, 0, 52, 13);

/** uma faixa de cor com o nome, em pixels */
function amostra(x: number, cor: string, nome: string, o: number): ReactNode {
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      <rect x={x - 26} y={44} width={52} height={78} rx={6} fill="#2b3038" stroke="#fff" strokeWidth={1.5} />
      <rect x={x - 5} y={52} width={10} height={62} rx={2} fill={cor} />
      {tag(fixo, [x, 146, 0], nome, 1)}
    </g>
  );
}

/** pista vista de cima, em pixels: duas faixas, a linha do meio e as setas de quem anda nelas */
function pista(cx: number, linha: string, opostos: boolean, o: number): ReactNode {
  if (o <= 0.01) return null;
  const seta = (x: number, cima: boolean) => (
    <path d={cima ? `M${x} 52 l9 12 h-5 v24 h-8 v-24 h-5 z` : `M${x} 100 l9 -12 h-5 v-24 h-8 v24 h-5 z`} fill="#fff" />
  );
  return (
    <g opacity={o}>
      <rect x={cx - 46} y={44} width={92} height={64} rx={4} fill="#4a5058" />
      <rect x={cx - 2} y={44} width={4} height={64} fill={linha} />
      {seta(cx - 23, !opostos)}
      {seta(cx + 23, true)}
    </g>
  );
}

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. as pinturas no asfalto também são sinais; cada cor, um trabalho
    case 0:
      return {
        cam: CAM_ESTRADA,
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: 1.75, y: 1.5, color: VOCE })],
        over: () => (
          <>
            {escuro(0.62 * ease(lt / 0.4))}
            {tag(fixo, [160, 22, 0], 'Pintura no chão é sinal', ease((lt - 0.2) / 0.3))}
            {amostra(64, AMAR, 'Amarela', ease((lt - 1.6) / 0.3))}
            {amostra(128, BRANCO, 'Branca', ease((lt - 1.9) / 0.3))}
            {amostra(192, VERM, 'Vermelha', ease((lt - 2.2) / 0.3))}
            {amostra(256, AZULV, 'Azul', ease((lt - 2.5) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Cada cor, um trabalho', ease((lt - 2.8) / 0.3))}
          </>
        ),
      };
    // 1. amarela: separa quem vai de quem vem
    case 1: {
      const y = lerp(2, -4, lt / 5.8);
      const yo = lerp(-34, -13, lt / 5.8);
      return {
        cam: CAM_ESTRADA,
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: -1.75, y: yo, heading: Math.PI, color: '#e0412f' }), car({ x: 1.75, y, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, 1.75, y)}
            {tag(pr, [0, -8, 0.2], 'Amarela', janela(lt, 0.3, 2.4, 0.2))}
            {tag(pr, [-1.75, yo - 0.4, 2.2], 'Vem de frente', ease((lt - 2.5) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Divide quem vai de quem vem', ease((lt - 1.0) / 0.3))}
          </>
        ),
      };
    }
    // 2. amarela também marca onde é proibido parar ou estacionar
    case 2: {
      const y = lerp(4, -14, lt / 3.5);
      return {
        cam: CAM_RUA,
        ground: CHAO_AMAR,
        objs: [...RUA_OBJS, car({ x: 1.75, y, color: VOCE })],
        over: (pr) => (
          <>
            {proibido(pr, [RA - 0.4, -12, 0.4], ease((lt - 0.4) / 0.3))}
            {tag(pr, [RA - 0.16, -2, 0.2], 'Meio-fio amarelo', ease((lt - 0.2) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Proibido parar ou estacionar', ease((lt - 0.8) / 0.3))}
          </>
        ),
      };
    }
    // 3. branca: faixas do mesmo sentido
    case 3: {
      const y = lerp(1.5, -3, lt / 3.8);
      return {
        cam: CAM_AV,
        ground: AV,
        objs: [...AV_OBJS, car({ x: -1.8, y: y - 8, color: '#4f7fc4' }), car({ x: 1.8, y, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, 1.8, y)}
            {tag(pr, [0, -14, 0.2], 'Branca', ease((lt - 0.2) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Todos para o mesmo lado', ease((lt - 0.9) / 0.3))}
          </>
        ),
      };
    }
    // 4. branca: borda, faixa de pedestres, retenção e setas
    case 4:
      return {
        cam: CAM_CRUZ,
        ground: CHAO_BRANCO,
        objs: [...BAIRRO, car({ x: 1.75, y: CY + 15, color: VOCE })],
        over: (pr) => (
          <>
            {tag(pr, [3.2, CY + 13, 0.1], 'Borda', janela(lt, 0.8, 1.6, 0.2))}
            {tag(pr, [-1.8, CY + 5.5, 0.1], 'Faixa de pedestres', janela(lt, 1.7, 2.6, 0.2))}
            {tag(pr, [2.4, CY + 7.6, 0.1], 'Retenção', janela(lt, 2.7, 3.6, 0.2))}
            {tag(pr, [1.75, CY + 11.1, 0.1], 'Seta', ease((lt - 3.7) / 0.3))}
          </>
        ),
      };
    // 5. vermelha: ciclovia e ciclofaixa
    case 5: {
      const yb = lerp(2, -8, lt / 3.1);
      return {
        cam: CAM_RUA,
        ground: CHAO_CICLO,
        objs: [...RUA_OBJS, cyclist(RA - 0.78, yb, lt * 14), car({ x: -1.75, y: -12, heading: Math.PI, color: '#8f98a3' })],
        over: (pr) => (
          <>
            {tag(pr, [RA - 0.78, -14, 0.1], 'Vermelha', ease((lt - 0.2) / 0.3))}
            {tag(fixo, [160, 186, 0], 'Ciclovia e ciclofaixa', ease((lt - 0.6) / 0.3))}
          </>
        ),
      };
    }
    // 6. azul: fundo do símbolo nas vagas especiais
    case 6: {
      const y = lerp(7, 4.2, ease(lt / 2));
      return {
        cam: CAM_VAGA,
        ground: CHAO_VAGA,
        objs: [...VAGA_OBJS, car({ x: 0, y, color: VOCE })],
        over: (pr) => (
          <>
            {voce(pr, 0, y)}
            {tag(pr, [0, FUNDO + 1.5, 0.1], 'Fundo azul', ease((lt - 0.5) / 0.3))}
            {tag(fixo, [160, 22, 0], 'Vaga especial', ease((lt - 1.4) / 0.3))}
          </>
        ),
      };
    }
    // 7. para guardar
    default:
      return {
        cam: CAM_ESTRADA,
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: 1.75, y: 1.5, color: VOCE })],
        over: () => (
          <>
            {escuro(0.65 * ease(lt / 0.4))}
            {pista(90, AMAR, true, ease((lt - 0.2) / 0.3))}
            {tag(fixo, [90, 132, 0], 'Amarelo: vai e vem', ease((lt - 0.5) / 0.3))}
            {pista(230, BRANCO, false, ease((lt - 1.8) / 0.3))}
            {tag(fixo, [230, 132, 0], 'Branco: vão juntos', ease((lt - 2.1) / 0.3))}
            {tag(fixo, [160, 22, 0], 'Para guardar', janela(lt, 0.2, 99, 0.3))}
          </>
        ),
      };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
