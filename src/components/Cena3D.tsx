import { lazy, Suspense, useId, type ComponentType } from 'react';
import type { SceneId } from '../content/types';

/**
 * Cenas paradas no estilo 3D (lotes por mundo, a partir de 15/11/2026). Cada lote fica num módulo carregado sob demanda.
 * A cena que ainda não tem versão 3D continua com o desenho antigo da `SceneArt` (veja `temCena3D`).
 */
type Comp = ComponentType<{ id?: string }>;
const m1 = () => import('./scenes/Mundo1');
const de = (pega: (m: Awaited<ReturnType<typeof m1>>) => Comp): Comp => lazy(() => m1().then((m) => ({ default: pega(m) })));

const CENAS3D: Partial<Record<SceneId, Comp>> = {
  'agente-apito': de((m) => m.AgenteApito),
  'agente-semaforo': de((m) => m.AgenteSemaforo),
  'agente-semaforo-verde': de((m) => (p) => <m.AgenteSemaforo {...p} luz="verde" />),
  ambulancia: de((m) => m.Ambulancia),
  'ambulancia-atras': de((m) => m.AmbulanciaAtras),
  'bombeiros-atras': de((m) => m.BombeirosAtras),
  'ambulancia-desligada': de((m) => m.AmbulanciaDesligada),
  'cruzamento-aproximacao': de((m) => m.CruzamentoAproximacao),
  'cruzamento-caminhao': de((m) => m.CruzamentoCaminhao),
  'cruzamento-direita': de((m) => m.CruzamentoDireita),
  'pedestre-faixa': de((m) => m.PedestreFaixaParada),
  'pedestre-semaforo': de((m) => m.PedestreSemaforo),
  'placa-escondida': de((m) => m.PlacaEscondida),
  'rodovia-via-local': de((m) => m.RodoviaViaLocal),
  rotatoria: de((m) => m.Rotatoria),
  'rua-local': de((m) => m.RuaLocal),
};

export const temCena3D = (s: SceneId) => s in CENAS3D;

export function Cena3D({ scene, title }: { scene: SceneId; title: string }) {
  const C = CENAS3D[scene]!;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <figure className="anim-scene">
      <div className="anim-scene-art" role="img" aria-label={title}>
        <Suspense fallback={<div className="anim-scene-wait" />}>
          <C id={`c3${uid}`} />
        </Suspense>
      </div>
    </figure>
  );
}
