import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
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

describe('fluxo principal', () => {
  it('faz o onboarding, abre a 1ª lição, erra, vê a explicação e salva o progresso', async () => {
    const { user, storage, unmount } = setup();
    await user.click(screen.getByRole('button', { name: 'Vamos lá' }));
    await user.click(screen.getByRole('radio', { name: /15 min por dia/ }));
    await user.click(screen.getByRole('button', { name: 'Começar a trilha' }));

    // trilha: módulos de referência e aviso de independência
    expect(screen.getAllByText('Módulo 1 · Sinalização de trânsito').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Quem passa primeiro\?.*módulo 3/ })).toBeInTheDocument();
    expect(screen.getByText(/app de estudo independente/)).toBeInTheDocument();
    expect(screen.getByText(/organização própria do app/)).toBeInTheDocument();

    // trilha: só a 1ª lição disponível
    expect(screen.getByRole('button', { name: /Quem passa primeiro\?, bloqueada/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Quem manda no trânsito\?, disponível/ }));

    // cartão de conceito
    expect(screen.getByRole('heading', { name: 'Os sinais de trânsito' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    // 1ª questão: "Verificar" desabilitado até escolher
    const check = screen.getByRole('button', { name: 'Verificar' });
    expect(check).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Gestos do agente de trânsito' }));
    expect(check).toBeEnabled();
    await user.click(check);

    const status = screen.getByRole('status');
    expect(within(status).getByText('Resposta correta:')).toBeInTheDocument();
    expect(within(status).getByText('Anúncios publicitários à beira da via')).toBeInTheDocument();
    expect(within(status).getByText(/Por que a sua não: Gestos do agente/)).toBeInTheDocument();
    expect(within(status).getByRole('link', { name: 'Código de Trânsito Brasileiro' })).toHaveAttribute('href', expect.stringContaining('planalto.gov.br'));
    expect(status).toHaveTextContent('arts. 80 e 87');

    // o erro já foi gravado
    const saved = JSON.parse(storage.getItem('cnhquest:progress:v1')!);
    expect(saved.questions['w1-l1-q1'].wrong).toBe(1);
    expect(saved.dailyGoal).toBe(30);

    // sair pede confirmação
    await user.click(screen.getByRole('button', { name: 'Sair da lição' }));
    expect(screen.getByRole('dialog', { name: 'Quer mesmo sair?' })).toBeInTheDocument();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sair da lição' }));
    expect(screen.getByRole('heading', { name: 'Começando no trânsito' })).toBeInTheDocument();

    // "recarregar": nova montagem com o mesmo armazenamento
    unmount();
    setup(storage);
    expect(screen.queryByRole('button', { name: 'Vamos lá' })).not.toBeInTheDocument();
    // a questão errada já aparece como revisão pendente
    expect(screen.getByLabelText('1 pendentes')).toBeInTheDocument();
  });

  it('teclado: número escolhe a alternativa e Enter verifica', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    await user.click(screen.getByRole('button', { name: /Quem manda no trânsito\?/ }));
    await user.keyboard('{Enter}'); // continua o conceito
    await user.keyboard('1');
    expect(screen.getAllByRole('radio').some((r) => r.getAttribute('aria-checked') === 'true')).toBe(true);
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('simulado entregue em branco mostra o desempenho por módulo de referência', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    await user.click(screen.getAllByRole('button', { name: /Simulado/ })[0]);
    await user.click(screen.getByRole('button', { name: 'Começar simulado' }));
    await user.click(screen.getByRole('button', { name: 'Entregar prova' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Entregar' }));

    const section = screen.getByRole('region', { name: 'Desempenho por módulo' });
    expect(within(section).getByText('Módulo 1')).toBeInTheDocument();
    expect(within(section).getByRole('progressbar', { name: /Módulo 1: 0% de acertos/ })).toBeInTheDocument();
    expect(within(section).getByText(/decisão do CNH Quest/)).toBeInTheDocument();
  });

  it('som pode ser desligado pelo atalho do topo e a escolha fica salva', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    const toggle = screen.getAllByRole('button', { name: 'Efeitos sonoros' })[0];
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await user.click(toggle);
    expect(JSON.parse(storage.getItem('cnhquest:progress:v1')!).prefs.sound).toBe(false);
    expect(screen.getAllByRole('button', { name: 'Efeitos sonoros' })[0]).toHaveAttribute('aria-pressed', 'false');
  });

  it('Esc fecha o diálogo de saída sem sair da lição', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    await user.click(screen.getByRole('button', { name: /Quem manda no trânsito\?/ }));
    await user.click(screen.getByRole('button', { name: 'Sair da lição' }));
    expect(screen.getByRole('dialog', { name: 'Quer mesmo sair?' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Os sinais de trânsito' })).toBeInTheDocument();
  });
});

