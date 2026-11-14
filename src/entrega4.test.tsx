import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QUESTIONS } from './content';
import { speechText, SpeakButton } from './components/SpeakButton';
import { seededShuffle } from './engine/grading';
import { AppStateProvider } from './state/AppState';
import { createLocalStore } from './storage/progressStore';
import { ProgressScreen } from './screens/ProgressScreen';

function memoryStorage(init?: object): Storage {
  const m = new Map<string, string>();
  if (init) m.set('cnhquest:progress:v1', JSON.stringify(init));
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } as Storage;
}

describe('letra grande', () => {
  afterEach(() => document.documentElement.removeAttribute('data-text'));
  it('o interruptor em Ajustes liga e desliga html[data-text=big]', async () => {
    const user = userEvent.setup();
    render(
      <AppStateProvider store={createLocalStore(memoryStorage({ version: 1, onboarded: true }))}>
        <ProgressScreen />
      </AppStateProvider>,
    );
    expect(document.documentElement.getAttribute('data-text')).toBeNull();
    const sw = screen.getByRole('switch', { name: 'Letra grande' });
    await user.click(sw);
    expect(document.documentElement.getAttribute('data-text')).toBe('big');
    await user.click(sw);
    expect(document.documentElement.getAttribute('data-text')).toBeNull();
  });
});

describe('ouvir a pergunta (voz do navegador)', () => {
  it('lê a pergunta e as respostas na ordem da tela', () => {
    const q = QUESTIONS.find((x) => x.type === 'choice')!;
    if (q.type !== 'choice') throw new Error();
    const t = speechText(q, 'abc');
    expect(t.startsWith(q.prompt)).toBe(true);
    seededShuffle(q.options, 'abc').forEach((o, i) => expect(t).toContain(`Resposta ${i + 1}: ${o.text}`));
  });
  it('lacuna e verdadeiro-ou-falso viram frases faladas', () => {
    const f = QUESTIONS.find((x) => x.type === 'fill')!;
    expect(speechText(f, 's')).toContain('espaço em branco');
    expect(speechText(f, 's')).not.toContain('___');
    const tf = QUESTIONS.find((x) => x.type === 'truefalse')!;
    expect(speechText(tf, 's')).toContain('verdadeiro ou falso');
  });
  it('o botão fala e para; sem leitura de voz no navegador, não aparece', async () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    vi.stubGlobal('speechSynthesis', { speak, cancel, getVoices: () => [] });
    vi.stubGlobal('SpeechSynthesisUtterance', class { text: string; constructor(t: string) { this.text = t; } });
    const user = userEvent.setup();
    const { unmount } = render(<SpeakButton text="Olá" />);
    await user.click(screen.getByRole('button', { name: 'Ouvir a pergunta' }));
    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0].text).toBe('Olá');
    await user.click(screen.getByRole('button', { name: 'Parar leitura' }));
    expect(cancel).toHaveBeenCalled();
    unmount();
    vi.unstubAllGlobals();
    // @ts-expect-error: simula navegador sem leitura de voz
    delete window.speechSynthesis;
    render(<SpeakButton text="Olá" />);
    expect(screen.queryByRole('button', { name: 'Ouvir a pergunta' })).toBeNull();
  });
});
