import { beforeEach, describe, expect, it, vi } from 'vitest';

/** AudioContext falso: conta quantos contextos e osciladores foram criados. */
function installFakeAudio() {
  const stats = { contexts: 0, oscillators: 0 };
  const param = () => ({ value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn() });
  const node = () => ({ connect: vi.fn((n: unknown) => n ?? node()), gain: param(), frequency: param(), Q: param(), threshold: param(), ratio: param(), type: '', start: vi.fn(), stop: vi.fn(), buffer: null });
  class FakeCtx {
    currentTime = 0;
    sampleRate = 8000;
    state = 'running';
    destination = node();
    constructor() {
      stats.contexts++;
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
    resume = vi.fn();
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
});
