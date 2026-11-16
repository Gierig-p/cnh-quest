import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import { QUESTION_BY_ID, WORLDS } from './content';
import { aulaCatalog, aulaMatches, aulaPracticeIds, aulaQuestionIds, unlockAula, unlockedAulaIds } from './engine/aulas';
import { initialProgress } from './engine/progress';
import { AppStateProvider } from './state/AppState';
import { createLocalStore } from './storage/progressStore';

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    length: 0,
  } as Storage;
}

function setup(storage = memoryStorage()) {
  const store = createLocalStore(storage);
  const user = userEvent.setup();
  const utils = render(
    <AppStateProvider store={store}>
      <App />
    </AppStateProvider>,
  );
  return { user, storage, ...utils };
}

const CATALOG = aulaCatalog(WORLDS);
const L1 = WORLDS[0].lessons[0];
const firstCard = CATALOG[0].card;

describe('Aulas (motor)', () => {
  it('lista todos os cartões da trilha, sem repetir', () => {
    const cards = WORLDS.flatMap((w) => w.lessons.flatMap((l) => l.steps.filter((s) => s.kind === 'concept')));
    expect(CATALOG).toHaveLength(cards.length);
    expect(new Set(CATALOG.map((a) => a.card.id)).size).toBe(CATALOG.length);
  });

  it('libera pelo cartão aberto ou pela rodada 1 feita (progresso antigo)', () => {
    const p = initialProgress();
    expect(unlockedAulaIds(p, CATALOG).size).toBe(0);
    const aberto = unlockAula(p, firstCard.id);
    expect([...unlockedAulaIds(aberto, CATALOG)]).toEqual([firstCard.id]);
    expect(unlockAula(aberto, firstCard.id)).toBe(aberto);
    const antigo = { ...p, lessons: { [L1.id]: { completed: true, mastered: false, bestAccuracy: 1, attempts: 1 } } };
    const ids = unlockedAulaIds(antigo, CATALOG);
    for (const st of L1.steps) if (st.kind === 'concept') expect(ids.has(st.card.id)).toBe(true);
  });

  it('pratica só as questões do cartão, uma por objetivo', () => {
    for (const a of CATALOG) {
      const own = aulaQuestionIds(a.lesson, a.card.id);
      expect(own.length, a.card.id).toBeGreaterThan(0);
      const ids = aulaPracticeIds(a.lesson, a.card.id, (id) => QUESTION_BY_ID[id].objective);
      expect(ids.length).toBeGreaterThan(0);
      expect(ids.length).toBeLessThanOrEqual(8);
      expect(ids.every((id) => own.includes(id))).toBe(true);
      const objs = ids.map((id) => QUESTION_BY_ID[id].objective);
      expect(new Set(objs).size).toBe(objs.length);
    }
  });

  it('busca sem acento e sem diferença de maiúsculas', () => {
    const a = CATALOG[0];
    const plain = a.card.title.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
    expect(aulaMatches(a, plain)).toBe(true);
    expect(aulaMatches(a, 'zzzz nada')).toBe(false);
  });
});

describe('Aulas (tela)', () => {
  it('avisa "Aula desbloqueada" no 1º cartão com vídeo e a aula aparece em Revisar › Aulas', async () => {
    const { user, storage, unmount } = setup();
    await user.click(screen.getByRole('button', { name: 'Vamos lá' }));
    await user.click(screen.getByRole('radio', { name: /15 min por dia/ }));
    await user.click(screen.getByRole('button', { name: 'Começar a trilha' }));

    // antes de estudar: a lista está vazia
    await user.click(screen.getAllByRole('button', { name: /^Revisar/ })[0]);
    await user.click(screen.getByRole('button', { name: /^Aulas/ }));
    expect(screen.getByText(/Faça a primeira lição da trilha/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Voltar para Revisar/ }));

    await user.click(screen.getAllByRole('button', { name: /^Trilha/ })[0]);
    await user.click(screen.getByRole('button', { name: new RegExp(`${L1.title.replace('?', '\\?')}, disponível`) }));
    expect(screen.getByRole('heading', { name: firstCard.title })).toBeInTheDocument();
    expect(firstCard.video).toBeTruthy();
    expect(screen.getByText('Aula desbloqueada!')).toBeInTheDocument();
    unmount();

    // abre o app de novo: a aula ficou salva
    setup(storage);
    await user.click(screen.getAllByRole('button', { name: /^Revisar/ })[0]);
    await user.click(screen.getByRole('button', { name: /^Aulas/ }));
    await user.click(screen.getByRole('button', { name: new RegExp(firstCard.title.replace(/[?()]/g, '.')) }));
    expect(screen.getByRole('heading', { level: 1, name: firstCard.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Praticar esta aula' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Voltar para Aulas/ }));
    expect(screen.getByRole('heading', { name: 'Aulas' })).toBeInTheDocument();
  });
});
