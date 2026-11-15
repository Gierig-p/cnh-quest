/**
 * Vídeos animados dos cartões de conceito (teste de 15/11/2026, pedido do dono).
 * O "vídeo" é uma animação do motor 3D dentro do app (leve, sem MP4), com narração e legenda.
 * Cada fala é uma frase da legenda; a animação segue os tempos de cada fala.
 * O áudio é gerado antes do deploy por scripts/audio/videos.ts e fica em public/audio/videos/<id>.mp3,
 * e os tempos de cada fala em src/content/videos/<id>.json. Mudou uma fala? Rode o script de novo.
 * Regra: diz o mesmo que o cartão, em linguagem simples, sem fato novo.
 */
export type VideoId = 'faixas' | 'acostamento' | 'ultrapassar' | 'nao-ultrapassar';

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
  // cartão c3-calcada-acostamento (CTB art. 29, V e § 2º; Anexo I)
  acostamento: {
    falas: [
      'A calçada é das pessoas a pé.',
      'O acostamento, a faixa ao lado da pista na estrada, é para emergências.',
      'Nenhum dos dois é caminho para carro.',
      'O carro só passa sobre a calçada para entrar ou sair de uma casa, garagem ou estacionamento.',
      'O trânsito parou na rodovia? Andar pelo acostamento para passar à frente é proibido.',
      'Ele fica livre para quem tem uma emergência.',
      'No trânsito, quem é maior cuida de quem é menor.',
      'O caminhão cuida do carro. O carro cuida da moto e da bicicleta.',
      'E todos juntos cuidam dos pedestres.',
      'Para guardar: quanto maior, mais responsável. E o pedestre é de todos.',
    ],
  },
  // cartão c3-ultrapassar-como (CTB art. 29, IX, X e XI; art. 30; Anexo I)
  ultrapassar: {
    falas: [
      'Ultrapassar é sair da sua faixa, passar à frente de um veículo mais lento no mesmo sentido e voltar.',
      'É uma das manobras mais perigosas. Por isso, tem passos certos.',
      'Em regra, ultrapasse pela esquerda.',
      'Mas, se o veículo da frente sinalizou que vai entrar à esquerda, passe pela direita dele.',
      'Antes, olhe pelo retrovisor: ninguém atrás pode já estar ultrapassando você.',
      'Veja se o da frente não vai ultrapassar outro.',
      'E se a faixa ao lado está livre por um bom trecho.',
      'Ligue a seta, passe com distância para o lado e volte à sua faixa, de novo com a seta.',
      'E quem é ultrapassado não acelera. Se estiver na faixa da esquerda, vai para a da direita.',
      'Para guardar: olhe, sinalize, passe com espaço e volte sinalizando.',
    ],
  },
  // cartão c3-onde-nao-ultrapassar (CTB art. 31, 32 e 33; Anexo I)
  'nao-ultrapassar': {
    falas: [
      'Há lugares em que é proibido ultrapassar.',
      'São lugares em que você não enxerga quem vem de frente, ou em que há pessoas e trilhos por perto.',
      'Numa pista única de mão dupla, não ultrapasse nas curvas nem nas subidas sem boa visão.',
      'Nem nas passagens de nível, onde a via cruza o trilho do trem.',
      'Nem nas pontes e viadutos, nem nas faixas de pedestres, a não ser que a sinalização permita.',
      'Nos cruzamentos e perto deles, também não ultrapasse.',
      'Ônibus parado, com gente subindo ou descendo? Reduza, redobre a atenção ou pare.',
      'Alguém pode surgir na frente dele.',
      'Para guardar: se não dá para ver quem vem, não dá para passar.',
    ],
  },
};
