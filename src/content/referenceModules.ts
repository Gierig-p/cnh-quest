import type { ModuleId, Question, ReferenceModuleId, World } from './types';

/**
 * Os 4 módulos de referência usados para organizar a trilha.
 *
 * ATENÇÃO: a associação mundo/lição → módulo é ORGANIZAÇÃO PEDAGÓGICA PRÓPRIA do CNH Quest.
 * Não existe classificação oficial publicada que ligue os assuntos do app a estes módulos.
 * Origem dos nomes: docs/matriz-conteudo-detran.md, seção "3b".
 */
export interface ReferenceModule {
  id: ReferenceModuleId;
  title: string;
  /** De onde vem o nome e qual é o grau de confirmação. */
  origin: string;
}

export const REFERENCE_MODULES: Record<ReferenceModuleId, ReferenceModule> = {
  1: {
    id: 1,
    title: 'Sinalização de trânsito',
    origin: 'Título no curso CNH do Brasil (índice visto em 25/10/2026): "Placas, cores e caminhos". Também no Banco Nacional de Questões v1.0.',
  },
  2: {
    id: 2,
    title: 'Escolhas e consequências',
    origin: 'Título no curso CNH do Brasil (índice visto em 25/10/2026): "Escolhas e consequências". Também no Banco Nacional de Questões v1.0.',
  },
  3: {
    id: 3,
    title: 'Direção defensiva',
    origin: 'Título no curso CNH do Brasil (índice visto em 25/10/2026): "Na direção da segurança". Nome curto do app vem da imprensa ("princípios de direção defensiva").',
  },
  4: {
    id: 4,
    title: 'Cuidado com a vida e o meio ambiente',
    origin: 'Título no curso CNH do Brasil (índice visto em 25/10/2026): "Cuidar, agir e preservar". Nome curto do app vem da imprensa ("cuidado da vida e do meio ambiente").',
  },
};

/**
 * Assunto da questão → módulo de referência (organização própria, inferida pelo tema).
 * Circulação (preferência, velocidade) fica no módulo 3, como no Banco Nacional v1.0,
 * em que "Na Direção da Segurança" reúne normas de circulação e direção defensiva.
 */
export const MODULE_TO_REFERENCE: Record<ModuleId, ReferenceModuleId> = {
  sinalizacao: 1,
  infracoes: 2,
  circulacao: 3,
  'direcao-defensiva': 3,
  'primeiros-socorros': 4,
  'meio-ambiente': 4,
};

/** Módulos de referência cobertos por um conjunto de questões, em ordem. */
export function referenceModulesOf(questions: Question[]): ReferenceModuleId[] {
  const set = new Set(questions.map((q) => MODULE_TO_REFERENCE[q.module]));
  return ([1, 2, 3, 4] as ReferenceModuleId[]).filter((m) => set.has(m));
}

export function worldReferenceModules(world: World): ReferenceModuleId[] {
  const set = new Set(world.lessons.map((l) => l.referenceModule));
  return ([1, 2, 3, 4] as ReferenceModuleId[]).filter((m) => set.has(m));
}

/** Mundos ainda não escritos (docs/plano-tecnico.md), com o módulo de referência previsto. */
export const PLANNED_WORLDS: { order: number; title: string; referenceModules: ReferenceModuleId[] }[] = [
  { order: 3, title: 'Regras para circular', referenceModules: [3] },
  { order: 4, title: 'Infrações e consequências', referenceModules: [2] },
  { order: 5, title: 'Motorista defensivo', referenceModules: [3] },
  { order: 6, title: 'Emergências e primeiros socorros', referenceModules: [4] },
  { order: 7, title: 'Veículo, meio ambiente e cidadania', referenceModules: [4] },
  { order: 8, title: 'Preparação para a prova', referenceModules: [1, 2, 3, 4] },
];
