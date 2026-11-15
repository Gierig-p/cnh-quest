/**
 * Vídeos animados dos cartões de conceito (teste de 15/11/2026, pedido do dono).
 * O "vídeo" é uma animação do motor 3D dentro do app (leve, sem MP4), com narração e legenda.
 * Cada fala é uma frase da legenda; a animação segue os tempos de cada fala.
 * O áudio é gerado antes do deploy por scripts/audio/videos.ts e fica em public/audio/videos/<id>.mp3,
 * e os tempos de cada fala em src/content/videos/<id>.json. Mudou uma fala? Rode o script de novo.
 * Regra: diz o mesmo que o cartão, em linguagem simples, sem fato novo.
 */
export type VideoId = 'faixas' | 'acostamento' | 'ultrapassar' | 'nao-ultrapassar' | 'seta' | 'conversao' | 'farois' | 'pisca-buzina' | 'parada' | 'portas' | 'velocidade-estrada' | 'cinto';

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
  // cartão c3-seta (CTB art. 29, § 1º; arts. 34, 35 e 36)
  seta: {
    falas: [
      'Antes de ir para o lado, olhe em volta.',
      'A manobra não pode trazer perigo para quem vem atrás, vai à frente ou vai cruzar com você.',
      'Mudar de faixa, virar e fazer o retorno: tudo isso é ir para o lado.',
      'Em todos esses casos, avise antes, com a seta.',
      'Se a seta não funcionar, avise com o gesto de braço.',
      'Mudar de faixa vale para a esquerda ou para a direita, sempre com os mesmos cuidados.',
      'Vai sair de uma garagem para a rua? Quem já está na rua passa primeiro: carros e pedestres.',
      'Espere os dois passarem. Depois, entre.',
      'Para guardar: primeiro olhe, depois a seta, só então vire.',
    ],
  },
  // cartão c3-conversao (CTB art. 37, art. 38 e parágrafo único, art. 44-A, art. 45)
  conversao: {
    falas: [
      'Na hora de virar, a posição do carro conta.',
      'Para virar à direita, encoste o máximo no lado direito e faça a curva fechada, no menor espaço.',
      'Para virar à esquerda numa rua de mão dupla, chegue perto do meio da pista.',
      'Numa rua de mão única, encoste no lado esquerdo.',
      'Ao virar, dê passagem aos pedestres, aos ciclistas e a quem vem em sentido contrário.',
      'Na rodovia sem lugar próprio para virar à esquerda, espere no acostamento da direita e cruze quando der.',
      'Sinal verde não basta. Se você vai ficar parado no meio do cruzamento, não entre.',
      'Virar à direita no sinal vermelho, só onde a sinalização permitir.',
      'Para guardar: verde não é ordem de entrar. Só entre se tiver espaço para sair.',
    ],
  },
  // cartão c3-farois (CTB art. 40, I e II, §§ 1º e 2º)
  farois: {
    falas: [
      'O farol serve para você ver e, principalmente, para ser visto.',
      'À noite, use a luz baixa.',
      'De dia também, nos túneis e com chuva, neblina ou cerração.',
      'Numa estrada sem iluminação, use a luz alta.',
      'Mas troque pela baixa quando cruzar com um carro vindo de frente.',
      'E também quando estiver logo atrás de outro carro.',
      'Motos usam o farol baixo de dia e de noite. Ônibus nas faixas só deles também.',
      'Carro sem luz própria para o dia acende o farol de dia nas rodovias de pista simples, fora da cidade.',
      'Para guardar: alguém de frente ou logo à frente? Luz baixa.',
    ],
  },
  // cartão c3-pisca-buzina (CTB art. 40, III e V; art. 41; art. 42)
  'pisca-buzina': {
    falas: [
      'Piscar o farol, ligar o pisca-alerta e buzinar são avisos.',
      'Por isso, cada um só vale nas situações certas.',
      'Piscar o farol é trocar a luz baixa e a alta bem rápido.',
      'Serve para avisar o carro da frente que você vai ultrapassar.',
      'Ou para avisar um perigo a quem vem de frente.',
      'O pisca-alerta é para o veículo parado na via, numa emergência, ou quando a regra do local mandar.',
      'A buzina é só um toque breve, para evitar um acidente.',
      'Fora da cidade, o toque breve também avisa que você vai ultrapassar.',
      'E não freie de repente, a não ser por segurança.',
      'Para guardar: buzina é aviso de perigo, não de pressa.',
    ],
  },
  // cartão c3-parada-estacionamento (CTB art. 46; art. 47 e parágrafo único; Anexo I)
  parada: {
    falas: [
      'Parar e estacionar parecem a mesma coisa, mas não são.',
      'A diferença é o tempo e o motivo.',
      'Parada é parar só o tempo de alguém subir ou descer do carro.',
      'Estacionamento é ficar parado por mais tempo que isso.',
      'Carregar ou descarregar mercadorias também conta como estacionamento.',
      'Onde é proibido estacionar, a parada só pode durar o tempo de alguém subir ou descer.',
      'E sem atrapalhar os carros e os pedestres.',
      'Se o carro ficar parado na via por uma emergência, sinalize o local na hora.',
      'Para guardar: subiu ou desceu e foi embora, é parada. Ficou, é estacionamento.',
    ],
  },
  // cartão c3-posicao-portas (CTB art. 48, caput e §§ 1º e 2º; art. 49 e parágrafo único)
  portas: {
    falas: [
      'Não basta saber onde parar. A posição do veículo também tem regra.',
      'O carro fica no sentido do trânsito, paralelo à beirada da pista e junto ao meio-fio.',
      'A moto fica de frente ou de traseira para o meio-fio, formando um L, e junto a ele.',
      'Isso vale quando a sinalização não mandar outra coisa.',
      'Na estrada com acostamento, pare fora da pista.',
      'Antes de abrir a porta, olhe se não vem ninguém: carro, moto, bicicleta ou pedestre.',
      'Os passageiros sobem e descem pelo lado da calçada. Só o motorista usa o outro lado.',
      'Para guardar: carro paralelo, moto em L, porta só depois de olhar.',
    ],
  },
  'velocidade-estrada': {
    falas: [
      'Fora da cidade, o limite de velocidade depende do tipo de via e do veículo.',
      'Rodovia é a via rural com asfalto. Estrada é a via rural de terra.',
      'Na rodovia de pista dupla, sem placa: carros, caminhonetes e motos vão até 110 quilômetros por hora.',
      'Os outros veículos, como caminhões e ônibus, até 90.',
      'Na rodovia de pista simples, sem placa: carros, caminhonetes e motos até 100. Os outros, até 90.',
      'Na estrada de terra, sem placa: 60 quilômetros por hora.',
      'Mas a placa sempre vem primeiro. Se ela marca 80, vale 80 para todos.',
      'E a velocidade mínima é a metade da máxima. Andar devagar demais sem motivo também atrapalha.',
      'Para guardar: pista dupla 110, simples 100, terra 60. Mínima: metade.',
    ],
  },
  cinto: {
    falas: [
      'Em qualquer viagem, curta ou longa, o corpo precisa estar protegido.',
      'O cinto de segurança é obrigatório para o motorista e para todos os passageiros, em todas as vias.',
      'Vale no banco da frente e no banco de trás.',
      'Criança com menos de 10 anos e menos de um metro e quarenta e cinco vai no banco de trás.',
      'E na proteção certa para a idade, o peso e a altura: bebê conforto, cadeirinha ou assento de elevação.',
      'Na moto, quem pilota usa capacete com viseira ou óculos de proteção.',
      'Pilota com as duas mãos no guidão e com roupa de proteção.',
      'O passageiro também usa capacete e roupa de proteção, e vai sentado atrás de quem pilota.',
      'Para guardar: todo mundo de cinto, criança atrás, capacete fechado.',
    ],
  },
};
