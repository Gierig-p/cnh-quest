/**
 * Lumi: guia original do CNH Quest. Um semáforo curioso cujas luzes acompanham o humor:
 * verde = feliz, amarelo = pensando, vermelho = errou (sem bronca).
 *
 * Humores:
 * - idle: respira e pisca (padrão)
 * - wave: acena (boas-vindas, conceito novo)
 * - happy: sorriso de olhos fechados (acerto)
 * - cheer: pula com os braços para cima (conclusão, conquista)
 * - think: inclina a cabeça (revisão, dúvida)
 * - sad: murcha um pouco e encoraja (erro, vidas acabaram) — nunca debochado
 */
export type Mood = 'idle' | 'happy' | 'think' | 'sad' | 'cheer' | 'wave';

const INK = '#1d2a36';

export function Lumi({ mood = 'idle', size = 110, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const lit = mood === 'sad' ? 'r' : mood === 'think' ? 'y' : 'g';
  const armsUp = mood === 'cheer';
  const closedEyes = mood === 'happy' || mood === 'cheer';
  const mouth =
    mood === 'sad'
      ? 'M42 59 Q50 54 58 59'
      : mood === 'think'
        ? 'M43 58 Q50 56 57 58'
        : mood === 'cheer'
          ? 'M38 52 Q50 70 62 52 Z'
          : mood === 'happy'
            ? 'M39 53 Q50 66 61 53 Z'
            : 'M41 54 Q50 62 59 54';
  return (
    <svg className={`lumi mood-${mood} ${className}`} width={size} height={size * 1.25} viewBox="0 0 100 125" aria-hidden="true">
      <defs>
        <radialGradient id="lumi-glow-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7dffb0" />
          <stop offset="100%" stopColor="#22c55e" />
        </radialGradient>
        <radialGradient id="lumi-glow-y" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff1a8" />
          <stop offset="100%" stopColor="#ffbf1f" />
        </radialGradient>
        <radialGradient id="lumi-glow-r" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb3b3" />
          <stop offset="100%" stopColor="#ff4d55" />
        </radialGradient>
      </defs>
      <ellipse className="shadow" cx="50" cy="121" rx="25" ry="3.6" fill="#0d1b2a" opacity=".14" />
      <g className="body">
        {/* braços */}
        <path className="arm arm-l" d={armsUp ? 'M20 68 Q8 54 12 38' : 'M20 72 Q9 80 13 90'} stroke={INK} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path
          className="arm arm-r"
          d={armsUp || mood === 'wave' ? 'M80 68 Q93 54 89 38' : 'M80 72 Q91 80 87 90'}
          stroke={INK}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {/* corpo (caixa do semáforo) */}
        <rect x="18" y="12" width="64" height="104" rx="26" fill="#2b3a48" />
        <rect x="18" y="12" width="64" height="104" rx="26" fill="none" stroke="#1d2a36" strokeWidth="2.5" />
        <path d="M26 104 Q50 114 74 104" stroke="#ffffff" strokeOpacity=".08" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* visor/rosto */}
        <rect x="24" y="19" width="52" height="46" rx="20" fill="#f6faf8" />
        <rect x="27" y="22" width="20" height="6" rx="3" fill="#ffffff" opacity=".9" />
        {/* olhos */}
        {closedEyes ? (
          <>
            <path d="M34 41 Q40 35 46 41" stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M54 41 Q60 35 66 41" stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <g className="eye">
              <ellipse cx="40" cy="40" rx="5.2" ry="6.4" fill={INK} />
              <circle cx="41.8" cy="37.6" r="1.7" fill="#fff" />
            </g>
            <g className="eye">
              <ellipse cx="60" cy="40" rx="5.2" ry="6.4" fill={INK} />
              <circle cx="61.8" cy="37.6" r="1.7" fill="#fff" />
            </g>
          </>
        )}
        {mood === 'sad' && (
          <>
            <path d="M33 33 L45 29.5" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M67 33 L55 29.5" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
        {mood === 'think' && <path d="M54 30 Q60 26 67 29" stroke={INK} strokeWidth="2.5" strokeLinecap="round" fill="none" />}
        <path d={mouth} stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill={mood === 'cheer' || mood === 'happy' ? '#ff6b6b' : 'none'} />
        <circle cx="31" cy="50" r="4.2" fill="#ff8fa0" opacity=".55" />
        <circle cx="69" cy="50" r="4.2" fill="#ff8fa0" opacity=".55" />
        {/* luzes */}
        <g className="lights">
          <circle cx="34" cy="87" r="7.5" fill={lit === 'r' ? 'url(#lumi-glow-r)' : '#4a3236'} className={lit === 'r' ? 'on' : ''} />
          <circle cx="50" cy="87" r="7.5" fill={lit === 'y' ? 'url(#lumi-glow-y)' : '#4d4632'} className={lit === 'y' ? 'on' : ''} />
          <circle cx="66" cy="87" r="7.5" fill={lit === 'g' ? 'url(#lumi-glow-g)' : '#2d4637'} className={lit === 'g' ? 'on' : ''} />
        </g>
        {/* boné de instrutor */}
        <path d="M29 15 Q50 -1 71 15 Z" fill="#22b357" />
        <rect x="24" y="12" width="52" height="5.5" rx="2.75" fill="#17924a" />
        <circle cx="50" cy="7.5" r="2.6" fill="#ffd34d" />
      </g>
      {mood === 'cheer' && (
        <g className="sparks" fill="#ffc83d">
          <path d="M8 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
          <path d="M92 16 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" />
          <path d="M94 52 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2z" />
        </g>
      )}
    </svg>
  );
}
