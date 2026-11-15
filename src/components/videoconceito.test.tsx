import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CONCEPTS3 } from '../content/world3';
import { CONCEPTS as CONCEPTS1 } from '../content/world1';
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

describe('todos os vídeos de conceito', () => {
  const tempos = import.meta.glob<{ dur: number; falas: { ini: number; fim: number }[] }>('../content/videos/*.json', { eager: true, import: 'default' });
  const cartoes = [...Object.values(CONCEPTS1), ...Object.values(CONCEPTS3)].filter((c) => c.video);

  it('cada vídeo tem tempos para todas as falas, em ordem, dentro da duração', () => {
    for (const id of Object.keys(VIDEOS) as (keyof typeof VIDEOS)[]) {
      const t = tempos[`../content/videos/${id}.json`];
      expect(t, id).toBeDefined();
      expect(t.falas, id).toHaveLength(VIDEOS[id].falas.length);
      t.falas.forEach((f, i) => {
        expect(f.fim, `${id} fala ${i}`).toBeGreaterThan(f.ini);
        if (i) expect(f.ini, `${id} fala ${i}`).toBeGreaterThanOrEqual(t.falas[i - 1].fim);
      });
      expect(t.dur, id).toBeGreaterThanOrEqual(t.falas[t.falas.length - 1].fim);
    }
  });

  it('cada cartão com vídeo aponta para um vídeo que existe e tem resumo', () => {
    expect(cartoes.map((c) => c.video!.id).sort()).toEqual(Object.keys(VIDEOS).sort());
    for (const c of cartoes) {
      expect(c.video!.resumo.length, c.id).toBeGreaterThan(0);
      expect(cardParts(c), c.id).toEqual([['video'], ['resumo', 'terms', 'guardar']]);
    }
  });
});
