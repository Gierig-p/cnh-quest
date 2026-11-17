/** Peças de tela comuns aos vídeos de escolha do Mundo 5 (aviso no alto, ícones e etiqueta no canto). */
import type { ReactNode } from 'react';

/** faixa de aviso no alto da tela (pixels) */
export function aviso(texto: string, cor: string, o: number, icone: ReactNode, lado: 'meio' | 'direita' = 'meio'): ReactNode {
  if (o <= 0.01) return null;
  const w = 16 + texto.length * 6.6 + 22;
  const x = lado === 'direita' ? 310 - w : 160 - w / 2;
  return (
    <g opacity={o}>
      <rect x={x} y={8} width={w} height={26} rx={13} fill={cor} />
      <g transform={`translate(${x + 15} 21)`}>{icone}</g>
      <text x={x + 28} y={25.5} fontSize={12.5} fontWeight={800} fill="#fff" fontFamily="Nunito, system-ui, sans-serif">{texto}</text>
    </g>
  );
}
export const xis = <path d="M-4.5 -4.5 L4.5 4.5 M4.5 -4.5 L-4.5 4.5" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />;
export const visto = <path d="M-5 0 L-1.5 3.8 L5 -4" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />;
export const interroga = <text x={-3.4} y={4.6} fontSize={13} fontWeight={900} fill="#fff">?</text>;

/** etiqueta fixa no canto de baixo (pixels) */
export function etiqueta(texto: string): ReactNode {
  const w = texto.length * 6.4 + 16;
  return (
    <g>
      <rect x={10} y={174} width={w} height={18} rx={9} fill="#ffffff" opacity={0.95} />
      <text x={10 + w / 2} y={186.5} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#1d2430" fontFamily="Nunito, system-ui, sans-serif">{texto}</text>
    </g>
  );
}
