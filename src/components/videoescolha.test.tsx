import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ESCOLHAS } from '../content/escolhas';
import temposPoca from '../content/escolhas/w5-rua-1.json';
import temposPontoCego from '../content/escolhas/w5-rua-4.json';
import { QUESTION_BY_ID } from '../content';
import { startSession } from '../engine/session';
import { LessonPlayer } from '../screens/LessonPlayer';
import { AppStateProvider } from '../state/AppState';
import { createLocalStore } from '../storage/progressStore';
import type { ChoiceQuestion } from '../content/types';

type Tempos = Record<string, { dur: number; falas: { ini: number; fim: number }[] }>;
/** cada situação em vídeo e a primeira fala do "jeito seguro" nos finais errados */
const CASOS: [string, Tempos, string][] = [
  ['w5-rua-1', temposPoca as Tempos, 'Freie antes da poça. Sobre a água, não freie.'],
  ['w5-rua-4', temposPontoCego as Tempos, 'Olhe o ponto cego.'],
];

/** áudio de mentira: o teste controla o tempo (currentTime) */
class FakeAudio {
  static todos: FakeAudio[] = [];
  static falha = false;
  currentTime = 0;
  ended = false;
  paused = true;
  constructor(public src: string) {
    FakeAudio.todos.push(this);
  }
  play() {
    this.paused = false;
    return FakeAudio.falha ? Promise.reject(new Error('sem som')) : Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}
const ultimo = () => FakeAudio.todos[FakeAudio.todos.length - 1];

beforeEach(() => {
  FakeAudio.todos = [];
  FakeAudio.falha = false;
  vi.stubGlobal('Audio', FakeAudio);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// cada teste monta a lição inteira; com a suíte toda rodando, 5 s pode não bastar
describe.each(CASOS)('situação em vídeo de escolha %s', { timeout: 20000 }, (QID, T, SEGURO) => {
  const q = QUESTION_BY_ID[QID] as ChoiceQuestion;
  const def = ESCOLHAS[QID];

  function montar(motion: 'full' | 'reduce' = 'full', vezes = 1) {
    const m = new Map<string, string>();
    m.set('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true, prefs: { sound: false, hearts: false, motion, examConfig: 'federal' } }));
    const storage = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } as Storage;
    const steps = Array.from({ length: vezes }, () => ({ kind: 'question' as const, questionId: QID }));
    const onFinish = vi.fn();
    const r = render(
      <AppStateProvider store={createLocalStore(storage)}>
        <LessonPlayer initial={startSession({ id: 't', steps })} practice={false} allowHints={false} onExit={() => {}} onFinish={onFinish} />
      </AppStateProvider>,
    );
    return { ...r, onFinish, storage: m };
  }

  const continuar = () => screen.getByRole('button', { name: 'Continuar' });

  /** toca a introdução até a pergunta */
  async function introAteOFim() {
    const play = await screen.findByRole('button', { name: 'Tocar o vídeo' });
    await waitFor(() => expect(play).toBeEnabled());
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    fireEvent.click(play);
    expect(ultimo().src).toMatch(new RegExp(`audio/escolhas/${QID}/intro[.]mp3$`));
    ultimo().currentTime = T.intro.dur;
    await screen.findByText('Escolha uma resposta abaixo e toque em Verificar.');
  }

  async function escolherEVerificar(id: string) {
    const texto = q.options.find((o) => o.id === id)!.text;
    fireEvent.click(screen.getByRole('radio', { name: texto }));
    // marcar não verifica: nenhum final começa
    expect(FakeAudio.todos.filter((a) => !a.src.endsWith('intro.mp3'))).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Verificar' }));
  }

  it('o catálogo e os tempos do áudio batem (introdução e um final por alternativa)', () => {
    expect(Object.keys(def.ramos).sort()).toEqual(q.options.map((o) => o.id).sort());
    expect(T.intro.falas).toHaveLength(def.intro.length);
    for (const [id, falas] of Object.entries(def.ramos)) {
      expect(T[id].falas, id).toHaveLength(falas.length);
      expect(def.quadros.escolha[id], id).toBeTruthy();
      T[id].falas.forEach((f, i) => i && expect(f.ini).toBeGreaterThan(T[id].falas[i - 1].fim));
      expect(T[id].dur).toBeGreaterThan(T[id].falas[falas.length - 1].fim);
    }
    // os finais errados têm o corte para o jeito seguro
    for (const id of q.options.map((o) => o.id).filter((x) => x !== q.correct)) expect(def.ramos[id][def.corte]).toBe(SEGURO);
  });

  it.each(['a', 'b', 'c', 'd'])('alternativa %s: toca o final dela, e o Continuar só libera no fim', async (id) => {
    montar();
    await introAteOFim();
    await escolherEVerificar(id);
    await waitFor(() => expect(ultimo().src).toMatch(new RegExp(`/${id}\\.mp3$`)));
    expect(continuar()).toBeDisabled();
    expect(screen.getByText(/Final em andamento/)).toBeInTheDocument();
    // Enter não pula o vídeo
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(continuar()).toBeDisabled();
    // errado: depois do corte vem o jeito seguro
    if (id !== q.correct) {
      ultimo().currentTime = T[id].falas[def.corte].ini + 0.1;
      expect(await screen.findByText(SEGURO)).toBeInTheDocument();
    }
    ultimo().currentTime = T[id].dur;
    await waitFor(() => expect(continuar()).toBeEnabled());
    expect(screen.getAllByText(q.mnemonic, { exact: false }).length).toBeGreaterThan(0);
    await waitFor(() => expect(continuar()).toHaveFocus());
  });

  it('"Ver de novo" não trava de novo e "Ler o que aconteceu" mostra o texto', async () => {
    montar();
    await introAteOFim();
    await escolherEVerificar('c');
    ultimo().currentTime = T.c.dur;
    await waitFor(() => expect(continuar()).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Ver de novo' }));
    expect(continuar()).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Pausar o vídeo' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ler o que aconteceu' }));
    expect(screen.getByText(def.quadros.escolha.c)).toBeInTheDocument();
    expect(screen.getByText(def.quadros.seguro)).toBeInTheDocument();
  });

  it('aba escondida pausa e oferece "Retomar o vídeo"', async () => {
    montar();
    await introAteOFim();
    await escolherEVerificar('b');
    const a = ultimo();
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    act(() => void document.dispatchEvent(new Event('visibilitychange')));
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    expect(a.paused).toBe(true);
    expect(continuar()).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retomar o vídeo' }));
    expect(a.paused).toBe(false);
  });

  it('a mesma questão repetida começa travada de novo', async () => {
    montar('full', 2);
    await introAteOFim();
    await escolherEVerificar('a');
    ultimo().currentTime = T.a.dur;
    await waitFor(() => expect(continuar()).toBeEnabled());
    fireEvent.click(continuar());
    expect(await screen.findByRole('button', { name: 'Tocar o vídeo' })).toBeInTheDocument();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  it('sair da lição para o som', async () => {
    const { unmount } = montar();
    await introAteOFim();
    await escolherEVerificar('d');
    const a = ultimo();
    unmount();
    expect(a.paused).toBe(true);
  });

  it('sem áudio, o relógio leva o vídeo até o fim', async () => {
    FakeAudio.falha = true;
    let agora = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => agora);
    montar();
    const play = await screen.findByRole('button', { name: 'Tocar o vídeo' });
    await waitFor(() => expect(play).toBeEnabled());
    fireEvent.click(play);
    await act(async () => {
      await Promise.resolve();
    });
    agora += (T.intro.dur + 1) * 1000;
    expect(await screen.findAllByRole('radio')).toHaveLength(q.options.length);
  });

  it('movimento reduzido: quadros com texto, alternativas na hora e sem espera', async () => {
    montar('reduce');
    expect(await screen.findAllByRole('radio')).toHaveLength(q.options.length);
    expect(screen.getByText(def.quadros.intro)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: q.options.find((o) => o.id === 'b')!.text }));
    fireEvent.click(screen.getByRole('button', { name: 'Verificar' }));
    await waitFor(() => expect(continuar()).toBeEnabled());
    expect(screen.getByText('Sua escolha')).toBeInTheDocument();
    expect(screen.getByText('Jeito seguro')).toBeInTheDocument();
    expect(screen.getByText(def.quadros.escolha.b)).toBeInTheDocument();
    expect(FakeAudio.todos).toHaveLength(0);
  });

  it('"Ver em quadros e texto" libera sem esperar o vídeo', async () => {
    montar();
    await screen.findByRole('button', { name: 'Tocar o vídeo' });
    fireEvent.click(screen.getByRole('button', { name: 'Ver em quadros e texto' }));
    expect(await screen.findAllByRole('radio')).toHaveLength(q.options.length);
    fireEvent.click(screen.getByRole('radio', { name: q.options.find((o) => o.id === 'a')!.text }));
    fireEvent.click(screen.getByRole('button', { name: 'Verificar' }));
    await waitFor(() => expect(continuar()).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Ler a situação' }));
    expect(screen.getByText(q.situation!.find((l) => l.kind === 'fala')!.text as string)).toBeInTheDocument();
  });
});
