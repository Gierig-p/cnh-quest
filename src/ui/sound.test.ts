import { beforeEach, describe, expect, it, vi } from 'vitest';

/** AudioContext falso: conta quantos contextos e osciladores foram criados. */
function installFakeAudio(opts: { startState?: string; resumeWorks?: boolean } = {}) {
  const { startState = 'running', resumeWorks = true } = opts;
  const stats = { contexts: 0, oscillators: 0, resumes: 0, all: [] as { state: string }[] };
  const param = () => ({ value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn() });
  const node = () => ({ connect: vi.fn((n: unknown) => n ?? node()), gain: param(), frequency: param(), Q: param(), threshold: param(), ratio: param(), type: '', start: vi.fn(), stop: vi.fn(), buffer: null });
  class FakeCtx {
    currentTime = 0;
    sampleRate = 8000;
    state = startState;
    destination = node();
    constructor() {
      stats.contexts++;
      stats.all.push(this);
    }
    createGain = () => node();
    createDynamicsCompressor = () => node();
    createBiquadFilter = () => node();
    createBufferSource = () => node();
    createBuffer = () => ({ getChannelData: () => new Float32Array(10) });
    createOscillator = () => {
      stats.oscillators++;
      return node();
    };
    resume = vi.fn(() => {
      stats.resumes++;
      if (resumeWorks) this.state = 'running';
      return resumeWorks ? Promise.resolve() : new Promise<void>(() => {});
    });
    close = vi.fn(() => {
      this.state = 'closed';
      return Promise.resolve();
    });
  }
  (window as unknown as { AudioContext: unknown }).AudioContext = FakeCtx;
  return stats;
}

describe('sistema de áudio', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('não cria AudioContext ao carregar o módulo nem com o som desligado', async () => {
    const stats = installFakeAudio();
    const { playSound } = await import('./sound');
    expect(stats.contexts).toBe(0);
    playSound('correct', false);
    expect(stats.contexts).toBe(0);
    playSound('correct', true);
    expect(stats.contexts).toBe(1);
    expect(stats.oscillators).toBeGreaterThan(0);
  });

  it('evita o mesmo som duplicado em sequência e respeita volume zero', async () => {
    const stats = installFakeAudio();
    const { playSound, setVolume } = await import('./sound');
    playSound('tap', true);
    const after1 = stats.oscillators;
    playSound('tap', true); // duplicado imediato: ignorado
    expect(stats.oscillators).toBe(after1);
    playSound('select', true); // outro efeito toca normalmente
    expect(stats.oscillators).toBeGreaterThan(after1);
    setVolume(0);
    const after2 = stats.oscillators;
    playSound('complete', true);
    expect(stats.oscillators).toBe(after2);
  });

  it('salva o volume separado do progresso', async () => {
    installFakeAudio();
    const { setVolume } = await import('./sound');
    setVolume(0.35);
    vi.resetModules();
    const again = await import('./sound');
    expect(again.getVolume()).toBeCloseTo(0.35);
    expect(localStorage.getItem('cnhquest:progress:v1')).toBeNull();
  });

  it('contexto adormecido: espera acordar e só então toca', async () => {
    const stats = installFakeAudio({ startState: 'suspended' });
    const { playSound } = await import('./sound');
    playSound('correct', true);
    expect(stats.oscillators).toBe(0); // ainda não tocou: está acordando
    await vi.waitFor(() => expect(stats.oscillators).toBeGreaterThan(0));
    expect(stats.resumes).toBe(1);
  });

  it('um toque na tela acorda o áudio antes de o efeito ser pedido', async () => {
    const stats = installFakeAudio();
    const { playSound } = await import('./sound');
    playSound('tap', true);
    stats.all[0].state = 'suspended'; // o aparelho adormeceu o áudio
    document.dispatchEvent(new Event('pointerdown'));
    expect(stats.resumes).toBe(1);
    expect(stats.all[0].state).toBe('running');
  });

  it('se o áudio não acorda, o efeito é descartado (nada de som atrasado) e o contexto é recriado', async () => {
    vi.useFakeTimers();
    try {
      const stats = installFakeAudio({ startState: 'interrupted', resumeWorks: false });
      const { playSound } = await import('./sound');
      playSound('correct', true);
      await vi.advanceTimersByTimeAsync(1100);
      expect(stats.oscillators).toBe(0);
      expect(stats.all[0].state).toBe('closed');
      playSound('wrong', true); // próximo gesto: contexto novo
      expect(stats.contexts).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
