import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { GLOSSARY } from './index';
import { buildHintIndex, splitTerms, type TextPart } from './glossary';
import { TermHintsContext, TermText } from '../components/TermText';

const marked = (parts: TextPart[]) => parts.flatMap((p) => (typeof p === 'string' ? [] : [p.text]));
const card = (term: string) => GLOSSARY.find((e) => e.term === term)!;

describe('dicas de palavras', () => {
  it('reconhece plural e variações, prioriza a forma mais longa e só aceita palavra inteira', () => {
    const idx = buildHintIndex(GLOSSARY, { lessonId: 'x', seenCardIds: [], completedLessonIds: ['w1-l2', 'w1-l4', 'w2-l4'] });
    expect(marked(splitTerms('Nas vias locais e na via local a regra muda.', idx))).toEqual(['vias locais', 'via local']);
    expect(marked(splitTerms('Duas rodovias e um viaduto.', idx))).toEqual(['rodovias']);
    expect(marked(splitTerms('Há uma linha amarela contínua aqui.', idx))).toEqual(['linha amarela contínua']);
  });

  it('só mostra palavras já ensinadas e marca como novas as da lição atual', () => {
    const viaLesson = card('Via').lessonId;
    const none = buildHintIndex(GLOSSARY, { lessonId: viaLesson, seenCardIds: [], completedLessonIds: [] });
    expect(marked(splitTerms('Toda via tem regras.', none))).toEqual([]);

    const now = buildHintIndex(GLOSSARY, { lessonId: viaLesson, seenCardIds: [card('Via').cardId], completedLessonIds: [] });
    const [, hit] = splitTerms('Toda via tem regras.', now);
    expect(hit).toMatchObject({ text: 'via', hint: { term: 'Via', isNew: true } });

    const later = buildHintIndex(GLOSSARY, { lessonId: 'outra', seenCardIds: [], completedLessonIds: [viaLesson] });
    expect(splitTerms('Toda via tem regras.', later)[1]).toMatchObject({ hint: { isNew: false } });
  });

  it('palavra ensinada de novo na lição atual usa a explicação desta lição', () => {
    const second = GLOSSARY.filter((e) => e.term === 'Rotatória')[1];
    const idx = buildHintIndex(GLOSSARY, { lessonId: second.lessonId, seenCardIds: [second.cardId], completedLessonIds: [card('Rotatória').lessonId] });
    expect(splitTerms('Na rotatória', idx)[1]).toMatchObject({ hint: { meaning: second.meaning, isNew: true } });
  });

  it('não vira dica nas questões listadas em skipIn', () => {
    const idx = buildHintIndex(GLOSSARY, { lessonId: 'x', seenCardIds: [], completedLessonIds: [card('Parar').lessonId] });
    expect(marked(splitTerms('Você pode parar ali.', idx, 'w1-l4-q3'))).toEqual([]);
    expect(marked(splitTerms('Você pode parar ali.', idx, 'outra'))).toEqual(['parar']);
  });

  it('o balão abre ao tocar, mostra o significado e fecha com Esc', async () => {
    const user = userEvent.setup();
    const index = buildHintIndex(GLOSSARY, { lessonId: card('Via').lessonId, seenCardIds: [card('Via').cardId], completedLessonIds: [] });
    render(
      <TermHintsContext.Provider value={{ index }}>
        <p>Toda via tem regras.</p>
        <p><TermText text="Toda via tem regras." /></p>
      </TermHintsContext.Provider>,
    );
    const btn = screen.getByRole('button', { name: 'via: ver significado' });
    expect(btn).toHaveClass('is-new');
    await user.click(btn);
    expect(screen.getByRole('tooltip')).toHaveTextContent(card('Via').meaning);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('sem provedor (ex.: simulado) o texto aparece sem dicas', () => {
    render(<p><TermText text="Toda via tem regras." /></p>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Toda via tem regras.')).toBeInTheDocument();
  });
});
