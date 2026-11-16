/**
 * Vídeos animados dos cartões de conceito (teste de 15/11/2026, pedido do dono).
 * O "vídeo" é uma animação do motor 3D dentro do app (leve, sem MP4), com narração e legenda.
 * Cada fala é uma frase da legenda; a animação segue os tempos de cada fala.
 * O áudio é gerado antes do deploy por scripts/audio/videos.ts e fica em public/audio/videos/<id>.mp3,
 * e os tempos de cada fala em src/content/videos/<id>.json. Mudou uma fala? Rode o script de novo.
 * Regra: diz o mesmo que o cartão, em linguagem simples, sem fato novo.
 */
export type VideoId = 'faixas' | 'acostamento' | 'ultrapassar' | 'nao-ultrapassar' | 'seta' | 'conversao' | 'farois' | 'pisca-buzina' | 'parada' | 'portas' | 'velocidade-estrada' | 'cinto' | 'sinais' | 'hierarquia' | 'placa-escondida' | 'preferencia' | 'pedestre' | 'emergencia' | 'formas' | 'r1-r2' | 'proibicoes' | 'velocidade' | 'proibe-movimento' | 'obriga-movimento' | 'advertencia' | 'avisos' | 'indicacao' | 'distancias' | 'marcas-cores' | 'marcas-linhas' | 'marcas-transversais' | 'semaforo' | 'semaforo-pisca';

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
  // cartão c-tipos-sinais (CTB art. 87; Anexo I)
  sinais: {
    falas: [
      'Sinal de trânsito é tudo o que dá um recado a quem dirige ou anda na rua.',
      'A lei diz que existem só seis tipos de sinal.',
      'As placas, em pé nos postes, são os sinais verticais.',
      'As pinturas no chão, como a faixa de pedestres e as linhas da pista, são os sinais horizontais.',
      'Os semáforos são os sinais luminosos.',
      'O apito do agente de trânsito é o sinal sonoro.',
      'Os movimentos de braço do agente são gestos. Os do motorista também.',
      'E os dispositivos auxiliares, como cones e tachões, ajudam a sinalizar.',
      'Para guardar: placa, pintura, luz, som, gesto e auxiliar.',
    ],
  },
  // cartão c-hierarquia (CTB art. 89; art. 61, §§ 1º e 2º)
  hierarquia: {
    falas: [
      'Às vezes dois sinais parecem dizer coisas diferentes. A lei já definiu quem manda mais.',
      'Pense numa escada: quem está no degrau de cima manda em quem está embaixo.',
      'Em primeiro lugar, o agente de trânsito. O que ele mandar vale mais que tudo.',
      'Em segundo, o semáforo. Ele vale mais que as placas e as pinturas no chão.',
      'Em terceiro, os outros sinais: as placas e as marcas no chão.',
      'Em quarto, as regras gerais da lei, como o limite de velocidade que vale quando não há placa.',
      'O semáforo está vermelho, mas o agente faz sinal para você seguir: você segue.',
      'A lei tem um limite geral, mas a rua tem uma placa com outro número: vale a placa.',
      'Para guardar: agente, semáforo, sinais e normas. Tem placa? Vale a placa.',
    ],
  },
  // cartão c-sinalizacao-falha (CTB art. 90 e § 1º)
  'placa-escondida': {
    falas: [
      'Às vezes uma placa fica atrás de uma árvore, apagada ou no lugar errado.',
      'Se a sinalização é insuficiente ou errada, você não pode ser punido por não obedecer àquele sinal.',
      'Quem responde pela placa é o órgão de trânsito responsável pela via.',
      'Não é o motorista, nem o dono da casa em frente.',
      'Mas as regras gerais continuam valendo.',
      'Placa escondida não quer dizer que tudo está liberado.',
      'Para guardar: placa que não se vê não pune, mas a regra geral continua.',
    ],
  },
  // cartão c-preferencia (CTB art. 29, III, e art. 44)
  preferencia: {
    falas: [
      'Preferência é o direito de passar primeiro.',
      'Se o cruzamento tem placa ou semáforo, obedeça a eles.',
      'Se não tem nada, faça três perguntas, nesta ordem.',
      'Primeira: um dos carros está numa rodovia? Passa quem está na rodovia.',
      'Segunda: é uma rotatória? Passa quem já está girando nela. Quem vai entrar espera.',
      'Terceira: nenhum dos dois? Passa quem vem pela sua direita.',
      'Tamanho do veículo, velocidade e quem chegou primeiro não contam.',
      'E chegue a qualquer cruzamento devagar, pronto para parar.',
      'Para guardar: rodovia, rotatória, direita.',
    ],
  },
  // cartão c-pedestre (CTB art. 70 e art. 214)
  pedestre: {
    falas: [
      'Pedestre é quem está a pé. É a parte mais frágil do trânsito.',
      'Na faixa sem semáforo, quem está atravessando passa primeiro. Você para e espera.',
      'Na faixa com semáforo, vale o semáforo.',
      'Mas, se o sinal abrir para você e ainda houver alguém na faixa, essa pessoa termina a travessia primeiro.',
      'Vai virar à direita e o pedestre já está na faixa? Pare e espere ele chegar do outro lado.',
      'Não dar a preferência ao pedestre na faixa é infração gravíssima, a mais séria.',
      'Para guardar: pé na faixa, pé no freio.',
    ],
  },
  // cartão c-emergencia (CTB art. 29, VII, "a")
  emergencia: {
    falas: [
      'Ambulância, bombeiros e polícia em urgência precisam chegar rápido.',
      'Repare: sirene tocando e luzes piscando são o sinal de urgência.',
      'Deixe livre a faixa da esquerda.',
      'Vá para a direita e pare, se for necessário.',
      'Para guardar: sirene tocou, direita e calma.',
    ],
  },
  // cartão c-formas (MBST vol. I item 3.6; vol. II item 3.5, A-18, A-32b)
  formas: {
    falas: [
      'Antes de ler o desenho, olhe a forma e a cor da placa.',
      'Placa redonda, em vermelho, preto e branco, é de regulamentação: ela dá uma ordem.',
      'Ordem é algo que você é obrigado a fazer, ou proibido de fazer.',
      'Há duas exceções: o PARE tem oito lados, e o Dê a preferência é um triângulo.',
      'Placa amarela, em forma de losango, é de advertência: ela dá um aviso.',
      'Por exemplo: a lombada desenhada avisa que há uma lombada à frente.',
      'E a pessoa na faixa avisa que há uma faixa de pedestres adiante.',
      'Para guardar: redonda manda, amarela em losango avisa.',
    ],
  },
  // cartão c-r1-r2 (MBST vol. I, R-1 e R-2; CTB arts. 208 e 258)
  'r1-r2': {
    falas: [
      'Duas placas parecidas pedem coisas diferentes: o PARE e o Dê a preferência.',
      'O PARE tem oito lados. Pare sempre, mesmo sem ninguém vindo.',
      'Depois de parar, olhe e só siga quando for seguro.',
      'Passar direto pelo PARE é infração gravíssima, como furar o sinal vermelho.',
      'O Dê a preferência é um triângulo de ponta para baixo.',
      'Reduza e deixe passar quem já está na via. Pare só se precisar.',
      'As duas placas valem mais que a regra de quem vem pela direita.',
      'Para guardar: oito lados, pare sempre. Triângulo de cabeça para baixo, eu cedo.',
    ],
  },
  // cartão c-proibicoes (MBST vol. I, R-3, R-6a, R-6c, R-7)
  proibicoes: {
    falas: [
      'Muitas placas redondas mostram um desenho cortado por uma barra vermelha.',
      'A barra quer dizer: não pode.',
      'A seta para a frente, cortada pela barra, é sentido proibido: não entre por ali.',
      'A letra E com uma barra é proibido estacionar. Parar só para alguém descer ainda pode.',
      'A letra E com duas barras em X é proibido parar e estacionar.',
      'Dois carros lado a lado, cortados por uma barra, é proibido ultrapassar.',
      'Para guardar: uma barra, não estaciona. Um X, nem para.',
    ],
  },
  // cartão c-velocidade (MBST vol. I, R-19; CTB art. 61, § 1º, I)
  velocidade: {
    falas: [
      'O limite de velocidade é o máximo que você pode andar.',
      'A placa redonda com um número mostra esse limite, a partir dali.',
      'Sem placa, na cidade, vale o limite da lei, pelo tipo de via.',
      'Via de trânsito rápido, sem semáforo nem cruzamento: oitenta quilômetros por hora.',
      'Via arterial, a avenida com semáforos: sessenta.',
      'Via coletora, que liga o bairro às avenidas: quarenta.',
      'Via local, a rua do bairro: trinta.',
      'Mas, se houver placa, vale a placa, mesmo com outro número.',
      'Para guardar: oitenta, sessenta, quarenta, trinta, do mais rápido para a rua do bairro.',
    ],
  },
  // cartão c2-proibe-movimento (MBST Vol. I: R-4a e R-5a)
  'proibe-movimento': {
    falas: [
      'Algumas placas redondas proíbem um movimento.',
      'Elas mostram o movimento desenhado, e uma faixa vermelha em diagonal risca por cima.',
      'Seta virando à esquerda, riscada: proibido virar à esquerda.',
      'Seta em forma de U, riscada: proibido fazer o retorno, a volta para seguir no sentido contrário.',
      'Uma não vale pela outra: a placa de não virar à esquerda não proíbe o retorno.',
      'Para proibir os dois movimentos, o trânsito coloca as duas placas.',
      'Para guardar: seta virando é conversão, seta em U é retorno. Riscada de vermelho, é proibido.',
    ],
  },
  // cartão c2-obriga-movimento (MBST Vol. I: R-26 e R-33)
  'obriga-movimento': {
    falas: [
      'Outras placas redondas não proíbem: elas mandam fazer um movimento.',
      'Nelas, o desenho aparece sem a faixa vermelha. A seta é uma ordem.',
      'Seta reta para cima: siga em frente. Você é obrigado a seguir em frente.',
      'Ela fala só do movimento no cruzamento. Não diz se a rua é de mão única ou de mão dupla.',
      'Setas em círculo: é a placa da rotatória.',
      'Ela manda circular no sentido anti-horário, o contrário do ponteiro do relógio, com a ilha do seu lado esquerdo.',
      'Para guardar: sem risco vermelho, faça o que a seta mostra.',
    ],
  },
  // cartão c2-advertencia (MBST Vol. II: itens 3.1 e 3.5; A-24)
  advertencia: {
    falas: [
      'A placa amarela em losango é a placa de advertência, a placa de aviso.',
      'Ela não dá ordem. Ela avisa que existe um perigo ou uma situação diferente logo à frente.',
      'Ela é usada quando o perigo não é fácil de perceber sozinho.',
      'Em geral, ela pede: reduza a velocidade e redobre a atenção.',
      'A forma é um quadrado com uma ponta para cima. A cor é amarela, com desenho preto.',
      'A exceção é a placa de obras: ela é laranja.',
      'Viu a placa de obras? Tire o pé e fique atento a máquinas e pessoas.',
      'Quando o perigo acaba, a placa deve ser retirada.',
      'Para guardar: amarelo avisa. Laranja avisa que é obra.',
    ],
  },
  // cartão c2-advertencia-exemplos (MBST Vol. II: A-12, A-14, A-15 e A-41)
  avisos: {
    falas: [
      'Muitas placas de aviso preparam você para outra coisa que vem logo depois.',
      'O semáforo desenhado avisa: tem um semáforo adiante.',
      'Você ainda não vê o semáforo, mas já reduz e se prepara para parar.',
      'A placa PARE desenhada no losango avisa que, adiante, existe uma placa PARE. Ela só avisa: quem manda parar é a placa PARE.',
      'As setas em círculo no losango avisam: tem uma rotatória adiante.',
      'O X amarelo marca o lugar onde a rua cruza o trilho do trem. Ele vem junto com a placa PARE ou com semáforo.',
      'Para guardar: a placa amarela conta antes o que vem pela frente.',
    ],
  },
  // cartão c2-indicacao (MBST vol. III, itens 2.1, 2.2 e 4.1 a 4.6)
  indicacao: {
    falas: [
      'Existe um terceiro tipo de placa: a de indicação. Ela não manda e não avisa de perigo.',
      'Ela informa: para onde ir, quanto falta, onde você está e onde encontrar serviços. Quase todas são retangulares.',
      'A verde mostra o destino: cidades, bairros e direções, com setas e distâncias.',
      'Nesta placa, o Centro fica em frente e a Praia fica à direita. Siga a seta do lugar aonde você quer ir.',
      'A azul identifica: o nome da cidade, o quilômetro da rodovia, o pedágio. Ela também mostra serviços e postos de fiscalização.',
      'A marrom mostra atrativos turísticos, como parque, praia ou museu.',
      'A branca, com letras pretas, é educativa: lembra regras de bom comportamento.',
      'Para guardar: verde leva, azul serve, marrom passeia, branco educa.',
    ],
  },
  // cartão c2-distancias (MBST vol. III, item 4.2.2)
  distancias: {
    falas: [
      'Na estrada aparece uma placa verde com nomes de cidades e números.',
      'Os números são os quilômetros que faltam até cada lugar.',
      'As cidades vêm em ordem: a mais perto em cima, a mais longe embaixo.',
      'Nesta placa: doze, quarenta e cinco e noventa quilômetros. A primeira cidade é a que você alcança antes.',
      'Cada placa tem no máximo três destinos. Se houver mais, eles vão para outra placa.',
      'Para guardar: em cima, a mais perto.',
    ],
  },
  // cartão c2-marcas-cores (MBST vol. IV, item 3.4.2)
  'marcas-cores': {
    falas: [
      'As pinturas no asfalto também são sinais. E cada cor tem um trabalho diferente.',
      'A amarela separa os carros que vão dos que vêm. Do outro lado da linha amarela, vêm carros de frente.',
      'A amarela também marca lugares onde é proibido parar ou estacionar.',
      'A branca separa faixas do mesmo sentido: todo mundo vai para o mesmo lado.',
      'A branca também marca a borda da pista, a faixa de pedestres, a linha de retenção e as setas.',
      'A vermelha marca a ciclovia e a ciclofaixa.',
      'A azul é o fundo do símbolo nas vagas especiais, como as de pessoa com deficiência.',
      'Para guardar: amarelo divide quem vai de quem vem. Branco organiza quem vai junto.',
    ],
  },
  // cartão c2-marcas-linhas (MBST vol. IV, item 4)
  'marcas-linhas': {
    falas: [
      'O desenho da linha muda tudo. Linha cheia é um muro pintado. Linha tracejada é uma porta, que pode ser usada com cuidado.',
      'A amarela contínua, simples ou dupla, proíbe ultrapassar e mudar de lado.',
      'Só pode cruzar para entrar ou sair de um imóvel à beira da via.',
      'A amarela tracejada mostra onde pode ultrapassar e mudar de lado, sempre com segurança.',
      'A branca contínua, entre faixas do mesmo sentido, proíbe ultrapassar e trocar de faixa.',
      'A branca tracejada só organiza as faixas. Pode trocar de faixa com cuidado e dando seta.',
      'Na estrada com amarela contínua no meio, você não ultrapassa o caminhão, mesmo que ele esteja devagar.',
      'Para guardar: cheia, não cruza. Tracejada, cruza com cuidado.',
    ],
  },
  // cartão c2-marcas-transversais (MBST vol. IV, itens 5.1, 5.4 e 8.2.8)
  'marcas-transversais': {
    falas: [
      'Algumas pinturas atravessam a pista de um lado ao outro. Elas mostram onde parar e por onde as pessoas passam.',
      'A linha de retenção é uma linha branca larga. É o limite onde você deve parar, como no semáforo vermelho ou na placa PARE.',
      'A faixa de pedestres pode ser zebrada ou ter duas linhas paralelas. Ela dá prioridade de passagem aos pedestres, nos casos da lei.',
      'No sinal vermelho, você para antes da linha de retenção, sem ficar em cima da faixa de pedestres.',
      'E a vaga com o símbolo de pessoa idosa é reservada a carros dirigidos por pessoas com sessenta anos ou mais.',
      'Para guardar: pare antes da linha. A faixa é do pedestre.',
    ],
  },
  // cartão c2-semaforo (MBST vol. V, Tabela 3.1 e itens 2.2.2 e 2.2.3)
  semaforo: {
    falas: [
      'O semáforo conversa com você por cores. Cada cor pede uma atitude.',
      'Verde: você pode seguir, respeitando as regras.',
      'Amarelo: o seu direito de passar está acabando. Pare, a não ser que não dê para parar com segurança.',
      'Vermelho: proibido passar. Você é obrigado a parar.',
      'As luzes ficam nesta ordem: vermelho, amarelo e verde, de cima para baixo. No semáforo deitado, da esquerda para a direita.',
      'E elas acendem nesta sequência: verde, amarelo, vermelho, e de volta ao verde.',
      'O amarelo acendeu e você ainda está longe? Freie com calma e pare.',
      'Se você já está quase em cima da linha e frear seria perigoso, siga com atenção.',
      'Para guardar: amarelo não é acelera. É pare, se der para parar com segurança.',
    ],
  },
  // cartão c2-semaforo-pisca (MBST vol. V, Tabelas 3.1 e 3.2 e item 2.2.3)
  'semaforo-pisca': {
    falas: [
      'Às vezes a luz fica piscando. Isso também é um recado, diferente da luz acesa direto.',
      'Amarelo piscando, para os carros, quer dizer perigo ou obstáculo. Reduza a velocidade e siga as regras.',
      'De madrugada, o cruzamento está com amarelo piscando. Ninguém tem o verde.',
      'Chegue devagar, olhe para os lados e siga as regras de preferência.',
      'No semáforo de pedestres, o vermelho piscando avisa: quem ainda não começou a atravessar não começa.',
      'Quem já está atravessando termina a travessia.',
      'A sequência dele é: verde, vermelho piscando, vermelho, e de volta ao verde.',
      'Para guardar: pisca-pisca amarelo, devagar e atenção.',
    ],
  },
};
