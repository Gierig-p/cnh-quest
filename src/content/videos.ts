/**
 * Vídeos animados dos cartões de conceito (teste de 15/11/2026, pedido do dono).
 * O "vídeo" é uma animação do motor 3D dentro do app (leve, sem MP4), com narração e legenda.
 * Cada fala é uma frase da legenda; a animação segue os tempos de cada fala.
 * O áudio é gerado antes do deploy por scripts/audio/videos.ts e fica em public/audio/videos/<id>.mp3,
 * e os tempos de cada fala em src/content/videos/<id>.json. Mudou uma fala? Rode o script de novo.
 * Regra: diz o mesmo que o cartão, em linguagem simples, sem fato novo.
 */
export type VideoId = 'faixas' | 'acostamento' | 'ultrapassar' | 'nao-ultrapassar' | 'seta' | 'conversao' | 'farois' | 'pisca-buzina' | 'parada' | 'portas' | 'velocidade-estrada' | 'cinto' | 'sinais' | 'hierarquia' | 'placa-escondida' | 'preferencia' | 'pedestre' | 'emergencia' | 'formas' | 'r1-r2' | 'proibicoes' | 'velocidade' | 'proibe-movimento' | 'obriga-movimento' | 'advertencia' | 'avisos' | 'indicacao' | 'distancias' | 'marcas-cores' | 'marcas-linhas' | 'marcas-transversais' | 'semaforo' | 'semaforo-pisca' | 'naturezas' | 'penalidades' | 'suspensao' | 'cassacao' | 'velocidade-sinal' | 'celular-cinto' | 'alcool' | 'recusa-racha' | 'crimes-vitima' | 'crimes-perigo' | 'auto-notificacao' | 'defesa-recurso' | 'defensiva' | 'fatores' | 'manutencao' | 'freios-luzes' | 'posicao' | 'retrovisores';

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
      'Esta placa amarela avisa: a altura adiante é limitada. Logo depois vem a placa redonda, com a altura máxima permitida. Veículo mais alto que isso não passa.',
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
  // cartão c4-naturezas (CTB art. 258, I a IV e § 2º; art. 259, I a IV; art. 252, VI)
  naturezas: {
    falas: [
      'Toda infração tem uma natureza. Ela diz o quanto a infração é séria.',
      'São quatro naturezas: leve, média, grave e gravíssima.',
      'A natureza define o valor da multa e quantos pontos vão para o seu registro de habilitação.',
      'Leve: multa de oitenta e oito reais e trinta e oito centavos, e três pontos.',
      'Média: cento e trinta reais e dezesseis centavos, e quatro pontos.',
      'Grave: cento e noventa e cinco reais e vinte e três centavos, e cinco pontos.',
      'Gravíssima: duzentos e noventa e três reais e quarenta e sete centavos, e sete pontos.',
      'Em algumas gravíssimas, muito perigosas, a multa é multiplicada: três, cinco ou até dez vezes.',
      'Esse número é o fator multiplicador.',
      'Um exemplo: dirigir com fone de ouvido ligado ao celular é infração média. Multa de cento e trinta reais e dezesseis centavos, e quatro pontos.',
      'Para guardar: leve três, média quatro, grave cinco, gravíssima sete.',
    ],
  },
  // cartão c4-penalidades (CTB art. 256; art. 267; art. 269, I, II e III; art. 167)
  penalidades: {
    falas: [
      'Quem comete uma infração recebe uma penalidade. A penalidade é a punição.',
      'Às vezes, o agente também toma uma providência na hora, para corrigir o problema. É a medida administrativa.',
      'As penalidades são: advertência por escrito, multa e suspensão do direito de dirigir.',
      'E também: cassação da CNH, cassação da Permissão para Dirigir e curso de reciclagem.',
      'Infração leve ou média, sem nenhuma outra infração nos últimos doze meses? Em vez de multa, vem a advertência por escrito.',
      'As medidas administrativas são: reter o veículo, remover o veículo e recolher a CNH.',
      'Reter: o carro fica parado até o problema ser resolvido.',
      'Remover: o carro é levado embora do local.',
      'Um exemplo: o passageiro está sem cinto. A infração é grave, e vem a multa. Essa é a penalidade.',
      'E o carro fica retido até ele colocar o cinto. Essa é a medida administrativa.',
      'Para guardar: penalidade pune. Medida administrativa corrige na hora.',
    ],
  },
  // cartão c4-suspensao (CTB art. 261, I, II e §§ 1º, 2º, 3º e 5º; art. 268, II)
  suspensao: {
    falas: [
      'Os pontos das infrações vão somando no seu registro.',
      'Se passarem do limite em doze meses, o direito de dirigir é suspenso. Você fica um tempo proibido de dirigir.',
      'O limite de pontos depende das infrações gravíssimas.',
      'Com duas ou mais gravíssimas, o limite é vinte pontos.',
      'Com uma gravíssima, trinta pontos.',
      'Sem nenhuma gravíssima, quarenta pontos.',
      'Quem dirige como trabalho, ganhando por isso, é suspenso com quarenta pontos, sejam as infrações quais forem.',
      'Pelos pontos, a suspensão dura de seis meses a um ano.',
      'Algumas infrações, como dirigir depois de beber, já trazem a suspensão sozinhas.',
      'A CNH só volta depois de cumprir o prazo e fazer o curso de reciclagem. E os pontos são zerados.',
      'Para guardar: duas gravíssimas, vinte. Uma, trinta. Nenhuma, quarenta.',
    ],
  },
  // cartão c4-cassacao (CTB art. 263, I, II, III e § 2º; art. 268, II, III e IV)
  cassacao: {
    falas: [
      'A cassação é mais séria que a suspensão. A pessoa perde a habilitação.',
      'Para voltar a dirigir, ela precisa esperar e começar de novo.',
      'A CNH é cassada quando a pessoa dirige com o direito de dirigir suspenso.',
      'Também quando ela repete, em doze meses, certas infrações gravíssimas.',
      'Dirigir veículo de outra categoria, ou entregar o carro a quem não pode dirigir.',
      'Dirigir sob efeito de álcool, fazer racha e manobras perigosas.',
      'E quando a pessoa é condenada pela Justiça por crime de trânsito.',
      'Depois de dois anos, ela pode pedir a reabilitação, refazendo todos os exames.',
      'O curso de reciclagem é obrigatório para quem foi suspenso e para quem contribuiu para um sinistro grave.',
      'Também para quem foi condenado por crime de trânsito.',
      'Para guardar: dirigir suspenso dá cassação.',
    ],
  },
  // cartão c4-velocidade-sinal (CTB art. 218, I, II e III; art. 208; art. 203)
  'velocidade-sinal': {
    falas: [
      'Algumas infrações caem muito na prova: correr demais, avançar o sinal vermelho e ultrapassar onde não pode.',
      'Primeiro, a velocidade. A conta é feita sobre a velocidade máxima da via.',
      'Até vinte por cento acima da velocidade máxima: infração média.',
      'Mais de vinte até cinquenta por cento acima: grave.',
      'Mais de cinquenta por cento acima: gravíssima, com multa três vezes maior e suspensão do direito de dirigir.',
      'Um exemplo: numa via de sessenta quilômetros por hora, quem passa a cem está mais de cinquenta por cento acima. É gravíssima, com suspensão.',
      'Avançar o sinal vermelho ou a parada obrigatória: gravíssima.',
      'Ultrapassar pela contramão em lugares perigosos também é gravíssima, com multa cinco vezes maior.',
      'Em curva ou subida sem visibilidade, e na faixa de pedestres.',
      'Em ponte, viaduto ou túnel, e sobre a linha amarela contínua.',
      'Para guardar: até vinte por cento, média. Até cinquenta, grave. Mais que isso, gravíssima.',
    ],
  },
  // cartão c4-celular-cinto (CTB art. 252, V, VI e parágrafo único; art. 167; art. 168; art. 244, I e II)
  'celular-cinto': {
    falas: [
      'Distração e falta de proteção também são infração.',
      'Olhar o celular por um segundo já basta para causar um sinistro.',
      'Segurar ou mexer no celular enquanto dirige: gravíssima.',
      'Dirigir com fones de ouvido ligados ao som ou ao celular: média.',
      'Dirigir com uma mão só: média.',
      'Pode tirar a mão para fazer sinal de braço, trocar a marcha ou usar os comandos do carro.',
      'Condutor ou passageiro sem cinto: grave.',
      'Levar criança sem seguir as regras de segurança: gravíssima.',
      'Moto com piloto ou passageiro sem capacete: gravíssima, com suspensão do direito de dirigir.',
      'Um exemplo: com o carro andando, você pega o celular para ver o mapa. É gravíssima. Programe o mapa antes de sair, com o carro parado.',
      'Para guardar: celular na mão, gravíssima. Fone, média.',
    ],
  },
  // cartão c4-alcool (CTB art. 165; art. 276; art. 263, II)
  alcool: {
    falas: [
      'O Código pune qualquer quantidade de álcool no corpo de quem dirige.',
      'Não existe "só um copo". Qualquer concentração no sangue ou no ar dos pulmões já é infração.',
      'Dirigir sob efeito de álcool ou de outra substância psicoativa é gravíssima.',
      'A multa é dez vezes maior: dois mil, novecentos e trinta e quatro reais e setenta centavos.',
      'E o direito de dirigir fica suspenso por doze meses.',
      'Na hora, o agente recolhe a CNH e retém o veículo.',
      'Repetiu em doze meses? A multa dobra e a habilitação é cassada.',
      'O aparelho tem uma pequena margem de erro, definida pelo Contran.',
      'Ela existe por causa do aparelho. Não é permissão para beber.',
      'Um exemplo: depois de uma taça de vinho no jantar, não dirija. Chame um táxi, um carro de aplicativo ou alguém que não bebeu.',
      'Para guardar: se beber, não dirija. Nem um copo.',
    ],
  },
  // cartão c4-recusa-racha (CTB art. 165-A; art. 277, caput e § 3º; arts. 173, 174 e 175)
  'recusa-racha': {
    falas: [
      'Recusar o bafômetro não livra ninguém da punição.',
      'Quem é parado numa fiscalização ou se envolve num sinistro pode passar pelo teste do bafômetro, por exame ou por perícia.',
      'Recusar o teste tem as mesmas penalidades de dirigir sob efeito de álcool.',
      'Gravíssima, multa dez vezes maior e suspensão por doze meses.',
      'E transformar a rua em pista de corrida é uma das infrações mais graves do Código.',
      'Racha e competição sem permissão são gravíssimas.',
      'Manobras perigosas também: arrancada brusca, derrapagem e freada com os pneus arrastando.',
      'Em todos esses casos: multa dez vezes maior e suspensão do direito de dirigir.',
      'O agente recolhe a CNH e remove o veículo.',
      'Um exemplo: no semáforo, dois carros arrancam lado a lado para ver quem chega primeiro. Isso é racha.',
      'Para guardar: recusar o bafômetro custa o mesmo que beber.',
    ],
  },
  // cartão c4-crimes-vitima (CTB art. 302, caput e § 3º; art. 303; art. 304; art. 305; art. 301)
  'crimes-vitima': {
    falas: [
      'Algumas atitudes no trânsito não são só infração: são crime.',
      'Aí quem julga é a Justiça, e a pena pode ser de prisão.',
      'Matar alguém sem querer, dirigindo, é homicídio culposo.',
      'A pena é detenção de dois a quatro anos, e suspensão ou proibição de dirigir.',
      'Se o motorista estava sob efeito de álcool ou de droga, a pena sobe: reclusão de cinco a oito anos.',
      'Ferir alguém sem querer é lesão corporal culposa: detenção de seis meses a dois anos.',
      'Deixar de socorrer a vítima é crime, mesmo que outra pessoa tenha socorrido.',
      'Fugir do local para não ser responsabilizado também é crime.',
      'Quem presta socorro pronto e completo à vítima não é preso em flagrante e não paga fiança.',
      'Um exemplo: houve um atropelamento. O motorista para, sinaliza o local e chama o socorro. Ele agiu certo.',
      'Para guardar: socorrer a vítima é dever e protege você.',
    ],
  },
  // cartão c4-crimes-perigo (CTB art. 306, § 1º; arts. 307 a 311)
  'crimes-perigo': {
    falas: [
      'Alguns crimes acontecem mesmo que ninguém se machuque. Basta colocar as pessoas em perigo.',
      'Dirigir com zero vírgula três miligrama de álcool por litro de ar no bafômetro, ou mais, é crime.',
      'Também conta seis decigramas por litro de sangue, ou sinais de que a capacidade de dirigir está alterada.',
      'A pena é detenção de seis meses a três anos, multa e suspensão ou proibição de dirigir.',
      'Participar de racha na via pública, gerando risco, também é crime: detenção de seis meses a três anos.',
      'Se alguém se ferir gravemente ou morrer, a pena é maior.',
      'Dirigir sem habilitação, gerando perigo, é crime. Entregar a direção a quem não é habilitado, ou não tem condições de dirigir, também.',
      'Nos dois casos: detenção de seis meses a um ano, ou multa.',
      'Dirigir com o direito de dirigir suspenso também é crime.',
      'Velocidade incompatível perto de escolas, hospitais ou lugares com muita gente, gerando perigo: detenção de seis meses a um ano, ou multa.',
      'Um exemplo: você empresta o carro a um amigo que não tem CNH. Mesmo que nada aconteça, você pode responder por crime.',
      'Para guardar: não precisa ter vítima para ser crime.',
    ],
  },
  // cartão c4-auto-notificacao (CTB art. 280, § 3º; art. 281, § 1º, II; art. 257, §§ 2º, 3º e 7º; art. 260)
  'auto-notificacao': {
    falas: [
      'Quando o agente vê uma infração, ele registra no auto de infração.',
      'Ele registra mesmo quando não consegue parar o veículo.',
      'Depois, o dono do veículo recebe um aviso oficial: a notificação.',
      'Primeiro chega a notificação da autuação. Se a multa for aplicada, chega a da penalidade.',
      'A notificação da autuação precisa ser expedida em até trinta dias. Se passar desse prazo, o auto é arquivado.',
      'Se quem dirigia não era o dono, ele pode indicar o condutor em até trinta dias da notificação.',
      'Sem indicação, a infração fica com o principal condutor cadastrado ou, se não houver, com o proprietário.',
      'O proprietário responde pelos documentos e pela conservação do carro.',
      'Quem dirige responde pelo que faz ao volante.',
      'A multa é aplicada pelo órgão responsável pela via onde a infração aconteceu.',
      'Um exemplo: seu irmão pegou seu carro e avançou o sinal vermelho. Quando chegar a notificação, indique ele como condutor dentro do prazo, para os pontos irem para a CNH dele.',
      'Para guardar: não era você? Indique o condutor em trinta dias.',
    ],
  },
  // cartão c4-defesa-recurso (CTB art. 281-A; art. 282, §§ 4º e 5º; arts. 285, 288 e 289; art. 284, caput e §§ 1º e 2º)
  'defesa-recurso': {
    falas: [
      'Você tem direito de se defender de uma multa. E, se preferir pagar, pode ter desconto.',
      'Depois da notificação da autuação, você tem pelo menos trinta dias para a defesa prévia.',
      'Se a multa for aplicada, chega a notificação da penalidade. Ela dá pelo menos trinta dias para recorrer.',
      'Essa data também é o vencimento da multa.',
      'O primeiro recurso é julgado pela JARI, a Junta Administrativa de Recursos de Infrações.',
      'Contra a decisão da JARI, cabe novo recurso em trinta dias. Em geral, ele vai para o CETRAN do seu estado. No Distrito Federal, o CONTRANDIFE.',
      'Pagar até o vencimento: você paga oitenta por cento do valor, ou seja, vinte por cento de desconto.',
      'E pagar não impede de recorrer.',
      'Quem aderiu ao sistema de notificação eletrônica antes de receber a notificação, e abre mão da defesa e do recurso, paga sessenta por cento: quarenta por cento de desconto.',
      'Um exemplo: chegou uma multa grave de cento e noventa e cinco reais e vinte e três centavos, e você não vai recorrer.',
      'Pagando até o vencimento, você paga oitenta por cento: cento e cinquenta e seis reais e dezoito centavos.',
      'Para guardar: defesa prévia, JARI, CETRAN. Pagou em dia: vinte por cento de desconto.',
    ],
  },
  // cartão c5-defensiva (manual de direção defensiva DENATRAN 2005, p. 12 e 13)
  defensiva: {
    falas: [
      'Direção defensiva é dirigir prevendo o perigo antes que ele aconteça.',
      'Quem dirige assim enxerga o risco cedo e tem tempo de tomar a decisão certa.',
      'É reconhecer antes as situações de perigo e prever o que pode acontecer com você, com quem está no veículo e com os outros na via.',
      'Sinistro de trânsito não acontece por acaso, por azar ou por destino.',
      'Na grande maioria dos sinistros existe o fator humano: falha de quem dirige ou de quem anda a pé.',
      'Se o perigo podia ser previsto, o sinistro podia ser evitado.',
      'Um exemplo: uma bola rola para a rua entre dois carros estacionados.',
      'Quem dirige na defensiva tira o pé e se prepara para parar.',
      'Pode vir uma criança correndo atrás dela.',
      'Para guardar: prever o perigo é o primeiro passo para evitá-lo.',
    ],
  },
  // cartão c5-fatores (manual DENATRAN 2005, p. 13, 46 e 47; CTB art. 29, § 2º)
  fatores: {
    falas: [
      'Os riscos do trânsito vêm de cinco lugares. Olhar para cada um deles ajuda a perceber o perigo mais cedo.',
      'O veículo: freios, pneus, luzes e outros equipamentos precisam estar bons.',
      'O condutor: atenção, sono, álcool e emoções mudam o jeito de dirigir.',
      'A via: curvas, buracos, obras e cruzamentos pedem mais cuidado.',
      'O ambiente: chuva, neblina, vento e a luz do sol mudam a visão e a aderência.',
      'Aderência é o agarre do pneu no chão. Com pouca aderência, o veículo escorrega.',
      'E o comportamento das pessoas: o que você e os outros fazem na via.',
      'Pela lei, o veículo maior responde pela segurança do menor, e o motorizado pelo não motorizado.',
      'E todos juntos respondem pelo pedestre.',
      'Um exemplo: dirigindo um caminhão, Jorge vai passar por um ciclista. Ele reduz e deixa bastante espaço. O maior cuida do menor.',
      'Para guardar: veículo, condutor, via, ambiente e pessoas.',
    ],
  },
  // cartão c5-manutencao (manual DENATRAN 2005, p. 14 a 17; CTB art. 230, XVIII)
  manutencao: {
    falas: [
      'Todo veículo se desgasta com o uso.',
      'A manutenção preventiva revisa e troca as peças antes que elas falhem no meio do caminho.',
      'Siga os prazos do manual do proprietário e use profissionais habilitados.',
      'Antes de sair, confira o combustível, os níveis de óleo e de água e se as luzes acendem.',
      'Pneu murcho gasta mais rápido, deixa o veículo instável, aumenta o consumo e escorrega mais na água.',
      'Os sulcos do pneu tiram a água de baixo dele. O manual de direção defensiva orienta que eles tenham pelo menos um vírgula seis milímetro de profundidade.',
      'Volante vibrando pode ser o balanceamento das rodas.',
      'Veículo puxando para um lado pode ser a calibragem ou o alinhamento.',
      'O estepe, o pneu reserva, também precisa dessas conferências.',
      'Andar com o veículo em mau estado de conservação, comprometendo a segurança, é infração grave.',
      'Um exemplo: antes de viajar, Rita calibra os pneus com a pressão para carro carregado, como manda o fabricante, e confere o estepe.',
      'Para guardar: revisar antes evita quebrar no caminho.',
    ],
  },
  // cartão c5-freios-luzes (manual DENATRAN 2005, p. 19 a 21)
  'freios-luzes': {
    falas: [
      'Freios, direção, amortecedores e luzes ajudam você a fugir do perigo. Se um deles falha, o risco aumenta.',
      'Freio gasto precisa de mais distância para parar.',
      'Confira o nível do fluido e procure manchas embaixo do veículo.',
      'Freio a lona, comum nas rodas de trás, pode perder força por um momento quando molha numa poça.',
      'Então reduza e pise no freio algumas vezes, até ele voltar ao normal.',
      'ABS é o freio que não deixa as rodas travarem numa freada forte. Se a luz do ABS acender no painel, há problema no sistema.',
      'Amortecedores gastos podem fazer o veículo perder o controle e capotar, principalmente em curvas e freadas.',
      'Folga na direção faz o veículo puxar para um lado.',
      'Luz de freio queimada: quem vem atrás não percebe que você está freando.',
      'Seta queimada: ninguém entende a sua manobra.',
      'Um exemplo: depois de passar por uma rua alagada, Caio sente o freio fraco. Ele reduz e pisa no freio algumas vezes até o freio voltar ao normal.',
      'Para guardar: freio bom para parar. Luz boa para ser visto.',
    ],
  },
  // cartão c5-posicao (manual DENATRAN 2005, p. 22 e 23)
  posicao: {
    falas: [
      'A posição certa ao dirigir cansa menos e deixa você pronto para reagir rápido.',
      'Braços e pernas um pouco dobrados, sem esticar.',
      'Costas bem apoiadas no assento e no encosto, perto de noventa graus.',
      'O encosto de cabeça fica, de preferência, na altura dos olhos. Ele protege o pescoço numa batida.',
      'Mãos no volante como os ponteiros do relógio às nove horas e quinze minutos.',
      'Calcanhares apoiados no assoalho, o piso do veículo. Não descanse os pés nos pedais.',
      'Calçado bem preso ao pé, para pisar nos pedais rápido e com segurança.',
      'Um exemplo: antes de sair, Léo ajusta o banco até os braços ficarem um pouco dobrados.',
      'Ele sobe o encosto de cabeça até a altura dos olhos e troca o chinelo por um tênis.',
      'Para guardar: mãos às nove e quinze, braços dobrados, costas apoiadas.',
    ],
  },
  // cartão c5-retrovisores (manual DENATRAN 2005, p. 23, 24 e 44)
  retrovisores: {
    falas: [
      'Quanto mais você enxerga em volta, mais cedo percebe o perigo. Os espelhos ajudam, mas não mostram tudo.',
      'Retrovisor interno: ajuste para ver todo o vidro de trás. Não coloque objetos que tampem a visão.',
      'Retrovisores externos: ajuste até ver a lateral traseira do seu próprio veículo.',
      'Mesmo assim sobram pontos cegos: áreas em volta do veículo que você não vê pelos espelhos.',
      'Antes de manobrar, mexa a cabeça para ver por outro ângulo e olhe pela lateral.',
      'Preste atenção também ao barulho do motor dos outros veículos.',
      'Só faça a manobra se tiver certeza de que não vai causar um sinistro.',
      'Se o farol de quem vem atrás ofuscar pelo retrovisor interno, ajuste o espelho para desviar a luz.',
      'Um exemplo: antes de passar para a faixa da esquerda, Ana olha o retrovisor, vira um pouco a cabeça e vê uma moto que estava no ponto cego.',
      'Ela espera a moto passar.',
      'Para guardar: espelho, cabeça e só depois a manobra.',
    ],
  },
};
