/**
 * Vídeo do cartão c5-manutencao ("Manutenção e pneus"), Mundo 5, lote 1 de 16/11/2026.
 * Manutenção preventiva, conferências antes de sair, pneu murcho, sulcos de 1,6 mm,
 * balanceamento, calibragem e alinhamento, estepe, mau estado (grave) e o exemplo da Rita.
 * Tempos em content/videos/manutencao.json.
 */
import type { ReactNode } from 'react';
import { NAT, TINTA, chave, chip, etiqueta, item, papel, quadro, ruaFundo, surge, visto } from './infracoesUI';
import { escuro, fazerVideo, type Quadro } from './videoBase';
import tempos from '../../content/videos/manutencao.json';

const AZ = '#2f6db5';
const VERDE = '#2fa36b';
const LARANJA = '#ea7b2c';
const BORRACHA = '#2a2f36';

/** pneu visto de lado, centrado em (x, y); `murcho` (0 a 1) achata a parte de baixo */
export function pneu(x: number, y: number, r: number, o = 1, murcho = 0, gira = 0): ReactNode {
  if (o < 0.01) return null;
  const ach = r * 0.28 * murcho;
  const raios = [0, 1, 2, 3, 4].map((i) => gira + (i / 5) * Math.PI * 2);
  return (
    <g opacity={o}>
      <ellipse cx={x} cy={y + ach * 0.35} rx={r + ach * 0.45} ry={r - ach * 0.35} fill={BORRACHA} />
      {/* desenho da banda (riscos na borda) */}
      {Array.from({ length: 16 }, (_, i) => {
        const a = gira + (i / 16) * Math.PI * 2;
        return <line key={i} x1={x + Math.cos(a) * r * 0.86} y1={y + Math.sin(a) * r * 0.86} x2={x + Math.cos(a) * r * 0.98} y2={y + Math.sin(a) * r * 0.98} stroke="#4a525d" strokeWidth={2} />;
      })}
      <circle cx={x} cy={y} r={r * 0.55} fill="#c9d0d8" stroke="#8d97a3" strokeWidth={1.5} />
      {raios.map((a, i) => (
        <line key={i} x1={x + Math.cos(a) * r * 0.14} y1={y + Math.sin(a) * r * 0.14} x2={x + Math.cos(a) * r * 0.5} y2={y + Math.sin(a) * r * 0.5} stroke="#8d97a3" strokeWidth={2.4} strokeLinecap="round" />
      ))}
      <circle cx={x} cy={y} r={r * 0.13} fill="#7b8590" />
    </g>
  );
}

/** pedaço da banda do pneu, em corte, com os sulcos e a régua de 1,6 mm */
function sulcos(x: number, y: number, o = 1, regua = 0, agua = 0): ReactNode {
  if (o < 0.01) return null;
  const w = 150, h = 54;
  const canais = [22, 58, 94, 130];
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={BORRACHA} />
      {canais.map((cx) => (
        <rect key={cx} x={x + cx - 7} y={y} width={14} height={h * 0.5} fill="#11151a" />
      ))}
      {agua > 0.01 && canais.map((cx) => (
        <rect key={`a${cx}`} x={x + cx - 6} y={y + 2} width={12} height={h * 0.5 - 4} fill="#5aa0ff" opacity={0.8 * agua} />
      ))}
      <line x1={x - 8} y1={y} x2={x + w + 8} y2={y} stroke="#9fb1c4" strokeWidth={1} strokeDasharray="3 3" />
      {regua > 0.01 && (
        <g opacity={regua}>
          <line x1={x + 58 + 16} y1={y} x2={x + 58 + 16} y2={y + h * 0.5} stroke="#ffd84a" strokeWidth={2} />
          <line x1={x + 58 + 11} y1={y} x2={x + 58 + 21} y2={y} stroke="#ffd84a" strokeWidth={2} />
          <line x1={x + 58 + 11} y1={y + h * 0.5} x2={x + 58 + 21} y2={y + h * 0.5} stroke="#ffd84a" strokeWidth={2} />
        </g>
      )}
    </g>
  );
}

/** volante (pixels) centrado em (x, y), tremendo `tr` pixels */
export function volante(x: number, y: number, r: number, o = 1, tr = 0, t = 0): ReactNode {
  if (o < 0.01) return null;
  const dx = tr * Math.sin(t * 40);
  return (
    <g opacity={o} transform={`translate(${dx} 0)`}>
      <circle cx={x} cy={y} r={r} fill="none" stroke={BORRACHA} strokeWidth={r * 0.2} />
      <circle cx={x} cy={y} r={r * 0.22} fill={BORRACHA} />
      {[Math.PI / 2, Math.PI * 1.1, -Math.PI * 0.1].map((a, i) => (
        <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * r} y2={y + Math.sin(a) * r} stroke={BORRACHA} strokeWidth={r * 0.16} />
      ))}
      {tr > 0.1 && [-1, 1].map((s) => (
        <path key={s} d={`M${x + s * (r + 8)} ${y - 8} q${s * 5} 8 0 16`} fill="none" stroke="#ffd84a" strokeWidth={2} strokeLinecap="round" />
      ))}
    </g>
  );
}

/** carrinho visto de cima (pixels), indo para cima, girado `a` radianos */
export function carroCima(x: number, y: number, a: number, o = 1): ReactNode {
  return (
    <g opacity={o} transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}>
      {[-1, 1].flatMap((sx) => [-1, 1].map((sy) => <rect key={`${sx}${sy}`} x={sx * 13 - 3} y={sy * 14 - 5} width={6} height={10} rx={2} fill={BORRACHA} />))}
      <rect x={-12} y={-22} width={24} height={44} rx={7} fill="#e9eef3" stroke="#8d97a3" />
      <rect x={-9} y={-12} width={18} height={10} rx={2} fill="#7fa6c9" />
    </g>
  );
}

const ANTES = ['Combustível', 'Nível do óleo', 'Nível da água', 'Luzes acendem'];
const MURCHO = ['Gasta mais rápido', 'Fica instável', 'Gasta mais combustível', 'Escorrega mais na água'];

function fundo(lt: number, o = 0.45, over?: (lt: number) => ReactNode): Quadro {
  const q = ruaFundo(lt);
  return { ...q, over: () => (
    <>
      {escuro(o)}
      {over?.(lt)}
    </>
  ) };
}

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. todo veículo se desgasta
    case 0: {
      const q = ruaFundo(lt);
      return { ...q, over: () => chip(160, 30, 'Todo veículo se desgasta com o uso', TINTA, surge(lt, 0.3), 11) };
    }
    // 1. manutenção preventiva
    case 1:
      return fundo(lt, 0.45 * surge(lt, 0.1), () => (
        <>
          {etiqueta(50, 50, 220, 'Manutenção preventiva', 'Revisar e trocar antes de falhar', AZ, surge(lt, 0.3))}
          {chip(160, 130, 'Não espere quebrar no caminho', VERDE, surge(lt, 2.4), 10)}
        </>
      ));
    // 2. prazos do manual e profissionais habilitados
    case 2:
      return fundo(lt, 0.45, () => (
        <>
          {papel(62, 50, 1.1, 'Manual', AZ, surge(lt, 0.3), 'Prazos')}
          {chip(97, 150, 'Siga os prazos', AZ, surge(lt, 0.8), 10)}
          {chave(228, 86, surge(lt, 2.2), 1.6)}
          {chip(228, 150, 'Profissional habilitado', VERDE, surge(lt, 2.6), 10)}
        </>
      ));
    // 3. antes de sair, confira
    case 3:
      return fundo(lt, 0.45, () => (
        <>
          {quadro(70, 36, 180, 128, surge(lt, 0.1), (
            <>
              <text x={90} y={22} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={AZ}>Antes de sair, confira</text>
              {ANTES.map((t, i) => (
                <g key={t}>
                  {item(16, 50 + i * 22, t, AZ, surge(lt, 0.9 + i * 0.9), 10.5)}
                  {visto(158, 46 + i * 22, surge(lt, 1.3 + i * 0.9), 6)}
                </g>
              ))}
            </>
          ))}
        </>
      ));
    // 4. pneu murcho
    case 4:
      return fundo(lt, 0.45, () => (
        <>
          {pneu(70, 100, 44, surge(lt, 0.2), surge(lt, 0.6, 1.2))}
          {chip(70, 168, 'Pneu murcho', LARANJA, surge(lt, 0.8), 11)}
          {quadro(140, 44, 166, 112, surge(lt, 0.9), (
            <>
              {MURCHO.map((t, i) => <g key={t}>{item(10, 24 + i * 24, t, LARANJA, surge(lt, 1.2 + i * 1.1), 10)}</g>)}
            </>
          ))}
        </>
      ));
    // 5. sulcos tiram a água; pelo menos 1,6 mm
    case 5:
      return fundo(lt, 0.45, () => (
        <>
          {chip(160, 30, 'Sulcos: tiram a água de baixo do pneu', AZ, surge(lt, 0.2), 10)}
          {sulcos(85, 64, surge(lt, 0.4), surge(lt, 4.4), surge(lt, 1.4, 0.8))}
          {chip(160, 136, 'Pelo menos 1,6 mm de profundidade', '#b8860b', surge(lt, 4.8), 10)}
          {chip(160, 162, 'Orientação do manual de direção defensiva', TINTA, surge(lt, 6.0), 9)}
        </>
      ));
    // 6. volante vibrando: balanceamento
    case 6:
      return fundo(lt, 0.45, () => (
        <>
          {volante(100, 96, 40, surge(lt, 0.2), 2.2 * surge(lt, 0.6), lt)}
          {chip(100, 160, 'Volante vibrando', LARANJA, surge(lt, 0.6), 10)}
          {pneu(232, 92, 32, surge(lt, 1.8), 0, lt * 3)}
          {chip(232, 160, 'Balanceamento das rodas', AZ, surge(lt, 2.2), 10)}
        </>
      ));
    // 7. puxando para um lado: calibragem ou alinhamento
    case 7: {
      const a = 0.28 * Math.min(1, lt / 3);
      const y = 140 - 22 * lt;
      return fundo(lt, 0.45, () => (
        <>
          {quadro(30, 30, 110, 140, surge(lt, 0.1), (
            <>
              <rect x={45} y={0} width={20} height={140} fill="#5c6670" />
              <line x1={55} y1={6} x2={55} y2={134} stroke="#fff" strokeWidth={1.5} strokeDasharray="6 6" />
              {carroCima(55 + 30 * Math.sin(a) * Math.min(1, lt / 4), Math.max(36, y - 30), a)}
            </>
          ))}
          {chip(85, 182, 'Puxando para um lado', LARANJA, surge(lt, 0.4), 10)}
          {chip(230, 80, 'Calibragem', AZ, surge(lt, 1.8), 11)}
          {chip(230, 112, 'ou', TINTA, surge(lt, 2.4), 10)}
          {chip(230, 144, 'Alinhamento', AZ, surge(lt, 2.8), 11)}
        </>
      ));
    }
    // 8. estepe também
    case 8:
      return fundo(lt, 0.45, () => (
        <>
          {pneu(100, 92, 42, surge(lt, 0.2))}
          {chip(100, 160, 'Estepe: o pneu reserva', AZ, surge(lt, 0.6), 10)}
          {quadro(178, 56, 128, 76, surge(lt, 1.4), (
            <>
              <text x={64} y={22} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={VERDE}>Também confira</text>
              {item(12, 46, 'Calibragem', VERDE, surge(lt, 1.8), 10)}
              {item(12, 66, 'Sulcos', VERDE, surge(lt, 2.2), 10)}
            </>
          ))}
        </>
      ));
    // 9. mau estado de conservação: grave
    case 9:
      return fundo(lt, 0.45, () => (
        <>
          {etiqueta(40, 52, 240, 'Mau estado de conservação', 'Comprometendo a segurança', TINTA, surge(lt, 0.3))}
          {chip(160, 134, `Infração ${NAT[2].nome.toLowerCase()}`, NAT[2].cor, surge(lt, 3.0), 12)}
        </>
      ));
    // 10. Rita calibra para carro carregado e confere o estepe
    case 10:
      return fundo(lt, 0.4, () => (
        <>
          {chip(160, 24, 'Antes de viajar', AZ, surge(lt, 0.2), 11)}
          {pneu(78, 96, 36, surge(lt, 0.4))}
          {chip(78, 152, 'Pressão para carro carregado', AZ, surge(lt, 1.6), 9)}
          {chip(78, 174, 'Como manda o fabricante', TINTA, surge(lt, 2.8), 9)}
          {pneu(240, 96, 30, surge(lt, 4.4))}
          {chip(240, 152, 'Confere o estepe', VERDE, surge(lt, 4.8), 10)}
          {visto(270, 70, surge(lt, 5.4))}
        </>
      ));
    // 11. para guardar
    default:
      return fundo(lt, 0.45, () => (
        <>
          {chip(160, 40, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {etiqueta(60, 72, 200, 'Revisar antes', 'Evita quebrar no caminho', VERDE, surge(lt, 0.6))}
        </>
      ));
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);
