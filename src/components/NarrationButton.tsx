import { useEffect, useRef, useState } from 'react';
import { NARRATION } from '../content/narration';
import { IconPause, IconSound } from './Icons';

type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

/** Endereço do áudio "Ouvir explicação" de um cartão (gerado por scripts/audio/cartoes.ts). */
export const narrationSrc = (cardId: string) => `${import.meta.env.BASE_URL}audio/cartoes/${cardId}.mp3`;

/** Endereço do áudio de uma situação "Na rua" (gerado por scripts/audio/situacoes.ts). */
export const situationSrc = (questionId: string) => `${import.meta.env.BASE_URL}audio/situacoes/${questionId}.mp3`;

interface Labels {
  idle: string;
  pause: string;
}

/**
 * Botão "Ouvir explicação": lê o cartão em voz alta, em linguagem simples.
 * É um pedido explícito do aluno, então toca mesmo com os efeitos sonoros desligados.
 * O áudio só é baixado no primeiro toque e para quando o cartão sai da tela.
 */
export function NarrationButton({ cardId }: { cardId: string }) {
  if (!NARRATION[cardId]) return null;
  return <AudioButton src={narrationSrc(cardId)} labels={{ idle: 'Ouvir explicação', pause: 'Pausar explicação' }} />;
}

/** Botão de áudio sob demanda (cartões e situações). Troca de `src` para o áudio anterior. */
export function AudioButton({ src, labels, className = '' }: { src: string; labels: Labels; className?: string }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [ratio, setRatio] = useState(0);

  useEffect(
    () => () => {
      const a = audio.current;
      if (a) {
        a.pause();
        a.removeAttribute('src');
      }
      audio.current = null;
      setStatus('idle');
      setRatio(0);
    },
    [src],
  );

  function toggle() {
    let a = audio.current;
    if (!a) {
      a = new Audio(src);
      a.preload = 'auto';
      a.addEventListener('playing', () => setStatus('playing'));
      a.addEventListener('pause', () => setStatus((s) => (s === 'error' ? s : 'paused')));
      a.addEventListener('ended', () => {
        setStatus('idle');
        setRatio(0);
      });
      a.addEventListener('timeupdate', () => {
        const el = audio.current;
        if (el && el.duration > 0) setRatio(el.currentTime / el.duration);
      });
      a.addEventListener('error', () => setStatus('error'));
      audio.current = a;
    }
    if (status === 'playing') {
      a.pause();
      return;
    }
    if (status === 'error') return;
    setStatus('loading');
    a.play()?.catch(() => setStatus('error'));
  }

  const playing = status === 'playing' || status === 'loading';
  const label =
    status === 'error'
      ? 'Áudio indisponível'
      : status === 'loading'
        ? 'Carregando…'
        : status === 'playing'
          ? labels.pause
          : status === 'paused'
            ? 'Continuar ouvindo'
            : labels.idle;

  return (
    <button
      type="button"
      className={`btn ghost sm listen-btn ${className} ${playing ? 'on' : ''}`}
      aria-pressed={playing}
      disabled={status === 'error'}
      onClick={toggle}
    >
      {playing ? <IconPause size={20} /> : <IconSound size={20} />}
      <span>{label}</span>
      {(status === 'playing' || status === 'paused') && (
        <span className="listen-bar" aria-hidden="true">
          <span style={{ width: `${Math.round(ratio * 100)}%` }} />
        </span>
      )}
    </button>
  );
}
