import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NarrationButton } from './NarrationButton';

/** Audio falso: guarda o endereço e dispara os eventos que o botão escuta. */
class FakeAudio extends EventTarget {
  static last: FakeAudio | null = null;
  src: string;
  preload = '';
  currentTime = 0;
  duration = 40;
  play = vi.fn(() => {
    this.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  });
  pause = vi.fn(() => this.dispatchEvent(new Event('pause')));
  removeAttribute = vi.fn();
  constructor(src: string) {
    super();
    this.src = src;
    FakeAudio.last = this;
  }
}

describe('botão "Ouvir explicação"', () => {
  const original = window.Audio;
  afterEach(() => {
    window.Audio = original;
    FakeAudio.last = null;
  });

  it('só baixa o áudio no toque, toca, pausa e para ao sair do cartão', async () => {
    window.Audio = FakeAudio as unknown as typeof Audio;
    const { unmount } = render(<NarrationButton cardId="c-tipos-sinais" />);
    expect(FakeAudio.last).toBeNull();

    await act(async () => fireEvent.click(screen.getByRole('button', { name: /ouvir explicação/i })));
    const a = FakeAudio.last!;
    expect(a.src).toMatch(/audio\/cartoes\/c-tipos-sinais\.mp3$/);
    expect(a.play).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /pausar/i })).toHaveAttribute('aria-pressed', 'true');

    await act(async () => fireEvent.click(screen.getByRole('button', { name: /pausar/i })));
    expect(a.pause).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /continuar ouvindo/i })).toBeInTheDocument();

    unmount();
    expect(a.removeAttribute).toHaveBeenCalledWith('src');
  });

  it('não aparece para um cartão sem narração', () => {
    const { container } = render(<NarrationButton cardId="nao-existe" />);
    expect(container).toBeEmptyDOMElement();
  });
});
