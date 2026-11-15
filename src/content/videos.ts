/**
 * Vídeos animados dos cartões de conceito (teste de 15/11/2026, pedido do dono).
 * O "vídeo" é uma animação do motor 3D dentro do app (leve, sem MP4), com narração e legenda.
 * Cada fala é uma frase da legenda; a animação segue os tempos de cada fala.
 * O áudio é gerado antes do deploy por scripts/audio/videos.ts e fica em public/audio/videos/<id>.mp3,
 * e os tempos de cada fala em src/content/videos/<id>.json. Mudou uma fala? Rode o script de novo.
 * Regra: diz o mesmo que o cartão, em linguagem simples, sem fato novo.
 */
export type VideoId = 'faixas';

export const VIDEOS: Record<VideoId, { falas: string[] }> = {
  // cartão c3-lado-direito (CTB art. 28 e art. 29, I, II e IV)
  faixas: {
    falas: [
      'No Brasil, o trânsito anda pelo lado direito da via.',
      'Quando a pista tem várias faixas no mesmo sentido, cada faixa tem um uso.',
      'As faixas da direita são dos veículos mais lentos e maiores, como caminhões e ônibus.',
      'As faixas da esquerda são para ultrapassar e para quem anda mais rápido.',
      'Para passar o caminhão, vá para a faixa à esquerda dele e depois volte.',
      'Guarde distância para a frente, para os lados e da beirada da pista.',
      'Quanto maior a velocidade, a chuva ou o movimento, maior deve ser o espaço.',
      'E dirija sempre com atenção, com o carro sob controle.',
      'Para guardar: direita para andar devagar, esquerda para passar.',
    ],
  },
};
