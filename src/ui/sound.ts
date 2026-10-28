/**
 * Sistema de áudio do CNH Quest.
 *
 * Todos os efeitos são sintetizados aqui mesmo com Web Audio (nenhum arquivo externo, nenhum som de terceiros):
 * zero bytes para baixar, nada para carregar antes de tocar e direitos 100% próprios.
 *
 * Regras:
 * - O AudioContext só é criado dentro de uma chamada de `playSound`, que sempre parte de um gesto do aluno
 *   (clique/tecla). Assim nenhum som toca ao abrir a página e as políticas de autoplay são respeitadas.
 * - O liga/desliga continua em `prefs.sound` (progresso). O volume é só do aparelho e fica em uma chave
 *   separada do localStorage, para não mexer no modelo de dados do progresso.
 * - O mesmo efeito não toca duas vezes em menos de 90 ms (cliques duplos, re-renderizações).
 * - Falhas são silenciosas: o app funciona igual sem áudio.
 */

export type SoundKind =
  | 'tap' // clique / confirmação de ação
  | 'select' // escolher uma alternativa
  | 'correct' // resposta certa
  | 'wrong' // resposta errada
  | 'combo' // sequência de acertos
  | 'complete' // lição concluída
  | 'xp' // contagem de XP
  | 'achievement' // conquista desbloqueada
  | 'celebrate' // celebração especial (domínio, aprovação)
  | 'transition' // troca de etapa
  | 'unlock'; // nova lição liberada

const VOLUME_KEY = 'cnhquest:audio:v1';
const DEFAULT_VOLUME = 0.7;
const DEDUP_MS = 90;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let volume = readVolume();
const lastPlayed = new Map<SoundKind, number>();

function readVolume(): number {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(VOLUME_KEY) : null;
    const v = raw ? Number(JSON.parse(raw).volume) : DEFAULT_VOLUME;
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

export function getVolume() {
  return volume;
}

export function setVolume(v: number) {
  volume = Math.min(1, Math.max(0, v));
  try {
    localStorage.setItem(VOLUME_KEY, JSON.stringify({ volume }));
  } catch {
    /* armazenamento indisponível: o volume vale só nesta sessão */
  }
  if (master && ctx) master.gain.setTargetAtTime(volume * 0.9, ctx.currentTime, 0.02);
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = volume * 0.9;
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Nota com envelope de ataque rápido e decaimento exponencial; `partial` soma um harmônico (som de sino). */
function note(freq: number, at: number, dur: number, opts: { type?: OscillatorType; gain?: number; partial?: number; glideTo?: number } = {}) {
  if (!ctx || !master) return;
  const { type = 'sine', gain = 0.18, partial = 0, glideTo } = opts;
  const t0 = ctx.currentTime + at;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  g.connect(master);
  const voices: [number, number][] = [[freq, 1]];
  if (partial) voices.push([freq * 2, partial]);
  for (const [f, amt] of voices) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo * (f / freq), t0 + dur * 0.8);
    const vg = ctx.createGain();
    vg.gain.value = amt;
    o.connect(vg).connect(g);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }
}

/** Sopro curto de ruído filtrado (transições). */
function whoosh(at: number, dur: number, from: number, to: number, gain = 0.08) {
  if (!ctx || !master) return;
  if (!noise) {
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const t0 = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, t0);
  f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

// Notas (Hz) usadas na "assinatura" sonora do app: dó maior, brilhante e amigável.
const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880, B5 = 987.77, C6 = 1046.5, E6 = 1318.5, G6 = 1568;

const RECIPES: Record<SoundKind, () => void> = {
  tap: () => note(1250, 0, 0.05, { gain: 0.07, glideTo: 900 }),
  select: () => {
    note(740, 0, 0.06, { type: 'triangle', gain: 0.1 });
    note(1110, 0.035, 0.07, { type: 'triangle', gain: 0.08 });
  },
  correct: () => {
    note(E5, 0, 0.16, { type: 'triangle', gain: 0.16, partial: 0.25 });
    note(G5, 0.07, 0.16, { type: 'triangle', gain: 0.16, partial: 0.25 });
    note(C6, 0.14, 0.32, { type: 'sine', gain: 0.2, partial: 0.35 });
  },
  wrong: () => {
    // grave e curto, sem estridência: errar não é bronca
    note(311, 0, 0.18, { type: 'triangle', gain: 0.16, glideTo: 262 });
    note(233, 0.13, 0.26, { type: 'triangle', gain: 0.14, glideTo: 196 });
  },
  combo: () => {
    [C6, E6, G6].forEach((f, i) => note(f, i * 0.05, 0.14, { type: 'sine', gain: 0.1, partial: 0.3 }));
  },
  complete: () => {
    [C5, E5, G5, C6].forEach((f, i) => note(f, i * 0.1, 0.24, { type: 'triangle', gain: 0.16, partial: 0.2 }));
    [C5, E5, G5].forEach((f) => note(f * 2, 0.42, 0.8, { type: 'sine', gain: 0.07 }));
  },
  xp: () => {
    note(B5, 0, 0.07, { type: 'square', gain: 0.035 });
    note(E6, 0.05, 0.16, { type: 'square', gain: 0.035 });
  },
  achievement: () => {
    [G5, B5, D5 * 2, G6].forEach((f, i) => note(f, i * 0.07, 0.3, { type: 'sine', gain: 0.12, partial: 0.4 }));
    note(G6 * 1.5, 0.32, 0.5, { type: 'sine', gain: 0.05 });
  },
  celebrate: () => {
    [C5, E5, G5].forEach((f, i) => note(f, i * 0.08, 0.2, { type: 'triangle', gain: 0.14 }));
    [A5, C6, E6].forEach((f, i) => note(f, 0.3 + i * 0.06, 0.24, { type: 'triangle', gain: 0.13, partial: 0.2 }));
    [C6, E6, G6].forEach((f) => note(f, 0.52, 0.9, { type: 'sine', gain: 0.07 }));
  },
  transition: () => whoosh(0, 0.18, 500, 2400, 0.05),
  unlock: () => {
    note(392, 0, 0.06, { type: 'square', gain: 0.04 });
    note(C5, 0.08, 0.14, { type: 'triangle', gain: 0.12 });
    note(G5, 0.16, 0.26, { type: 'sine', gain: 0.14, partial: 0.3 });
  },
};

/** Ponto único para tocar efeitos. `enabled` vem de `prefs.sound`. */
export function playSound(kind: SoundKind, enabled: boolean) {
  if (!enabled || volume <= 0) return;
  if (typeof document !== 'undefined' && document.hidden) return;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const last = lastPlayed.get(kind) ?? -Infinity;
  if (now - last < DEDUP_MS) return;
  lastPlayed.set(kind, now);
  try {
    if (!ensureContext()) return;
    RECIPES[kind]();
  } catch {
    /* sem áudio disponível */
  }
}
