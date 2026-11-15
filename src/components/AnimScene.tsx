import { lazy, Suspense, useEffect, useId, useState, type ComponentType } from 'react';
import type { AnimSceneId } from '../content/types';
import { useReducedMotion } from '../ui/hooks';

/**
 * Cenas que reagem à resposta (piloto de 14/11/2026, motor 3D em SVG de scenes/engine.tsx).
 * Antes de verificar: quadro parado (t = 0). Depois de verificar, certo ou errado, a cena mostra a ação correta
 * uma vez (t de 0 a 1). No erro, aparece "Veja a ação correta". Movimento reduzido: vai direto ao quadro final.
 * Cada cena é carregada sob demanda (o motor e os modelos ficam num pedaço compartilhado).
 */
type SceneComp = ComponentType<{ t?: number; id?: string }>;

const CENAS: Record<AnimSceneId, { C: SceneComp; dur: number }> = {
  'pedestre-faixa': { C: lazy(() => import('./scenes/PedestreFaixa').then((m) => ({ default: m.PedestreFaixa }))), dur: 2.2 },
  'linha-retencao': { C: lazy(() => import('./scenes/LinhaRetencao').then((m) => ({ default: m.LinhaRetencao }))), dur: 1.6 },
  'pare-esquina': { C: lazy(() => import('./scenes/PareEsquina').then((m) => ({ default: m.PareEsquina }))), dur: 2.2 },
  'porta-bicicleta': { C: lazy(() => import('./scenes/PortaBicicleta').then((m) => ({ default: m.PortaBicicleta }))), dur: 2.2 },
};

/** quadros por segundo da animação (30 basta e poupa o celular) */
const FPS = 30;

export function AnimScene({ scene, title, checked }: { scene: AnimSceneId; title: string; checked?: null | { correct: boolean } }) {
  const { C, dur } = CENAS[scene];
  const reduced = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [t, setT] = useState(0);
  const ativo = Boolean(checked);

  useEffect(() => {
    if (!ativo) {
      setT(0);
      return;
    }
    if (reduced || typeof requestAnimationFrame !== 'function') {
      setT(1);
      return;
    }
    let raf = 0;
    let ultimo = -1;
    const t0 = performance.now();
    const passo = (agora: number) => {
      const k = Math.min(1, (agora - t0) / 1000 / dur);
      const quadro = Math.floor(k * dur * FPS);
      if (quadro !== ultimo || k === 1) {
        ultimo = quadro;
        setT(k);
      }
      if (k < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    // aba escondida: para e mostra o final, sem reiniciar ao voltar
    const oculto = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        setT(1);
      }
    };
    document.addEventListener('visibilitychange', oculto);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', oculto);
    };
  }, [ativo, reduced, dur]);

  return (
    <figure className="anim-scene">
      <div className="anim-scene-art" role="img" aria-label={title}>
        <Suspense fallback={<div className="anim-scene-wait" />}>
          <C t={t} id={`as${uid}`} />
        </Suspense>
      </div>
      {checked && !checked.correct && <figcaption className="anim-scene-cap">Veja a ação correta</figcaption>}
    </figure>
  );
}
