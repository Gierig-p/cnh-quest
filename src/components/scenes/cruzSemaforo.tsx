/**
 * Cruzamento com semáforo, faixa de pedestres e linha de retenção, para os vídeos do Mundo 2 (lote 3 de 15/11/2026):
 * semáforo, semáforo piscando e faixas que cruzam a pista.
 * Você vem pela faixa da direita (x = 1,75), indo para o norte; o semáforo fica na esquina da direita.
 */
import type { ReactNode } from 'react';
import { camLook, rect, type Obj, type Part, type V3 } from './engine';
import { car, trafficLight, zebra } from './models';
import { bairro, cruzamento } from './Mundo1';
import { Balao, SemaforoDesenho, raios } from './Mundo2';
import { AMARELO, VOCE, type Pr } from './videoBase';

export type Luz = 'vermelho' | 'amarelo' | 'verde' | 'apagado';

export const CY = -12;
/** a faixa de pedestres atravessa a sua rua entre ZY0 e ZY1; a linha de retenção vai de LY0 a LY1 */
export const ZY0 = CY + 3.9, ZY1 = CY + 6.9;
export const LY0 = CY + 7.4, LY1 = CY + 7.9;
/** onde o carro fica quando para com a frente antes da linha (a frente fica 2,15 m à frente do centro) */
export const PARA = LY1 + 2.6;
export const LUZ: V3 = [4.3, CY + 4.0, 3.0];
export const CAM = camLook(1.8, -4, 0.6, 16, 38, 13);
const BAIRRO = bairro(CY, 1);

/** chão do cruzamento; `linha` e `faixa` (0..1) pintam de amarelo a linha de retenção e a faixa de pedestres */
export function chaoSemaforo(linha = 0, faixa = 0): Part[] {
  return [
    ...cruzamento(CY),
    ...zebra(-3.5, ZY0, 3.5, ZY1, 'y'),
    rect(0.15, LY0, 3.35, LY1, '#ffffff'),
    ...(faixa > 0.01 ? [rect(-3.5, ZY0, 3.5, ZY1, AMARELO, 0.02, 0.45 * faixa)] : []),
    ...(linha > 0.01 ? [rect(0.05, LY0 - 0.15, 3.45, LY1 + 0.15, AMARELO, 0.02, 0.7 * linha)] : []),
  ];
}

export const eu = (y: number, brake = false, blink: 'l' | 'r' | 'lr' | null = null): Obj => car({ x: 1.75, y, color: VOCE, brake, blink });
export const objsSemaforo = (luz: Luz, extra: Obj[] = []): Obj[] => [...BAIRRO, trafficLight(LUZ[0], LUZ[1], luz), ...extra];

/** balão no alto, à direita, com o semáforo grande; `pisca` desenha os raios em volta da luz acesa */
export function balaoLuz(pr: Pr, luz: Luz, pisca = false, o = 1): ReactNode {
  if (o <= 0.01) return null;
  const [lx, ly] = pr(LUZ);
  return (
    <g opacity={o}>
      {pisca && luz !== 'apagado' && (
        <>
          <circle cx={lx} cy={ly} r={9} fill="#ffc83d" opacity={0.35} />
          {raios(lx, ly, 6, 4, '#ffd76a')}
        </>
      )}
      <Balao at={[lx + 3, ly]} x={262} y={14} w={44} h={80}>
        <g transform="translate(10 10)">
          <SemaforoDesenho luz={luz} pisca={pisca} />
        </g>
      </Balao>
    </g>
  );
}

/** semáforo grande desenhado na tela com as três luzes acesas; `deitado` gira para a horizontal */
export function semaforoTres(cx: number, cy: number, s: number, deitado = false, o = 1): ReactNode {
  if (o <= 0.01) return null;
  const cores = ['#ff3b30', '#ffc83d', '#22d36b'];
  const nomes = ['Vermelho', 'Amarelo', 'Verde'];
  return (
    <g opacity={o} transform={`translate(${cx} ${cy}) scale(${s})`} fontFamily="Arial, sans-serif" fontWeight={800}>
      <g transform={deitado ? 'rotate(-90)' : undefined}>
        <rect x={-12} y={-30} width={24} height={60} rx={5} fill="#2b323b" stroke="#fff" strokeWidth={0.8} />
        {cores.map((c, i) => (
          <circle key={c} cx={0} cy={-19 + i * 19} r={7} fill={c} />
        ))}
      </g>
      {nomes.map((n, i) =>
        deitado ? (
          <text key={n} x={-19 + i * 19} y={i === 1 ? -17 : 23} fontSize={6} fill="#fff" textAnchor="middle">{n}</text>
        ) : (
          <text key={n} x={17} y={-17 + i * 19} fontSize={6.4} fill="#fff">{n}</text>
        ),
      )}
    </g>
  );
}

/** luz de um semáforo que pisca: acesa na metade do tempo */
export const piscando = (lt: number, cor: Luz = 'amarelo'): Luz => (Math.floor(lt * 2) % 2 === 0 ? cor : 'apagado');
