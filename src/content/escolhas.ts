/**
 * Situações "Na rua" em vídeo de escolha (Mundo 5, plano de 17/11/2026, docs/codex/respostas/10_situacoes_em_video.md).
 * Catálogo de apresentação, separado das questões: a questão (texto, alternativas, resposta, explicação e fonte)
 * continua igual em situations.ts. Aqui ficam só as falas do vídeo e o texto dos quadros parados.
 *
 * Cada ramo é indicado pelo ID da alternativa (não pela posição na tela, que é embaralhada).
 * As falas só repetem o que a questão já diz (alternativa, whyWrong, explicação, mnemonic).
 * O áudio fica em public/audio/escolhas/<questão>/<parte>.mp3 e os tempos em src/content/escolhas/<questão>.json
 * (scripts/audio/escolhas.ts).
 */
export interface EscolhaDef {
  /** som de fundo mostrado na legenda, entre colchetes */
  som: string;
  /** som extra no começo de um final (ex.: buzina), mostrado na legenda junto da primeira fala */
  somRamo?: Record<string, string>;
  /** falas da introdução; a última é a pergunta, e o vídeo para nela */
  intro: string[];
  /** falas de cada final, pelo ID da alternativa */
  ramos: Record<string, string[]>;
  /** nos finais errados, a fala em que começa o "jeito seguro" (o corte; a imagem mostra o aviso "Jeito seguro") */
  corte: number;
  /** quadros parados (movimento reduzido ou "Ver em quadros e texto") */
  quadros: {
    intro: string;
    /** o que a sua escolha fez, pelo ID da alternativa */
    escolha: Record<string, string>;
    seguro: string;
  };
}

const SEGURO_PONTO_CEGO = ['Olhe o ponto cego.', 'Só mude de faixa se estiver livre.'];
const SEGURO_POCA = ['Freie antes da poça. Sobre a água, não freie.', 'Segure firme o volante.'];

export const ESCOLHAS: Record<string, EscolhaDef> = {
  'w5-rua-1': {
    som: 'chuva forte',
    intro: ['Chove forte. A luz baixa está acesa.', 'Há uma poça grande na sua faixa.', 'O que você faz?'],
    ramos: {
      a: ['Boa escolha. Você freia antes da poça.', 'Sobre a água, não freia.', 'E segura firme o volante.'],
      b: ['Você acelera em direção à água.', 'Essa escolha aumenta o perigo.', ...SEGURO_POCA],
      c: ['Você freia em cima da poça.', 'Essa escolha aumenta o perigo.', ...SEGURO_POCA],
      d: ['Você desvia de repente, sem olhar.', 'Essa escolha aumenta o perigo.', ...SEGURO_POCA],
    },
    corte: 2,
    quadros: {
      intro: 'Chove forte e a luz baixa está acesa. Na sua faixa, lá na frente, há uma poça grande. Na outra faixa vem um carro.',
      escolha: {
        a: 'Você freia antes da poça. A luz de freio apaga antes da água. Sobre a água, o carro segue reto, sem frear, com o volante firme.',
        b: 'Você acelera em direção à poça. A cena para na entrada da água: essa escolha aumenta o perigo.',
        c: 'Você entra na poça e a luz de freio acende em cima da água. A cena para: essa escolha aumenta o perigo.',
        d: 'Você começa a ir para a outra faixa sem olhar, e vem um carro nela. A cena para antes de você entrar: essa escolha aumenta o perigo.',
      },
      seguro: 'Jeito seguro: freie antes da poça. Sobre a água, não freie. Segure firme o volante.',
    },
  },
  'w5-rua-4': {
    som: 'motor de veículo bem perto',
    somRamo: { b: 'buzina curta' },
    intro: ['Você quer ir para a faixa da esquerda.', 'O espelho parece livre, mas há barulho de motor bem perto.', 'O que você faz?'],
    ramos: {
      a: ['Você confia no espelho e muda de faixa.', 'Essa escolha aumenta o perigo.', ...SEGURO_PONTO_CEGO],
      b: ['Você buzina e muda de faixa.', 'Essa escolha aumenta o perigo.', ...SEGURO_PONTO_CEGO],
      c: ['Você muda de faixa bem rápido.', 'Essa escolha aumenta o perigo.', ...SEGURO_PONTO_CEGO],
      d: ['Boa escolha. Você vira um pouco a cabeça e olha o ponto cego.', 'Tem uma moto ali. Você espera na sua faixa.', 'Espelho, cabeça e só depois a manobra.'],
    },
    corte: 2,
    quadros: {
      intro: 'Você está na faixa do meio de uma avenida e quer ir para a faixa da esquerda. O espelho parece livre, mas há barulho de motor bem perto.',
      escolha: {
        a: 'Você começa a ir para a esquerda só olhando o espelho. A cena para logo no começo: havia uma moto no ponto cego. Essa escolha aumenta o perigo.',
        b: 'Você buzina e começa a ir para a esquerda. A buzina não tira a moto do ponto cego. A cena para logo no começo: essa escolha aumenta o perigo.',
        c: 'Você começa a ir para a esquerda bem rápido. A cena para logo no começo: havia uma moto no ponto cego. Essa escolha aumenta o perigo.',
        d: 'Você vira um pouco a cabeça e olha o ponto cego. Tem uma moto ali. Você continua na sua faixa e espera a moto passar.',
      },
      seguro: 'Jeito seguro: vire um pouco a cabeça e olhe o ponto cego. Só mude de faixa se estiver livre.',
    },
  },
};

export const temEscolha = (questionId: string): boolean => questionId in ESCOLHAS;
