import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CONCEPTS } from './content/world1';
import { startSession } from './engine/session';
import { AppStateProvider } from './state/AppState';
import { createLocalStore } from './storage/progressStore';
import { LessonPlayer } from './screens/LessonPlayer';
import { ALL_LESSONS, QUESTIONS } from './content';
import { MODULE_TO_REFERENCE } from './content/referenceModules';
import type { ConceptCard } from './content/types';
import { cardParts } from './components/ConceptView';
import { dayLabel, initialProgress, nextReviewDay } from './engine/progress';
import { studyReport } from './screens/ProgressScreen';

const cards = ALL_LESSONS.flatMap((l) => l.steps.flatMap((s) => (s.kind === 'concept' ? [s.card as ConceptCard] : [])));
/** o mesmo cartão só com o texto: a divisão em partes é a dos cartões sem vídeo */
const soTexto = (id: string): ConceptCard => ({ ...cards.find((c) => c.id === id)!, video: undefined });

describe('cartão em partes', () => {
  it('o cartão de teste vira várias partes, sem perder nem repetir bloco', () => {
    const parts = cardParts(soTexto('c-preferencia'));
    expect(parts.length).toBeGreaterThan(1);
    expect([...parts.flat()].sort()).toEqual(['body', 'example', 'points', 'terms']);
    // a fala da Lumi e o Passo a passo ficam juntos
    expect(parts.find((p) => p.includes('body'))).toContain('points');
  });
  it('"Continuar" passa as partes e só depois avança a lição', async () => {
    const m = new Map<string, string>();
    const storage = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } as Storage;
    const onFinish = vi.fn();
    const user = userEvent.setup();
    render(
      <AppStateProvider store={createLocalStore(storage)}>
        <LessonPlayer initial={startSession({ id: 't', steps: [{ kind: 'concept', card: CONCEPTS.preferencia }] })} practice={false} allowHints onExit={() => {}} onFinish={onFinish} />
      </AppStateProvider>,
    );
    const n = cardParts(CONCEPTS.preferencia).length;
    for (let i = 1; i <= n; i++) {
      expect(screen.getByText(`Parte ${i} de ${n}`)).toBeInTheDocument();
      expect(onFinish).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Continuar' }));
      await new Promise((r) => requestAnimationFrame(r));
    }
    expect(onFinish).toHaveBeenCalled();
  });
  it('no fim da explicação, com questão em seguida, o botão é "Ir para as perguntas"', async () => {
    const m = new Map<string, string>();
    const storage = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } as Storage;
    const user = userEvent.setup();
    render(
      <AppStateProvider store={createLocalStore(storage)}>
        <LessonPlayer initial={startSession({ id: 't', steps: [{ kind: 'concept', card: CONCEPTS.preferencia }, { kind: 'question', questionId: 'w1-l1-q1' }] })} practice={false} allowHints onExit={() => {}} onFinish={() => {}} />
      </AppStateProvider>,
    );
    const n = cardParts(CONCEPTS.preferencia).length;
    for (let i = 1; i < n; i++) {
      expect(screen.queryByRole('button', { name: 'Ir para as perguntas' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Continuar' }));
      await new Promise((r) => requestAnimationFrame(r));
    }
    await user.click(screen.getByRole('button', { name: 'Ir para as perguntas' }));
    await new Promise((r) => requestAnimationFrame(r));
    expect(screen.getByRole('button', { name: 'Verificar' })).toBeInTheDocument();
  });
  it('"Voltar" mostra a parte anterior e não aparece na primeira parte', async () => {
    const m = new Map<string, string>();
    const storage = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } as Storage;
    const user = userEvent.setup();
    render(
      <AppStateProvider store={createLocalStore(storage)}>
        <LessonPlayer initial={startSession({ id: 't', steps: [{ kind: 'concept', card: CONCEPTS.preferencia }] })} practice={false} allowHints onExit={() => {}} onFinish={() => {}} />
      </AppStateProvider>,
    );
    const n = cardParts(CONCEPTS.preferencia).length;
    expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await new Promise((r) => requestAnimationFrame(r));
    expect(screen.getByText(`Parte 2 de ${n}`)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Voltar' }));
    await new Promise((r) => requestAnimationFrame(r));
    expect(screen.getByText(`Parte 1 de ${n}`)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeInTheDocument();
  });
  it('todo cartão longo vira partes completas; os curtos seguem inteiros', () => {
    for (const c of cards) {
      const parts = cardParts(c);
      const all = cardParts({ ...c, id: '' })[0];
      expect([...parts.flat()].sort()).toEqual([...all].sort());
      expect(new Set(parts.flat()).size).toBe(all.length);
      if (all.includes('body') && all.includes('points')) expect(parts.find((p) => p.includes('body'))).toContain('points');
      if (parts.length === 1) continue;
      for (const part of parts) expect(part.length).toBeGreaterThan(0);
    }
    expect(cards.filter((c) => cardParts(c).length > 1).length).toBeGreaterThan(10);
    expect(cardParts(soTexto('c-emergencia'))).toHaveLength(1);
  });
});

describe('próxima revisão', () => {
  const now = new Date(2026, 10, 14, 10);
  it('sem questões, não há data', () => {
    expect(nextReviewDay(initialProgress(), now)).toBeNull();
  });
  it('a mais cedo das não dominadas; atrasada conta como hoje', () => {
    const p = initialProgress();
    p.questions = {
      a: { seen: 1, wrong: 0, box: 3, due: '2026-11-18' },
      b: { seen: 1, wrong: 0, box: 2, due: '2026-11-16' },
      c: { seen: 3, wrong: 0, box: 5, due: '2026-11-15' },
    };
    expect(nextReviewDay(p, now)).toBe('2026-11-16');
    p.questions.d = { seen: 1, wrong: 1, box: 1, due: '2026-11-10' };
    expect(nextReviewDay(p, now)).toBe('2026-11-14');
  });
  it('mostra hoje, amanhã ou o dia da semana com a data', () => {
    expect(dayLabel('2026-11-14', now)).toBe('hoje');
    expect(dayLabel('2026-11-15', now)).toBe('amanhã');
    expect(dayLabel('2026-11-16', now)).toMatch(/^segunda-feira, 16\/11$/);
  });
});

describe('o que você já estudou', () => {
  it('4 módulos; sem questões = "sem conteúdo ainda"; nada de chance de passar', () => {
    const r = studyReport(initialProgress());
    expect(r.map((x) => x.module)).toEqual([1, 2, 3, 4]);
    for (const x of r) expect(x.status).toBe(x.total ? 'ainda não começou' : 'sem conteúdo ainda');
  });
  it('começou e praticado', () => {
    const p = initialProgress();
    const ids = QUESTIONS.filter((q) => MODULE_TO_REFERENCE[q.module] === 1).map((q) => q.id);
    const stat = { seen: 1, wrong: 0, box: 2, due: '2026-11-15' };
    p.questions = { [ids[0]]: stat };
    expect(studyReport(p)[0]).toMatchObject({ seen: 1, status: 'começou' });
    p.questions = Object.fromEntries(ids.map((id) => [id, stat]));
    expect(studyReport(p)[0]).toMatchObject({ seen: ids.length, status: 'praticado' });
  });
});
