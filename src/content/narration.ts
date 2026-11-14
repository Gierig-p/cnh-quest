/**
 * Texto falado de cada cartão de conceito (botão "Ouvir explicação").
 * Regra: diz o mesmo que o cartão, em linguagem simples, sem fato novo.
 * Cada item da lista é um bloco: entre blocos a pausa é maior; entre frases do mesmo bloco, menor.
 * Siglas e códigos vêm escritos do jeito que se falam ("R quatro A"), para a voz ler certo.
 * O áudio é gerado antes do deploy por scripts/audio/cartoes.ts e fica em public/audio/cartoes/<id>.mp3.
 * Mudou um texto daqui? Rode o script de novo para o áudio acompanhar.
 */
export const NARRATION: Record<string, string[]> = {
  'c-tipos-sinais': [
    'Oi! Vamos começar do zero, sem pressa.',
    'Sinal de trânsito é qualquer coisa que dá um recado a quem dirige ou anda na rua. Por exemplo: pare, vá devagar, cuidado.',
    'A lei de trânsito diz que existem só seis tipos de sinal.',
    'Primeiro, as placas. Elas ficam em pé, em postes. São os sinais verticais.',
    'Segundo, as pinturas no chão, como a faixa de pedestres e as linhas da pista. São os sinais horizontais.',
    'Terceiro, as luzes do semáforo, que muita gente chama de sinaleiro. São os sinais luminosos.',
    'Quarto, o apito do agente de trânsito. É o sinal sonoro. Agente de trânsito é a pessoa autorizada a fiscalizar e organizar o trânsito.',
    'Quinto, os gestos: os movimentos de braço do agente, e também os do próprio motorista.',
    'Sexto, os dispositivos auxiliares. São peças que ajudam a sinalizar, como cones e tachões.',
    'Para guardar: placa, pintura, luz, som, gesto e auxiliar. Só isso é sinal. Em pé é placa. Deitado no chão é pintura.',
  ],

  'c-hierarquia': [
    'Às vezes dois sinais parecem dizer coisas diferentes. Calma: a lei já definiu quem vale mais.',
    'Pense numa escada. Quem está no degrau de cima manda em quem está embaixo.',
    'No degrau mais alto está o agente de trânsito. O que ele mandar vale mais que tudo.',
    'Logo abaixo vem o semáforo. Ele vale mais que as placas e as pinturas no chão.',
    'Depois vêm os outros sinais: as placas e as marcas no chão.',
    'E por último, as regras gerais da lei. Por exemplo, o limite de velocidade que vale quando não há placa.',
    'Veja um caso. O semáforo está vermelho, mas o agente faz sinal para você seguir. Você segue, porque o agente manda mais.',
    'Outro caso. A lei tem um limite geral de velocidade, mas a rua tem uma placa com outro número. Vale a placa.',
    'Para guardar: agente, semáforo, sinais e normas. Tem placa? Vale a placa.',
  ],

  'c-sinalizacao-falha': [
    'Pode acontecer de uma placa estar atrás de uma árvore, apagada, ou colocada no lugar errado.',
    'A lei protege você nesse caso, mas não libera tudo.',
    'Se a sinalização não é suficiente ou está errada, você não pode ser punido por não obedecer àquele sinal.',
    'Quem responde pela placa é o órgão de trânsito responsável pela rua. Não é o motorista, nem o dono da casa em frente.',
    'Mas as regras gerais continuam valendo. Placa escondida não é terra sem lei.',
    'Para guardar: placa que não se vê não pune, mas a regra geral continua.',
  ],

  'c-preferencia': [
    'Ter preferência quer dizer ter o direito de passar primeiro.',
    'Quando o cruzamento tem placa ou semáforo, você obedece a eles.',
    'Quando não tem nada, a lei responde com três perguntas, nesta ordem.',
    'Primeira pergunta: um dos carros está numa rodovia e o outro não? Passa quem está na rodovia. Rodovia é a via fora da cidade que é asfaltada.',
    'Segunda pergunta: é uma rotatória, aquela praça redonda no meio do cruzamento? Passa quem já está girando nela. Quem vai entrar espera.',
    'Terceira: se não é nenhum desses casos, passa quem vem pela sua direita.',
    'O tamanho do carro, a velocidade e quem chegou primeiro não contam.',
    'E chegando a qualquer cruzamento, vá devagar, para poder parar se for preciso.',
    'Um exemplo. Você chega a um cruzamento de duas ruas comuns, sem placa. Um carro vem pela sua direita. Ele passa primeiro, mesmo que você tenha chegado antes.',
    'Para guardar: rodovia, depois rotatória, depois a direita. Tamanho não é documento.',
  ],

  'c-pedestre': [
    'Pedestre é quem está a pé. Ele é a parte mais frágil do trânsito, por isso a lei protege bastante quem está na faixa.',
    'Se a faixa não tem semáforo, quem está atravessando passa primeiro. Você para e espera.',
    'Se a faixa tem semáforo, vale o semáforo.',
    'Mas atenção: se o sinal abrir para você e ainda houver alguém atravessando, essa pessoa termina a travessia primeiro.',
    'Não dar a preferência ao pedestre na faixa é infração gravíssima, o tipo mais sério de infração.',
    'Um exemplo. Você vai virar à direita e um pedestre já está no meio da faixa. Você para e espera ele chegar do outro lado.',
    'Para guardar: pé na faixa, pé no freio. O verde para você não apaga quem está na faixa.',
  ],

  'c-emergencia': [
    'Ambulância, bombeiros e polícia, quando estão atendendo uma urgência, precisam chegar rápido. A lei diz como você ajuda.',
    'Primeiro, repare se a sirene e as luzes piscando estão ligadas. Esse é o sinal de que é urgência.',
    'Depois, deixe livre a faixa da esquerda.',
    'Vá para a direita, e pare, se for necessário.',
    'Para guardar: a sirene tocou? Direita e calma.',
  ],

  'c-formas': [
    'Antes de ler o desenho, olhe a forma e a cor da placa. Só isso já mostra se ela dá uma ordem ou um aviso.',
    'A placa de regulamentação dá uma ordem: algo que você é obrigado a fazer, ou proibido de fazer. Ela é redonda, em vermelho, preto e branco.',
    'Há duas exceções. A placa de parada obrigatória, o PARE, tem oito lados. E a placa Dê a preferência é um triângulo.',
    'Já a placa de advertência dá um aviso: existe um perigo ou uma situação diferente logo à frente. Ela é quadrada, virada como um losango, amarela com desenho preto.',
    'Por exemplo: um losango amarelo com uma lombada desenhada avisa que há lombada à frente. Um losango amarelo com uma pessoa na faixa avisa que há faixa de pedestres adiante.',
    'Para guardar: redonda manda. Amarela em losango avisa.',
  ],

  'c-r1-r2': [
    'Estas duas placas caem muito na prova e parecem parecidas, mas pedem coisas diferentes. E elas valem mais que a regra de quem vem pela direita.',
    'A primeira é a placa PARE, de oito lados. O nome dela é parada obrigatória.',
    'Com ela, você para sempre o carro antes de entrar ou cruzar a rua, mesmo que não venha ninguém.',
    'Depois de parar, olhe, e só siga quando for seguro.',
    'Passar direto pelo PARE, ou pelo sinal vermelho, é infração gravíssima. Infração é desobedecer a uma regra de trânsito, e gravíssima é o nível mais sério.',
    'A segunda é a placa Dê a preferência, um triângulo de ponta para baixo.',
    'Com ela, você deixa passar quem já está na rua em que você vai entrar. Reduza, e pare se precisar.',
    'Para guardar: oito lados, pare sempre. Triângulo de cabeça para baixo, eu cedo.',
  ],

  'c-proibicoes': [
    'Muitas placas redondas mostram um desenho cortado por uma barra vermelha. A barra quer dizer: não pode.',
    'A placa sentido proibido é um círculo vermelho com uma faixa branca deitada. Ela diz: não entre por ali.',
    'A placa proibido estacionar mostra a letra E cortada por uma barra.',
    'A placa proibido parar e estacionar mostra a letra E com duas barras, formando um X.',
    'Qual a diferença? Parar é ficar parado só o tempo de alguém entrar ou sair do carro. Estacionar é deixar o carro parado por mais tempo do que isso.',
    'E a placa proibido ultrapassar mostra dois carros lado a lado, cortados por uma barra. Ultrapassar é sair da sua faixa para passar à frente de um carro mais lento, e depois voltar.',
    'Para guardar: uma barra, não estaciona. Um X, nem para.',
  ],

  'c-velocidade': [
    'O limite de velocidade é o máximo que você pode andar.',
    'Às vezes ele está numa placa. Às vezes não tem placa, e vale o que a lei diz.',
    'A placa de limite é um círculo vermelho com um número dentro. Esse número é a velocidade máxima a partir daquela placa.',
    'Sem placa, na cidade, a lei define o limite pelo tipo de via.',
    'Na via de trânsito rápido, oitenta quilômetros por hora. Na via arterial, sessenta. Na via coletora, quarenta. E na via local, trinta. Via local é a rua de bairro, sem semáforo, usada para chegar às casas.',
    'Se houver placa, vale a placa, mesmo que o número seja diferente desses.',
    'Para guardar: oitenta, sessenta, quarenta, trinta, do mais rápido até a rua do bairro. O número no círculo é o teto da velocidade.',
  ],

  'c2-proibe-movimento': [
    'No Mundo 1 você viu que a placa redonda dá uma ordem. Agora vamos ler o desenho de dentro.',
    'Quando a placa proíbe alguma coisa, ela mostra o movimento proibido com uma faixa vermelha em diagonal por cima. Essa faixa se chama tarja.',
    'A placa R quatro A mostra uma seta virando à esquerda, riscada. Ela proíbe virar à esquerda para entrar em outra rua. Isso se chama conversão.',
    'A placa R cinco A mostra uma seta em forma de U para a esquerda, riscada. Ela proíbe fazer o retorno à esquerda, que é dar a volta para seguir no sentido contrário.',
    'Uma não substitui a outra. A placa de conversão não proíbe o retorno.',
    'Para proibir os dois movimentos à esquerda, o órgão de trânsito coloca as duas placas.',
    'Um exemplo. Você chega a um cruzamento e vê a seta virando, riscada. Não pode entrar na rua da esquerda. Se quisesse fazer o U, olharia se há também a placa do retorno.',
    'Para guardar: seta virando é conversão. Seta em U é retorno. Riscada de vermelho, é proibido.',
  ],

  'c2-obriga-movimento': [
    'Algumas placas redondas não proíbem. Elas mandam fazer um movimento. Nelas, o desenho aparece sem a faixa vermelha em diagonal.',
    'A placa siga em frente mostra uma seta reta para cima. Você é obrigado a fazer esse movimento: seguir em frente.',
    'Atenção: essa placa não serve para mostrar se a rua é mão única ou mão dupla. Ela fala só do movimento no cruzamento.',
    'A placa da rotatória mostra setas em círculo. Ela obriga a circular no sentido anti-horário, o contrário do ponteiro do relógio.',
    'Na prática, você entra na rotatória e dá a volta deixando a ilha do meio do seu lado esquerdo.',
    'Para guardar: sem risco vermelho, a seta é uma ordem. Faça o que ela mostra.',
  ],

  'c2-advertencia': [
    'A placa amarela em losango é a placa de advertência. Ela não dá ordem. Ela avisa que existe um perigo, ou uma situação diferente, logo à frente, para você se preparar com calma.',
    'Ela é usada quando o perigo não é fácil de perceber sozinho.',
    'Em geral, ela pede que você reduza a velocidade e redobre a atenção.',
    'A forma e a cor padrão são estas: quadrada, com uma ponta para cima, como um losango, amarela com desenho preto.',
    'Há uma exceção de cor: a placa de obras tem fundo e borda laranja.',
    'E quando o perigo acaba, a placa deve ser retirada.',
    'Um exemplo. Você vê um losango laranja com um trabalhador desenhado. Há obras adiante. Tire o pé do acelerador e fique atento a máquinas e pessoas.',
    'Para guardar: amarelo avisa. Laranja avisa que é obra.',
  ],

  'c2-advertencia-exemplos': [
    'Muitas placas de aviso existem para preparar você para outra coisa que vem logo depois: um semáforo, uma placa PARE, uma rotatória ou um trilho de trem.',
    'A placa com um semáforo desenhado avisa: tem um semáforo adiante.',
    'A placa parada obrigatória à frente avisa que, mais adiante, existe uma placa PARE. Ela só avisa. Quem manda parar é a própria placa PARE.',
    'A placa interseção em círculo avisa que há uma rotatória adiante, onde se circula no sentido anti-horário.',
    'A Cruz de Santo André é um X amarelo. Ela marca o próprio lugar onde a rua cruza o trilho do trem, no mesmo nível, sem ponte nem túnel. Ela vem junto com a placa PARE ou com um semáforo.',
    'E a placa altura limitada avisa antes da placa que diz a altura máxima permitida.',
    'Um exemplo. Numa estrada, você vê a placa com o semáforo desenhado. Ainda não vê o semáforo, mas já sabe que ele vem aí. Reduz e se prepara para parar.',
    'Para guardar: a placa amarela é o spoiler do que vem pela frente.',
  ],

  'c2-indicacao': [
    'Existe um terceiro tipo de placa: a de indicação. Ela não manda e não avisa de perigo. Ela informa.',
    'Ela diz para onde ir, quanto falta, onde você está e onde encontrar serviços.',
    'Quase todas são retangulares, e a cor diz o assunto.',
    'Verde mostra o caminho: cidades, bairros e direções, com setas e distâncias.',
    'Azul identifica lugares, como o nome da cidade, o quilômetro da rodovia e o pedágio. Também mostra serviços e postos de fiscalização.',
    'Marrom mostra lugares de passeio, como parque, praia ou museu.',
    'E branca com letras pretas são as placas educativas, que lembram regras de bom comportamento.',
    'Um exemplo. Uma placa verde mostra Centro, com uma seta para cima, e Praia, com uma seta para a direita. É uma placa de destino. Siga a seta do lugar aonde você quer ir.',
    'Para guardar: verde leva, azul serve, marrom passeia, branco educa.',
  ],

  'c2-distancias': [
    'Na estrada aparece uma placa verde com nomes de cidades e números. Os números são os quilômetros que faltam até cada lugar.',
    'As cidades aparecem da mais perto, em cima, para a mais longe, embaixo.',
    'Cada placa tem no máximo três destinos. Se houver mais, eles vão para outra placa.',
    'Um exemplo. Uma placa mostra doze quilômetros, quarenta e cinco quilômetros e noventa quilômetros, nessa ordem, de cima para baixo. A primeira cidade é a que você alcança antes.',
    'Para guardar: em cima, a mais perto.',
  ],

  'c2-marcas-cores': [
    'As pinturas no asfalto também são sinais. É a sinalização horizontal. E cada cor tem um trabalho diferente.',
    'A amarela separa os carros que vão dos carros que vêm, em sentidos contrários. Ela também marca lugares onde é proibido parar ou estacionar.',
    'A branca separa faixas em que todos vão para o mesmo lado. Ela também marca a borda da pista, a faixa de pedestres, a linha onde o carro para e as setas no chão.',
    'A vermelha marca a ciclovia e a ciclofaixa, o espaço das bicicletas.',
    'E a azul é o fundo do símbolo nas vagas especiais, como as de pessoa com deficiência.',
    'Um exemplo. Linha amarela no meio da pista: do outro lado vêm carros de frente. Linhas brancas entre as faixas: todo mundo vai para o mesmo lado.',
    'Para guardar: amarelo divide quem vai de quem vem. Branco organiza quem vai junto.',
  ],

  'c2-marcas-linhas': [
    'O desenho da linha muda tudo. Pense assim: linha cheia é um muro pintado. Linha tracejada, feita de traços com espaços, é uma porta que pode ser usada com cuidado.',
    'A linha amarela cheia, simples ou dupla, proíbe ultrapassar e mudar de lado. Só pode cruzar para entrar ou sair de uma casa ou terreno à beira da rua.',
    'A linha amarela tracejada mostra onde é permitido ultrapassar e mudar de lado, sempre com segurança.',
    'A linha branca cheia, entre faixas do mesmo sentido, proíbe ultrapassar e trocar de faixa.',
    'A linha branca tracejada só organiza as faixas. Você pode trocar de faixa com cuidado, dando seta.',
    'Um exemplo. Numa estrada de mão dupla com linha amarela cheia no meio, você não ultrapassa o caminhão da frente, mesmo que ele esteja devagar.',
    'Para guardar: cheia, não cruza. Tracejada, cruza com cuidado.',
  ],

  'c2-marcas-transversais': [
    'Algumas pinturas atravessam a pista de um lado ao outro. Elas mostram onde parar e por onde as pessoas passam.',
    'A linha de retenção é uma linha branca larga, de lado a lado da faixa. É o limite onde você deve parar, por exemplo no semáforo vermelho ou na placa PARE.',
    'A faixa de pedestres é branca, em listras como uma zebra, ou com duas linhas paralelas. Ela dá prioridade de passagem aos pedestres, nos casos que a lei prevê.',
    'E a vaga com o símbolo de pessoa idosa é reservada a carros dirigidos por pessoas com sessenta anos ou mais.',
    'Um exemplo. No semáforo vermelho, você para antes da linha de retenção, sem ficar em cima da faixa de pedestres.',
    'Para guardar: pare antes da linha. A faixa é do pedestre.',
  ],

  'c2-semaforo': [
    'O semáforo, ou sinaleiro, conversa com você por cores. Cada cor tem um significado e uma atitude esperada.',
    'Verde: você tem permissão para seguir, respeitando as regras.',
    'Amarelo: a sua vez de passar está acabando. Você deve parar, a não ser que não dê para parar com segurança.',
    'Vermelho: proibido passar. Você é obrigado a parar o carro por completo.',
    'As luzes ficam nesta ordem: vermelho, amarelo e verde, de cima para baixo. Se o semáforo for deitado, da esquerda para a direita.',
    'E elas acendem nesta sequência: verde, amarelo, vermelho, e de volta ao verde.',
    'Um exemplo. O amarelo acende quando você ainda está longe: freie com calma e pare. Se ele acender quando você já está quase em cima da linha, e frear seria perigoso, siga com atenção.',
    'Para guardar: amarelo não quer dizer acelera. Quer dizer pare, se der para parar com segurança.',
  ],

  'c2-semaforo-pisca': [
    'Às vezes a luz fica piscando. Isso também é um recado, e ele é diferente da luz acesa direto.',
    'Amarelo piscando, no semáforo dos carros, quer dizer que existe perigo ou obstáculo. Reduza a velocidade e siga as regras de circulação.',
    'No semáforo de pedestres, o vermelho piscando quer dizer: quem ainda não começou a atravessar não deve começar. Quem já está atravessando termina a travessia.',
    'A sequência do semáforo de pedestres é: verde, vermelho piscando, vermelho, e de volta ao verde.',
    'Um exemplo. De madrugada, um cruzamento está com o amarelo piscando. Ninguém tem o verde. Chegue devagar, olhe para os lados e siga as regras de preferência.',
    'Para guardar: pisca-pisca amarelo, devagar e atenção.',
  ],

  /* ---- Mundo 3: Regras para circular ---- */
  'c3-lado-direito': [
    'Bem-vindo ao mundo das regras para circular. Vamos começar pelo básico: por onde andar.',
    'No Brasil, o trânsito anda pelo lado direito da via. Quando a regra é outra, há sinalização avisando.',
    'A pista pode ser dividida em faixas, que são como corredores, cada um com largura para um carro.',
    'Quando há várias faixas no mesmo sentido, as da direita são para os veículos mais lentos e maiores. As da esquerda são para ultrapassar e para quem anda mais rápido.',
    'Guarde distância de segurança: para a frente, para os lados e da beirada da pista. Quanto maior a velocidade, a chuva ou o movimento, maior o espaço.',
    'E o tempo todo, você deve ter o domínio do veículo, dirigindo com atenção.',
    'Um exemplo. Numa avenida de três faixas, o caminhão lento vai pela direita. Você usa a faixa da esquerda para passar por ele, e depois volta.',
    'Para guardar: direita para andar devagar, esquerda para passar.',
  ],

  'c3-calcada-acostamento': [
    'Calçada e acostamento não são caminho para carro.',
    'A calçada é das pessoas a pé. O acostamento é aquela faixa ao lado da pista, na estrada. Ele serve para parar em emergência, e para pedestres e bicicletas quando não há outro lugar.',
    'O carro só pode passar sobre a calçada ou o acostamento para entrar ou sair de uma casa, uma garagem ou um estacionamento.',
    'Acostamento não é faixa extra para fugir do congestionamento.',
    'E tem mais uma regra importante: quem é maior cuida de quem é menor. O caminhão cuida do carro. O carro cuida da moto e da bicicleta. Os veículos com motor cuidam dos sem motor. E todos juntos cuidam dos pedestres.',
    'Um exemplo. O trânsito parou na rodovia. Andar pelo acostamento para passar à frente é proibido. Ele fica livre para quem tem uma emergência.',
    'Para guardar: quanto maior, mais responsável. E o pedestre é de todos.',
  ],

  'c3-ultrapassar-como': [
    'Ultrapassar é sair da sua faixa, passar à frente de um veículo mais lento que vai no mesmo sentido, e voltar.',
    'É uma das manobras mais perigosas. Por isso tem passos certos.',
    'Em regra, ultrapasse pela esquerda. A exceção: se o veículo da frente sinalizou que vai entrar à esquerda, você passa pela direita dele.',
    'Antes de passar, olhe três coisas. Ninguém atrás já começou a ultrapassar você? O da frente não vai ultrapassar outro? A faixa está livre por um bom trecho?',
    'Durante a ultrapassagem: ligue a seta, ou faça o gesto de braço. Passe com distância para o lado. E volte à sua faixa, de novo com a seta.',
    'E quem está sendo ultrapassado não acelera. Se estiver na faixa da esquerda, vai para a da direita.',
    'Um exemplo. Pelo retrovisor, você vê que um carro quer passar, e você está na faixa da esquerda. Ligue a seta, vá para a direita e mantenha a velocidade.',
    'Para guardar: olhe, sinalize, passe com espaço e volte sinalizando.',
  ],

  'c3-onde-nao-ultrapassar': [
    'Há lugares em que você não enxerga quem vem de frente, ou em que há pessoas e trilhos por perto. Neles, ultrapassar é proibido.',
    'Numa pista única de mão dupla, ou seja, uma pista só com os dois sentidos lado a lado, não ultrapasse em curvas e subidas sem boa visão.',
    'Também não ultrapasse em passagens de nível, que são os lugares onde a rua cruza um trilho de trem. Nem em pontes, viadutos e faixas de pedestres. A não ser que a sinalização permita.',
    'Nos cruzamentos e perto deles, também não se ultrapassa.',
    'E se um ônibus estiver parado, com gente subindo ou descendo: reduza, redobre a atenção ou pare. Pode surgir alguém na frente dele.',
    'Um exemplo. Numa estrada de mão dupla, o caminhão da frente está devagar numa subida, e você não vê o topo. Espere a reta, com visão livre, para passar.',
    'Para guardar: se não dá para ver quem vem, não dá para passar.',
  ],

  'c3-seta': [
    'Toda vez que você vai para o lado, os outros precisam saber antes. A seta é o seu aviso.',
    'Antes de qualquer manobra, confira se ela não traz perigo para quem vem atrás, vai à frente ou vai cruzar com você.',
    'Mudar de faixa, virar à direita ou à esquerda e fazer o retorno: tudo isso é ir para o lado. Avise com a seta, com antecedência. Se a seta não funcionar, use o gesto de braço.',
    'Mudar de faixa pode ser para a esquerda ou para a direita, sempre com os mesmos cuidados.',
    'E saindo de uma garagem ou de um estacionamento para a rua, a preferência é de quem já está na rua: carros e pedestres.',
    'Um exemplo. Você sai da garagem de ré. Um pedestre passa na calçada e um carro vem pela rua. Os dois passam primeiro. Depois, você entra.',
    'Para guardar: primeiro olhe, depois a seta, só então vire.',
  ],

  'c3-conversao': [
    'Na hora de virar, a posição do carro conta. E mesmo com o sinal verde, nem sempre dá para entrar no cruzamento.',
    'Para virar à direita, encoste o máximo possível no lado direito e faça a curva no menor espaço.',
    'Para virar à esquerda numa rua de mão dupla, chegue perto do meio da pista. Numa rua de mão única, encoste no lado esquerdo.',
    'Ao virar, dê passagem aos pedestres e ciclistas, e aos veículos que vêm no sentido contrário.',
    'Na rodovia com acostamento e sem lugar próprio para virar à esquerda ou voltar, espere no acostamento da direita e cruze quando der.',
    'Sinal verde não basta: se você pode ficar parado no meio do cruzamento, travando quem cruza, não entre.',
    'E virar à direita no sinal vermelho só é livre onde a sinalização permitir.',
    'Para guardar: verde não é ordem de entrar. Só entre se tiver espaço para sair.',
  ],

  'c3-farois': [
    'O farol serve para você ver e, principalmente, para ser visto. Cada situação pede uma luz.',
    'A luz baixa é o farol normal. Use à noite. E use também de dia, em túneis e com chuva, neblina ou cerração. Cerração é a neblina bem fechada.',
    'A luz alta é o farol forte, que ilumina longe. Use em via sem iluminação. Mas troque pela baixa quando cruzar com outro veículo ou quando estiver seguindo um.',
    'As motos usam o farol baixo de dia e de noite. Os ônibus nas faixas só deles também.',
    'E se o carro não tem luz de rodagem diurna, que é a luz própria para o dia, o farol fica aceso de dia nas rodovias de pista simples fora da cidade.',
    'Um exemplo. Numa estrada escura, você usa a luz alta. Um carro aparece vindo de frente: você baixa a luz para não cegar o motorista.',
    'Para guardar: alguém de frente ou logo à frente? Luz baixa.',
  ],

  'c3-pisca-buzina': [
    'Piscar o farol, ligar o pisca-alerta e buzinar são avisos. Por isso, cada um só vale em situações certas.',
    'Piscar o farol, trocando a luz baixa e a alta bem rápido, só serve para avisar que você vai ultrapassar o da frente, ou para avisar um perigo a quem vem de frente.',
    'O pisca-alerta são as duas setas piscando juntas. Use com o veículo parado na via, numa emergência, ou quando a regra do local mandar.',
    'A buzina é só um toque breve, para evitar um acidente. Fora da cidade, o toque breve também pode avisar que você vai ultrapassar.',
    'E não freie de repente, a não ser por segurança.',
    'Um exemplo. Seu carro quebrou na pista. Ligue o pisca-alerta e sinalize o local para os outros verem de longe.',
    'Para guardar: buzina é aviso de perigo, não de pressa.',
  ],

  'c3-parada-estacionamento': [
    'Parar e estacionar parecem a mesma coisa, mas não são. A diferença é o tempo e o motivo.',
    'Parada é parar só o tempo para alguém subir ou descer do veículo. Estacionamento é qualquer tempo maior que esse.',
    'Onde é proibido estacionar, a parada só pode durar o tempo de alguém subir ou descer, sem atrapalhar carros e pedestres.',
    'Atenção: carga e descarga, que é colocar ou tirar mercadorias, conta como estacionamento.',
    'E se o veículo ficar parado na via por emergência, sinalize o local na hora.',
    'Um exemplo. Você deixa um amigo na porta da escola e sai: foi uma parada. Se desce para comprar pão e deixa o carro na rua, foi um estacionamento.',
    'Para guardar: sobe ou desce e vai embora, é parada. Ficou, é estacionamento.',
  ],

  'c3-posicao-portas': [
    'Não basta saber onde parar. A posição do veículo e o jeito de abrir a porta também têm regra.',
    'O carro fica no sentido do trânsito, paralelo à beirada da pista e junto ao meio-fio. Meio-fio é a pedra da beirada da calçada. Isso vale a não ser que a sinalização diga outra coisa.',
    'A moto fica perpendicular ao meio-fio, ou seja, formando um L com a calçada, e junto a ele.',
    'Na estrada com acostamento, pare fora da pista.',
    'Antes de abrir a porta, veja se não vem ninguém: carro, moto, bicicleta ou pedestre.',
    'Os passageiros sobem e descem pelo lado da calçada. Só o motorista usa o outro lado.',
    'Um exemplo. Você estacionou. Antes de abrir a porta, olha o retrovisor e vem uma bicicleta. Espere ela passar.',
    'Para guardar: carro paralelo, moto em L, porta só depois de olhar.',
  ],

  'c3-velocidade-estrada': [
    'No mundo um, você viu os limites da cidade. Fora dela, o limite depende do tipo de via e do veículo. E a placa sempre vem primeiro.',
    'Rodovia é a via fora da cidade com asfalto. Estrada é a via fora da cidade sem asfalto.',
    'Sem placa, na rodovia de pista dupla, aquela com uma pista para cada sentido: cento e dez quilômetros por hora para carros, caminhonetes e motos. Noventa para os outros veículos.',
    'Sem placa, na rodovia de pista simples: cem quilômetros por hora para carros, caminhonetes e motos. Noventa para os outros.',
    'Sem placa, na estrada de terra: sessenta quilômetros por hora.',
    'E a velocidade mínima é a metade da máxima. Andar devagar demais sem motivo também atrapalha.',
    'Um exemplo. Numa rodovia de pista simples sem placa, você vai de carro a até cem. O caminhão ao lado, até noventa. Se aparecer uma placa de oitenta, vale oitenta para os dois.',
    'Para guardar: pista dupla, cento e dez. Simples, cem. Terra, sessenta. A mínima é a metade.',
  ],

  'c3-cinto-capacete': [
    'Em qualquer viagem, curta ou longa, o corpo precisa estar protegido.',
    'O cinto de segurança é obrigatório para o motorista e para todos os passageiros, em todas as vias do país.',
    'Criança com menos de dez anos e menos de um metro e quarenta e cinco vai no banco de trás, no dispositivo de retenção certo para a idade, o peso e a altura. Dispositivo de retenção é o bebê conforto, a cadeirinha ou o assento de elevação.',
    'Na moto, quem pilota usa capacete com viseira ou óculos de proteção, as duas mãos no guidão e roupa de proteção. Viseira é a parte transparente do capacete, que protege os olhos.',
    'O passageiro da moto usa capacete e roupa de proteção, e vai no assento atrás de quem pilota.',
    'Um exemplo. Uma criança de seis anos vai com você ao mercado, a duas quadras. Mesmo perto, ela vai no banco de trás, na cadeirinha.',
    'Para guardar: todo mundo de cinto. Criança atrás. Capacete fechado.',
  ],
};
