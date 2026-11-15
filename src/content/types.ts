/** Modelo de dados do conteúdo educativo. Nenhum texto de questão vive nos componentes. */

export type ModuleId =
  | 'sinalizacao'
  | 'infracoes'
  | 'circulacao'
  | 'direcao-defensiva'
  | 'primeiros-socorros'
  | 'meio-ambiente';

/**
 * Módulo de referência (1 Sinalização · 2 Escolhas e consequências · 3 Direção defensiva ·
 * 4 Cuidado com a vida e o meio ambiente). Organização pedagógica própria: ver referenceModules.ts.
 */
export type ReferenceModuleId = 1 | 2 | 3 | 4;

export type Difficulty = 1 | 2 | 3;

/** Estado de revisão do conteúdo: só 'verificado' pode entrar em simulado. */
export type ReviewStatus = 'verificado' | 'em-revisao' | 'rascunho';

export interface SourceRef {
  /** id em SOURCES (sources.ts) */
  sourceId: string;
  /** dispositivo específico, ex.: "art. 29, III" ou "R-1" */
  locator: string;
}

/** Placas e ilustrações desenhadas pelo app (componente SignArt). */
export type SignCode =
  | 'R-1' | 'R-2' | 'R-3' | 'R-6a' | 'R-6c' | 'R-7' | 'R-19'
  | 'R-4a' | 'R-5a' | 'R-26' | 'R-33'
  | 'A-12' | 'A-14' | 'A-18' | 'A-24' | 'A-32b' | 'A-41'
  /** placa de orientação de destino (verde), exemplo didático sem código oficial */
  | 'IND-destino';

export interface Visual {
  kind: 'sign' | 'scene';
  /** para kind = 'sign' */
  sign?: SignCode;
  /** para R-19 */
  speed?: number;
  /** para kind = 'scene': id de cena em SceneArt */
  scene?: SceneId;
  /** cena 3D que reage à resposta (AnimScene); quando existe, substitui `scene` */
  anim?: AnimSceneId;
  alt: string;
}

/** cenas que reagem à resposta (piloto de 14/11/2026) */
export type AnimSceneId = 'pedestre-faixa' | 'linha-retencao' | 'porta-bicicleta';

export type SceneId =
  | 'cruzamento-direita'
  | 'rotatoria'
  | 'rodovia-via-local'
  | 'agente-semaforo'
  | 'pedestre-faixa'
  | 'ambulancia'
  | 'linha-amarela-continua'
  | 'linha-amarela-tracejada'
  | 'linha-retencao'
  | 'semaforo-amarelo'
  // cenas novas (14/11)
  | 'cruzamento-caminhao'
  | 'cruzamento-aproximacao'
  | 'agente-apito'
  | 'pedestre-semaforo'
  | 'ambulancia-atras'
  | 'bombeiros-atras'
  | 'ambulancia-desligada'
  | 'rua-local'
  | 'linha-branca-continua'
  | 'vaga-idoso'
  | 'semaforo-amarelo-piscando'
  | 'semaforo-pedestre-piscando'
  | 'placa-escondida'
  | 'placa-distancias';

/**
 * Uma linha da situação narrada ("Na rua"): uma fala do narrador ou um som.
 * O áudio pronto fica em public/audio/situacoes/<id da questão>.mp3 (scripts/audio/situacoes.ts).
 */
export type SituationLine =
  | { kind: 'fala'; text: string }
  /** `som` é a chave do efeito no script de áudio; `label` é o que aparece na tela, ex.: "apito". */
  | { kind: 'som'; som: string; label: string };

interface QuestionBase {
  id: string;
  module: ModuleId;
  topic: string;
  objective: string;
  prompt: string;
  visual?: Visual;
  difficulty: Difficulty;
  /** Por que a resposta correta está correta. */
  explanation: string;
  /** Frase curta para memorizar. */
  mnemonic: string;
  sources: SourceRef[];
  verifiedAt: string; // AAAA-MM-DD
  review: ReviewStatus;
  /** Pode entrar no simulado (formato oficial: 4 alternativas, 1 correta). */
  examEligible?: boolean;
  /** Situação narrada com sons, tocada antes da pergunta (lições "Na rua"). */
  situation?: SituationLine[];
}

export interface ChoiceOption {
  id: string;
  text: string;
  visual?: Visual;
  /** Por que esta alternativa está errada (obrigatório para as incorretas). */
  whyWrong?: string;
}

export interface ChoiceQuestion extends QuestionBase {
  type: 'choice';
  options: ChoiceOption[];
  correct: string;
  /** Exibir opções como cartões de imagem. */
  layout?: 'list' | 'grid';
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'truefalse';
  statement: string;
  answer: boolean;
  whyWrong: string;
}

/** Completar frase com banco de palavras (uma lacuna `___`). */
export interface FillBlankQuestion extends QuestionBase {
  type: 'fill';
  sentence: string;
  bank: string[];
  answer: string;
  whyWrong: Record<string, string>;
}

/** Ordenar passos ou hierarquias. */
export interface OrderQuestion extends QuestionBase {
  type: 'order';
  items: { id: string; text: string }[];
  /** ordem correta de ids */
  answer: string[];
  whyWrong: string;
}

/** Associar pares (ex.: placa ↔ significado). */
export interface MatchQuestion extends QuestionBase {
  type: 'match';
  pairs: { id: string; left: string; leftVisual?: Visual; right: string }[];
  whyWrong: string;
}

export type Question =
  | ChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | OrderQuestion
  | MatchQuestion;

/** Palavra explicada num cartão. Vira dica (balão) nos exercícios depois de ensinada. */
export interface TermDef {
  term: string;
  meaning: string;
  /** Outras formas da mesma palavra a destacar nos exercícios (plural, variações). */
  aliases?: string[];
  /**
   * Questões em que a palavra não vira dica: ela aparece com outro sentido
   * ou o significado entregaria a resposta.
   */
  skipIn?: string[];
}

/** Cartão de conceito (não avaliado) que abre um assunto, como "Palavra nova". */
export interface ConceptCard {
  id: string;
  title: string;
  /** Fala curta e acolhedora da Lumi que apresenta o assunto. */
  body: string;
  /** Palavras que o aluno talvez não conheça, explicadas em linguagem simples. */
  terms?: TermDef[];
  /** A explicação dividida em passos curtos. */
  points?: string[];
  /** Uma situação do dia a dia que mostra a regra. */
  example?: string;
  /** Frase curta para memorizar. */
  remember?: string;
  visual?: Visual;
  sources: SourceRef[];
}

export type LessonStep =
  | { kind: 'concept'; card: ConceptCard }
  | { kind: 'question'; questionId: string };

export interface Lesson {
  id: string;
  title: string;
  icon: 'star' | 'sign' | 'shield' | 'review' | 'trophy';
  steps: LessonStep[];
  /** Fração mínima de acertos na 1ª tentativa para contar como "dominada". */
  masteryThreshold: number;
  xp: number;
  /**
   * Quantas vezes a lição é feita antes de liberar a próxima (padrão 1).
   * Rodada 1: explicações + exercícios. Rodadas seguintes: só prática, mais curta.
   */
  rounds?: number;
  /**
   * Revisão sorteada: em vez de questões fixas, sorteia `size` questões já ensinadas no mundo
   * (revisão da metade: lições antes dela; revisão do mundo: todas). Nesse caso `steps` fica vazio.
   */
  review?: { size: number };
  /** Módulo de referência principal da lição (organização própria; deve aparecer entre os módulos das questões). */
  referenceModule: ReferenceModuleId;
}

export interface World {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  color: string;
  lessons: Lesson[];
}

export interface ExamConfig {
  id: string;
  label: string;
  questionCount: number;
  passMin: number;
  durationMin: number;
  sources: SourceRef[];
  notes: string;
}
