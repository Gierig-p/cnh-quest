import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CONCEPTS3 } from '../content/world3';
import { VIDEOS } from '../content/videos';
import tempos from '../content/videos/faixas.json';
import { AppStateProvider } from '../state/AppState';
import { createLocalStore } from '../storage/progressStore';
import { ConceptBlocks, cardParts } from './ConceptView';

function memoryStorage(init?: object): Storage {
  const m = new Map<string, string>();
  if (init) m.set('cnhquest:progress:v1', JSON.stringify(init));
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } as Storage;
}

const card = CONCEPTS3.ladoDireito;
const app = (show: Parameters<typeof ConceptBlocks>[0]['show']) => (
  <AppStateProvider store={createLocalStore(memoryStorage({ version: 1, onboarded: true, prefs: { sound: false, hearts: false, motion: 'reduce', examConfig: 'federal' } }))}>
    <ConceptBlocks card={card} show={show} />
  </AppStateProvider>
);

describe('vídeo do conceito (piloto c3-lado-direito)', () => {
  it('o cartão vira duas páginas: vídeo e resumo', () => {
    expect(card.video?.id).toBe('faixas');
    expect(cardParts(card)).toEqual([['video'], ['resumo', 'terms', 'guardar']]);
  });

  it('cada fala tem o seu tempo no áudio', () => {
    expect(tempos.falas).toHaveLength(VIDEOS.faixas.falas.length);
    for (let i = 1; i < tempos.falas.length; i++) expect(tempos.falas[i].ini).toBeGreaterThan(tempos.falas[i - 1].fim);
    expect(tempos.dur).toBeGreaterThan(tempos.falas[tempos.falas.length - 1].fim);
  });

  it('página 1: a cena carrega com o botão de tocar e a legenda começa ao tocar', async () => {
    render(app(['video']));
    const play = await screen.findByRole('button', { name: 'Tocar o vídeo' });
    await waitFor(() => expect(play).toBeEnabled());
    expect(screen.getByRole('img', { name: card.title })).toBeInTheDocument();
    expect(screen.getByText(/Toque no ▶/)).toBeInTheDocument();
    fireEvent.click(play);
    expect(await screen.findByText(VIDEOS.faixas.falas[0])).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pausar o vídeo' })).toBeInTheDocument();
  });

  it('página 2: resumo, palavras novas e a frase para guardar', () => {
    render(app(['resumo', 'terms', 'guardar']));
    expect(screen.getByRole('heading', { name: /Resumo/ })).toBeInTheDocument();
    for (const r of card.video!.resumo) expect(screen.getByText(r)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Palavras novas/ })).toBeInTheDocument();
    expect(screen.getByText(card.remember!)).toBeInTheDocument();
  });
});
