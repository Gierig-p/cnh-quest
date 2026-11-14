import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { QUESTION_BY_ID } from '../content';
import type { MatchQuestion } from '../content/types';
import { grade, type Answer } from '../engine/grading';
import { AppStateProvider } from '../state/AppState';
import { createLocalStore } from '../storage/progressStore';
import { dropIndex, Exercise, moveItem } from './Exercises';

const q = QUESTION_BY_ID['w1-l1-q6'] as MatchQuestion;

function Harness({ onChange }: { onChange: (a: Answer | null) => void }) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  return (
    <Exercise
      q={q}
      seed="t"
      answer={answer}
      checked={null}
      onAnswer={(a) => {
        setAnswer(a);
        onChange(a);
      }}
    />
  );
}

describe('exercício de pares', () => {
  it('corrige cada par na hora: o certo trava, o errado solta e conta como erro', async () => {
    let last: Answer | null = null;
    const user = userEvent.setup();
    render(
      <AppStateProvider store={createLocalStore(undefined)}>
        <Harness onChange={(a) => (last = a)} />
      </AppStateProvider>,
    );
    const [p1, p2] = q.pairs;
    const left = (t: string) => screen.getByRole('button', { name: new RegExp(`^${t}`) });
    const right = (t: string) => screen.getByRole('button', { name: t });

    // par errado: nada fica associado, mas a tentativa é contada
    await user.click(left(p1.left));
    await user.click(right(p2.right));
    expect(last).toEqual({ type: 'match', pairs: {}, mistakes: 1 });
    expect(left(p1.left)).not.toBeDisabled();

    // par certo, começando pela coluna da direita: trava os dois botões
    await user.click(right(p1.right));
    await user.click(left(p1.left));
    expect(last).toEqual({ type: 'match', pairs: { [p1.id]: p1.id }, mistakes: 1 });
    expect(left(p1.left)).toBeDisabled();
    expect(right(p1.right)).toBeDisabled();

    // completa o resto certo: como houve um erro no caminho, não vale como acerto
    for (const p of q.pairs.slice(1)) {
      await user.click(left(p.left));
      await user.click(right(p.right));
    }
    await act(async () => {});
    const final = last as unknown as Answer;
    expect(Object.keys((final as { pairs: object }).pairs)).toHaveLength(q.pairs.length);
    expect(grade(q, final).correct).toBe(false);
    expect(grade(q, { type: 'match', pairs: Object.fromEntries(q.pairs.map((p) => [p.id, p.id])) }).correct).toBe(true);
  });
});

describe('ordenar arrastando', () => {
  it('calcula para onde vai o item solto e reordena', () => {
    const centers = [30, 100, 170, 240];
    expect(dropIndex(centers, 0, 30 + 150)).toBe(2); // arrastou o 1º para baixo de 2 itens
    expect(dropIndex(centers, 3, 240 - 160)).toBe(1); // arrastou o último para cima
    expect(dropIndex(centers, 1, 105)).toBe(1); // quase não mexeu
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });
});
