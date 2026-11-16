import { lazy, Suspense, useId, type ComponentType } from 'react';
import type { SceneId } from '../content/types';

/**
 * Cenas paradas no estilo 3D (lotes por mundo, a partir de 15/11/2026). Cada lote fica num módulo carregado sob demanda.
 * A cena que ainda não tem versão 3D continua com o desenho antigo da `SceneArt` (veja `temCena3D`).
 */
type Comp = ComponentType<{ id?: string }>;
const m1 = () => import('./scenes/Mundo1');
const m2 = () => import('./scenes/Mundo2');
const m3 = () => import('./scenes/Mundo3');
const de = (pega: (m: Awaited<ReturnType<typeof m1>>) => Comp): Comp => lazy(() => m1().then((m) => ({ default: pega(m) })));
const de2 = (pega: (m: Awaited<ReturnType<typeof m2>>) => Comp): Comp => lazy(() => m2().then((m) => ({ default: pega(m) })));
const de3 = (pega: (m: Awaited<ReturnType<typeof m3>>) => Comp): Comp => lazy(() => m3().then((m) => ({ default: pega(m) })));
const m4 = () => import('./scenes/Mundo4');
const de4 = (pega: (m: Awaited<ReturnType<typeof m4>>) => Comp): Comp => lazy(() => m4().then((m) => ({ default: pega(m) })));

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
  // Mundo 2
  'linha-amarela-continua': de2((m) => m.LinhaAmarelaContinua),
  'linha-amarela-continua-carro': de2((m) => m.LinhaAmarelaContinuaCarro),
  'linha-amarela-tracejada': de2((m) => m.LinhaAmarelaTracejada),
  'linha-branca-continua': de2((m) => m.LinhaBrancaContinua),
  'linha-retencao': de2((m) => m.LinhaRetencaoParada),
  'semaforo-amarelo': de2((m) => m.SemaforoAmarelo),
  'semaforo-amarelo-piscando': de2((m) => m.SemaforoAmareloPiscando),
  'semaforo-pedestre-piscando': de2((m) => m.SemaforoPedestrePiscando),
  'vaga-idoso': de2((m) => m.VagaIdoso),
  'placa-distancias': de2((m) => m.PlacaDistancias),
  'avenida-tres-faixas': de3((m) => m.AvenidaTresFaixas),
  'faixa-esquerda-carro-atras': de3((m) => m.FaixaEsquerdaCarroAtras),
  'onibus-ponto': de3((m) => m.OnibusPonto),
  'saida-garagem': de3((m) => m.SaidaGaragem),
  'rodovia-virar-esquerda': de3((m) => m.RodoviaVirarEsquerda),
  'virar-direita-pedestre': de3((m) => m.VirarDireitaPedestre),
  'chuva-dia': de3((m) => m.ChuvaDia),
  'estrada-escura': de3((m) => m.EstradaEscura),
  'luz-alta-carro-frente': de3((m) => m.LuzAltaCarroFrente),
  'carro-padaria': de3((m) => m.CarroPadaria),
  'carro-quebrado': de3((m) => m.CarroQuebrado),
  'estrada-terra': de3((m) => m.EstradaTerra),
  'rodovia-dupla-80': de3((m) => m.RodoviaDupla80),
  'congestionamento-acostamento': de3((m) => m.CongestionamentoAcostamento),
  'carro-bicicleta': de3((m) => m.CarroBicicleta),
  'sendo-ultrapassado': de3((m) => m.SendoUltrapassado),
  'cruzamento-ultrapassar': de3((m) => m.CruzamentoUltrapassar),
  'verde-fila-parada': de3((m) => m.VerdeFilaParada),
  'vermelho-direita': de3((m) => m.VermelhoDireita),
  'rodovia-simples': de3((m) => m.RodoviaSimples),
  'tunel-dia': de3((m) => m.TunelDia),
  'passageiro-desce': de3((m) => m.PassageiroDesce),
  'carga-descarga': de3((m) => m.CargaDescarga),
  'rodovia-dupla': de3((m) => m.RodoviaDupla),
  'rodovia-dupla-caminhao': de3((m) => m.RodoviaDuplaCaminhao),
  'rodovia-placa-100': de3((m) => m.RodoviaPlaca100),
  'crianca-carro': de3((m) => m.CriancaCarro),
  // Mundo 4
  'radar-60': de4((m) => m.Radar60),
  'avanca-vermelho': de4((m) => m.AvancaVermelho),
  'celular-mao': de4((m) => m.CelularMao),
  'celular-banco': de4((m) => m.CelularBanco),
  'fones-ouvido': de4((m) => m.FonesOuvido),
  'moto-sem-capacete': de4((m) => m.MotoSemCapacete),
  'blitz-noite': de4((m) => m.BlitzNoite),
  'fiscalizacao-cinto': de4((m) => m.FiscalizacaoCinto),
  'racha': de4((m) => m.Racha),
  'sinistro-moto': de4((m) => m.SinistroMoto),
  'escola': de4((m) => m.Escola),
  'zigue-zague': de4((m) => m.ZigueZague),
  'festa': de4((m) => m.Festa),
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
