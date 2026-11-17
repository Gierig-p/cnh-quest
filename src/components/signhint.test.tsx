import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GLOSSARY, QUESTION_BY_ID } from '../content';
import { buildHintIndex } from '../content/glossary';
import { SIGN_IN_HINT, hintDelay, HINT_DELAY_S } from '../content/hints';
import { signCodesIn } from '../content/signs';
import { SignInline, TermHintsContext, TermText } from './TermText';

const index = buildHintIndex(GLOSSARY, { lessonId: 'x', seenCardIds: [], completedLessonIds: ['w2-l2'] });

function view(hideSigns: boolean) {
  return render(
    <TermHintsContext.Provider value={{ index, hideSigns }}>
      <p>
        <TermText text="Qual é a cor da placa A-24?" />
      </p>
      <span>
        <SignInline text="A-24" />
      </span>
    </TermHintsContext.Provider>,
  );
}

describe('placa guardada para a Dica', () => {
  it('as questões da lista existem, citam placa e têm a dica liberada desde o começo', () => {
    for (const id of SIGN_IN_HINT) {
      const q = QUESTION_BY_ID[id];
      expect(q, id).toBeTruthy();
      expect(signCodesIn(JSON.stringify(q)).length, id).toBeGreaterThan(0);
      expect(hintDelay(id)).toBe(0);
    }
    expect(hintDelay('w1-l1-q1')).toBe(HINT_DELAY_S);
    expect(HINT_DELAY_S).toBe(20);
  });

  it('sem a dica, o código da placa fica sem desenho; com a dica, o desenho aparece', () => {
    expect(index.signs.has('A-24')).toBe(true);
    const hidden = view(true);
    expect(hidden.container.querySelector('.term.is-sign, .sign-mini')).toBeNull();
    hidden.unmount();
    const shown = view(false);
    expect(shown.container.querySelector('.term.is-sign')).not.toBeNull();
    expect(shown.container.querySelector('.sign-mini')).not.toBeNull();
  });
});
