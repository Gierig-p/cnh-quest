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

/** a contagem é a do cartão verificado "A regra dos dois segundos" (world5.ts) */
const SEGURO_DISTANCIA = ['Reduza e conte de novo.', 'Cinquenta e um, cinquenta e dois.', 'Só depois passe pela placa.'];
const SEGURO_PONTO_CEGO = ['Olhe o ponto cego.', 'Só mude de faixa se estiver livre.'];
const SEGURO_NEBLINA = ['Use a luz baixa. Reduza e aumente a distância.', 'Se não der para seguir, pare num local seguro.'];
const SEGURO_SONO = ['Pare num local seguro.', 'Descanse antes de seguir.'];
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
  'w5-rua-2': {
    som: 'barulho da estrada',
    intro: ['Você segue um caminhão na rodovia, num dia de sol.', 'O caminhão passa pela placa.', 'Cinquenta e um...', 'Seu carro já chegou à placa.', 'O que você faz?'],
    ramos: {
      a: ['Você mantém a velocidade.', 'Essa escolha aumenta o perigo.', ...SEGURO_DISTANCIA],
      b: ['Você pisca o farol para o caminhão.', 'Essa escolha aumenta o perigo.', ...SEGURO_DISTANCIA],
      c: ['Boa escolha. Você tira o pé e a distância aumenta.', 'Cinquenta e um, cinquenta e dois.', 'Só depois você passa pela placa.', 'Passou antes? Tire o pé e conte de novo.'],
      d: ['Você encosta ainda mais no caminhão.', 'Essa escolha aumenta o perigo.', ...SEGURO_DISTANCIA],
    },
    corte: 2,
    quadros: {
      intro: 'Você segue um caminhão na rodovia, num dia de sol. O caminhão passa pela placa e você conta: cinquenta e um... e o seu carro já chegou à placa.',
      escolha: {
        a: 'Você mantém a velocidade e a distância continua curta. A cena para: essa escolha aumenta o perigo.',
        b: 'Você pisca o farol para o caminhão, mas a distância não aumenta: quem precisa ajustar é você. A cena para: essa escolha aumenta o perigo.',
        c: 'Você tira o pé e a distância aumenta. O caminhão passa pela placa seguinte e você conta: cinquenta e um, cinquenta e dois. Só depois o seu carro passa pela placa.',
        d: 'Você chega ainda mais perto do caminhão e sobra menos tempo para reagir. A cena para: essa escolha aumenta o perigo.',
      },
      seguro: 'Jeito seguro: reduza e conte de novo, "cinquenta e um, cinquenta e dois". Só depois da contagem passe pela placa.',
    },
  },
  'w5-rua-3': {
    som: 'noite na estrada',
    intro: ['São quatro da manhã.', 'Você trabalhou o dia todo e dormiu muito pouco.', 'Na estrada, os seus olhos pesam e você boceja sem parar.', 'O que você faz?'],
    ramos: {
      a: ['Você liga o som bem alto.', 'Essa escolha aumenta o perigo.', ...SEGURO_SONO],
      b: ['Boa escolha. Você para num local seguro.', 'E descansa antes de seguir.', 'Bateu o sono? Pare e descanse.'],
      c: ['Você acelera para chegar antes.', 'Essa escolha aumenta o perigo.', ...SEGURO_SONO],
      d: ['Você abre a janela e continua do mesmo jeito.', 'Essa escolha aumenta o perigo.', ...SEGURO_SONO],
    },
    corte: 2,
    quadros: {
      intro: 'São quatro da manhã. Você trabalhou o dia todo e dormiu muito pouco. Na estrada escura, os seus olhos pesam e você boceja sem parar.',
      escolha: {
        a: 'Você liga o som bem alto e continua. Os olhos continuam pesados: som alto não tira o sono e ainda abafa os barulhos do trânsito. A cena para: essa escolha aumenta o perigo.',
        b: 'Você dá a seta, sai da estrada e para numa área de descanso iluminada, fora da pista. Ali você descansa antes de seguir.',
        c: 'Você acelera. Com sono, os reflexos ficam lentos, e mais velocidade aumenta muito o perigo. A cena para.',
        d: 'Você abre a janela e continua do mesmo jeito. O vento no rosto não resolve o sono: os olhos continuam pesados. A cena para: essa escolha aumenta o perigo.',
      },
      seguro: 'Jeito seguro: pare num local seguro, fora da pista, e descanse antes de seguir.',
    },
  },
  'w5-rua-5': {
    som: 'neblina na serra',
    intro: ['De manhã cedo, você desce a serra.', 'De repente, a neblina fecha.', 'Você mal enxerga a traseira do carro da frente.', 'O que você faz?'],
    ramos: {
      a: ['Você acende a luz alta.', 'Essa escolha aumenta o perigo.', ...SEGURO_NEBLINA],
      b: ['Você para no meio da pista.', 'Essa escolha aumenta o perigo.', ...SEGURO_NEBLINA],
      c: ['Boa escolha. Você acende a luz baixa e reduz.', 'E aumenta a distância do carro da frente.', 'Se não der para seguir, pare num local seguro.', 'Neblina: luz baixa, nunca alta.'],
      d: ['Você cola no carro da frente.', 'Essa escolha aumenta o perigo.', ...SEGURO_NEBLINA],
    },
    corte: 2,
    quadros: {
      intro: 'De manhã cedo, você desce a serra. De repente, a neblina fecha e você mal enxerga a traseira do carro da frente.',
      escolha: {
        a: 'Você acende a luz alta. A luz reflete nas gotinhas da neblina e você enxerga ainda menos. A cena para: essa escolha aumenta o perigo.',
        b: 'Você para no meio da pista. Parado ali, quem vem atrás pode não ver você. A cena para: essa escolha aumenta o perigo.',
        c: 'Você acende a luz baixa, reduz e deixa a distância do carro da frente aumentar. Se não der para seguir, você para num local seguro, como um posto.',
        d: 'Você cola no carro da frente para seguir as luzes dele. Na neblina, a distância deve aumentar, não diminuir. A cena para: essa escolha aumenta o perigo.',
      },
      seguro: 'Jeito seguro: use a luz baixa, reduza e aumente a distância. Se não der para seguir, pare num local seguro, como um posto.',
    },
  },
};

export const temEscolha = (questionId: string): boolean => questionId in ESCOLHAS;
