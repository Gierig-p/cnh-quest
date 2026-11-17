import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppStateProvider } from '../state/AppState';
import { CompleteScreen } from './CompleteScreen';

const result = { lessonId: 'w1-l1', total: 4, correctFirstTry: 4, accuracy: 1, missed: [], completed: true };

describe('fim de lição', () => {
  it('com "Próxima" no botão principal, há também um botão para voltar à trilha', async () => {
    const onContinue = vi.fn();
    const onBack = vi.fn();
    render(
      <AppStateProvider>
        <CompleteScreen title="Lição" result={result} outcome={null} nextLabel="Próxima: Lição 2" onContinue={onContinue} backLabel="Voltar para a trilha" onBack={onBack} />
      </AppStateProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Voltar para a trilha' }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('sem backLabel (o principal já volta), não repete o botão', () => {
    render(
      <AppStateProvider>
        <CompleteScreen title="Lição" result={result} outcome={null} nextLabel="Continuar" onContinue={() => {}} />
      </AppStateProvider>,
    );
    expect(screen.queryByRole('button', { name: /Voltar/ })).not.toBeInTheDocument();
  });
});
